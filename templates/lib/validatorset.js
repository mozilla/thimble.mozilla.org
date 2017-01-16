var Joi = require('joi');
var regex = require('./regex/regex.js');

var fieldValidators = {
  username:       Joi.string().regex(regex.username).label('Username'),
  uid:            Joi.alternatives().try(
                    Joi.string().regex(regex.username).label('Username'),
                    Joi.string().regex(regex.email).label('Email')
                  ),
  password:       Joi.string().regex(/^\S{8,128}$/).label('Password'),
  email:          Joi.string().regex(regex.email).label('Email'),
  feedback:       Joi.boolean().required().label('Feedback')
};

module.exports = {
  getValidatorSet: function (fieldValues) {
    var validators = {};
    fieldValues.forEach(function(entry) {
      var isDisabled = entry[Object.keys(entry)].disabled;
      Object.keys(entry).forEach(function(name) {
        if (!isDisabled && fieldValidators[name]) {
          validators[name] = fieldValidators[name];
        }
      });
    });
    return validators;
  }
};
