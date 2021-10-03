import * as Validation from '../Validation.js'

// Form initial state
const defaultState = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordRepeat: '',
    rememberMe: false 
};

// required request fields
const requiredFields = ['firstName', 'lastName', 'email', 'password', 'passwordRepeat', 'rememberMe'];
   
function validateState(state) {
    let errs = {};
    if ('firstName' in state)   { errs.firstName = Validation.ValidateString(state.firstName);      }
    if ('lastName' in state)    { errs.lastName = Validation.ValidateString(state.lastName);        }
    if ('email' in state)       { errs.email = Validation.ValidateEmail(state.email);               }
    if ('password' in state)    { errs.password = Validation.ValidateString(state.password);        }
    if ('rememberMe' in state)  { errs.rememberMe = Validation.ValidateBoolean(state.rememberMe);    }
    if ('passwordRepeat' in state && 'password' in state) 
        { errs.passwordRepeat = Validation.ValidateStringEqual(state.passwordRepeat, state.password, 'password'); }
    return errs; 
}

// validate incoming request: body must contain required fields with valid values
function validateRequest(req) {
   let res = {
      error: false,
      message: ''
   };
   // required fields must be present
   if (!('body' in req) || !(requiredFields.every((f) => (f in req.body)))) {
      res.error = true;
      res.message = "missing body or 1+ fields";
   }
   else { 
      // fields must have valid values 
      const errs = validateState(req.body);
      const badFields = Object.keys(errs).filter((k) => (errs[k].length > 0));
      if (badFields.length > 0) {
         const bs = badFields.join(', ');
         res.error = true;
         res.message = `invalid fields in request: ${bs}`;
      }
   } 
   return res; 
}

const e = {
   'defaultState': defaultState,
   'validateState': validateState,
   'validateRequest': validateRequest
};

export default e; 