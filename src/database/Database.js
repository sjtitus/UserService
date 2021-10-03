/*__________________________________________________________________________________________________
 * Database 
 * Singleton object encapsulating a Postgres DB 
 *__________________________________________________________________________________________________
*/
import { strict as assert } from 'assert';
import Config from '../../config/Config.js';
import Pool from 'pg-pool';
import util from 'util';

import {GetModuleLogger} from '../util/Logger.js';
const log = GetModuleLogger('Database');

//_____________________________________________________________________________
// Configuration
// Get configuration from file config.js for now.
// Currently, config is just pg-pool settings.
const config = Config.database;

//_____________________________________________________________________________
// Singleton instance 
let instance = null;

//_____________________________________________________________________________
// Database class 
class Database {
    
    constructor(dbConfig) {
        assert(dbConfig);
        log.info(` . creating database`)
        this.config = dbConfig;
        this._createPool();
    }

    //_____________________________________________________
    // Static methods for database pool event handling 
    static _poolError(error, client) {
        log.error(`[ db pool ERROR: ${error.message}, client pid: ${client.pid} ]`);
        //log.error(`Pool error: ${error.message}, client pid: ${client.pid}, full error: ${util.format('%o',error)}`);
        throw new Error(`Pool ERROR: ${error.message}, client pid: ${client.pid}`);
    }
    
    static _poolConnect(client) {
        log.debug(`[ db pool: CONNECT: host: ${client.host} port: ${client.port} pid: ${client.processID} db: ${client.database} user: ${client.user} ]`);
    }
    
    static _poolRemove(client) {
        log.debug(`[ db pool: REMOVE: host: ${client.host} port: ${client.port} pid: ${client.processID} db: ${client.database} user: ${client.user} ]`);
    }
    
    static _poolAcquire(client) {
        log.debug(`[ db pool: ACQUIRE: host: ${client.host} port: ${client.port} pid: ${client.processID} db: ${client.database} user: ${client.user} ]`);
    }

    //_____________________________________________________
    // Create the database pool 
    _createPool() {
        log.info(' . creating new connection pool');
        log.debug(`    . user: ${this.config.user}`);
        log.debug(`    . host: ${this.config.host}`);
        log.debug(`    . database: ${this.config.database}`);
        log.debug(`    . password: ${this.config.password}`);
        log.debug(`    . port: ${this.config.port}`);
        log.debug(`    . max: ${this.config.max}`);
        log.debug(`    . idleTimeoutMillis: ${this.config.idleTimeoutMillis}`);
        log.debug(`    . connectionTimeoutMillis: ${this.config.connectionTimeoutMillis}`);
        try {
            this.pool = new Pool(this.config);
            log.info(' . binding event handlers (on error,connect,remove,acquire');
            this.pool.on('error', Database._poolError.bind(this));
            this.pool.on('connect', Database._poolConnect.bind(this)); 
            this.pool.on('remove', Database._poolRemove.bind(this));
            this.pool.on('acquire', Database._poolAcquire.bind(this));
        }
        catch (error) {
            log.error(`Failed to create database pool: ${error.message} stack: ${error.stack}`);
            throw(error);
        }
    } 
   
    //_____________________________________________________
    // Test database connectivity
    // By executing 'SELECT NOW()' 
    async TestConnection() {
        log.info(`Testing database connection`);
        const res = await this.Query('SELECT NOW()');
        if (res.rows.length !== 1) {
            throw new Error(`Test connection query 'SELECT NOW()' failed to return 1 row`);
        }
        log.debug(` . test successful: time: '${res.rows[0].now}'`);
    }

    //_____________________________________________________
    // Query wrapper
    // Async wrapper around pool.query 
    async Query(text, params) { 
        log.debug(`Query: ${text}, ${params}`);
        let res = null;
        try {
            res = await this.pool.query(text, params);
        }
        catch (error) {
            delete error.stack;
            // Uncomment for full error info in log message
            // log.error(`Query error: ${error.message} (code: ${error.code})\nquery text: ${text}\nquery params: ${params}\nfull error: ${util.format('%o', error)}`);
            log.error(`Query error: ${error.message} (code: ${error.code}), query: ${text}, params: ${params}`);
            let e = new Error(`Query error: ${error.message} (code: ${error.code})`);
            e.code = error.code;
            throw e; 
        }
        return res;
    } 

}

//__________________________________________________________________________________________________
// Singleton implementation
function getSingleton(clientName) {
    if (instance === null) {
        log.debug(`Creating singleton database instance`);
        instance = new Database(config);
    }
    log.debug(`Returning singleton instance (client: '${clientName}')`);
    return instance;
}

export default {
    Instance: getSingleton,
}
