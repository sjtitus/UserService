/*_________________________________________________________________________________________________
 * Validation
 *_________________________________________________________________________________________________
 */

 const utcTimestampRegexp = /^([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{3})Z$/;
 const emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

 export function ValidateNumber(x) {
   const c = (typeof(x)==='number' && !Number.isNaN(x));
   return c ? '': `must be a number`;
 }

 export function ValidateBoolean(x) {
   const c = (typeof(x)==='boolean');
   return c ? '': 'must be boolean'
 }

 export function ValidateEmail(x) {
   const c = ((typeof(x)=='string') && emailRegexp.test(x));
   return c ? '':`must be valid email`;
 }

 export function ValidateString(x) {
    const c = ((typeof(x)=='string') && (/\S/.test(x)));
    return c ? '':`field is required`;
 }
 
 export function ValidateStringEqual(x, y, y_name) {
    const c = ((typeof(x)=='string') && (x === y));
    return c ? '':`must match '${y_name}'`;
 }

 export function ValidateUTCTimestamp(x) {
    const c = (typeof(x)=='string' && (x.match(utcTimestampRegexp) !== null))  
    return c ? '':`must be an ISO UTC timestamp string`;
 }

 export function ValidateDate(x) {
    const c = (Object.prototype.toString.call(x) === "[object Date]");
    return c ? '':`must be a javascript Date object`;
 }
