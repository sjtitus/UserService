import { strict as assert } from 'assert';

export function DeleteSession(req, res) {
   assert( req && res && req.session && res.locals.sessionManager );
   const cookieName = res.locals.sessionManager.sessionConfig.name;
   const cookiePath = res.locals.sessionManager.sessionConfig.path;
   res.clearCookie(cookieName, { path: cookiePath });
   req.session.destroy();
}