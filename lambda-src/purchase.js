require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const statusCode = 200;
const headers = {
  "Access-Control-Allow-Origin" : "*",
  "Access-Control-Allow-Headers": "Content-Type"
};
const sgMail = require('@sendgrid/mail');
const Airtable = require('airtable');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY
});

const saveToAirtable = data => {
  const base = Airtable.base(process.env.AIRTABLE_BASE);

  return new Promise((resolve, reject) => {
    base('Coffee Purchases').create(data, function (err, record) {
      if (err) {
        console.log(err);
        return reject(err);
      }

      return resolve(record.getId());
    });
  });
}

const formatForAirtable = metadata => {
  const coffeeOrder = JSON.parse(metadata.items);
  let airTableData = { ...metadata };

  delete airTableData.items;

  for (let prop in coffeeOrder) {
    airTableData[`blend: ${prop}`] = coffeeOrder[prop];
  }

  for (let prop in airTableData) {
    airTableData[prop] = String(airTableData[prop]);
  }

  return airTableData;
}

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
    !data.total ||
    !data.items ||
    !data.email ||
    !data.address ||
    !data.phone ||
    !data.name ||
    !data.grind
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
  let chargeDescription = `Coffee purchase ${data.should_ship ? "(with shipping) " : ""}from ${data.name}`

  if (data.should_ship) {
    try {
      charge = await stripe.charges.create({
        amount: data.total,
        currency: 'usd',
        source: data.token.id,
        receipt_email: data.email,
        description: chargeDescription,
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
  }

  let airTableData = formatForAirtable(metadata);

  try {
    let airtablePromise = saveToAirtable(airTableData);
    let emailPromise = sgMail.send({
      to: 'ahmacarthur@gmail.com',
      from: 'ahmacarthur@gmail.com',
      subject: 'Coffee has been purchased!',
      html: `${data.name} just purchased the following items: ${JSON.stringify(data.items)}.`,
    });

    await Promise.all([airtablePromise, emailPromise]);

  } catch (e) {
    console.error(e);
  }

  return {
    statusCode,
    headers,
    body: charge.status ? charge.status : 'done'
  };
}
