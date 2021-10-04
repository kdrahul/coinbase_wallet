'use strict';

const { MongoClient } = require('mongodb');

let db;

const DB_CONNECT = process.env.MONGO_SERVER;

module.exports = () => {
  if (db) {
    return db;
  }

  // return MongoClient.connect(process.env.DB_CONNECT, {}).then((client) => {
  return MongoClient.connect(DB_CONNECT, {}).then((client) => {
    db = client.db('coinwallet');

    return Promise.all([
      db
        .collection('details')
        .createIndexes([
          {
            key: { username: 1 },
            background: true,
            unique: true,
            sparse: true,
          },
        ]),
      // db.collection('wallets').createIndexes([]),
      // db.collection('tokens').createIndexes([]),
    ]);
  });
};
