const express = require("express")
const { isLoggedIn } = require("../middlewares/isLoggedIn")
const { Post } = require("../models/post.model")
const router = express.Router()
const mongoose = require("mongoose")



router.post("/create", isLoggedIn, async(req, res) => {
    try {
        const{caption, imageUrl} = req.body

        if(!imageUrl)
        {
            throw new Error("Image is required!...")
        }

        const newPost = await Post.create({
            caption, imageUrl, authorId : req.user._id
        })

        req.user.posts.push(newPost)
        await req.user.save()

        res.status(201).json({
            success : true,
            msg : "Posted",
            data : newPost
        })

    } catch (error) {
        res.status(400).json({
            err : error.message
        })
    }
})

router.get("/:id", isLoggedIn, async(req, res) => {
    try {
            const {id} = req.params

            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid Id")
            
            }

            const post = await Post.findById(id)

            if(!post)
            {
                throw new Error("post not found")
            }

            res.status(200).json({
                success: true,
                post
            })



    } catch (error) {
        res.status(400).json({ err: error.message })
    }
})






module.exports = {
    postRouter : router
}