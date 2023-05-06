const express = require("express");
const mongoose = require("mongoose");
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

/// Start Express
const app = express();

/// DB Config
const db = require("./config/keys").mongoUri;

/// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/// Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.port || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));
