(function () {
    'use strict';
    var myApp = angular.module('ies');
    myApp.controller('feedbackCtrl', feedbackCtrl);
    feedbackCtrl.$inject = ['$scope', '$rootScope', '$state', '$window', '$filter', '$timeout', 'bootstrapError', 'feedbackServices'];
    function feedbackCtrl($scope, $rootScope, $state, $window, $filter, $timeout, bootstrapError, feedbackServices) {

        $scope.feedback = {};
        $scope.organisation = [
            {
                "unitName": {
                    "name": "PSG COLLEGE OF ARTS & SCIENCE",
                    "value": "CAS"
                }
            }
        ];

        $scope.organisationUnit = [
            {
                "name": "AIDED",
            },
            {
                "name": "SF",
            }
        ]

        feedbackServices.getSelectedNodesWithProjection(function (err, res) {
            if (!err) {
                $scope.feedbackAudiencers = res;
            }
            else {
                console.log(err);
            }
        });

        $scope.feedback.audience = {};
        $scope.feedback.audience.organisation = {};
        $scope.feedback.audience.orgUnit = {};
        $scope.feedback.audience.department = {}
        $scope.feedback.audience.programmeName = {}
        $scope.feedback.audience.batchYear = {}
        $scope.feedback.audience.section = {}
        $scope.loadDepartmentsByOrgUnit = function (orgUnit) {
            $scope.feedback.audience.department = {}
            $scope.feedback.audience.programmeName = {}
            $scope.feedback.audience.batchYear = {}
            $scope.feedback.audience.section = {}
            $scope.selectedDepartments = [];
            angular.forEach($scope.feedbackAudiencers, function (org) {
                if (orgUnit.name == org.programmeCategory) {
                    $scope.selectedDepartments.push(org);
                }
            })
        }

        $scope.loadProgrammeByDepartment = function (pgm) {
            $scope.feedback.audience.programmeName = {}
            $scope.feedback.audience.batchYear = {}
            $scope.feedback.audience.section = {}
            $scope.selectedProgramme = [];
            angular.forEach($scope.feedbackAudiencers, function (org) {
                if (org.programmeName.includes(pgm.department)) {
                    $scope.selectedProgramme.push(org);
                }
            })
        }

        $scope.createFeedback = function (finalAudience) {
            var path = "";
            var feedbackDetail = {};
            feedbackDetail.audience = {};
            if (!$scope.isObjectEmpty(finalAudience.audience.orgUnit)) {
                path = path + "org:" + finalAudience.audience.organisation.unitName.value + $window.location.pathname + "orgUnit:" + finalAudience.audience.orgUnit.name + $window.location.pathname;
                feedbackDetail.audience.organisationUnit = finalAudience.audience.orgUnit.name;
                if (!$scope.isObjectEmpty(finalAudience.audience.department)) {
                    path = path + "department:" + finalAudience.audience.department.department + $window.location.pathname;
                    feedbackDetail.audience.department = finalAudience.audience.department.department;
                    if (!$scope.isObjectEmpty(finalAudience.audience.programmeName)) {
                        path = path + "programmeName:" + finalAudience.audience.programmeName.programmeName + $window.location.pathname + "batchYear:" + finalAudience.audience.programmeName.batchYear + $window.location.pathname + "section:" + finalAudience.audience.programmeName.pathName;
                        feedbackDetail.audience.programmeName = finalAudience.audience.programmeName.programmeName;
                        feedbackDetail.audience.batchYear = finalAudience.audience.programmeName.batchYear;
                        feedbackDetail.audience.section = finalAudience.audience.programmeName.pathName;
                    }
                }
            }
            else {
                path = "org:" + finalAudience.audience.organisation.unitName.value + $window.location.pathname;
            }
            feedbackDetail.audience.organisation = finalAudience.audience.organisation.unitName.name;
            feedbackDetail.audience.path = path;
            feedbackDetail.feedbackInfo = {};
            feedbackDetail.feedbackInfo.feedbackJson = JSON.parse(finalAudience.feedbackJson);
            // feedbackDetail.feedbackInfo.feedbackJson = feedbackDetail.feedbackInfo.feedbackJson.replace(/\n/g, "<br />");
            feedbackDetail.feedbackInfo.name = finalAudience.name;
            feedbackDetail.feedbackInfo.timeOfCreation = new Date();
            $scope.feedback = {};
            feedbackServices.createFeedback(feedbackDetail, function (err, res) {
                if (!err) {
                    console.log(res);
                    successMessage("Feedback has been created successfully");
                    getCreatedFeedbacks();
                }
                else {
                    console.log(err);
                    ErrorMessage("Failed to create feedback");
                }
            });
        }

        var getCreatedFeedbacks = function () {
            feedbackServices.getCreatedFeedbacks(function (err, res) {
                if (!err) {
                    $scope.pastFeedbacks = res;
                }
                else {
                    console.log(err);
                    ErrorMessage("Failed to fetch feedback");
                }
            })
        }
        getCreatedFeedbacks();

        $scope.isObjectEmpty = function (obj) {
            return Object.keys(obj).length === 0;
        }

        $(document).ready(function () {
            $("#openModalBtn").click(function () {
                $scope.feedback = {};
                $("#add_user").modal();
            });
        });

        var successMessage = function (message) {
            $window.scrollTo(0, 0);
            $scope.success = true;
            $scope.successMsg = message;
            $timeout(function () {
                $scope.success = false;
                $scope.successMsg = "";
            }, 5000);
        }

        var ErrorMessage = function (message) {
            $window.scrollTo(0, 0);
            $scope.error = true;
            $scope.errorMsg = message;
            $timeout(function () {
                $scope.error = false;
                $scope.errorMsg = "";
            }, 5000);
        }

    }
})();