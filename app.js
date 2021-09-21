let express = require('express');
let app = express();
let db = require('./db');
let auth = require('./auth');
let account = require('./user_account');
const port = 5959;

// ERC - 1155 apis
// const transferSingle = (req, res) => {};
// const transferBatch = (req, res) => {};
// const approvalForAll = (req, res) => {};
// const URI = (req, res) => {};
// const safeTransferFrom = (req, res) => {};
// const safeBatchTransferFrom = (req, res) => {};
// const balanceOf = (req, res) => {};
// const balanceOfBatch = (req, res) => {};
// const setApprovalForAll = (req, res) => {};
// const isApprovedForAll = (req, res) => {};

let users = express.Router();
let transactions = express.Router();
let utils = express.Router();

app.use(express.json());
// app.use(express.urlencoded({extended = true})); // For Form data

// Helper functions

transactions.post('/auth', () => {}); // Authenticates the user
transactions.post('/transaction_details', () => {}); // Gets all the details necessary to Coinbase API
transactions.post('/store_transaction', () => {}); // Stores each transaction into the database

users.post('/register', (req, res, next) => {
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
users.post('/login', (req, res) => {
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
users.get('/exist', (req, res) => {
    const walletId = req.body.wallet_id;
    if(!walletId) return res.status(400).json({error: 'Bad Request'});
    account.doesExist(walletId).then((userExist) => {
        res.status(200).send(userExist);
    }).catch((err) =>{
        return res.status(400).send(err);
    });
});
users.delete('/deleteAccount', (req, res) => {
    const id = req.body.wallet_id;
    account.removeUser(id).then().catch();
});
users.put('/username', () => {});

utils.put('/details', (req, res) => {});
utils.get('/tokens', () => {});
utils.get('/tickers', () => {});

app.get('/', (request, response) => {
  response.status(200).send('Hello');
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
