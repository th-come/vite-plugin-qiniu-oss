const color = require('picocolors')
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
	matchFiles, 
	getLogFile, 
	mapLimit, 
	deleteOldFiles, 
	writeLogFile
} = require('./src/utils');

module.exports = function vitePluginQiniuOss() {
	let baseConfig = '/'
	let buildConfig = ''
	const options = getFileOptions()
	const reporter = new Reporter('\n');

	if (!validateOptions(options)) {
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
			const { accessKey, secretKey, bucket, bucketDomain } = createOssOption;
			const qiniu = new Qiniu({
				accessKey,
				secretKey,
				bucket,
				domain: bucketDomain
			})

			const files = await glob.sync(
				outDirPath + '/**/*',
				{
					strict: true,
					nodir: true,
					dot: true,
					ignore: options.matchFiles ? options.matchFiles : '**/*.html'
				}
			)

			reporter.log = '=====qiniu oss 开始上传=====  \n';

			const startTime = new Date().getTime()
			const fileNames = files.map(item => {
				return item.split(outDirPath)[1]
			})

			reporter.log = '=====正在获取历史数据=====  \n';

			// 处理文件过滤
			const releaseFiles = matchFiles(fileNames, createOssOption);

			// 获取文件日志
			const {
				uploadTime,
				prev: prevFiles = [],
				current: currentFiles = []
			} = await getLogFile(createOssOption, qiniu);

			// 合并去重，提取最终要上传和删除的文件
			const { uploadFiles, deleteFiles } = combineFiles(prevFiles, currentFiles, releaseFiles);

			reporter.log = `=====将上传 ${uploadFiles.length} 个文件=====`;

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
				console.error(chalk.bold.red('\n\n上传失败:'));
				callback(e);
			}

			const duration = (new Date().getTime() - startTime) / 1000
			console.log(`=====上传完毕, cost ${duration.toFixed(2)}s`)
			
			reporter.text = `=====正在写入日志...\n`;
			await writeLogFile({currentFiles, releaseFiles, qiniu, createOssOption});
			reporter.log = `=====日志记录完毕\n`

			reporter.succeed('===== \n');
		}
	}
}

