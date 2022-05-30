const error = (req, res) => {
	res.status(404).render('page-not-found', { pageTitle: 'Error! You got nowhere!' });
};

module.exports = error;
