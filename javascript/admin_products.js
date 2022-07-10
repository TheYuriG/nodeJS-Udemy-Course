//? This javascript script is loaded on "/admin/products" and triggered
//? every time the user clicks the "Delete" button on a product they created
const deleteProduct = (buttonClicked) => {
	//? Store in a constant the 2 pieces of data required to perform the
	//? network request and information
	const productID = buttonClicked.parentNode.querySelector('[name=productID]').value;
	const csrf = buttonClicked.parentNode.querySelector('[name=_csrf]').value;

	//? Makes a HTML fetch request back to the server requesting the deletion
	//? of this item
	fetch('/admin/delete-product/' + productID, {
		method: 'DELETE',
		headers: { 'csrf-token': csrf }, //? Attaches the CSRF token to validate this request
	})
		.then((result) => {
			//? If successful, log the 200 response to the console and
			//? remove the "article" HTML element where this item
			//? was being displayed. This happens dynamically without
			//? forcing the user to reload the page which can be
			//? a waste of time and would require additional
			//? API calls to the database too
			console.log(result);
			buttonClicked.closest('article').remove();
		})
		.catch((result) =>
			//? If an error occurs, logs the 500 responde to the console
			console.log(result)
		);
};
