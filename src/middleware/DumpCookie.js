import {GetModuleLogger} from '../util/Logger.js';
const log = GetModuleLogger('Cookie');

// Middleware to dump incoming cookies
function DumpCookie(req, res, next) {
    if ('cookie' in req.headers) {
      log.debug(`Incoming cookie: '${req.headers.cookie} (${req.method} ${req.originalUrl})`); 
    }
    else {
      log.debug(`Incoming cookie: NONE (${req.method} ${req.originalUrl})`); 
    }
    next();
}

export default DumpCookie;