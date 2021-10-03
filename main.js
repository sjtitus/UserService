// Set process maxlisteners to 30 due to the derived loggers
// we create for logging diff modules/levels.
// Must be done first because modules create loggers during import time
process.setMaxListeners(30)

import Config from './config/Config.js';
import UserServer from './src/server/UserServer.js'
import Database from './src/database/Database.js'
import {InstallTopLevelHandlers} from './src/util/ProcessUtils.js';

import {GetModuleLogger} from './src/util/Logger.js';
const Logger = GetModuleLogger('main');

//_________________________________________________________________________________________________
// Global error handlers
// Handle unhandled promise rejections by logging and exiting
const unhandledRejectionHandler = (error) => {
    //Logger.error(`** Global handler: unhandledRejection (exiting): ${error.message}, ${error.stack}`);
    process.exit(-1);
};
// Handle uncaught exceptions by logging and exiting
const uncaughtExceptionHandler = (error) => {
    //Logger.error(`** Global handler: uncaughtException (exiting): ${error.message}, ${error.stack}`);
    process.exit(-2);
};

const exitHandler = (code) => {
    Logger.info(`** Global handler: exit event: exiting with code ${code}`);
}

Logger.info(``);
Logger.info(`___________________________________________________________`);
Logger.info(`Start backend`);
Logger.info(`__________ Install process-level exception handlers`);
InstallTopLevelHandlers(unhandledRejectionHandler, uncaughtExceptionHandler, exitHandler);

Logger.info(``);
Logger.info(`__________  Test database connection`);
const db = Database.Instance('main');
await db.TestConnection();
Logger.info(`Database connection: ok`);

Logger.info(``);
Logger.info(`__________ Initialize API`);
let uServer = new UserServer();

Logger.info(``);
Logger.info(`__________ Start API`);
await uServer.Start();
Logger.info(`API start: ok`);
Logger.info(``);
Logger.info(`Start backend: complete`);
Logger.info(`___________________________________________________________`);
Logger.info(``);
