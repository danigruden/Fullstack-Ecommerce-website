require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const checkAuthentication = require("../middleware/check-auth");

const router = express.Router();

//Signup
router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "Successfully created user",
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Invalid authentication credentials!",
        });
      });
  });
});

//Login
router.post("/login", (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Invalid authentication credentials!",
        });
      }
      fetchedUser= user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: "Invalid authentication credentials!",
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id, userType: fetchedUser.userType },
        process.env.TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id,
        userEmail: fetchedUser.email,
        userType: fetchedUser.userType
      });
    })
    .catch((err) => {
      return res.status(401).json({
        message: "Authentication failed",
      });
    });
});


router.get("/userType", checkAuthentication, (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
    User.findById(req.userData.userId)
    .then((userType) => {
      res.status(200).json({
        userType: userType.userType
      });
    })
    .catch((error) => {
      res.status(401).json({
        message: "Authorization failed",
      });
    });

    });



module.exports = router;
