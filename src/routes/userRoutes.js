/*_________________________________________________________________________________________________
 * UserService API
 *    GET      /user       return logged in user
 *    GET      /user/:id   return user by id 
 *    PUT      /user/:id   update user by id 
 *    DELETE   /user/:id   delete a user by id 
 *    POST     /users      create a new user 
 *    POST     /login      login an existing user  
 *    POST     /logout     logout the logged in user 
 *_________________________________________________________________________________________________
*/
import express from 'express';
import { User } from '../models/User.js'; 
import { DeleteSession } from './Helpers.js'; 
import SignupRequest from '../shared/models/SignUpRequest.js';
import Config from '../../config/Config.js';
import { GetModuleLogger } from '../util/Logger.js';
import * as Validation from '../shared/Validation.js';

const log = GetModuleLogger('UserRoutes');

const router = express.Router();

//_________________________________________________________________________________________________
// GET /user      Get logged in user
/**
 * @openapi
 *  /user:
 *  get:
 *      tags:
 *          - user
 *      description: Returns currently logged in user 
 *      responses:
 *          '200':
 *              $ref: '#/components/responses/User'
 *          '202':
 *              $ref: '#/components/responses/NotLoggedIn'
 */ 
async function GetUser(req, res, next) {
   try {
      log.debug(`GetUser (API): checking for logged in user`);
      const user = await _LoadLoggedInUser(req, res);
      if (user) {
         log.debug(`GetUser (API): user ${user.UserObject.email} logged in (uid=${user.UserObject.id})`);
         res.status(200).json(user.UserObject);
      }
      else {
         log.debug(`GetUser (API): no user logged in`); 
         res.status(202).json({ "message": "user not logged in" });
      }
   }
   catch (err) {
      next(err)
   }
}
router.get('/user', GetUser); 


//_________________________________________________________________________________________________
// POST /users    Create/Signup new user
/**
 * @openapi
 *  /users:
 *  post:
 *      tags:
 *          - user
 *      description: Creates new user
 *      requestBody: 
 *          $ref: '#/components/requestBodies/NewUserReqBody'
 *      responses:
 *          '201': 
 *              $ref: '#/components/responses/NewUserCreated'
 *          '400': 
 *              $ref: '#/components/responses/BadRequest'
 *          '409': 
 *              $ref: '#/components/responses/UserExists'
 */
async function CreateUser(req, res, next) {
   try {
      // validate the request
      const { error, message } = SignupRequest.validateRequest(req);
      if (error) {
         log.debug(`CreateUser (API): bad request: ${message}`);
         res.status(400).json({ message: message });
         return;
      }
      const {firstName, lastName, email, password, rememberMe } = req.body;
      // Admin user creating another user 
      // TODO: add authorization validating admin (return a 401) 
      let callingUser = await _LoadLoggedInUser(req, res);
      if (callingUser) {
         log.debug(`CreateUser (API): existing user ${callingUser.UserObject.email} creating new user ${email}`);
      }
      // attempt signup
      // may collide with existing user or fail for some other reason  
      log.debug(`CreateUser (API): create new user: email=${email}, firstName=${firstName}, lastName=${lastName}`);
      let newUser = new User();
      const ok = await newUser.Create(email, firstName, lastName, password);
      if (!ok) {
         res.status(409).json({ message: `user already exists` });
         return;
      }
      // successful user creation! 
      // add user_id to session (this will trigger cookie creation at far end)
      const userObject = newUser.UserObject;
      log.debug(`CreateUser (API): new user created: email=${userObject.email}, id=${userObject.id}`);
      //
      // signup: set the session info and 'rememberMe' if applicable
      if (!callingUser) {
         log.debug(`CreateUser (API): new user signup: creating session/cookie`); 
         req.session.user_id = userObject.id; 
         // if rememberme is on, make session persist 
         if (rememberMe) {
            const sessionDays = Config.server.session.maxAgeDays;
            log.debug(`CreateUser (API): remembering user ${userObject.email} for ${sessionDays} days`);
            req.session.cookie.maxAge = sessionDays * 24 * 60 * 60 * 1000;
         }
      } 
      //
      res.status(201).json(userObject);
   }
   catch (err) { 
      next(err)
   }
}
router.post('/users', CreateUser); 


//_________________________________________________________________________________________________
// GET /user/:id     Get a specific user
//_________________________________________________________________________________________________
/**
 * @openapi
 *  /user/{userId}:
 *  get:
 *      tags:
 *          - user
 *      description: Return a specific user 
 *      parameters:
 *          - $ref: '#/components/parameters/userIdParam'
 *      responses:
 *          '200':
 *              $ref: '#/components/responses/User'
 *          '401':
 *              $ref: '#/components/responses/Unauthorized'
 *          '404':
 *              $ref: '#/components/responses/NotFound'
 */
async function GetUserById(req, res, next) {
   try {
      // authenticated users only
      const callingUser = await _LoadLoggedInUser(req, res);
      if (!callingUser) {
         log.warn(`GetUserById (API): logged in user required`); 
         res.status(401).json({ message: `logged in user required` });
         return;
      }
      const id = parseInt(req.params.id);
      const errmsg = Validation.ValidateNumber(id);
      if (errmsg) {
         log.warn(`GetUserById (API): invalid user id in request: ${errmsg}`);
         res.status(400).json({ message: errmsg });
         return;
      }
      log.debug(`GetUserById (API): getting user with id=${id}`);
      const user = new User();
      const exists = await user.Load(id);
      if (!exists) {
         log.warn(`GetUserById (API): no user with id=${id}`);
         res.sendStatus(404);
         return;
      }
      res.status(200).json(user.UserObject);
   }
   catch (err) {
      next(err)
   }
}
router.get('/user/:id', GetUserById); 


//_________________________________________________________________________________________________
// DELETE /user/:id     delete a specific user
//_________________________________________________________________________________________________
/**
 * @openapi
 *  /user/{userId}:
 *  delete:
 *      tags:
 *          - user
 *      description: Delete a specific user 
 *      parameters:
 *          - $ref: '#/components/parameters/userIdParam'
 *      responses:
 *          '200':
 *              $ref: '#/components/responses/OK'
 *          '404':
 *              $ref: '#/components/responses/NotFound'
 *          '401':
 *              $ref: '#/components/responses/Unauthorized'
 *          '400':
 *              $ref: '#/components/responses/BadRequest'
 */
async function DeleteUserById(req, res, next) {
   try {
      // authenticated users only
      // TODO: calling user must be an admin?? 
      const callingUser = await _LoadLoggedInUser(req, res);
      if (!callingUser) {
         log.warn(`DeleteUserById (API): logged in user required`); 
         res.status(401).json({ message: `logged in user required` });
         return;
      }
      const id = parseInt(req.params.id);
      const errmsg = Validation.ValidateNumber(id);
      if (errmsg) {
         log.warn(`DeleteUserById (API): invalid user id in request: ${errmsg}`);
         res.status(400).json({ message: errmsg });
         return;
      }
      log.debug(`DeleteUserById (API): deleting user with id=${id}`);
      const user = new User();
      const exists = await user.Delete(id);
      if (!exists) {
         log.warn(`DeleteUserById (API): no user with id=${id}`);
         res.sendStatus(404);
         return;
      }
      res.status(200).json(user.UserObject);
   }
   catch (err) {
      next(err)
   }
}
router.delete('/user/:id', DeleteUserById); 







/**
 * @openapi
 *
 *  /users:
 *  get:
 *      tags:
 *          - user
 *      description: Returns all users 
 *      responses:
 *          '200':
 *              $ref: '#/components/responses/UserList'
 *          '401':
 *              $ref: '#/components/responses/Unauthorized'
 */ 
async function getUsers(req, res, next) {
    try {
        res.status(200).json({"message" : "get /users route"});
    }
    catch (err) {
      next(err)
    }
}
router.get('/users', getUsers); 





async function delayTest(req, res, next) {
    try {
        const delayMillisec = req.query.delayMillis || 5000;
        log.debug(`delayTest: waiting for ${delayMillisec} ms before returning`);
        await new Promise( (resolve) => setTimeout(resolve, delayMillisec) );
        res.setHeader('Access-Control-Allow-Origin','http://localhost:3000');
        res.setHeader('Vary','Origin');
        res.status(200).json({"message" : "delayTest successful"});
    }
    catch (err) {
      log.error(`delayTest: error waiting for ${delayMillisec} ms before returning: ${err.message}`);
      next(err)
    }
}
router.get('/delayTest', delayTest); 






//_____________________________________________________________________________
// _LoadLoggedInUser
// Load and return the currently logged in user from datastore.
// If a session with a user_id exists but there is no db user, delete the session 
// and log an error. Returns user or null.
async function _LoadLoggedInUser(req, res) {
   let user = null;
   if ('user_id' in req.session) {
      const uid = req.session.user_id;
      log.debug(`LoadLoggedInUser: found active session (sid=${req.session.id}, uid=${uid})`);
      user = new User();
      const userFound = await user.Load(uid);
      if (!userFound) {
         // session exists without user: stale session (user got deleted from db somehow)
         user = null;
         log.error(`LoadLoggedInUser: stale session (sid=${req.session.id}, uid=${uid}), deleting session/cookie`);
         DeleteSession(req, res);
         throw new Error(`stale user session deleted, please try again`);
      }
   }
   return user; 
}

export default router;



/*
If a user is attempting to authenticate, but provides invalid credentials, the response should have a status of 401, regardless of if you 
are using Basic Authorization or not. 401 indicates that authentication failed, but the user can alter their request and attempt again.

If a user is authenticated, but not authorized to access the requested resource, then the response should have a status of 403. 
403 indicates that the user is forbidden from accessing the resource, and no matter how they alter the request, they will not be 
permitted access.

In the scenario that your endpoint requires the credentials to be in the body of the request, you should return a 400 if the 
request body does not meet your specifications.
            

//log.warn(`logoutUser: clearing session cookie`); 
            //res.clearCookie('cribbage', {path: "/"});
            //log.warn(`logoutUser: destroying session`); 
            //req.session.destroy();

*/
