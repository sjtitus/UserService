/*_____________________________________________________________________________
 * ErrorHandling middleware
 * NOTE: this middleware should be last in the middleware chain. 
 *_____________________________________________________________________________
*/

import {GetModuleLogger} from '../util/Logger.js';
const log = GetModuleLogger('ErrorHandling');

// explicit404: needs to be after all application logic middleware, but
// before 'raiseError' below. If we've fallen through to this point, 
// application didn't handle path: generate a 404 error.
export function generate404(req, res, next) {
    log.debug(`no handler for path ${req.method} ${req.url}`);
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
}

// raise: raise a 404 if path wasn't found, or 500 error if an explicit
// non-404 error was raised 
export function raiseError(err, req, res, next) {
    if (err.status === 404) {
      log.warn(`Global 404 generated: ${err.message}`);
      res.status(404).json({message: `Not Found`});
    }
    else {
      log.error(`Global 500 generated: ${err.message} (status: ${err.status}), stack ${err.stack}`);
      res.status(500).json({message: `Internal server error: ${err.message}`});
    }
}

