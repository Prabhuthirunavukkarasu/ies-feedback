(function () {
    'use strict';
    var myApp = angular.module('ies');
    myApp.service("bootstrapError", bootstrapError);
    function bootstrapError() {
        this.showErrors = function (id) {
            var form = document.getElementById(id);
            form.className += " was-validated";
        }
        this.hideErrors = function (id) {
            var form = document.getElementById(id);
            form.className = form.className.replace("was-validated", "");

        }
    }
})();