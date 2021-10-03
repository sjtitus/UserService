/*_________________________________________________________________________________________________
*  DbUser 
*  Database entity for user 
*__________________________________________________________________________________________________
 */
import { strict as assert } from 'assert';
import { EncryptPassword, CheckPassword } from '../crypto/mycrypto.js';
import Database from './Database.js';

import {GetModuleLogger} from '../util/Logger.js';
const log = GetModuleLogger('DbUser');

// Database singleton 
const db = Database.Instance('DbUser');
assert(db, "Database instance must exist");

// SQL for database user operations 
const sql = {
    createUser: 'SELECT * from createUser($1,$2,$3,$4,$5,$6)',  // email, first, last, salt, encryptedPW, iters
    getUserByEmail: 'SELECT * FROM usr WHERE email = $1 and isDeleted=false',
    getUserById: 'SELECT * FROM usr WHERE id = $1 and isDeleted=false',
    updateUser: 'UPDATE usr SET email=$1, firstName=$2, lastName=$3, timestampModified=current_timestamp WHERE id=$4 and isDeleted=false RETURNING *',
    deleteUser: 'UPDATE usr SET isDeleted=true, timestampDeleted=current_timestamp WHERE id=$1 RETURNING *'
    //getUserById: 'SELECT * FROM usr WHERE id = $1',
    //deleteUserByEmail: 'DELETE FROM usr WHERE email = $1',
    //deleteUserById: 'DELETE FROM usr WHERE id = $1',
    //getPasswordByUserId: 'SELECT * FROM passwd WHERE id_usr = $1',
}

// Create
async function userCreate( email, firstName, lastName, password ) {
    log.debug(`Create: email='${email}', firstName='${firstName}', lastName='${lastName}'`);
    let [salt, encryptedPassword, cryptIters] = await EncryptPassword(password); 
    log.debug(`Create: password encryption complete (salt=${salt}, cryptIters=${cryptIters})`);
    const { rows:users } = await db.Query( sql.createUser, [email, firstName, lastName, salt, encryptedPassword, cryptIters] );
    if (users.length !== 1) {
        log.error(`Create: email '${email}': unexpected # of records updated: ${users.length}`);
        throw new Error(`Create: email '${email}': unexpected # of records updated: ${users.length}`);
    }
    const newUser = users[0];
    log.debug(`Create: email='${email}': success`);
    return newUser; 
}

// Read (Get) 
// Returns null if user not found
async function userGet({email, id}) {
    assert(email || id, 'must supply email or id');
    const field = (email) ? 'email':'id'; 
    const fval = (email) ? email:id; 
    const query = (email) ? sql.getUserByEmail:sql.getUserById;
    log.debug(`Get: field=${field}, val='${fval}'`);
    const { rows:users } = await db.Query( query, [fval] );
    if (users.length === 0) {
        log.debug(`Get: field=${field}, val='${fval}': no user found`);
        // NOTE: return null if user not found
        return null;
    }
    log.debug(`Get: found ${users.length} users`);
    if (users.length > 1) {
      log.error(`Get: field=${field}, val='${fval}':unexpected # of records returned: ${users.length}`);
      throw new Error(`Get: field=${field}, val='${fval}':unexpected # of records returned: ${users.length}`);
    }
    const foundUser = users[0];
    return foundUser; 
}

// Update
async function userUpdate(email, firstName, lastName, id) {
    log.debug(`Update: id=${id}, email='${email}', firstName='${firstName}', lastName='${lastName}'`);
    const {rows: users} = await db.Query( sql.updateUser, [email, firstName, lastName, id ]);
    if (users.length !== 1) {
        log.error(`Update: user '${email}': unexpected number of records updated: ${users.length}`);
        throw new Error(`Update: user '${email}': unexpected number of records updated: ${users.length}`);
    }
    const updatedUser = users[0];
    log.debug(`Update: email='${email}': success`);
    return updatedUser;
}

// Delete
async function userDelete(id) {
    log.debug(`Delete: id='${id}'`);
    const {rows: users} = await db.Query( sql.deleteUser, [id]);
    if (users.length !== 1) {
        log.error(`Delete: user id='${id}': unexpected number of records updated: ${users.length}`);
        throw new Error(`Delete: user id '${id}': unexpected number of records updated: ${users.length}`);
    }
    const updatedUser = users[0];
    return updatedUser;
}

// export CRUD operations
const DbUser = {
    create: userCreate,
    read: userGet,
    update: userUpdate,
    delete: userDelete
};

export default DbUser;