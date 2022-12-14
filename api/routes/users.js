const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/user");
const router = express.Router();


// just for checking server health
// GET /demands/test
router.get("/test", (req, res) => {
    res.status(200).json({
        "state": "active"
    })
});

// GET /users
router.get("/", (req, res) => {
    User.find().exec()
    .then(users => {
        res.status(200).json(users);
    })
    .catch(error => {
        res.status(400).send(error);
    });
});

// GET /users
router.post("/authenticate", (req, res) => {
    requestBody = req.body;
    if (requestBody.username == "geopro-admin" && requestBody.password == "password"){
        let user = {
            username: requestBody.username,
            password: requestBody.password,
            role: "admin"
        };
        res.status(200).json(user)
    } else {
        User.findOne({username: requestBody.username}).exec()
        .then(user => {
            if (user.password == requestBody.password) res.status(200).json(user)
            else res.status(403).json({error: "Nom d'utilisateur ou mot de passe incorrècte"});
        })
        .catch(error => {
            res.status(400).send(error);
        });
    }
});

// GET /users
router.patch("/patch/:id", (req, res) => {
    requestBody = req.body;
    userId = req.params.id;
    User.findById(userId).exec()
    .then(user => {
        user.username = requestBody.username,
        user.role = requestBody.role,
        user.password = requestBody.password
        User.update({_id: userId}, user).exec()
            .then(result => res.status(200).json(user))
            .catch(error => res.status(400).json(error));
    })
    .catch(error => {
        res.status(400).send(error);
    });
});


router.delete("/:id", (req, res) => {
    userId = req.params.id;
    User.findById(userId).exec()
    .then(user => {
        User.deleteOne({_id: userId}).exec()
            .then(result => res.status(200).json({id: userId}))
            .catch(error => res.status(400).json(error));
    })
    .catch(error => {
        res.status(400).send(error);
    });
});


// POST /users
router.post("/new", (req, res) => {
    reqBody = req.body;
    User.countDocuments({username: reqBody.username}).exec()
    .then(count => {
        if (count == 0){
            const newUser = new User({
                _id: mongoose.Types.ObjectId(),
                username: reqBody.username,
                role: reqBody.role,
                password: reqBody.password,
                encodedPassword: ""
            });
            newUser.save()
            .then(users => {
                res.status(200).json(users);
            })
            .catch(error => {
                res.status(400).send(error);
            });
        } else {
            res.status(400).json({"error": "AlreadyExistUsername"});
        }
    })
    .catch(error => res.status(400).json({
            "error": "DatabaseError"
        })
    );   
});


module.exports = router;