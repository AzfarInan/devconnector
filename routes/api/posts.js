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
const { json } = require("body-parser");

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

// @route         Post api/posts/like/:id
// @desc          Like a post
// @access        Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      Post.findById(req.params.id)
        .then((post) => {
          if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ message: "User already liked this post" });
          }

          // Add the user id to likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then((post) => res.json(post));
        })
        .catch(() => res.status(404).json({ message: "Post not found" }));
    });
  }
);

// @route         Post api/posts/unlike/:id
// @desc          Unlike a post
// @access        Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      Post.findById(req.params.id)
        .then((post) => {
          if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ message: "User has not liked this post yet" });
          }

          // Get removeIndex
          const removeIndex = post.likes.map((item) =>
            item.user.toString().indexOf(req.user.id)
          );

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then((post) => res.json(post));
        })
        .catch(() => res.status(404).json({ message: "Post not found" }));
    });
  }
);

// @route         Post api/posts/comment/:id
// @desc          Comment on a post
// @access        Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors send 400 with errors
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then((post) => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id,
        };

        // Add to comments array
        post.comments.unshift(newComment);

        // Save
        post.save().then((post) => res.json(post));
      })
      .catch((err) => json.status(404).json({ message: "No post found" }));
  }
);

// @route         Post api/posts/comment/:id/:comment_id
// @desc          Remove comment form a post
// @access        Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then((post) => {
        // Check to see if comment exists
        if (
          post.comments.filter(
            (comment) => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ message: "No comment found with this id" });
        }

        // Get removeIndex
        const removeIndex = post.comments.map((item) =>
          item._id.toString().indexOf(req.params.comment_id)
        );

        // Splice out of array
        post.comments.splice(removeIndex, 1);

        // Save
        post.save().then((post) => res.json(post));
      })
      .catch(() => res.status(404).json({ message: "Post not found" }));
  }
);

module.exports = router;
