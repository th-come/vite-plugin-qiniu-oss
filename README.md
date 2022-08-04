# Qiniu Webpack Plugin 
>  Webpack 编译后的文件上传到 七牛云存储

## 功能

静态资源自动上传七牛云

## 安装

npm install vite-plugin-qiniu-oss       
或者使用      
yarn add vite-plugin-qiniu-oss

## 使用

**webpack.config.js**

```Javascript
const vitePluginQiniuOss = require('vite-plugin-qiniu-oss');

// vite 配置
const uploadPath = require('./package.json').name;

export default defineConfig({
	base: `https://qiniu.other.cq-wnl.com/${uploadPath}/`, // same with webpack public path
	plugins: [vitePluginQiniuOss()]
})
```

在项目目录下新建 `.qiniu-webpack` 文件，并且在 `.gitignore` 忽略此文件

**.qiniu-webpack**

```Javascript
module.exports = {
  accessKey: 'qiniu access key', // required
  secretKey: 'qiniu secret key', // required
  bucket: 'demo', // required
  bucketDomain: 'https://domain.bkt.clouddn.com', // required
  matchFiles: ['!*.html', '!*.map'],
  uploadPath: '/assets',
  usePublicPath: true,
  batch: 10,
  deltaUpdate: true
}
```

**Options**


***


## License
lsc
