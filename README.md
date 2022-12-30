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

![preview](https://qiniu.other.cq-wnl.com/1672381353.png)

# Installation

```bash
yarn add -D vite-plugin-qiniu-oss
```

or

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
| accessKey       | qiniu oss accessKey                                     | string  |               |
| secretKey       | qiniu oss secretKey                                     | string  |               |
| bucket          | qiniu oss bucket name                                   | string  |               |
| bucketDomain    | qiniu oss bucket domain                                 | string  |               |
| ignore      	  | ignore file rules, silently upload all static resource files except html           | (string or array)  | `'**html'` |
| uploadPath      | qiniu oss upload storage file name						| string  |               |
| batch           | the number of files uploaded synchronously              | number | 10         	|
| zone            | storage room name                                       | string | `'Zone_z0'`    |
| ...             | other parameters to initialize oss, see for details https://developer.qiniu.com/kodo/sdk/nodejs | any | |

