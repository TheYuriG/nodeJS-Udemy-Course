module.exports = (req, res, next) => {
	//? Redirects the user to login if they aren't connected
	if (!req.session.isAuthenticated) {
		return res.redirect('/authenticate');
	}
	next();
};
