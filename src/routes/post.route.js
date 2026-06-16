const express = require("express")
const { isLoggedIn } = require("../middlewares/isLoggedIn")
const { Post } = require("../models/post.model")
const router = express.Router()



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







module.exports = {
    postRouter : router
}