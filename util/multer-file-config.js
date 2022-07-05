//? Require multer again to
const multer = require('multer');

//? Setup for configuring a file destination and name with multer
module.exports.fileDestinationAndNaming = multer.diskStorage({
	destination: (req, fileToName, callbackToFileDestination) => {
		callbackToFileDestination(null, 'images');
	},
	filename: (req, fileToName, callbackToFileName) => {
		callbackToFileName(null, new Date().toISOString() + '-' + fileToName.originalname);
	},
});

//? Setup for configuring what file types we will be accepting
module.exports.fileTypeFilter = (req, fileToBeFiltered, callbackForFileFilter) => {
	if (
		fileToBeFiltered.mimetype === 'image/png' ||
		fileToBeFiltered.mimetype === 'image/jpg' ||
		fileToBeFiltered.mimetype === 'image/jpeg'
	) {
		callbackForFileFilter(null, true);
	} else {
		callbackForFileFilter(null, false);
	}
};
