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

module.exports = {
    commentRouter: router
}