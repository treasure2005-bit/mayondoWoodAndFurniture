const mongoose = require("mongoose");
const { type } = require("os");
const passportLocalMongoose = require("passport-local-mongoose");

const signupSchema = new mongoose.Schema({
role : {
    type : String,
    required : true,
},
  email : {
type : String,
required : true,
  },
  phoneNumber : {
    type: Number,
    required: true,
    trim : true,
  },
  password : {
    type : String,
    required : true,
  },
  confirmPassword : {
    type : String,
    required : true,
  },

});

// This tells passport to use email field instead of username
signupSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});

module.exports = mongoose.model("userModel", signupSchema);
