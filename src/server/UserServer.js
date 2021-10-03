/*_____________________________________________________________________________
 * UserService: backend server
 *_____________________________________________________________________________
*/
import { strict as assert } from 'assert';
import httpContext from 'express-http-context';
import express from 'express';
import Config from '../../config/Config.js';
import {GetModuleLogger} from '../util/Logger.js';
import cors from 'cors';

// Swagger and JsDoc: API documentation
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

// Middleware
import {generate404, raiseError} from '../middleware/ErrorHandling.js';
import DumpCookie from '../middleware/DumpCookie.js';
import RequestLogger from '../middleware/RequestLogger.js';
import SessionManager from '../middleware/SessionManager.js';
import SetRequestId from '../middleware/SetRequestId.js';

// API routes
import userRoutes from '../routes/userRoutes.js';

const log = GetModuleLogger('UserServer');

class UserServer {  
  constructor() {
      log.info(`UserServer: construct`);
      this.app = null;
      log.info(` . port: ${Config.server.port}`);
      this.port = Config.server.port;
      log.info(` . set swagger-jsdoc options`);
      this.jsDocOptions = Config.api.jsDocOptions;
      log.info(` . create session manager`);
      this.sessionManager = new SessionManager(); 
  }

  // Start the server 
  async Start() {
    assert(this.app === null, "already started")
    log.info(`UserServer start`);
    log.info(` . create express app`); 
    this.app = express();
    log.info(` . parse API doc spec`);
    this.apiSpec = await swaggerJsDoc(this.jsDocOptions);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    // Actually start the server 
    log.info(` . start server on port ${this.port}`);
    this._httpServer = this.app.listen(this.port, function(){
      log.info(`[ user service successfully listening on port ${this.port} ]`);
    }.bind(this));
  }

  // Stop the server 
  async Stop() {
    assert(false, "not implemented yet")
  }

  // Set up express middleware stack 
  setupMiddleware() {
    log.info(` . set up middleware`);
    log.info(`    . middleware: httpContext`);
    this.app.use(httpContext.middleware);
    log.info(`    . middleware: set request id`);
    this.app.use(SetRequestId);
    log.info(`    . middleware: express.json`);
    this.app.use(express.json());
    log.info(`    . middleware: session management`);
    // this is where session gets injected
    this.app.use(this.sessionManager.middleware);
    const sessionManager = this.sessionManager;
    this.app.use(function(req, res, next){
      res.locals.sessionManager = sessionManager; 
      next();
    });
    log.info(`    . middleware: request logging (winston)`);
    this.app.use(RequestLogger);
    log.info(`    . middleware: incoming cookie`);
    this.app.use(DumpCookie);
    log.info(`    . middleware: cors`);
    this.app.use(cors({
      origin: 'http://my.tituscribbage.com:3000',  
      credentials: true
    }));
    /*
    log.info(`    . middleware: detect orphan session`);
    this.app.use(function(req, res, next) {
      // a session without a user_id should not happen
      if (('session' in req) && !('user_id' in req.session)) {
         log.error(`session with no user id`);
      }
      next(); 
    });
    */

  }


  // Set up endpiont routes
  setupRoutes() {
    log.info(` . set up routes`);
    log.info(`    . route: /favicon`);
    this.app.get('/favicon.ico', function(req, res) {
      res.sendStatus(204);
    });
    log.info(`    . route: /`);
    this.app.get('/', function(req, res){
      res.status(200).json({"message" : "backend server for cribbage game"});
    });
    log.info(`    . route: /socketTest`);
    this.app.get('/socketTest', function(req, res){
      res.sendFile(process.cwd() + '/public/socketTest.html');
    });
    log.info(`    . route: /api-docs`);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(this.apiSpec));
    log.info(`    . route: [user routes]`);
    this.app.use('/', userRoutes); 
  }
  
  // Set up error handling 
  setupErrorHandling() {
    log.info(` . set up error handling`);
    log.info(`    . generate 404`);
    this.app.use(generate404);
    log.info(`    . raise 404/500`);
    this.app.use(raiseError);
  } 

  // Return the underlying HTTP server
  // (used to multiplex socketio)
  get httpServer() {
    return this._httpServer;
  }
}

export default  UserServer