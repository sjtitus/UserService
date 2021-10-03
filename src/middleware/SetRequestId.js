import { v4 as uuidv4 } from 'uuid';
import httpContext from 'express-http-context';
import {GetModuleLogger} from '../util/Logger.js';

const log = GetModuleLogger('SetRequestId');

// Middleware to set up an 8-character unuique request ID 
function SetRequestId(req, res, next) {
    const reqid = uuidv4().substring(0,8);
    httpContext.set('reqid', reqid);
    req.reqid = reqid;
    log.info(`_____________________________`);
    log.info(`HTTP ${req.method} ${req.url}`);
    next(); 
}

export default SetRequestId;