require('dotenv').config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const employeeSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required : true,
  },
  tokens : [{
    token: {
      type: String,
      required : true,
    }
  }]
});

employeeSchema.methods.generateAuthToken = async function () {
try {
  console.log(this._id);
  const token = jwt.sign({_id : this._id.toString()} ,"vikashbahralisverygoodboyandverysmart")
  this.tokens = this.tokens.concat({token:token})
  await this.save();
  return token ;
} catch(err) {
  // res.send(`Error : ${err}`);
}
}

// Converting password into hash
employeeSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // console.log(`the current password is ${this.password}`);
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmpassword = await bcrypt.hash(this.confirmpassword, 12);
    // console.log(`the current password is ${this.password}`)
  }
  next();
});

// now we need to create collection
const Register = new mongoose.model("Register", employeeSchema);

module.exports = Register;
