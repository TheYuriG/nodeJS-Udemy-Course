const deleteProduct = (buttonClicked) => {
	const productID = buttonClicked.parentNode.querySelector('[name=productID]').value;
	const csrf = buttonClicked.parentNode.querySelector('[name=_csrf]').value;

	fetch('/admin/delete-product/' + productID, {
		method: 'DELETE',
		headers: { 'csrf-token': csrf },
	})
		.then((result) => {
			console.log(result);
			buttonClicked.closest('article').remove();
		})
		.catch((result) => console.log(result));
};
