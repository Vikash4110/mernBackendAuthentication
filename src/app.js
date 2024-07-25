require('dotenv').config();
const express = require("express");
const app = express();
const Port = process.env.PORT || 3000;
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("./db/conn");
const Register = require("./models/registers");

const templatePath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

console.log("SECRET_KEY:", process.env.SECRET_KEY);

// app.use(express.static(staticPath));          
app.set("view engine", "hbs");
app.set("views", templatePath);
hbs.registerPartials(partialsPath);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index");
});
// create a new user in our database

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    if (password === cpassword) {
      const registerEmployee = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        gender: req.body.gender,
        phone: req.body.phone,
        age: req.body.age,
        password: password,
        confirmpassword: cpassword,
      });

      // jwt
      const token = await registerEmployee.generateAuthToken();
      console.log(`the login token is ${token}`);

      // Password Hash
      // middleware
      const registered = await registerEmployee.save();
      res.status(201).render("index");
    } else {
      res.send("Passwords are not matching");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

// Login Validation
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userEmail = await Register.findOne({ email: email });
    // console.log(`Email is ${email} and password is ${password}`);

    const ispassMatch = await bcrypt.compare(password, userEmail.password);
    // jwt
    const token = await userEmail.generateAuthToken();
    console.log(token);

    if (ispassMatch) {
      res.status(201).render("index");
    } else {
      res.send("Invalid Password Entered");
    }
  } catch (err) {
    res.status(400).send("Invalid Login Details");
  }
});

// Encryption (Two Way Communication)
// origData --> Encode --> Decode
// vikash --> hsavik --> vikash

// Hashing (One Way Communication)
// vikash --> sgwgwgfsd.sf.sfweffw.
// Best Hashing algo --> Bcryptjs

// const securePassword = async (password) => {
//     const passwordHash = await bcrypt.hash(password, 12);
//     console.log(passwordHash);

//     const passwordMatch = await bcrypt.compare("rahil", passwordHash);
//     console.log(passwordMatch);
// }
// securePassword("vikash@123");

// JWT
// const createToken = async () => {
//     const token = await jwt.sign({_id : "66a28765eaf066a285db5801"}, "vikashbahralisverygoodboyandverysmart" , {
//         expiresIn : "2 seconds"
//     });
//     console.log(token);

//     const userVer = await jwt.verify(token , "vikashbahralisverygoodboyandverysmart" );
//     console.log(userVer);
// }
// createToken();
app.listen(Port, () => {
  console.log(`Listening to Port number : ${Port}`);
});
