/*_________________________________________________________________________________________________
    SessionManager
    Simple session management using express-session and memorystore.
  _________________________________________________________________________________________________
*/
import session from 'express-session';
import mstore from 'memorystore';
import Config from '../../config/Config.js';
import {GetModuleLogger} from '../util/Logger.js';

const log = GetModuleLogger('SessionManager');

const MemoryStore = mstore(session);

class SessionManager {

    constructor() {
        log.info(` . sessionManager: construct`);
        this.sessionConfig = Config.server.session;
        this.storeConfig = Config.server.sessionStore; 
        log.info(`    . create MemoryStore`);
        this.store = new MemoryStore({
            checkPeriod: this.storeConfig.checkPeriod, 
            noDisposeOnSet: this.storeConfig.noDisposeOnSet,
            dispose: (key, val) => { log.debug(`session memorystore: deleting key ${key} (value=${val})`); },
        });
        log.info(`    . start stale session reaping`);
        this.store.startInterval();
        this.sessionConfig.store = this.store; 
        log.info(`    . create middleware`);
        this._middleware = session(this.sessionConfig); 
        this._logConfig();
    }

    get middleware() {
        return this._middleware;
    }

    _logConfig() { 
        log.info(`    . session settings`); 
        log.info(`      . cookie name: ${this.sessionConfig.name}`); 
        log.info(`      . cookie secure: ${this.sessionConfig.cookie.secure}`); 
        log.info(`      . cookie sameSite: ${this.sessionConfig.cookie.sameSite}`); 
        if (!('maxAge' in this.sessionConfig.cookie)) {
            log.info(`      . cookie maxAge: undefined (expires on browser close)`); 
        }
        else {
            log.info(`      . cookie maxAge: ${this.sessionConfig.cookie.maxAge}`); 
        }
        log.info(`      . resave: ${this.sessionConfig.resave}`); 
        log.info(`      . saveUnitialized: ${this.sessionConfig.saveUninitialized}`); 
        log.info(`      . httpOnly: ${this.sessionConfig.cookie.httpOnly}`); 
        log.info(`      . memorystore: sessions reaped every ${this.storeConfig.checkPeriod/(1000*60*60)} hours`);
    }
}

export default SessionManager; 
