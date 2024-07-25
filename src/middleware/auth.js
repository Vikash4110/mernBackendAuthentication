const jwt = require("jsonwebtoken");
const Register = require("../models/registers"); 

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      throw new Error('No token provided');
    }

    const verifyUser = jwt.verify(token, process.env.SECRET_KEY || "vikashbahralisverygoodboyandverysmart");
    console.log(verifyUser);

    const user = await Register.findOne({ _id: verifyUser._id });
    if (!user) {
      throw new Error('User not found');
    }

    console.log(user);

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send(err.message || err);
  }
};

module.exports = auth;
