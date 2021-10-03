import expressWinston from 'express-winston';

import {GetModuleLogger} from '../util/Logger.js';
const log = GetModuleLogger('RequestLogger');

const RequestLogger = expressWinston.logger({
    winstonInstance: log,
    level: "info",
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    colorize: true
    //ignoreRoute: function (req, res) { 
    //    const exclude = (/favicon/.test(req.url));   
    //    return exclude; 
    //}
});

export default RequestLogger;