'use strict';
const db = require('./db.js');

const doesExist = (walletId) => {
  const collection = db().collection('users');
  return collection
    .find({ _id: walletId }, { projection: { _id: 1 } })
    .limit(1)
    .next()
    .then((user) => {
      if (!user) return false;
      return true;
    });
};

const removeUser = (id) => {
  return Promise.all([
    db().collection('users').deleteOne({ _id: id }),
    db().collection('details').deleteOne({ _id: id }),
  ]);
};

const getDetails = (walletId) => {
  const collection = db().collection('details');
  return collection.find({ _id: walletId }).limit(1).next().then((doc) => {
      if (!doc) return doc;
      return doc.data;
  });
};

module.exports = {
  doesExist,
  getDetails,
  removeUser,
};
