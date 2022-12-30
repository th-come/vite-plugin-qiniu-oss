const chalk = require('chalk')
const glob = require('glob')
const path = require('path')
const { URL } = require('url')
const Qiniu = require('./src/qiniu')

const { normalizePath } = require('vite')
const Reporter = require('./src/reporter');

const { 
	combineFiles, 
	validateOptions, 
	getFileOptions, 
	getLogFile, 
	mapLimit, 
	writeLogFile
} = require('./src/utils');

module.exports = function vitePluginQiniuOss(openUpload) {
	let baseConfig = '/'
	let buildConfig = ''
	const options = getFileOptions()
	const reporter = new Reporter('\n');

	if(!openUpload) {
		reporter.stop()
		return
	}

	if (!validateOptions(options)) {
		reporter.stop()
		return
	}

	return {
		name: 'vite-plugin-qiniu-oss',
		enforce: 'post',
		apply: 'build',
		configResolved(config) {
			baseConfig = config.base
      		buildConfig = config.build
		},
		async closeBundle() {
			const outDirPath = normalizePath(path.resolve(normalizePath(buildConfig.outDir)))

			const createOssOption = Object.assign({}, options)
			const { accessKey, secretKey, bucket, bucketDomain, zone } = createOssOption;
			const qiniu = new Qiniu({
				accessKey,
				secretKey,
				bucket,
				domain: bucketDomain,
				zone
			})

			const files = await glob.sync(
				outDirPath + '/**/*',
				{
					strict: true,
					nodir: true,
					dot: true,
					ignore: options.ignore ? options.ignore : '**/*.html'
				}
			)

			reporter.log = '=====qiniu oss start upload=====  \n';

			const startTime = new Date().getTime()
			const releaseFiles = files.map(item => {
				return item.split(outDirPath)[1]
			})

			reporter.log = '=====get history data=====  \n';


			// files log
			const {
				uploadTime,
				prev: prevFiles = [],
				current: currentFiles = []
			} = await getLogFile(createOssOption, qiniu);

			const { uploadFiles, deleteFiles } = combineFiles(prevFiles, currentFiles, releaseFiles);

			reporter.log = `=====will upload ${uploadFiles.length} files=====`;

			const uploadFileTasks = uploadFiles.map((filename, index) => {
				const localUrl= outDirPath + filename
				const uploadPath = createOssOption.uploadPath.replace(/\//g, '')
				const key =  uploadPath + filename

				return async () => {
					return await qiniu.putFile(key, localUrl);
				}
			})

			try {
				await mapLimit(uploadFileTasks, createOssOption.batch,
					(task, next) => {
						(async () => {
							try {
								const res = await task();
								next(null, res);
							} catch (err) {
								next(err);
							}
						})();
					}
				);
			} catch (e) {
				console.error(chalk.bold.red('\n\nupload fail:', e));
			}

			const duration = (new Date().getTime() - startTime) / 1000
			console.log(`=====upload done, cost ${duration.toFixed(2)}s`)
			
			reporter.text = `====write log...\n`;
			await writeLogFile({currentFiles, releaseFiles, qiniu, createOssOption});
			reporter.log = `=====log complete\n`

			reporter.succeed('=====upload success \n');
		}
	}
}

