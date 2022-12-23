const uploadPath = require('./package.json').name;

module.exports = {
	accessKey: 'xxxxx',
	secretKey: 'xxxx',
	bucket: 'xxxx',
	bucketDomain: 'https://example.com/',
	uploadPath: `/${uploadPath}/`,
	usePublicPath: true,
	batch: 10,
	ignore: ['**/*.html', '**/*.map'],
	zone: 'Zone_z0'
}
