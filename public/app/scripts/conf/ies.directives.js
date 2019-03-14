var myApp = angular.module('ies');
myApp.directive('windowHeight', function ($window) {
    return {
        link: function (scope, element, attrs) {
            angular.element(window).resize(function () {
                scope.windowHeight();
            });
            setTimeout(function () {
                scope.windowHeight();
            }, 10);
            scope.windowHeight = function () {
                element.css('min-height', angular.element(window).height() -
                    (angular.element('#footer').height()));

            }
        }
    }
})


myApp.directive('scrollSpy', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, elem, attr) {
            var offset = parseInt(attr.scrollOffset, 10)
            if (!offset) offset = 10;
            elem.scrollspy({ "offset": offset });
            scope.$watch(attr.scrollSpy, function (value) {
                $timeout(function () {
                    elem.scrollspy('refresh', { "offset": offset })
                }, 1);
            }, true);
            
        }
    }
});

myApp.directive('preventDefault', function () {
    return function (scope, element, attrs) {
        jQuery(element).click(function (event) {
            event.preventDefault();
        });
    }
});

myApp.directive("scrollTo", ["$window", function ($window) {
    return {
        restrict: "AC",
        compile: function () {

            function scrollInto(elementId) {
                if (!elementId) $window.scrollTo(0, 0);
                //check if an element can be found with id attribute
                var el = document.getElementById(elementId);
                if (el) el.scrollIntoView();
            }

            return function (scope, element, attr) {
                element.bind("click", function (event) {
                    scrollInto(attr.scrollTo);
                });
            };
        }
    };
}]);

myApp.filter('startFrom', startFrom);
function startFrom() {

    return function (input, start) {
        if (start) {
            start = +start;
            return input.slice(start);
        }
        return input;
    }
}