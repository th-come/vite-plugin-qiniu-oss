import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vitePluginQiniuOss from '../../index'
const uploadPath = require('./package.json').name;

export default defineConfig(() => {
	const openUpload = process.env.NODE_ENV == 'production' ? true : false

	return {
		base: openUpload ? `https://qiniu.xxx.com/${uploadPath}/`: `./`, // same with webpack public path
		plugins: [vue(), vitePluginQiniuOss(openUpload)]
	}
})
