# E-Commerce website example

Create, buy, update and delete products with this e-commerce platform application.

## Before you build:

Make sure to create an account with the necessary providers:

-   Sendgrid
-   MongoDB
-   Stripe

You will need API keys for each of them to make the application work. MongoDB is where your products will be stored, Sendgrid is responsible for sending emails and Stripe is responsible for handling payments.

After creating the free accounts and fetching the API keys, create the `util/secret/keys.js` file where you will store those API keys and some additional data. This is how your file should look like:

```js
module.exports.sendGridAPIKey = 'SENDGRID_API_KEY_HERE';
module.exports.mongoDBAPIKey = 'MONGODB_API_KEY_HERE';
module.exports.senderEmail = 'EMAIL_REGISTERED_AT_SENDGRID@DOMAIN.COM';
module.exports.saltSecret = 'ANY_LARGE_STRING_FOR_SECURITY';
module.exports.stripeSecret = 'STRIPE_PRIVATE_API_KEY_HERE';
```

## Starting the server

With this set up, you will now be able to run the application. Open the terminal on the application folder and start with:

```js
npm start
```

Open the browser of your preference and access the platform at `http://localhost:3000/`. Initially, you should have no products, so let's start by adding some.

### Adding a new user

Create an account by clicking `Sign Up` or access `http://localhost:3000/register`. To pass the validation, you need to input a name that is at least 2 characters long, a valid email and a password that is at least 8 characters long and matches the `Confirm Password` field. Once that's done, you should receive an email confirming your account creation and you should be logged in.

### Managing the e-commerce data

Now that you are logged in, you can start adding your products. Click `Add Product` or head over to `http://localhost:3000/admin/add-product`, enter a title, price, description and upload a valid JPG, JPEG or PGN file (all of this is validated, so make sure to use valid information/correct file types). You can edit or delete products later by accessing `Admin Products` or clicking `http://localhost:3000/admin/products`.

### Purchasing items

Click `Products` or head over to `http://localhost:3000/products` to purchase your first item. Add any items you want to your cart and when you are satisfied, click `Cart` or visit `http://localhost:3000/cart` and click `Order Now!`. You will be redirected to `http://localhost:3000/checkout`, click to `Order Now!` again to be redirected to Stripe's dummy payment page. Enter any fake data (example below) and you will be redirected to `http://localhost:3000/orders` where you can see a summary of all your fake purchases and download their respective invoices.

#### Fake data for Stripe

```
Email: user@domain.com
Card Number: 4242 4242 4242 4242
Expiration Date: 12/50
CVC: 123
Card Name: Dummy
```

### Issues? Contributing?

Feel free to open any [Issues](https://github.com/TheYuriG/nodeJS-Udemy-Course/issues) that you see fit. There should already be some there, open or closed, for me to keep track of future improvements I want to add to the platform myself. For contributions, only UI contributions will be accepted at this time, thank you.
