let express = require('express');
let app = express();
let db = require('./db.js');
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

// Helper functions

transactions.post('/auth', () => {}); // Authenticates the user
transactions.post('/transaction_details', () => {}); // Gets all the details necessary to Coinbase API
transactions.post('/store_transaction', () => {}); // Stores each transaction into the database

users.post('/register', () => {});
users.get('/login', () => {});
users.get('/exist', (req, res) => {
  res.send('No it doesnt');
});
users.delete('/account', () => {});
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
