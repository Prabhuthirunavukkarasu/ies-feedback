(function () {
    'use strict';
    var myApp = angular.module('ies');
    myApp.config(configuration);
    configuration.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
    function configuration($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode(false);
        $urlRouterProvider.otherwise('/feedbackDashboard');
        $stateProvider
            .state('feedbackDashboard', {
                url: "/feedbackDashboard",
                templateUrl: 'app/modules/feedbackDashboard.html',
                controller: 'feedbackCtrl',
            });
    }

})();