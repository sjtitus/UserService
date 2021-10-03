/*_________________________________________________________________________________________________
*  User 
*  Backend business-layer User model
*  Reads and writes JS object model to/from the database 
*__________________________________________________________________________________________________
 */
import { strict as assert } from 'assert';
import DbUser from '../database/DbUser.js'; 
import JSUser from '../shared/models/User.js';

import {GetModuleLogger} from '../util/Logger.js';
const log = GetModuleLogger('User');

export class User {
   
   constructor() {
      this._user = { ...JSUser.initialState };
      this._dbUser = null; 
      log.debug(`Constructor: new uninitialized user ${JSON.stringify(this._user)}`);
   }

   get UserObject() { return this._user; }
   get DBObject() { return this._dbuser; }

   // create a new user in the database and load that user
   // return true on success, false if user already exists
   // throws on unexpected error 
   async Create( email, firstName, lastName, password ) {
      assert(this._user.id === -1 && this._dbUser === null, `Create: user must be uninitialized`);
      assert(email.length && firstName.length && lastName.length && password.length);
      log.debug(`Create: email=${email}, firstName=${firstName}, lastName=${lastName}`);
      try {
         const dbUser = await DbUser.create(email, firstName, lastName, password);
         this._dbUser = dbUser;
         this._convert();
         return true;
      }
      catch (e) {
         // collision with existing user
         if (e.code === 'ST001') {
            log.warn(`Create: user already exists with email ${email}`); 
            return false;
         }
         // some other problem? (throw 500)
         else { 
            log.error(`Create: db user creation failed: ${e.message}`);
            throw(e);
         } 
      }
   }

   // Note: returns NULL if user DNE
   async Load(userId) {
      assert(this._user.id === -1 && this._dbUser === null, `Load: user must be uninitialized`);
      log.debug(`Load: id=${userId}`);
      const dbUser = await DbUser.read({id: userId});
      this._dbUser = dbUser;
      this._convert();
      return (dbUser !== null);
   }

   async Update() {
   }

   async Delete(userId=null) {
      let id;
      // Delete this user 
      if (userId === null) {
         assert((this._user.id !== -1 && this._dbUser !== null && this._user.id === this._dbUser["id"]), `Delete: JS and db users not in sync`);
         id = this._user.id;
         log.debug(`Delete: deleting and reloading user id=${id}`);
      }
      else {
         assert(this._user.id === -1 && this._dbUser === null, `Delete (by Id): user must be uninitialized`);
         id = userId; 
         log.debug(`Delete: deleting and loading user id=${id}`);
      }
      const dbUser = await DbUser.delete(id);
      this._dbUser = dbUser;
      this._convert();
      return (dbUser !== null);
   }

   // Convert the DB user to a JS user 
   _convert() {
      if (this._dbUser === null) {
         log.warn(`User model: attempt to convert null db object to JS object (db object deleted?)`);
         this._user = { ...JSUser.initialState };
         //throw new Error(`User model: attempt to convert null db object to JS object`);
         return;
      }
      this._user.id = this._dbUser["id"];
      this._user.email = this._dbUser["email"];
      this._user.firstName = this._dbUser["firstname"];
      this._user.lastName = this._dbUser["lastname"];
      this._user.created = this._dbUser["timestampcreated"];
      this._user.modified = this._dbUser["timestampmodified"];
      this._user.deleted = this._dbUser["timestampdeleted"]
      if (!JSUser.isValid(this._user)) {
         const errs = JSUser.validateState(this._user);
         log.error(`User model: id=${this._user.id}: db object (fields invalid/missing): ${JSON.stringify(errs)}`);
         throw new Error(`User model: id=${this._user.id}: invalid db object (fields invalid/missing)`);
      }
   }
}
