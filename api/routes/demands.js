const express = require("express");
const mongoose = require("mongoose");
const csv = require('csv-express');
const Demand = require("../models/demand");
const { preprocessDemandsArray, stringifyDemandNumber, getDemandDtoValidationErrors, getDemandValidationErrors, INPUT } = require("../utils/utilities");
const router = express.Router();


// just for checking server health
// GET /demands/test
router.get("/test", (req, res) => {
    res.status(200).json({
        "state": "active",
    })
});

// TODO: not working 
// GET /demands/;id
router.get("/:id", (req, res) => {
    const requestedId = req.params.id;
    Demand.findOne({_id: requestedId}).exec()
    .then(demandResult => {
        res.status(200).json({
            result: "OK",
            data: demandResult
        });
    })
    .catch(error => res.status(400).json({
        result: "KO",
        data: [error]
    }));
});

// PATCH /demands/;id
router.post("/patch/:id", (req, res) => {
    const requestedId = req.params.id;
    for (let prop of ['demandDate', 'missionDate']){
        if (req.body[prop] != null) req.body[prop] = req.body[prop].split('T')[0]
    }
    let demandDtoValidationErrors = getDemandDtoValidationErrors(req.body);
    if (demandDtoValidationErrors.length == 0){
        // find demand
        Demand.findById(requestedId).exec()
        .then(demandResult => {
            // updating demand
            for (let property in req.body){
                if (property in demandResult){
                    demandResult[property] = req.body[property];
                }                 
            }
            // saving demand
            Demand.update({_id: requestedId}, demandResult).exec()
            .then(result => res.status(200).json(demandResult))
            .catch(error => res.status(400).json(error));
        })
        .catch(error => res.status(400).json(error));
    } else {
        res.status(400).json({errors: demandDtoValidationErrors});
    }
});


// DELETE /demands/;id
router.delete("/:id", (req, res) => {
    const requestedId = req.params.id;
    Demand.findById(requestedId).exec()
    .then(demandResult => {
        demandResult.deleted = true
        Demand.update({_id: requestedId}, demandResult)
        .exec()
        .then(result => res.status(200).json(demandResult));
    })
    .catch(error => res.status(400).json(error));
});


// POST /demands
router.post("/all", (req, res) => {
    let requestBody = req.body;
    requestBody.deleted = false;
    let textIputFields = ['fullName', 'primaryPhone', 'secondaryPhone', 'delegation', 'locality']
    for (let field of textIputFields){
        if (requestBody[field]) {
            requestBody[field] = { $regex: requestBody[field], $options: "i" };
        }
    }
    Demand.find(requestBody).exec()
    .then(demands => {
        res.status(200).json(demands);
    })
    .catch(error => {
        res.status(400).send(error);
    });
});


// POST /demands/missions
router.post("/missions", (req, res) => {
    // pinned day
    var pinnedDays = 15;
    var todayDate = new Date();
    var startTime = new Date();
    var endTime = new Date();
    startTime = startTime.setTime(todayDate.getTime() - (pinnedDays * 24 * 60 * 60 * 1000));
    endTime = endTime.setTime(todayDate.getTime() + (pinnedDays * 24 * 60 * 60 * 1000));
    var startDate = new Date(startTime);
    var endDate = new Date(endTime);
    Demand.find({
        missionDate: {
            $gte: startDate,
            $lt: endDate 
        },
        deleted: false
    }).exec()
    .then(demands => {
        res.status(200).json(demands);
    })
    .catch(error => {
        res.status(400).send(error);
    });
});

// POST /demands/new
router.post("/new", (req, res) => {
    let demandValidationErrors = getDemandValidationErrors(req.body);
    if (demandValidationErrors.length == 0){ 
        let demandNumber = 0;
        let yearDate = new Date();
        let currentYear = yearDate.getFullYear()
        Demand.countDocuments({demandDate: {"$gte": new Date(currentYear, 1, 1), "$lte": new Date(currentYear, 12, 31)}}).exec()
        .then(count => {
            demandNumber = 1 + count;
            // before save add reference
            let currentYear = new Date().getFullYear().toString();
            let demandRef= "CL" + currentYear.substring(2) + "-" + stringifyDemandNumber(demandNumber);
            // create the new demand
            const newDemand = new Demand({
                _id: mongoose.Types.ObjectId(),
                demandReference: demandRef,
                civility: req.body.civility,
                fullName: req.body.fullName,
                primaryPhone: req.body.primaryPhone,
                governorate: req.body.governorate,
                service: req.body.service,
                demandDate: new Date(req.body.demandDate),
                demandState: req.body.demandState,
                deleted: false
            });
            // optional informations
            for (let prop of INPUT.OPTIONAL){
                if (prop == "missionDate") {
                    newDemand[prop] = (prop in req.body && req.body[prop] != null) ? new Date(req.body[prop]) : null;
                } else {
                    newDemand[prop] = (prop in req.body) ? req.body[prop] : null;
                }
            }
            // save document
            newDemand.save()
            .then(result => res.status(200).json(result))
            .catch(error => res.status(400).json(error));
        })
        .catch(error => res.status(400).json(error));
    } else {
        res.status(400).json({errors: demandValidationErrors});
    }
});


// export csv file
router.get('/export/csv', function(req, res, next) {
    var filename   = "demandes.csv";
    Demand.find().lean().exec({}, function(err, demands) {
        if (err) res.send(err);
        demands = preprocessDemandsArray(demands);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader("Content-Disposition", 'attachment; filename='+filename);
        res.csv(demands, true);
    });
 });

module.exports = router;