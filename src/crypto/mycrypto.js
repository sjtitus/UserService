import * as crypto from 'crypto';
import { promisify } from 'util';
const async_pbkdf2 = promisify(crypto.pbkdf2);

const crypt_iters = 100000;
const crypt_keylen = 128;
const crypt_alg = 'sha256';
const crypt_saltlen = 16;

export const crypt_testsalt = Buffer.from([
  0x01, 0x02, 0x03, 0x04,
  0x05, 0x02, 0x03, 0x04,
  0x06, 0x02, 0x03, 0x04,
  0x07, 0x02, 0x03, 0x04,
]).toString('hex');

//_____________________________________________________________________________
// Encrypt a cleartext password
// Returns: [salt, encrypted hex password, encryption iterations]
export async function EncryptPassword(password) {
  const salt = crypto.randomBytes(crypt_saltlen).toString('hex');
  const encryptedBuff = await async_pbkdf2(password, salt, crypt_iters, crypt_keylen, crypt_alg);
  return [salt, encryptedBuff.toString('hex'), crypt_iters];
}

//_____________________________________________________________________________
// Check a cleartext password against a specified encrypted password
// Returns: true if passwords match
export async function CheckPassword(password, encryptedPassword, salt, iters) {
  let encryptedBuff = await async_pbkdf2(password, salt, iters, crypt_keylen, crypt_alg);
  let encryptedNew = encryptedBuff.toString('hex');
  return (encryptedNew === encryptedPassword);
}
