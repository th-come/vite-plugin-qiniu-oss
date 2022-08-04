const difference = require('lodash.difference');
const mapLimit = require('map-limit');
const path = require('path');
const revalidator = require('revalidator');
const chalk = require('chalk');
const mm = require('micromatch')
const request = require('request-promise');
const { resolve } = require('path');

const CONFIG_FILENAME = '.qiniu.config';
const LOG_FILENAME = '__qiniu__vite__plugin__files.json';

module.exports = {
	/**
	 * 合并文件列表
	 * @param {Array<string>} prevFiles 上一版本文件列表
	 * @param {Array<string>} currentFiles 当前线上的文件列表
	 * @param {Array<string>} releaseFiles 等待发布的文件列表
	 * 
	 * let prevFiles = [1, 2, 3, 4]
	 * let currentFiles = [1, 2, 5, 6]
	 * let releaseFiles = [1, 2, 7, 8]
	 * 
	 * deleteFiles:
	 * _.difference(prevFiles, currentFiles)  // [3, 4]
	 * 
	 * uploadFiles:
	 * _.difference(releaseFiles, currentFiles)  // [7, 8]
	 * 
	 * 
	 */
	combineFiles(prevFiles, currentFiles, releaseFiles) {
		console.log('prevFiles', prevFiles)
		console.log('currentFiles', currentFiles)
		console.log('releaseFiles', releaseFiles)

		let deleteFiles = difference(prevFiles, currentFiles);
		let uploadFiles = difference(releaseFiles, currentFiles);

		deleteFiles = difference(deleteFiles, uploadFiles);

		// 返回最终要上传的文件列表
		return {
			uploadFiles,
			deleteFiles
		};
	},

	mapLimit(list, limit, iterator) {
		return new Promise((resolve, reject) => {
			mapLimit(
				list,
				limit,
				iterator,
				(err, results) => {
					if (err) {
						reject(err);
					} else {
						resolve(results);
					}
				}
			)
		})
	},

	// 校验配置
	validateOptions(options) {
		let validate = revalidator.validate(options, {
			properties: {
				accessKey: {
					type: 'string',
					required: true
				},
				secretKey: {
					type: 'string',
					required: true
				},
				bucket: {
					type: 'string',
					required: true,
					minLength: 4,
					maxLength: 63
				},
				bucketDomain: {
					type: 'string',
					required: true,
					message: 'is not a valid url',
					conform(v) {
						let urlReg = /[-a-zA-Z0-9@:%_\+.~#?&//=]{1,256}\.[a-z]{1,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
						if (urlReg.test(v)) {
							return true;
						}
						return false;
					}
				},
				uploadPath: {
					type: 'string'
				},
				batch: {
					type: 'number'
				},
				deltaUpdate: {
					type: 'boolean'
				}
			}
		});

		if (!validate.valid) {
			const { errors } = validate;
			console.log(chalk.bold.red('[QiniuWebpackPlugin] options validate failure:'));
			for (let i = 0, len = errors.length; i < len; i++) {
				const error = errors[i];
				console.log('\n    > ', error.property, error.message);
			}
			console.log('\n');
			return false
		} else {
			return true
		}
	},

	// 获取配置文件信息
	getFileOptions() {
		try {
			return require(path.resolve(CONFIG_FILENAME));
		} catch (e) {
			if (e.code !== 'MODULE_NOT_FOUND') {
				throw e;
			}
			return null;
		}
	},

	// 过滤不上传文件
	matchFiles(fileNames, createOssOption) {
		const { matchFiles = [] } = createOssOption;

		matchFiles.unshift('*'); // all files

		return mm(fileNames, matchFiles, { matchBase: true });
	},

	/**
	* 获取文件列表
	*/
	async getLogFile(createOssOption, qiniu) {
		const uploadPath = createOssOption.uploadPath.replace(/\//, '')
		let remotePath = path.posix.join(uploadPath, LOG_FILENAME);
		let logDownloadUrl = qiniu.getPublicDownloadUrl(remotePath);

		let randomParams = '?r=' + +new Date();

		// 域名没有通信协议
		if (logDownloadUrl.indexOf('//') === 0) {
			logDownloadUrl = 'https:' + logDownloadUrl;
		}

		return request({
			uri: logDownloadUrl + randomParams,
			json: true
		})
			.catch(err => ({ prev: [], current: [], uploadTime: '' }))
	},
	
	/**
	* 删除旧的文件
	* @param {Array<string>} deleteFiles 待删除文件列表
	*/
	async deleteOldFiles ({createOssOption, deleteFiles, qiniu}) {
		if (deleteFiles.length > 0) {
			const keys = deleteFiles.map((filename, index) => path.posix.join(createOssOption.uploadPath, filename));
			await qiniu.batchDelete(keys);
		}
	},

	/**
	* 记录文件列表
	* @param {Array<string>} currentFiles 当前线上的文件列表
	* @param {Array<string>} releaseFiles 等待发布的文件列表
	*/
	async writeLogFile ({currentFiles, releaseFiles, qiniu, createOssOption}) {
		let json = JSON.stringify({
			prev: currentFiles,
			current: releaseFiles,
			uploadTime: new Date()
		});
		const uploadPath = createOssOption.uploadPath.replace(/\//, '')
		const key = path.posix.join(uploadPath, LOG_FILENAME);
		return await qiniu.put(key, json);
	}
}