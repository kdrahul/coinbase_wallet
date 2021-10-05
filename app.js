require('dotenv').config();
let express = require('express');
let app = express();
let db = require('./db');
let auth = require('./auth');
let account = require('./user_account');
const coinbase = require('coinbase-commerce-node');
const { Webhook } = require('coinbase-commerce-node');
const Client = coinbase.Client;
const Charge = coinbase.resources.Charge;
const port = process.env.PORT || 5959;
const cors = require('cors')({ origin: '*' });

let users = express.Router();
let transactions = express.Router();
let utils = express.Router();

const rawBody = (req, res, next) => {
  req.setEncoding('utf8');

  var data = '';

  req.on('data', (chunk) => {
    data += chunk;
  });

  req.on('end', () => {
    req.rawBody = data;

    next();
  });
};

app.use(cors);
Client.init(process.env.COINBASE_API_KEY);

////////////////////////////////////////////////////////////
//  TRANSACTION APIs
////////////////////////////////////////////////////////////

transactions.post('/charge', express.json(), async (req, res) => {
  const data = req.body;
  // Fields necessary to create a charge
  const chargeData = {
    // REQUIRED
    name: data.name, // Title of the product, 100 chars or less
    description: data.description, // tag lines, or extra details about product. 200 chars or less
    pricing_type: data.pricing_type, // Values: no_price | fixed_price

    // Optional
    // All these go into payment portal for reference to the user
    // regarding how much they want to pay, and for what item(s) they are paying.
    local_price: data.local_price, // Price in INR or USD or whatever
    metadata: data.metadata, // Any extra info if necessary
  };
  const charge = await Charge.create(chargeData);
  res.status(200).send(charge);
  // Each charge expires in 1Hr. That is, user has 1Hr to make that payment.
});

transactions.post('/webhook', rawBody, async (req, res) => {
  const rawBody = req;
  const signature = req.headers['x-cc-webhook-signature'];
  const webhookSecret = process.env.WEBHOOK_SECRET;

  try {
    const event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);
    if (event.type == 'charge:pending') {
      // TODO: Received Order
      db().collection('coinbaseTransactions').save(event.data);
      console.log(event.id + ': PENDING!!');
    }
    if (event.type == 'charge:confirmed') {
      // Everything went fine. Fulfill the order to the user
      // Add the transaction details to the database
      db().collection('coinbaseTransactions').save(event.data);
      console.log(event.id + ': CONFIRMED!!');
    }
    if (event.type == 'charge:failed') {
      // Payment didnt go through. Cancel the order
      db().collection('coinbaseTransactions').save(event.data);
      console.log(event.id + ': Failed!!');
    }
    res.status(200).send(`success ${event.id}`);
  } catch (error) {
    console.error(error);
    res.status(400).send('failure!');
  }
});

transactions.post('/transaction_details', () => {}); // Gets all the details necessary to Coinbase API
transactions.post('/store_transaction', () => {}); // Stores each transaction into the database

////////////////////////////////////////////////////////////
//  USER APIs
////////////////////////////////////////////////////////////

users.post('/register', express.json(), (req, res, next) => {
  const walletId = req.body.wallet_id;
  auth
    .register(walletId, req.body.pin)
    .then((token) => {
      console.log('registered wallet %s', walletId);
      res.status(200).send(token);
    })
    .catch((err) => {
      if (!['auth_failed', 'user_deleted'].includes(err.error))
        console.error('error', err);
      return res.status(400).send(err);
    });
});
users.post('/login', express.json(), (req, res) => {
  // Alter this based on what they send in their json
  const walletId = req.body.wallet_id;
  console.log(req.body.wallet_id);
  auth
    .login(walletId, req.body.pin)
    .then((token) => {
      console.log('authenticated wallet %s' + walletId);
      res.status(200).send(token);
    })
    .catch((err) => {
      if (err) console.error('error ', err);
      res.status(400).send(err);
    });
});
users.get('/exist', express.json(), (req, res) => {
  const walletId = req.body.wallet_id;
  if (!walletId) return res.status(400).json({ error: 'Bad Request' });
  account
    .doesExist(walletId)
    .then((userExist) => {
      res.status(200).send(userExist);
    })
    .catch((err) => {
      return res.status(400).send(err);
    });
});
users.delete('/deleteAccount', express.json(), (req, res) => {
  const id = req.body.wallet_id;
  account
    .removeUser(id)
    .then(() => {
      res.status(200).send('Deleted user %s', id);
    })
    .catch((err) => {
      return res.status(400).send(err);
    });
});
users.put('/username', () => {});

////////////////////////////////////////////////////////////
//  UTIL APIs
////////////////////////////////////////////////////////////

utils.get('/tokens', () => {});
utils.get('/tickers', () => {});

utils.get('/details', (req, res) => {
  account
    .getDetails(req.query.wallet_id)
    .then((details) => {
      res.status(200).json(details);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

utils.put('/details', (req, res) => {
  if (!req.body.data) return res.status(400).json({ error: 'Bad request' });
  account
    .saveDetails(req.body.wallet_id, req.body.data)
    .then((details) => {
      res.status(200).json(details);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.get('/', express.json(), (req, res) => {
  // Charge is the amount you are charging the customer for a particular item.
  // Charge == Purchasing price.
  res.status(200).send('Hello');
  console.log(req.body);
});
app.post('/', express.json(), (req, res) => {
  console.log(JSON.stringify(req.body));
  let hello_string = 'hello ' + req.body.name;
  res.status(200).send(hello_string);
});

////////////////////////////////////////////////////////////
//  Products APIs
////////////////////////////////////////////////////////////
const saveProduct = () => {
  const collection = db().collection('product');
  return collection
    .updateOne({ _id: id }, { $set: { data } }, { upsert: true })
    .then(() => {
      return data;
    });
};
app.get('/product', express.json(), (req, res) => {
  db()
    .collection('product')
    .find({})
    .toArray((err, result) => {
      if (err) throw err;
      console.log(result);
      res.status(200).send(result);
    });
});

app.post('/product', express.json(), (req, res) => {
  const product = req.body;
  const data = {
    _id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    datetime: product.datetime,
  };
  db()
    .collection('product')
    .insertOne(data, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.status(200).send(result);
    });
});
app.delete('/product', express.json(), (req, res) => {
  const deletion = req.body;
  db()
    .collection('product')
    .deleteOne({ _id: deletion.id }, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.status(200).send(result);
    });
});

app.use('/user', users);
app.use('/util', utils);
app.use('/payment', transactions);

app.listen(port, (err) => {
  if (err) {
    console.error('Error ' + err);
  }
  db();
  console.info('server started at ' + port);
});

// db()
//   .then(() => {
//     const port = 5959;
//     const server = app.listen(port, () => {
//       console.info('Server started at ' + server.address().port);
//         server.timeout = 20000;
//     });
//   })
//   .catch((error) => {
//     console.error('Error: ', error);
//   });
