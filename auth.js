'use strict';
const db = require('./db');
const account = require('./user_account');
const crypto = require('crypto');

const register = (walletId, pin) => {
  return account.doesExist(walletId).then((userExist) => {
    if (!userExist) {
      return createUser(walletId, pin);
    }
    return login(walletId, pin);
  });
};

const login = (walletId, pin) => {
  const collection = db().collection('users');
  return collection
    .find({ _id: walletId })
    .limit(1)
    .next()
    .then((user) => {
      if (!user) return Promise.reject({ error: 'user_deleted' });
      return verifyPin(user, pin);

      // TODO: Verify pin later to check with credentials
    });
};

const createUser = (walletId, pin) => {
  const collection = db().collection('users');
  // Generate token using random number
  const token = generateToken();
  const password = token + pin;
  const hashAndSalt = generatePasswordHash(password);
  return collection
    .insertOne({
      _id: walletId,
      password_sha: hashAndSalt[0],
      salt: hashAndSalt[1],
      token,
      failed_attempts: 0,
    })
    .then(() => {
      return token;
    });
};
const generateToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

const generatePasswordHash = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha1');
  hash.update(password + salt);
  return [hash.digest('hex'), salt];
};

const verifyPin = (user, pin) => {
  pin = pin || '';
  const password = user.token + pin;
  const hash = crypto.createHash('sha1');
  const sha = hash.update(password + user.salt).digest('hex');

  if (sha === user.password_sha) {
    if (user.failed_attempts) {
      updateFailCount(user._id, 0);
    }
    return user.token;
  }

  const counter = user.failed_attempts + 1;
  if (counter >= 3) return deleteUser(user._id);
  incrementFailCount(user._id);
  return Promise.reject({ error: 'auth_failed' });
};

const updateFailCount = (id, counter) => {
  const collection = db().collection('users');
  return collection.updateOne(
    { _id: id },
    { $set: { failed_attempts: counter } }
  );
};

const incrementFailCount = (id) => {
  const collection = db().collection('users');
  return collection.updateOne({ _id: id }, { $inc: { failed_attempts: 1 } });
};

const deleteUser = id => {
    const collection = db().collection('users');
    return collection.deleteOne({_id: id}).then(() => {
        return Promise.reject({error: 'user_deleted'});
    });
};

module.exports = {
  register,
  login,
};
