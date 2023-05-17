const sqlite=require('sqlite3');

const RunningDb = require('../runningDb');
const db = RunningDb.getDb();
const crypto = require('crypto');

exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM USERS WHERE EMAIL = ?';
    db.get(sql, [email], (err, row) => {
      if (err) {
        reject(err);
      }
      else if (row === undefined) {
        resolve(false);
      }
      else {
        const user = {id: row.ID, username: row.EMAIL, name: row.NAME};
        crypto.scrypt(password, row.SALT, 32, function(err, hashedPassword) {
          if (err) reject(err);
          if(!crypto.timingSafeEqual(Buffer.from(row.HASH, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      }
      else if (row === undefined) {
        resolve({error: 'User not found!'});
      }
      else {
        const user = {id: row.ID, username: row.EMAIL, name: row.NAME};
        resolve(user);
      }
    });
  });
};
