const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const signupSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      trim: true,
    },
    password: {
      type: String,
    },
    confirmPassword: {
      type: String,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  }
);

// This tells passport to use email field instead of username
signupSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});

module.exports = mongoose.model("userModel", signupSchema);
