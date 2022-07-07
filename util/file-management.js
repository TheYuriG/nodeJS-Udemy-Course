const fs = require('fs');

const deleteFile = (filePath) => {
	fs.unlink(filePath, (fileDeletionError) => {
		if (fileDeletionError) {
			throw fileDeletionError;
		}
	});
};

module.exports.yeet = deleteFile;
