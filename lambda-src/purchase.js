require('dotenv').config();
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const statusCode = 200;
const headers = {
  "Access-Control-Allow-Origin" : "*",
  "Access-Control-Allow-Headers": "Content-Type"
};

  exports.handler = function(event, context, callback) {

  if (event.httpMethod !== 'POST' || !event.body) {
    callback(null, {
      statusCode,
      headers,
      body: ''
    });

    return;
  }

  const data = JSON.parse(event.body);

  //-- Make sure we have all required data. Otherwise, escape.
  if(
    !data.token ||
    !data.total ||
    !data.items ||
    !data.email ||
    !data.address ||
    !data.phone ||
    !data.name ||
    !data.type ||
    !data.idempotency_key
  ) {

    return callback(null, {
      statusCode,
      headers,
      body: 'failure'
    });
  }

  let metadata = {
    name: data.name,
    items: JSON.stringify(data.items),
    type: data.type,
    phone: data.phone,
    address: data.address,
    message: data.message
  };

  if(data.message) {
    metadata.message = data.message;
  }

  stripe.charges.create({
    amount: data.total,
    currency: 'usd',
    source: data.token.id,
    receipt_email: data.email,
    description: `Coffee fundraiser purchase from ${data.name}`,
    metadata
  }, {
    idempotency_key: data.idempotency_key
  }, function (err, charge) {

    if (charge == null || charge.status !== 'succeeded') {
      console.error(err);
    }

    return callback(null, {
      statusCode,
      headers,
      body: charge ? charge.status : "Something's up."
    });
  });

}