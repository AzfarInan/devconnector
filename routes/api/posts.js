const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

// Load Post Schema
const Post = require("../../models/Post");

// Load Profile Schema
const Profile = require("../../models/Profile");

// Initiate Router
const router = express.Router();

// Validation
const validatePostInput = require("../../validation/post");

// @route         GET api/posts
// @desc          Get all posts
// @access        Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then((posts) => res.json(posts))
    .catch((err) => res.status(404).json({ message: "No posts found" }));
});

// @route         GET api/posts/:id
// @desc          Get posts by ID
// @access        Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then((post) => res.json(post))
    .catch((err) =>
      res.status(404).json({ message: "No post found with that id" })
    );
});

// @route         POST api/posts
// @desc          Create post
// @access        Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors send 400 with errors
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id,
    });

    newPost.save().then((post) => res.json(post));
  }
);

// @route         DELETE api/posts/:id
// @desc          Delete post
// @access        Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      Post.findById(req.params.id)
        .then((post) => {
          // Check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ authorization: "User not authorized" });
          }

          // Delete
          post.deleteOne().then(() => res.json({ success: true }));
        })
        .catch(() => res.status(404).json({ message: "Post not found" }));
    });
  }
);

module.exports = router;
