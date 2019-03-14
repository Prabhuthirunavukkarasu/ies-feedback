myapp = angular.module('ies');
myApp.service('feedbackServices', feedbackServices);
feedbackServices.$inject = ['$http', '$window'];
function feedbackServices($http, $window) {
    this.getSelectedNodesWithProjection = function (callback) {
        var request = {
            url: $window.location.origin + $window.location.pathname + "feedback/getSelectedNodes",
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'annasarpprasanna'
            }
        };
        $http(request).then(function (response) {
            callback(null, response.data);
        }, function (error) {
            callback(error, null);
        });
    };

    this.createFeedback = function (finalFeedback, callback) {
        var request = {
            url: $window.location.origin + $window.location.pathname + "feedback/createFeedback",
            method: 'POST',
            data: finalFeedback,
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'annasarpprasanna'
            }
        };
        $http(request).then(function (response) {
            callback(null, response.data);
        }, function (error) {
            callback(error, null);
        });
    }

    this.getCreatedFeedbacks = function (callback) {
        var request = {
            url: $window.location.origin + $window.location.pathname + "feedback/getFeedback",
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'annasarpprasanna'
            }
        };
        $http(request).then(function (response) {
            callback(null, response.data);
        }, function (error) {
            callback(error, null);
        });
    }
}