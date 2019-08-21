var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');


var nameValidator = [
  validate({
    validator: 'matches',
    arguments: /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{3,20})+)+$/,
    message: 'Must be at least 3 character, max 30,no special character or number, must have space  in between name'
  })
];

var emailValidator = [
  validate({
    validator: 'isEmail',
    message: 'Is not valid e-mail'
  }),
  validate({
    validator: 'isLength',
    arguments: [3, 25],
    message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];
var usernameValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 25],
    message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'isAlphanumeric',
    message: 'Name should contain alpha-numeric characters only'
  })
];

var UserSchema = new Schema({
  name: { type: String, required: true, validate: nameValidator },
  username: { type: String, lowercase: true, required: true, unique: true, validate: usernameValidator },
  password: { type: String, required: true, select: false },
  email: { type: String, lowercase: true, required: true, unique: true, validate: emailValidator },
  active: { type: Boolean, required: true, default: false },
  temporarytoken: { type: String, required: true },
  resettoken: { type: String, required: false },
  permission: { type: String, required: true, default: 'user' }
});


UserSchema.pre('save', function (next) {
  var user = this;
  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, null, null, function (err, hash) {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

UserSchema.plugin(titlize, {
  paths: ['name']
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password)
};
module.exports = mongoose.model('User', UserSchema);
