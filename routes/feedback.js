var express = require("express");
var router = express.Router();
var feedbackService = require("../services/feddbackService");
var appLogger = require('../logging/appLogger');
var Client = require('node-rest-client').Client;
var config = require('../config/config.' + process.env.NODE_ENV);
var entitiesRemoteUrl = config.entitiesRemoteUrl;

router.post('/createFeedback', function (req, res) {
    feedbackService.createFeedback(req.body, function (err, response) {
        if (!err) {
            appLogger.info("Successfully created feedback!");
            res.send(response);
        } else {
            appLogger.info("Failed to create feedback!");
            res.status(500).send({ name: err.name, message: err.message });
        }
    })
});

router.get('/getFeedback',function(req,res){
    feedbackService.getFeedbacks(function (err, response) {
        if (!err) {
            appLogger.info("Successfully fetched feedbacks");
            res.send(response);
        }
        else {
            appLogger.error("Failed to get feedbacks");
            res.status(500).send({ name: err.name, message: err.message });
        }
    });
})

router.post('/submitFeedback', function (req, res, next) {
    feedbackService.saveFeedback(req.body.responseInfo, function (err, response) {
        if (!err) {
            appLogger.info("Successfully submitted");
            res.send(response);
        }
        else {
            appLogger.error("Failed to create feedback");
            res.status(500).send({ name: err.name, message: err.message });
        }
    });
})

router.get('/getFeedbackForMobile',function(req,res){
    feedbackService.getFeedbackForMobile(function (err, response) {
        if (!err) {
            appLogger.info("Successfully fetched feedbacks");
            res.send(response);
        }
        else {
            appLogger.error("Failed to get feedbacks");
            res.status(500).send({ name: err.name, message: err.message });
        }
    });
})

router.get('/getSubmittedFeedbacks/fetch', function (req, res, next) {
    feedbackService.getSubmittedFeedbacks(function (err, response) {
        if (!err) {
            appLogger.info("Successfully fetched all student feedbacks");
            res.send(response);
        }
        else {
            appLogger.error("Failed to get feedbacks");
            res.status(500).send({ name: err.name, message: err.message });
        }
    });
});

router.post('/getSelectedNodes', function (req, res) {
    var client = new Client();

    // remote url has to come from configuration file based on entity name
    var remoteUrl = entitiesRemoteUrl["nodeSearch"];
    // set content-type header and data as json in args parameter 
    var args = {
        data: { filterQuery: req.body, projection: ["path", "type", "pathName", "orgUnit", "parentName","programmeName", "programmeCategory", "batchYear",  "department"] },
        headers: {
            "Content-Type": "application/json",
            "Authorization": req.headers.authorization
        }
    };
    // direct way 
    client.post(remoteUrl, args, function (data, response) {
        // parsed response body as js object 
        if (response.statusCode == 200) {
            res.send(data);
        }

    }).on('error', function (e) {
        res.status(500).send({ err: e });
    }).end()
});



module.exports = router;