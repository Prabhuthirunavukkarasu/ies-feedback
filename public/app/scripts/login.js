//initialize keycloak and bootstrap angular
(function () {
    'use strict';
    var authModule = angular.module('app.auth', []);

    function registerAuthListeners(Auth) {
        Auth.onReady = function () {
            console.log("Adapter is initialized");
        };

        Auth.onAuthSuccess = function () {
            console.log("User is successfully authenticated");
            loadRootScopeWithUserProfile(Auth);
        };

        Auth.onAuthError = function () {
            console.log("Error during authentication");
        };

        Auth.onAuthRefreshSuccess = function () {
            //Called when the token is refreshed.
            console.log("Auth refresh success");
        };

        Auth.onAuthRefreshError = function () {
            //Called if there was an error while trying to refresh the token.
            console.log("Auth refresh error");
        };

        Auth.onAuthLogout = function () {
            //Called if the user is logged out (will only be called if the session status iframe is enabled, or in Cordova mode).
            console.log("Auth logout successfully");
        };

        Auth.onTokenExpired = function () {
            //Called when the access token is expired. 
            //If a refresh token is available the token can be refreshed with updateToken, or 
            //in cases where it is not (that is, with implicit flow) you can redirect to login screen to obtain a new access token.
            console.log("Token expired");
            var successCallback = (function successCallback() {
                return function (refreshed) {
                    if (refreshed) {
                        console.log("Token refreshed");
                        if (Auth.onauthChange) {
                            Auth.onauthChange();
                            loadRootScopeWithUserProfile(Auth);
                        }

                    }
                };
            })();
            Auth.updateToken(0).success(successCallback).error(function () {
                Auth.logout();
            });
        };
    }

    //store / cache user profile in rootScope
    function loadRootScopeWithUserProfile(Auth) {
        Auth.principal = Auth.tokenParsed;
        Auth.principal.userRoles = {};
        Auth.principal.userEntitlements = getEntitlements(Auth, rolesToEntitlements);
        Auth.principal.userStates = getStates(Auth, roleToStates);
        console.log("obtained post auth" + Auth.principal);
    }

    function getEntitlements(Auth, allRoles) {
        var userEntitlements = {};
        Object.getOwnPropertyNames(allRoles).forEach(function (role) {
            if (Auth.principal.resource_access["ies_sis"].roles.indexOf(role) >= 0) {
                //get entitlements for the current role
                console.log("fetching entitlements for role " + role);
                var roleWithEntitlements = allRoles[role];
                Auth.principal.userRoles[role] = true;
                roleWithEntitlements.forEach(function (e) {
                    //check each entitlement if present in userEntitlements and add it to the array if not present
                    if (!userEntitlements[e]) {
                        console.log("Adding entitlement to user " + e);
                        userEntitlements[e] = true;
                    }
                });
            }
        });
        console.log(userEntitlements);
        return userEntitlements;
    }

    //get the states for the role
    function getStates(Auth, allRoles) {
        var userStates = {};
        Object.getOwnPropertyNames(allRoles).forEach(function (role) {
            if (Auth.principal.realm_access.roles.indexOf(role) >= 0) {
                //get entitlements for the current role
                console.log("fetching states for role " + role);
                var roleWithStates = allRoles[role];
                roleWithStates.forEach(function (e) {
                    //check each state if present in userState and add it to the array if not present
                    if (!userStates[e]) {
                        console.log("Adding state to user " + e);
                        userStates[e] = true;
                    }
                });
            }
        });
        console.log(userStates);
        return userStates;
    }

    var rolesToEntitlements =
        {
            "PLACEMENT_OFFICE": [
                "VIEW_STUDENTS",
                "VIEW_DASHBOARD",
                "CONFIGURE_APPLICATION"
            ],
            "HOD": [
                "VIEW_STUDENTS_IN_DEPARTMENT",
                "VIEW_DASHBOARD"
            ],
            "PROGRAM_COORDINATOR": [
                "VIEW_STUDENTS_IN_PROGRAM",
                "VIEW_DASHBOARD"
            ],
            "CLASS_TUTOR": [
                "VIEW_STUDENTS_IN_CLASS",
                "VIEW_DASHBOARD"
            ],
            "STUDENT": [
                "MY_PROFILE"
            ],
            "CLASS_REP": [
                "VIEW_STUDENTS_IN_CLASS",
                "MY_PROFILE"
            ],
            "STUDENTS_SECTION": [
                "EDIT_BASIC_DATA"
            ],
            "STUDENTS_ADMIN": []
        };

    //added entitlements (key) and state(value)
    //all these states used in current example come under application sales 
    var roleToStates =
        {
            "STUDENTS_ADMIN": [
                "dashboard",
                "students",
                "personalDetails",
                "tcDetails",
                "convocation",
                "certificate",
                "studentprofileview",
                "admissionDetails"
            ],
            "PLACEMENT_OFFICE": [
                "dashboard",
                "students",
                "personalDetails",
                "tcDetails",
                "convocation",
                "certificate",
                "studentprofileview",
                "admissionDetails"
            ],
            "HOD": [
                "dashboard",
                "students",
                "personalDetails",
                "studentprofileview",
                "admissionDetails"
            ],
            "PROGRAM_COORDINATOR": [
                "dashboard",
                "students",
                "personalDetails",
                "studentprofileview"
            ],
            "CLASS_TUTOR": [
                "dashboard",
                "students",
                "personalDetails",
                "studentprofileview"
            ],
            "STUDENT": [
                "studentprofileview"
            ],
            "CLASS_REP": [
                "studentprofileview"
            ],
            "STUDENTS_SECTION": [
                "personalDetails",
                "studentprofileview",
                "admissionDetails"
            ]
        };

    authModule.constant("rolesToEntitlements", rolesToEntitlements);
    authModule.constant("roleToStates", roleToStates);

    // angular.element(document).ready(function () {
    // });

    function authWithKeycloak() {
        var keycloak = new Keycloak(window.keycloakConfig);
        //register listeners
        registerAuthListeners(keycloak);
        var keycloakEnabled = false;

        if (keycloakEnabled) {
            keycloak.init({
                onLoad: 'login-required',
                checkLoginIframe: true,
                checkLoginIframeInterval: 5,
                responseMode: 'fragment'
            }).success(function (authenticated) {
                authModule.factory('Auth', function () {
                    return keycloak;
                });
                bootstrap();

            }).error(function () {
                alert("Authentication failed");
                // window.location.reload();
            });
        } else {
            authModule.factory('Auth', function () {
                var keycloak = {};
                keycloak.tokenParsed = {
                    email: 'admin@psg',
                    preferred_username: 'admin',
                    name: 'Admin',
                    userRoles: {
                        'PLACEMENT_OFFICE': 1
                    }
                };
                keycloak.hasResourceRole = function (role) {
                    return (role == "PLACEMENT_OFFICE");
                };
                keycloak.principal = keycloak.tokenParsed;
                // keycloak.tokenParsed = {
                //     email: '16utc35@psg',
                //     preferred_username: '16utc35',
                //     name: '16UTC35',
                //     userRoles: {
                //         'PLACEMENT_STUDENT': 1
                //     }
                // };
                // keycloak.hasResourceRole = function (role) {
                //     return (role == "PLACEMENT_STUDENT");
                // };

                return keycloak;
            });
            bootstrap();
        }
    };//end document ready

    function bootstrap() {
        angular.element(document).ready(function () {
            angular.bootstrap(document, ['app']);
        });
    }

    authWithKeycloak();

})();//end function
