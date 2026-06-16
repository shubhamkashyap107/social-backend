const express = require("express")
const router = express.Router()
const validator = require("validator")
const { User } = require("../models/user.model")
const { isLoggedIn } = require("../middlewares/isLoggedIn")


router.put("/complete",isLoggedIn, async(req, res) => {
    try {
        const{firstName, lastName, dateOfBirth, gender, displayPicture, bio} = req.body
        // console.log(displayPicture, dateOfBirth, gender)
        // const{ userId } = req.params
        const foundUser = req.user

        if(!firstName || !lastName || !dateOfBirth || !gender)
        {
            throw new Error("Firstname, lastname, gender and DOB are required..")
        }

        if(!validator.isDate(dateOfBirth))
        {
            throw new Error("Invalid Date")
        }

        
        foundUser.firstName = firstName;
        foundUser.lastName = lastName;
        foundUser.bio = bio;
        foundUser.gender = gender;
        foundUser.dateOfBirth = dateOfBirth;
        foundUser.displayPicture = displayPicture;
        foundUser.isCompletedProfile = true;

        await foundUser.save()




        res.status(200).json({
            success : true, 
            msg : "Profile updated",
            data : {
                email : foundUser.email,
                username : foundUser.username,
                firstName : foundUser.firstName,
                lastName : foundUser.lastName,
                bio : foundUser.bio,
                gender : foundUser.gender,
                dateOfBirth : foundUser.dateOfBirth,
                displayPicture : foundUser.displayPicture,
                followers : foundUser.followers,
                following : foundUser.following,
                posts : foundUser.posts,
            }
        })


    } catch (error) {
        res.status(400).json({
            err : error.message
        })
    }
})

router.patch("/edit", isLoggedIn ,async(req, res) => {
    try {
        const{ firstName, lastName, bio } = req.body



        const loggedInUser = req.user

        loggedInUser.firstName = firstName
        loggedInUser.lastName = lastName
        // loggedInUser.displayPicture = displayPicture
        loggedInUser.bio = bio

        await loggedInUser.save()

        res.status(200).json({
            success : true,
            msg : "Profile Updated...",
            data : {
                email : loggedInUser.email,
                username : loggedInUser.username,
                firstName : loggedInUser.firstName,
                lastName : loggedInUser.lastName,
                bio : loggedInUser.bio,
                gender : loggedInUser.gender,
                dateOfBirth : loggedInUser.dateOfBirth,
                displayPicture : loggedInUser.displayPicture,
                followers : loggedInUser.followers,
                following : loggedInUser.following,
                posts : loggedInUser.posts,
                isCompletedProfile : loggedInUser.isCompletedProfile
            }
        })
        

    } catch (error) {
        res.status(400).json({
            err : error.message
        })
    }
})

router.patch("/edit/dp", isLoggedIn, async(req, res) => {
    try {
        const{displayPicture} = req.body
        console.log(displayPicture)

        if(!validator.isURL(displayPicture))
        {
            throw new Error("Please provide a valid picture")
        }

        const loggedInUser = req.user
        loggedInUser.displayPicture = displayPicture
        await loggedInUser.save()

        res.json({
            success : true,
            msg : "Profile Picture updated..",
            data : {
                email : loggedInUser.email,
                username : loggedInUser.username,
                firstName : loggedInUser.firstName,
                lastName : loggedInUser.lastName,
                bio : loggedInUser.bio,
                gender : loggedInUser.gender,
                dateOfBirth : loggedInUser.dateOfBirth,
                displayPicture : loggedInUser.displayPicture,
                followers : loggedInUser.followers,
                following : loggedInUser.following,
                posts : loggedInUser.posts,
                isCompletedProfile : loggedInUser.isCompletedProfile
            }
        })

        // console.log("OK")

    } catch (error) {
        res.status(400).json({
            err : error.message
        })
    }
})


module.exports = {
    profileRouter : router
}