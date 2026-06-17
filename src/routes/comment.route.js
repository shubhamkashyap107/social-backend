const express = require("express")
const { isLoggedIn } = require("../middlewares/isLoggedIn")
const { Post } = require("../models/post.model")
const router = express.Router()
const mongoose = require("mongoose")


router.post("/create-comment", isLoggedIn, async(req, res) => {
    try {
            const foundUser = req.user
            const { text, postId } = req.body

              if (!text?.trim()) {
                throw new Error("Comment text is required")
              }

              if (!postId) {
              throw new Error("Post id is required")
              } 

              const post = await Post.findById(postId)

              if (!post) {
              throw new Error("Post not found")
              }

              const newComment = await Comment.create({
              text,
              authorId: foundUser._id,
              postId
              })

              post.comments.push(newComment._id)
              await post.save()

              res.status(201).json({
              success: true,
              msg: "Comment added",
              data: newComment
              })
  

    } catch (error) {
        res.status(400).json({
            success: false,
            err: error.message
        })
    }
})


router.delete("/:id", isLoggedIn, async (req, res) => {
  try 
  {
    const comment = await Comment.findById(req.params.id);

    if (!comment) 
    {
      throw new Error("Comment not found");
    }

    const post = await Post.findById(comment.postId);

    const isCommentOwner = comment.authorId.toString() === req.user._id.toString();

    const isPostOwner = post && post.authorId.toString() === req.user._id.toString();

    if (!isCommentOwner && !isPostOwner) 
    {
      throw new Error("You are not authorized to delete this comment")
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      msg: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      err: error.message,
    });
  }
});

module.exports = {
    commentRouter: router
}
