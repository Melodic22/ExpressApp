const crypto = require('crypto');

//function to hash a password
async function hashPassword(password, salt) {
    return new Promise((res, rej) => {
        crypto.pbkdf2(password, salt, 120000, 64, 'sha512', (err, derivedKey) => {
            if (err) {
                rej(err);
            } else {
                res(derivedKey.toString('hex'));
            }
        });
    });
};

module.exports = {hashPassword}