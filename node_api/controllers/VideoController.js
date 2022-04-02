var fs = require('fs');

module.exports.getVideos = async (req, res, next) => {
	var files = await fs.readdirSync(__dirname);
	files = await this.getVideosFromDirectory();
	res.send(files);
};

module.exports.getVideosFromDirectory = () => {
	return new Promise((resolve, reject) => {
		try {
			let dir = "./video";
			let path = `${process.env.EXPRESS_SCHEME}${process.env.EXPRESS_HOST}:${process.env.EXPRESS_PORT}/video/`;
			var contents = fs.readdirSync(dir);
			let files = [];
			let counter = -1;

			var getFiles = () => {
				counter++;
				if (contents[counter]) {
					let fileName = contents[counter];
					var stat = fs.statSync(dir + '/' + fileName);
					if (stat && stat.isFile()) {
						let file = path + fileName;
						let size = stat.size;

						if (!fileName.includes('DS_Store')) {
							files.push({ file, size, fileName });
						}
					}
					getFiles();
				}
			};
			getFiles();
			resolve({ error: false, data: files });
			return;
		} catch (_catch) {
			resolve({ error: true, data: _catch, message: _catch.message });
			return;
		}
	});
};