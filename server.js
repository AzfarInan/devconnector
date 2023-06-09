const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

/// Start Express
const app = express();

// Body parser middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/// DB Config
const db = require("./config/keys").mongoUri;

/// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/// Passport middleware
app.use(passport.initialize());

/// Passport Config
require('./config/passport.js')(passport);

/// Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

/// Port Connection
const port = process.env.port || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));
