(function () {
    'use strict';
    var myApp = angular.module('ies');
    myApp.controller('AppCtrl', AppCtrl);
    AppCtrl.$inject = ['$scope', '$window', '$timeout'];
    function AppCtrl($scope, $window, $timeout) {

        //Standard Table Filter Collapse
        $scope.filterCollapse = function ($event) {
            var thisElement = $event.currentTarget;
            angular.element(thisElement).children('i').toggleClass('fa-arrow-up');
            angular.element('#filterTitle').closest('.col-lg-6').toggleClass('col-lg-12');
            angular.element('#filterTitle').toggleClass('col-lg-12 border-bottom-0');
            angular.element('#filterResultTitle').toggle();
            angular.element('#filterAddRule').toggle();
            angular.element('#filterRules').toggle();
        }
        

        //Sidebar Collapse
        $scope.sidebarCollapseHide = function ($event) {
            var thisElement = $event.currentTarget;
            angular.element('#leftColumn').toggle("silde");
            $timeout(function () {
                angular.element('#rightColumn').toggleClass('col-md-12');
                angular.element('#siderbarCollapseShow').toggleClass('d-flex');
            }, 150);
        }
        $scope.sidebarCollapseShow = function ($event) {
            var thisElement = $event.currentTarget;
            angular.element('#siderbarCollapseShow').toggleClass('d-flex');
            angular.element('#rightColumn').toggleClass('col-md-12');
            angular.element('#leftColumn').toggle("silde");
        }

    }
})();
