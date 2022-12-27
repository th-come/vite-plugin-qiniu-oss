vite-plugin-qiniu-oss
=======
![license](https://qiniu.other.cq-wnl.com/1672110731.png)

Upload the production files bundled in the project to qiniu OSS, except for html

[中文文档](https://github.com/th-come/vite-plugin-qiniu-oss/blob/main/README_CN.md)

# Feature

- By default, the packaged static resource files are uploaded, and the historical data will be obtained, and the uploaded files will be removed。

- the configuration is simple，using outDir path of vite, uploading to the same path of oss.

Note: Upload all files except html files, because html files have no hash and are usually placed on the server.

# Preview

![preview](https://qiniu.other.cq-wnl.com/1672107090.jpg)

# Installation

```bash
yarn add -D vite-plugin-qiniu-oss
```

或者

```bash
npm i -D vite-plugin-qiniu-oss
```

# Basic usage

1. Register the plugin in vite.config.js
2. Set base public URL path when served in development or production.
3. Create a Qiniu configuration file in the root directory ex: .qiniu.config.js

```Javascript
import vitePluginQiniuOss from 'vite-plugin-qiniu-oss'
const uploadPath = require('./package.json').name;

export default defineConfig(() => {
	const openUpload = process.env.NODE_ENV == 'production' ? true : false

	return {
		base: openUpload ? `https://qiniu.xxx.com/${uploadPath}/`: `./`, // same with webpack public path
		plugins: [vue(), vitePluginQiniuOss(openUpload)]
	}
})

// create file: `.qiniu.config.js`

const uploadPath = require('./package.json').name;
module.exports = {
  accessKey: 'qiniu access key',
  secretKey: 'qiniu secret key',
  bucket: 'demo',
  bucketDomain: 'https://domain.bkt.clouddn.com',
  uploadPath: `/${uploadPath}/`,
  batch: 10,
  zone: 'Zone_z0',
  ignore: ['**/*.html', '**/*.map']
}
```

3. Build Production

```
npm/yarn run build
```

The plugin will upload files of outDir path after bundle.

# options

| options         | description                                             | type    | default       |
|-----------------|---------------------------------------------------------|---------|---------------|
| accessKey       | 七牛云 oss 秘钥                                          | string  |               |
| secretKey       | 七牛云 oss 访问秘钥                                      | string  |               |
| bucket          | 七牛云 oss 存储空间名称                                   | string  |               |
| bucketDomain    | 七牛云 oss 存储空域名                                 	  | string  |               |
| ignore      	  | 文件规则	默然会上传除去html以外所有静态资源文件           | (string or array)  |  `'**/*.html'` |
| uploadPath      | 七牛云 oss 上传储存空间文件名								| string  |               |
| batch           | 同步上传文件个数                                 		   | number | 10         	|
| zone            | 储存空间机房名                                             | string | `'Zone_z0'`    |
| ...             | 其他初始化 oss 的参数，详细信息请见 https://developer.qiniu.com/kodo/sdk/nodejs | any | |

