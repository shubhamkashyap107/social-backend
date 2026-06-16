const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    caption : {
        type : String,
        maxLength : 100,
        trim : true
    },
    imageUrl : {
        type : String,
        required : true,
        trim : true
    },
    authorId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },
    likes : [],
    comments : []

}, {timestamps : true})

const Post = mongoose.model("Post", postSchema)

module.exports = {
    Post
}