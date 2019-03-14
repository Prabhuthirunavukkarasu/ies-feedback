var feedbackDao = require('../daos/feedbackDao');

module.exports = {

    createFeedback: function (feedback, callback) {
        feedbackDao.create(feedback, function (err, res) {
            if (!err) {
                callback(null, res);
            }
            else {
                callback(err, null);
            }
        })
    },

    getFeedbacks: function (callback) {
        feedbackDao.getAll(function (err, res) {
            if (!err) {
                callback(null, res);
            }
            else {
                callback(err, null);
            }
        });
    },

    getFeedbackForMobile: function (callback) {
        feedbackDao.getAll(function (err, res) {
            if (!err) {
                res.forEach(feed => {
                    var metadata = {
                        "isReadOnly": false,
                        "commitMode": "Immediate",
                        "validationMode": "Immediate",
                        "source": {},
                        "propertyAnnotations": []
                    }
                    feed.feedbackInfo.feedbackJson.pages[0].elements.forEach(element => {
                        metadata.source[element.name] = "";
                        if (element.type == "rating") {
                            metadata.source[element.name] = "Excellent";
                            var property = {};
                            property["name"] = element.name;
                            property["displayName"] = element.title;
                            property["editor"] = "SegmentedEditor";
                            property["valuesProvider"] = [];
                            element.rateValues.forEach(element1 => {
                                property.valuesProvider.push(element1.text);
                                console.log(element1);
                            });
                            if (element.isRequired) {
                                if (element.isRequired == true) {
                                    property["validators"] = [
                                        { "name": "NonEmpty" }
                                    ];
                                }
                            }
                        }
                        if (element.type == "comment") {
                            var property = {};
                            property["name"] = element.name;
                            property["displayName"] = element.title;
                            property["editor"] = "MultilineText";
                            if (element.isRequired) {
                                if (element.isRequired == true)
                                    property["validators"] = [
                                        { "name": "NonEmpty" }
                                    ];
                            }
                        }
                        metadata.propertyAnnotations.push(property)
                        feed.feedbackInfo.feedbackJson = metadata;
                    });
                })
                callback(null, res);
            }
            else {
                callback(err, null);
            }
        });
    }

}


