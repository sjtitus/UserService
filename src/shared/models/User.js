/*_________________________________________________________________________________________________
 * User
 * User model (javascript object) 
 *_________________________________________________________________________________________________
 */
import * as Validation from '../Validation.js';

// Initial state (empty state)
// NOTE: this state is not valid 
const initialState = {
    id: -1,
    email: '',
    firstName: '',
    lastName: '',
    created: null,
    modified: null
//  deleted: null       Not exposed 
};

// required request fields
const requiredFields = ['id', 'email', 'firstName', 'lastName', 'created', 'modified'];

const testState = {
    id: 777,
    email: 'steve.titus@bozo.com',
    firstName: 'steve',
    lastName: 'titus',
    created: new Date('1969/03/04').toISOString(),
    modified: '',
};
   
function validateState(state) {
    let errs = {};
    if ('id' in state)           { errs.id = Validation.ValidateNumber(state.id);               }
    if ('email' in state)        { errs.email = Validation.ValidateEmail(state.email);          }
    if ('firstName' in state)    { errs.firstName = Validation.ValidateString(state.firstName); }
    if ('lastName' in state)     { errs.lastName = Validation.ValidateString(state.lastName);   }
    if ('created' in state)      { errs.created = Validation.ValidateDate(state.created);       }
    if ('modified' in state)     { errs.modified = Validation.ValidateDate(state.modified);     }
    //if ('deleted' in state && (state.deleted !== null))     
    //  { errs.deleted = Validation.ValidateDate(state.deleted);      }
    return errs; 
}

function isValid(state) {
    if (!requiredFields.every((f) => (f in state))) {
      // missing one or more required fields 
      return false;
    }
    const errs = validateState(state);
    return Object.values(errs).every( (v) => (v===''));
}

export default {
   'initialState': initialState,
   'validateState': validateState,
   'isValid': isValid,
   'testState': testState,
}


