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
  return collection
    .find({ _id: walletId })
    .limit(1)
    .next()
    .then((doc) => {
      if (!doc) return doc;
      return doc.data;
    });
};

const saveDetails = (walletId, data) => {
  const collection = db().collection('details');
  return collection
    .updateOne({ _id: walletId }, { $set: { data } }, { upsert: true })
    .then(() => {
      return data;
    });
};

const setUsername = (walletId, username) => {
  const collection = db().collection('users');
  return collection
    .find({ _id: walletId })
    .limit(1)
    .next()
    .then((user) => {
      if (!user) return Promise.reject({ error: 'error getting doc' });

      username = username
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .substr(0, 63);
      const usernameSha = crypto
        .createHash('sha1')
        .update(username + process.env.USERNAME_SALT)
        .digest('hex');
      return db()
        .collection('details')
        .updateOne(
          { _id: user._id },
          {
            $set: { username_sha: usernameSha },
          },
          { upsert: true }
        )
        .then(() => {
          return username;
        })
        .catch((error) => {
          if (
            error &&
            error.message &&
            error.message.match(/E11000 duplicate key error/)
          ) {
            return Promise.reject({ error: 'username_exists' });
          }
          return Promise.reject(error);
        });
    });
};

module.exports = {
  doesExist,
  getDetails,
  removeUser,
  saveDetails,
  setUsername,
};
