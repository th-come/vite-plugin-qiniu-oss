import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vitePluginQiniuOss from '../../index'
const uploadPath = require('./package.json').name;


export default defineConfig({
	base: `https://qiniu.other.cq-wnl.com/${uploadPath}/`, // same with webpack public path
	plugins: [vue(), vitePluginQiniuOss()]
})
