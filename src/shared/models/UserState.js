import * as Validation from '../Validation.js'

// request default state (for form)
const defaultState = {
    loginTime: '', 
    userID: -1, 
    firstName: '', 
    lastName: '' 
}

// validation: validate any fields that are present
// (used to trigger individual form errors during validation)
function validateState(state) {
    let errs = {};
    if ('loginTime' in state)   {  errs.loginTime = Validation.ValidateUTCTimestamp(state.loginTime);  }
    if ('userID' in state)      {  errs.userID = Validation.ValidateNumber(state.userID);              }
    if ('firstName' in state)   {  errs.firstName = Validation.ValidateString(state.firstName);        }
    if ('lastName' in state)    {  errs.lastName = Validation.ValidateString(state.lastName);          }
    return errs; 
}

// Functions
function loginStatus(state) {
    const validLoginTime = ((state.loginTime.length > 0) && (Validation.ValidateUTCTimestamp(state.loginTime).length === 0));
    if (validLoginTime && state.userID > 0) {
        return 'loggedIn';
    }
    if (validLoginTime && state.userID === -1) {
        return 'loggedOut';
    }    
    return 'unknown';
}

const UserState = { 
   'defaultState': defaultState,
   'validateState': validateState,
   'loginStatus': loginStatus
}

export default UserState; 
