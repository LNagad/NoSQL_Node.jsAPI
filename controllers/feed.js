const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Post = require("../models/post");
const { clearImage } = require("../util/clearImage");
const User = require("../models/user");
const user = require("../models/user");
const io = require("../socket");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;

  const perPage = 2;

  let totalItems;

  try {
    // const count = await Post.find({ creator: req.userId }).countDocuments();
    const count = await Post.find().countDocuments();

    if (count <= 0) {
      const error = new Error("Could not find posts.");
      error.statusCode = 404;
      throw error;
    }

    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    totalItems = count;

    res.status(200).json({
      message: "Fetched posts succesfully.",
      posts,
      totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      error.data = errors.array();

      if (req.file) {
        clearImage(req.file.path);
      }
      throw error;
    }

    if (!req.file) {
      const error = new Error("No image provided.");
      error.statusCode = 422;
      throw error;
    }

    //remove \\ from url in db
    const imagePath = `/${req.file.path.replace(/\\/g, "/")}`;

    const title = req.body.title;
    const content = req.body.content;

    const post = new Post({
      title,
      content,
      imageUrl: imagePath,
      creator: req.userId,
    });

    const creator = await User.findById(req.userId);

    if (!creator) {
      const error = new Error("Could not find user logged in.");
      error.statusCode = 404;

      if (req.file) {
        clearImage(req.file.path);
      }
      throw error;
    }

    const result = await post.save();

    creator.posts.push(post);

    await creator.save();

    io.getIO().emit("posts", {
      action: "create",
      post: {
        ...post._doc,
        creator: {
          _id: req.userId,
          name: creator.name,
        },
      },
    });

    res.status(201).json({
      message: "Post created sucesfully",
      post: result,
      creator: { _id: creator._id, name: creator.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId)
      .where("_id")
      .equals(postId)
      .where("creator")
      .equals(req.userId);

    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Post fetched.",
      post,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;

  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;

      if (req.file) {
        clearImage(req.file.path);
      }
      throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if (req.file) {
      imageUrl = `/${req.file.path.replace(/\\/g, "/")}`;
    }

    if (!imageUrl) {
      const error = new Error("No file picked.");
      error.statusCode = 422;
      throw error;
    }

    const post = await Post.findById(postId).populate("creator");

    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;

      if (req.file) {
        clearImage(req.file.path);
      }
      throw error;
    }

    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;

      if (req.file) {
        clearImage(req.file.path);
      }
      throw error;
    }

    if (imageUrl) {
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
    }

    post.title = title;
    post.imageUrl = imageUrl ?? post.imageUrl;
    post.content = content;

    const result = await post.save();

    io.getIO().emit("posts", {
      action: "update",
      post: result,
    });

    res.status(200).json({ message: "Post updated!", post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    if (post.imageUrl) {
      clearImage(post.imageUrl);
    }

    const result = await Post.findOneAndDelete({ _id: postId });

    if (!result) {
      const error = new Error("Failed removing post.");
      error.statusCode = 404;
      throw error;
    }

    //Deleting the post from the user post collection
    const user = await User.findById(req.userId);

    user.posts.pull(postId);

    await user.save();

    io.getIO().emit("posts", {
      action: "delete",
      post: postId,
    });

    res.status(200).json({ message: "Deleted post." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};
