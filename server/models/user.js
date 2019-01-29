const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 4,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            require: true
        },
        token: {
            type: String,
            require: true
        }
    }]
});

// Determines what is sent back when mongoose model is converted to JSON
UserSchema.methods.toJSON = function() {
    const user = this;
    // toObject() - converts mongoose objecto to regular object
    const userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

// Instance methods
UserSchema.methods.generateAuthToken = function() {
    // Create token based on user.id 
    const user = this;
    const access = 'auth';
    const token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    // Update token array
    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(() => token);
};

// Model Method
UserSchema.statics.findByToken = function(token) {
    const User = this;
    let decoded;

    // Catch - secret does not match the secret it was created with       
    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (err) {
        return Promise.reject();
    }

    // check if user is validated
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

// Check if password is modified.
UserSchema.pre('save', function(next) {
    const user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        })
    } else {
        next();
    }
    
});

const User = mongoose.model('User', UserSchema);

module.exports = {
    User
}