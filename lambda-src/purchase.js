require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const statusCode = 200;
const headers = {
  "Access-Control-Allow-Origin" : "*",
  "Access-Control-Allow-Headers": "Content-Type"
};
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async function(event) {

  if (event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode,
      headers,
      body: ''
    };
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
    !data.grind ||
    !data.idempotency_key
  ) {

    return {
      statusCode,
      headers,
      body: 'failure'
    };
  }

  let metadata = {
    name: data.name,
    items: JSON.stringify(data.items),
    grind: data.grind,
    phone: data.phone,
    address: data.address,
    message: data.message,
    should_ship: data.should_ship
  };

  if (data.additional_donation) {
    metadata.additional_donation = `$${data.additional_donation}`;
  }

  if(data.message) {
    metadata.message = data.message;
  }

  let charge;

  try {
    charge = await stripe.charges.create({
      amount: data.total,
      currency: 'usd',
      source: data.token.id,
      receipt_email: data.email,
      description: `Coffee fundraiser purchase from ${data.name}`,
      metadata
    }, {
      idempotency_key: data.idempotency_key
    });
  } catch (e) {

    console.error(e);

    return {
      statusCode,
      headers,
      body: 'failure'
    };
  }

  try {
    await sgMail.send({
      to: 'ahmacarthur@gmail.com',
      from: 'ahmacarthur@gmail.com',
      subject: 'Coffee has been purchased!',
      html: `${data.name} just purchased the following items: ${JSON.stringify(data.items)}.`,
    });
  } catch (e) {
    console.error(e);
  }

  return {
    statusCode,
    headers,
    body: charge.status
  };
}
