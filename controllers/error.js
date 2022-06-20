exports.get404 = (req, res, next) => {
	const loginData = req.session.isAuthenticated ? true : false;
	res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/404', isAuthenticated: loginData });
};
