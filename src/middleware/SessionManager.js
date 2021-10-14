/*_________________________________________________________________________________________________
    SessionManager
    Simple session management using express-session and memorystore.
  _________________________________________________________________________________________________
*/
import session from 'express-session';
import mstore from 'memorystore';
import Config from '../../config/Config.js';
import {GetModuleLogger} from '../util/Logger.js';
import redis from 'redis';
import connectRedis from 'connect-redis';

const log = GetModuleLogger('SessionManager');


const MemoryStore = mstore(session);

class SessionManager {

    constructor() {
        log.info(` . sessionManager: construct`);
        this.sessionConfig = Config.server.session;
        _createStore();
        this.sessionConfig['store'] = this.store; 
        log.info(`    . create middleware`);
        this._middleware = session(this.sessionConfig);
        // TODO: make _logConfig log based on type of store 
        this._logConfig();
    }

    _createStore() {
        this.storeConfig = Config.server.sessionStore; 
        log.info(`    . create store (type: ${this.storeConfig.type})`);
        if (this.storeConfig.type === 'memorystore') {
            log.info(`    . create memorystore`);
            const MemoryStore = mstore(session);
            this.store = new MemoryStore( {
                checkPeriod: this.storeConfig.memoryStoreConfig.checkPeriod, 
                noDisposeOnSet: this.storeConfig.memoryStoreConfig.noDisposeOnSet,
                dispose: (key, val) => { log.debug(`session memorystore: deleting key ${key} (value=${val})`); },
            }); 
            log.info(`    . start stale session reaping`);
            this.store.startInterval();
        }
        else if (this.storeConfig.type === 'redis') {
            log.info(`    . create redis`);
            const RedisStore = connectRedis(session);
            this.redisClient = redis.createClient({
                host: this.storeConfig.redisConfig.host,
                port: this.storeConfig.redisConfig.port
            });
            this.store = new RedisStore({client: this.redisClient}); 
        }
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
