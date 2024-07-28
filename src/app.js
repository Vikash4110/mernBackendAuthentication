require('dotenv').config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
require("./db/conn");
const Register = require("./models/registers");
const auth = require("./middleware/auth");
const upload = require('./middleware/upload');

// Paths for views and partials
const templatePath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

// Middleware setup
app.set("view engine", "hbs");
app.set("views", templatePath);
hbs.registerPartials(partialsPath);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", upload.single('profilePicture'), async (req, res) => {
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
        profilePicture: req.file ? req.file.filename : 'default.png',
      });

      // Generate JWT token
      const token = await registerEmployee.generateAuthToken();
      console.log(`The login token is ${token}`);

      // Set cookie
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 30000), // Adjust expiration time as needed
        httpOnly: true,
      });

      // Save registered employee
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

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userEmail = await Register.findOne({ email: email });

    if (userEmail) {
      const isPassMatch = await bcrypt.compare(password, userEmail.password);
      
      if (isPassMatch) {
        // Generate JWT token
        const token = await userEmail.generateAuthToken();
        console.log(`The token is : ${token}`);

        // Set cookie
        res.cookie("jwt", token, {
          expires: new Date(Date.now() + 100000), // Adjust expiration time as needed
          httpOnly: true,
        });

        res.status(201).render("index");
      } else {
        res.send("Invalid Password Entered");
      }
    } else {
      res.send("Invalid Login Details");
    }
  } catch (err) {
    res.status(400).send("Invalid Login Details");
  }
});

app.get("/secret", auth, (req, res) => {
  console.log(`This is the cookie: ${req.cookies.jwt}`);
  res.render("secret");
});

app.get("/dashboard", auth, (req, res) => {
  res.render("dashboard", {
    firstname: req.user.firstname,
    lastname: req.user.lastname,
    email: req.user.email,
    gender: req.user.gender,
    phone: req.user.phone,
    age: req.user.age,
    profilePicture: req.user.profilePicture || "default.png"
  });
});

app.get("/logout", auth, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    console.log(req.user);

    // All device logout
    req.user.tokens = [];  // Clear all tokens

    res.clearCookie("jwt");
    console.log(`Logout Successfully`);

    await req.user.save();  // Save the updated user document

    res.render("login");
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || error);
  }
});

app.listen(port, () => {
  console.log(`Listening to port number: ${port}`);
});
