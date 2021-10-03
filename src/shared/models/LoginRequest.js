import * as Validation from '../Validation.js'

// request default state (for form)
const defaultState = {
    email: '',
    password: '',
    rememberMe: false,
};

// required request fields
const requiredFields = ['email', 'password', 'rememberMe'];

// validation: validate any fields that are present
// (used to trigger individual form errors during validation)
function validateState(state) {
    let errs = {};
    if ('email' in state)       { errs.email = Validation.ValidateEmail(state.email);               }
    if ('password' in state)    { errs.password = Validation.ValidateString(state.password);        }
    if ('rememberMe' in state)  { errs.rememberMe = Validation.ValidateBoolean(state.rememberMe);   }
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
        res.message = "missing one or more required fields";
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

export default {
   'defaultState': defaultState,
   'validateState': validateState,
   'validateRequest': validateRequest
}
