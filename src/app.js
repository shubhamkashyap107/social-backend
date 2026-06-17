require("dotenv").config()
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const cp = require("cookie-parser")
const { authRouter } = require("./routes/auth.route")
const { profileRouter } = require("./routes/profile.route")
const { postRouter } = require("./routes/post.route")

const {commentRouter} = require("./routes/comment.route")

const PORT = process.env.PORT || 8080
const cors = require("cors")


app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true
}))
app.use(cp())
app.use(express.json())
app.use("/api/auth", authRouter)
app.use("/api/profile", profileRouter)
app.use("/api/post", postRouter)
app.use("/api/comment", commentRouter)

app.use((req, res) => {
    res.status(404).json({
        err : "Not found"
    })
})






mongoose.connect(process.env.MONGO_URL)
.then(() => {

    console.log("DB Connected...")
    
    
    app.listen(PORT, () => {
        console.log("Server Running on PORT", PORT)
    })

})




