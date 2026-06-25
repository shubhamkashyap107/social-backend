const express = require("express")
const router = express.Router()
const validator = require("validator")
const { User } = require("../models/user.model")
const { isLoggedIn } = require("../middlewares/isLoggedIn")


router.put("/complete",isLoggedIn, async(req, res) => {
    try {
        const{firstName, lastName, dateOfBirth, gender, displayPicture, bio} = req.body
       
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

router.patch("/follow/:userId",isLoggedIn,async(req,res)=>{
    try 
    {
        const {userId} = req.params;
        const foundUser = req.user

        const targetUser = await User.findById(userId)

        if(!targetUser)
        {
            throw new Error("User not found")
        }

        if(targetUser._id.toString() == foundUser._id.toString())
        {
            throw new Error("You cannot follow yourself")
        }
        const alreadyFollowing = foundUser.following.some(user => user.toString() == userId)

        if(alreadyFollowing)
        {
            foundUser.following = foundUser.following.filter((user)=>{
                return user.toString() !== userId
            })

            targetUser.followers = targetUser.followers.filter((user)=>{
                return user.toString() !== userId
            })

            await foundUser.save()
            await targetUser.save()

            return  res.status(200).json({
                success : true,
                msg : "User unfollowed Successfully"
            })
        }
        foundUser.following.push(targetUser._id)
        targetUser.followers.push(foundUser._id)

        await foundUser.save()
        await targetUser.save()

        res.status(200).json({
            success : true,
            msg : "user followed Successfully"
        })


    } 
    catch (error) 
    {
        res.status(400).json({
            success : false,
            msg : error.message
        })
    }
})

router.get("/search", isLoggedIn, async (req, res) => {
    try {
        const { query, limit = 10, skip = 0 } = req.query;
        const foundUser = req.user;

        // Validate limit and skip
        const parsedLimit = parseInt(limit);
        const parsedSkip = parseInt(skip);

        if (isNaN(parsedLimit) || parsedLimit <= 0) {
            return res.status(400).json({
                success: false,
                err: "limit must be a positive integer"
            });
        }

        if (isNaN(parsedSkip) || parsedSkip < 0) {
            return res.status(400).json({
                success: false,
                err: "skip must be a non-negative integer"
            });
        }

        // Enforce max limit of 50
        const finalLimit = Math.min(parsedLimit, 50);

        if (!query || query.trim() === "") {
            return res.status(200).json({
                success: true,
                data: [],
                pagination: {
                    limit: finalLimit,
                    skip: parsedSkip,
                    totalCount: 0
                }
            });
        }

        const filter = {
            username: { $regex: query, $options: "i" },
            _id: { $ne: foundUser.id }
        };

        const [users, totalCount] = await Promise.all([
            User.find(filter)
                .select("username firstName lastName displayPicture")
                .skip(parsedSkip)
                .limit(finalLimit),
            User.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            msg: "Users fetched",
            data: users,
            pagination: {
                limit: finalLimit,
                skip: parsedSkip,
                totalCount
            }
        });

    } catch (error) {
        res.status(400).json({
            err: error.message
        });
    }
});

router.get("/:username", isLoggedIn, async (req, res) => {
    try {
        const { username } = req.params;
        const loggedInUser = req.user;

        const user = await User.findOne({ username })
            .select("username firstName lastName displayPicture bio gender dateOfBirth followers following posts isCompletedProfile");

        if (!user) {
            return res.status(404).json({
                success: false,
                err: "User not found"
            });
        }

        const isFollowing = loggedInUser.following.some(
            (id) => id.toString() === user._id.toString()
        );

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                displayPicture: user.displayPicture,
                bio: user.bio,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                isCompletedProfile: user.isCompletedProfile,
                isFollowing,
                followersCount: user.followers.length,
                followingCount: user.following.length,
                postsCount: user.posts.length
            }
        });
    } catch (error) {
        res.status(400).json({
            err: error.message
        });
    }
});


module.exports = {
    profileRouter : router
}