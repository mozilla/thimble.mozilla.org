/* jshint esnext: true */

var React = require('react/addons');
var ValidationMixin = require('react-validation-mixin');
var ga = require('react-ga');
var ToolTip = require('../tooltip/tooltip.jsx');
var WebmakerActions = require('../../lib/webmaker-actions.jsx');
var API = require('../../lib/api.jsx');
var Router = require('react-router');

var Form = React.createClass({
  propTypes: {
    fields: React.PropTypes.array.isRequired,
    validators: React.PropTypes.object.isRequired,
    origin: React.PropTypes.string.isRequired
  },
  statics: {
      'iconLabels': {
        'username': 'icon-label-username',
        'password': 'icon-label-password',
        'email':    'icon-label-email',
        'error':    'icon-label-error',
        'valid':    'icon-label-valid',
        'uid':      'icon-label-username',
        'key':      'icon-label-password',
      }
  },
  mixins: [
    ValidationMixin,
    React.addons.LinkedStateMixin,
    Router.Navigation,
    Router.State,
    API
  ],
  validatorTypes: false,
  componentWillMount: function() {
    this.validatorTypes = this.props.validators;
    this.errorClass = this.getIconClass('error');
    this.validClass = this.getIconClass('valid');
  },
  componentDidMount: function() {
    WebmakerActions.addListener('FORM_ERROR', this.formError);
    WebmakerActions.addListener('FORM_VALID', this.setFormState);
  },
  componentWillUnmount: function() {
    WebmakerActions.deleteListener('FORM_ERROR', this.formError);
    WebmakerActions.deleteListener('FORM_VALID', this.setFormState);
  },
  getInitialState: function() {
    return {
      username: this.props.defaultUsername || this.getQuery().username || '',
      uid: this.props.defaultUid || this.getQuery().uid || '',
      password: '',
      email: '',
      feedback: false,
      dirty: {},
      key: '',
      errorMessage: {},
      valid_username: true,
      valid_password: true,
      valid_feedback: true,
      valid_email: true,
      valid_uid: true
    };
  },
  setFormState: function(data) {
    var errorMessage = Object.assign({}, this.state.errorMessage);
    errorMessage[data.field] = null;
    this.setState({
      ['valid_' + data.field]: true,
      errorMessage: errorMessage
    });
  },
  formError: function(data) {
    var errorMessage = Object.assign({}, this.state.errorMessage);
    errorMessage[data.field] = data.message;

    this.setState({
      ['valid_' + data.field]: false,
      errorMessage: errorMessage
    });
  },
  dirty: function(id, origin) {
    return (err, valid) => {
      if(err) {
        if ( id === 'uid' && this.state[id] ) {
          this.formError({field: id, message: 'Please enter a valid email address or username'});
          return;
        }
        if(id === 'username' && this.state[id]) {
          this.formError({field: id, message: 'Must be 1-20 characters long and use only "-" and alphanumeric symbols.'});
          // preventing any message to override this error message.
          return;
        }
        if(id === 'email') {
          this.formError({field: id, message: 'Please use a valid email address.'});
        }
        if(id === 'password' && !this.state[id]) {
          this.formError({field: id, message: 'Please specify a password.'});
        }
        ga.event({category: origin, action: 'Validation Error', label: 'Error on ' + id + ' field.'});
      }
      if(!err && ['email', 'uid'].indexOf(id) >= 0 ) {
        this.setFormState({field: id});
      }

      if(id === 'password' && this.state[id] && err) {
        this.setFormState({field: id});
      }
      this.handleBlur(id, this.state[id])
    }
  },
  handleBlur: function(fieldName, value) {
   if ( this.props.onInputBlur ) {
     this.props.onInputBlur(fieldName, value);
    }
    var dirty = this.state.dirty;
    dirty[fieldName] = true;
    this.setState({
      dirty: dirty
    });

  },
  buildFormElement: function(key, i) {
    // we always expect this.props.fields[i] to be one object with one property.
    var id = Object.keys(this.props.fields[i])[0];
    var value = this.props.fields[i][id];
    this.passChecked = value.checked;
    this.beforeLabel = value.label === undefined ? true : value.label;
    var passwordError = 'Invalid password.';

    var isValid = !this.state.errorMessage[id] && this.isValid(id) && this.state['valid_' + id];

    var input = (
      <input type={value.type}
             id={id}
             ref={id+'Input'}
             tabIndex={value.tabIndex}
             name={id}
             placeholder={value.placeholder}
             autoComplete={this.props.autoComplete ? this.props.autoComplete : "on"}
             valueLink={this.linkState(id)}
             defaultValue={this.props.defaultUsername}
             onBlur={this.handleValidation(id, this.dirty(id, this.props.origin))}
             className={this.getInputClasses(id, isValid)}
             disabled={value.disabled ? "disabled" : false}
             autoFocus={value.focus ? true : false}
      />
    );

    if (value.type === 'checkbox') {
      var input = (
        <input type={value.type}
               id={id}
               ref={id+'Input'}
               checked={this.state.feedback}
               tabIndex={value.tabIndex}
               role='checkbox'
               aria-checked='false'
               onChange={this.toggleCheckBox}
               onBlur={this.handleValidation(id, this.dirty(id, this.props.origin))}
               className={this.getInputClasses(id, isValid)}
        />
      );
      input = (<span className={value.className}>{input}<span/></span>);
    }
    var errorMessage;
    if(id === 'password') {
      errorMessage = this.state.errorMessage[id] || passwordError;
    } else {
      errorMessage = this.state.errorMessage[id] || this.getValidationMessages(id)[0];
    }
    var errorTooltip = <ToolTip ref="tooltip" className="warning" message={errorMessage}/>;

    return (
     <label ref={id+'Label'} className={this.getLabelClasses(id, isValid)} key={id} htmlFor={id}>
        {!isValid ? errorTooltip : false}
        {value.label && value.labelPosition==='before' ? value.label : false}
        {input}
        {value.label && value.labelPosition==='after' ? value.label : false}
     </label>
    );
  },
  render: function() {
     var fields = Object.keys(this.props.fields).map(this.buildFormElement);
     return (
        <div role="form">
          <form autoComplete={this.props.autoComplete ? this.props.autoComplete : "on"}
                action="#"
                onSubmit={this.processFormData}
                id="form">
            {fields}
            { this.props.autoComplete === 'off' ?
              (
                /* this is a hack to stop autocomplete for username and password on signup page */
                <div>
                  <input className="hidden" type="text" name="fakeusernameremembered"/>
                  <input className="hidden" type="password" name="fakepasswordremembered"/>
                </div>)
              : false
            }
            <input className="hidden" type="submit"/>
          </form>
        </div>
      );
  },
  getInputClasses: function(field, isValid) {
    var classes = {};
    classes['has-error'] = !isValid;
    classes['is-valid'] = isValid;
    classes['hideLabel'] = !this.beforeLabel;
    classes[this.getIconClass(field)] = true;
    return React.addons.classSet(classes);
  },
  getLabelClasses: function(field, isValid) {
    var classes = {};
    var ref = this.refs[field + 'Input'];
    classes['inputBox'] = field === 'feedback';
    classes[this.getIconClass(field)] = true;
    classes['hideLabel'] = !this.beforeLabel;
    classes[this.errorClass] = !isValid;
    classes[this.validClass] = (field !== 'feedback' && (this.state.dirty[field] && isValid) || this.passChecked)
    return React.addons.classSet(classes);
  },
  getIconClass: function(field) {
    return Form.iconLabels[field];
  },
  toggleCheckBox: function(e) {
    if(e.target.getAttribute('aria-checked') === 'false') {
      this.setState({feedback: !this.state.feedback});
      e.target.setAttribute('aria-checked','true');
    } else {
      this.setState({feedback: !this.state.feedback});
      e.target.setAttribute('aria-checked','false');
    }
    e.target.focus();
  },
  /**
   * "owner" components call form.processFormData on us
   */
  processFormData: function(e) {
    e.preventDefault();
    this.validate((error, data) => {
      WebmakerActions.onFormValidation({err: error, user: !!error ? false : JSON.parse(JSON.stringify(this.state))});
    });
  }
});

module.exports = Form;
