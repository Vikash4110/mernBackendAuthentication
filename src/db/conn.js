const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/youtubeRegistration")
.then(() => {
    console.log('Database Connection Succesfull');
}) .catch((e) => {
    console.log("No Connection");
})