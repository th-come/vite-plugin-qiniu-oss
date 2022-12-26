vite-plugin-qiniu-oss
=======
![license](https://img.shields.io/npm/l/vite-plugin-ali-oss)
![downloads](https://img.shields.io/npm/dt/vite-plugin-ali-oss)

将项目中打包后生产文件上传到 qiniu OSS，除了 html 以外

# 功能特性

- 默认上传打包后静态资源文件，将获取历史数据，去除已上传文件。
- 配置简单方便，使用 `vite` `outDir` 路径，上传到 oss 的相同路径中

备注：除了所有 html 文件以外，上传所有文件。html文件通常放在服务器上

效果预览：

![preview](https://qiniu.other.cq-wnl.com/1672044545.png)
![preview](https://qiniu.other.cq-wnl.com/1672044500.png)
# 安装

```
pnpm i -D vite-plugin-qiniu-oss
```

或者

```bash
yarn add -D vite-plugin-qiniu-oss
```

或者

```bash
npm i -D vite-plugin-qiniu-oss
```

# 基本使用

1. 在 vite.config.js 中注册本插件
2. 设置 base 开发或生产环境服务的公共基础 ***URL*** 路径
3. 在根目录创建七牛配置文件.qiniu.config.js 文件

```Javascript
import vitePluginQiniuOss from 'vite-plugin-qiniu-oss'
import packageJson from './package.json'

export default defineConfig({
	base: import.meta.env.NODE_ENV == 'production'? `https://qiniu.xxx.com/${packageJson.name}/`: `./`,, 
	plugins: [vitePluginQiniuOss()]
})

// 新建`.qiniu.config.js`配置文件，并且在 `.gitignore` 忽略此文件

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

3. 打包发布生产代码

```
npm/yarn run build
```

插件将会在打包完成后，上传 vite 配置 outDir 路径下的所有资源文件。

# 配置项

| options         | description                                             | type    | default       |
|-----------------|---------------------------------------------------------|---------|---------------|
| accessKey       | 七牛云 oss 秘钥                                          | string  |               |
| secretKey       | 七牛云 oss 访问秘钥                                       | string  |               |
| bucket          | 七牛云 oss 储空间名称                                     | string  |               |
| bucketDomain    | 七牛云 oss 储空域名                                 	  | string  |               |
| ignore      	  | 文件规则	默然会上传除去html以外所有静态资源文件           | (string or array)  |  `'**/*.html'` |
| uploadPath      | 七牛云 oss 上传储存空间文件名								| string  |               |
| batch           | 同步上传文件个数                                 		   | number | 10         	|
| zone            | 储存空间机房名                                             | string | `'Zone_z0'`    |
| ...             | 其他初始化 oss 的参数，详细信息请见 https://developer.qiniu.com/kodo/sdk/nodejs | any | |

