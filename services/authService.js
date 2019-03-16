'use strict';
var request = require('request');

let adminClient = require('../kc-admin-client/kc-admin-client');
var appLogger = require('../logging/appLogger');
var config = require('../config/config.' + process.env.NODE_ENV);
var keycloakConfig = config.authServerConfig;
let settings = config.authServerConfig.settings;
var realmName = config.authServerConfig.realmName;
var STUDENT_GROUP = config.authServerConfig.studentUserGroup;

//reference to Keycloak REST API client
var kcApiClient;
var studentGroupId;

//initialize client
adminClient(settings)
    .then((client) => {
        appLogger.info("Connected successfully to Keycloak server");

        kcApiClient = client;

        client.groups.find(realmName).then((groups) => {
            if (groups.length > 0) {
                groups.forEach(function (g) {
                    if (g.name == STUDENT_GROUP) {
                        studentGroupId = g.id;
                    }
                });
            }
        });
    }) //end adminClient
    .catch((err) => {
        appLogger.error(err, "Error while trying to connect to KeyCloak server");
    });

function addUserToGroup(realm, userRecord, groupName, callback) {
    adminClient(settings)
        .then((client) => {
            //STEP 1:  find user record to fetch User Id from it
            client.users.find(realm, { username: userRecord.rollNumber.toLowerCase() })
                .then((foundUser) => {
                    if ((foundUser) && (foundUser.length == 1)) {
                        foundUser = foundUser[0];
                    } else {
                        var foundErr = new Error("No user records found for " + userRecord.rollNumber);
                        console.log(JSON.stringify(foundErr));
                        appLogger.error(foundErr, foundErr.message);
                        callback(foundErr, userRecord);
                        return;
                    }

                    //find matching user group
                    var groupId;
                    client.groups.find(realmName).then((groups) => {
                        if (groups.length > 0) {
                            groups.forEach(function (g) {
                                if (g.name == groupName) {
                                    groupId = g.id;
                                }
                            });
                        }

                        //return if no matching user group
                        if (!groupId) {
                            foundErr = new Error("No matching group found for " + groupName);
                            console.log(JSON.stringify(foundErr));
                            appLogger.error(foundErr, foundErr.message);
                            callback(foundErr, null);
                            return;
                        }

                        //associate user to group now
                        client.users.joinGroup(realmName, foundUser.id, groupId).then((updatedUser) => {
                            appLogger.info("Updated user " + foundUser.username + " with group " + groupName + " successfully");
                            console.log("Updated user " + foundUser.username + " with group " + groupName + " successfully");
                            callback(null, updatedUser);

                        }).catch((err) => {
                            appLogger.error(err, "Error while trying to associate user to the Student group " + err);
                            console.log("Error while trying to associate user to the Student group " + err);
                            callback(err, createdUser);
                        });//end groups update promise

                    }).catch((err) => {
                        appLogger.error(err, "Error while trying to find group id " + err);
                        console.log("Error while trying to find group id " + err);
                        callback(err, groupName);
                    });;

                }).catch((findErr) => {
                    appLogger.error(findErr, "Error while trying to find user before updating " + userRecord.rollNumber + " in KeyCloak server");
                    callback(findErr, userRecord);
                });

        });
}

function updateUserDetails(realm, userRecord, callback) {
    adminClient(settings)
        .then((client) => {
            //STEP 1:  find user record to fetch User Id from it
            client.users.find(realm, { username: userRecord.rollNumber.toLowerCase() })
                .then((foundUser) => {
                    if ((foundUser) && (foundUser.length == 1)) {
                        foundUser = foundUser[0];
                    } else {
                        var foundErr = new Error("No user records found for " + userRecord.rollNumber);
                        appLogger.error(foundErr, foundErr.message);
                        callback(foundErr, userRecord);
                        return;
                    }

                    foundUser.email = userRecord.studentEmail;
                    foundUser.emailVerified = userRecord.emailVerification;
                    foundUser.attributes = {
                        programName: userRecord.programName,
                        branchName: userRecord.branchName,
                        degreeName: userRecord.degreeName,
                        currentSem: userRecord.currentSem,
                        fatherName: userRecord.family.fatherName,
                    };
                    // STEP 2: updateUser
                    client.users.update(realm, foundUser)
                        .then((updatedUser) => {
                            appLogger.info(`Update user account ${userRecord.rollNumber}`);
                            callback(null, userRecord);
                        }).catch((err) => {
                            appLogger.error(err, "Error while trying to update user " + userRecord.rollNumber + " in KeyCloak server");
                            callback(err, userRecord);
                        });//end remove promise

                }).catch((findErr) => {
                    appLogger.error(findErr, "Error while trying to find user before updating " + userRecord.rollNumber + " in KeyCloak server");
                    callback(findErr, userRecord);
                });

        });
}

function resetPassword(realm, userRecord, callback) {
    adminClient(settings)
        .then((client) => {
            //STEP 1:  find user record to fetch User Id from it
            client.users.find(realm, { username: userRecord.rollNumber.toLowerCase() })
                .then((foundUser) => {
                    if ((foundUser) && (foundUser.length == 1)) {
                        foundUser = foundUser[0];
                    } else {
                        var foundErr = new Error("No user records found for " + userRecord.rollNumber);
                        appLogger.error(foundErr, foundErr.message);
                        callback(foundErr, userRecord);
                        return;
                    }

                    //STEP 2: set password
                    var passwdVal = { temporary: true, value: userRecord.rollNumber };
                    client.users.resetPassword(realmName, foundUser.id, passwdVal)
                        .then((updatedUser) => {
                            appLogger.info(`Update user account ${userRecord.rollNumber}`);
                            callback(null, userRecord);
                        }).catch((err) => {
                            appLogger.error(err, "Error while trying to update user " + userRecord.rollNumber + " in KeyCloak server");
                            callback(err, userRecord);
                        });
                        
                }).catch((findErr) => {
                    appLogger.error(findErr, "Error while trying to find user before updating " + userRecord.rollNumber + " in KeyCloak server");
                    callback(findErr, userRecord);
                });
        });
}

function deactivateUser(realm, userRecord, callback) {
    adminClient(settings)
        .then((client) => {
            //STEP 1:  find user record to fetch User Id from it
            client.users.find(realm, { username: userRecord.rollNumber.toLowerCase() })
                .then((foundUser) => {
                    if ((foundUser) && (foundUser.length == 1)) {
                        foundUser = foundUser[0];
                    } else {
                        var foundErr = new Error("No user records found for " + userRecord.rollNumber);
                        appLogger.error(foundErr, foundErr.message);
                        callback(foundErr, userRecord);
                        return;
                    }

                    foundUser.enabled = false;
                    // STEP 2: updateUser
                    client.users.update(realm, foundUser)
                        .then((updatedUser) => {
                            appLogger.info(`Update user account ${userRecord.rollNumber}`);
                            callback(null, userRecord);
                        }).catch((err) => {
                            appLogger.error(err, "Error while trying to update user " + userRecord.rollNumber + " in KeyCloak server");
                            callback(err, userRecord);
                        });//end remove promise

                }).catch((findErr) => {
                    appLogger.error(findErr, "Error while trying to find user before updating " + userRecord.rollNumber + " in KeyCloak server");
                    callback(findErr, userRecord);
                });

        });
}


function activateUser(realm, userRecord, callback) {
    adminClient(settings)
        .then((client) => {
            //STEP 1:  find user record to fetch User Id from it
            client.users.find(realm, { username: userRecord.rollNumber.toLowerCase() })
                .then((foundUser) => {
                    if ((foundUser) && (foundUser.length == 1)) {
                        foundUser = foundUser[0];
                    } else {
                        var foundErr = new Error("No user records found for " + userRecord.rollNumber);
                        appLogger.error(foundErr, foundErr.message);
                        callback(foundErr, userRecord);
                        return;
                    }

                    foundUser.enabled = true;
                    // STEP 2: updateUser
                    client.users.update(realm, foundUser)
                        .then((updatedUser) => {
                            appLogger.info(`Update user account ${userRecord.rollNumber}`);
                            callback(null, userRecord);
                        }).catch((err) => {
                            appLogger.error(err, "Error while trying to update user " + userRecord.rollNumber + " in KeyCloak server");
                            callback(err, userRecord);
                        });//end remove promise

                }).catch((findErr) => {
                    appLogger.error(findErr, "Error while trying to find user before updating " + userRecord.rollNumber + " in KeyCloak server");
                    callback(findErr, userRecord);
                });

        });
}

function createUser(userRecord, callback) {
    var authUser = createAuthUser(userRecord);
    console.log("Obtained login user object for student " + userRecord.rollNumber + " login id is " + authUser.username);

    adminClient(settings)
        .then((client) => {

            // STEP 1: createUser
            client.users.create(realmName, authUser)
                .then((createdUser) => {
                    appLogger.info(`Created user account for ${userRecord.rollNumber} with user object ${createdUser}`);

                    //STEP 2: set password
                    var passwdVal = { temporary: true, value: userRecord.rollNumber };
                    var passwdPromise = client.users.resetPassword(realmName, createdUser.id, passwdVal);

                    //STEP 3: join student group to get the required roles in the system
                    passwdPromise.then(function () {
                        appLogger.info(`Password is set for user account ${authUser.username}`);

                        client.users.joinGroup(realmName, createdUser.id, studentGroupId).then((updatedUser) => {
                            appLogger.info(`Updated user ${authUser.username} with student group successfully`);
                            callback(null, createdUser);

                        }).catch((err) => {
                            appLogger.error(err, "Error while trying to associate user to the Student group " + err);
                            callback(err, createdUser);
                        });;//end groups update promise

                    }).catch((err) => {
                        appLogger.error(err, "Error while trying to set password in KeyCloak server " + err);
                        callback(err, createdUser);
                    });;//end passwd promise

                }).catch((err) => {
                    appLogger.error(err, "Error while trying to create user in KeyCloak server " + err);
                    callback(err, authUser);
                });//end create promise
        });
}

function deleteUser(realm, userRecord, callback) {
    adminClient(settings)
        .then((client) => {
            //STEP 1:  find user record to fetch User Id from it
            client.users.find(realm, { username: userRecord.rollNumber.toLowerCase() })
                .then((foundUser) => {

                    if ((foundUser) && (foundUser.length == 1)) {
                        foundUser = foundUser[0];
                    } else {
                        var foundErr = new Error("No user records found for " + userRecord.rollNumber);
                        appLogger.error(foundErr, foundErr.message);
                        callback(foundErr, userRecord);
                        return;
                    }

                    // STEP 2: deleteUser
                    client.users.remove(realm, foundUser.id)
                        .then((deletedUser) => {
                            appLogger.info(`Deleted user account ${userRecord.rollNumber}`);
                            callback(null, userRecord);
                        }).catch((err) => {
                            appLogger.error(err, "Error while trying to remove user " + userRecord.rollNumber + " in KeyCloak server");
                            callback(err, userRecord);
                        });//end remove promise

                }).catch((findErr) => {
                    appLogger.error(findErr, "Error while trying to find user before removing " + userRecord.rollNumber + " in KeyCloak server");
                    callback(findErr, userRecord);

                });

        });
}

function createUsers(users, callback) {
    var processedUsers = [];
    var errorUsers = [];

    createItr(users, 0, processedUsers, errorUsers, callback);

    function createItr(records, index, processedRecords, errorRecords, callback) {
        if (index >= records.length) {
            console.log("Completed processing of users to create their account");
            callback(((errorRecords.length == 0) ? null : errorRecords), processedRecords);
            return;
        }

        var user = records[index];
        createUser(user, function (err, createdUser) {
            if (err) {
                console.log("Error while creating user " + user.rollNumber + " " + err);
                errorRecords.push(user);
            } else {
                console.log("Successfully created user " + user.rollNumber);
            }
            processedUsers.push(createdUser);

            createItr(records, index + 1, processedRecords, errorRecords, callback);
        });
    }
}

function deleteUsers(realm, users, callback) {
    var processedUsers = [];
    var errorUsers = [];

    deleteItr(realm, users, 0, processedUsers, errorUsers, callback);

    function deleteItr(realm, records, index, processedRecords, errorRecords, callback) {
        if (index >= records.length) {
            callback(((errorRecords.length == 0) ? null : errorRecords), processedRecords);
            return;
        }

        var user = records[index];
        deleteUser(realm, user, function (err, deletedUser) {
            if (err) {
                errorRecords.push(user);
            }
            processedUsers.push(deletedUser);

            deleteItr(realm, records, index + 1, processedRecords, errorRecords, callback);
        });
    }
}

function createAuthUser(userRecord) {
    var authUser = {};

    authUser.firstName = userRecord.studentName;
    authUser.username = userRecord.rollNumber.toLowerCase();
    authUser.enabled = true;

    //TODO get the list of attributes from the function itself
    // status: userRecord.active,
    // dob: userRecord.dob,
    // studentContactNo:userRecord.studentContactNo,   
    // studentEmail:userRecord.studentEmail
    authUser.attributes = {
        programName: userRecord.programName,
        branchName: userRecord.branchName,
        degreeName: userRecord.degreeName,
        currentSem: userRecord.currentSem
    };

    if (userRecord.email) {
        authUser.email = userRecord.studentEmail;
    }

    return authUser;
}

function addUsersToGroup(realm, users, groupName, callback) {
    addUserToGroupRecursively(realm, users, 0, groupName, callback);
}

function addUserToGroupRecursively(realm, usersList, processingIndex, groupName, originalCallback) {
    if (processingIndex >= usersList) {
        originalCallback(null, usersList);
        return;
    }

    addUserToGroup(realm, usersList[processingIndex], groupName, function (err, updatedUser) {
        processingIndex++;

        if (processingIndex >= usersList) {
            originalCallback(null, usersList);
            return;
        } else {
            addUserToGroupRecursively(realm, usersList, processingIndex, groupName, originalCallback);
        }
    });
}

function verifyCallerWithKeycloak(req, res, next) {
    if(req.method== "GET" && req.originalUrl.startsWith("/lookups/load/versionCode")) {
        next();
        return;
    }
    if (!keycloakConfig.verifyToken || keycloakConfig.bypassId == req.headers.authorization) {
        next();
        return;
    }
    var options = {
        method: 'POST',
        url: keycloakConfig.verifyTokenUrl,
        headers:
        {
            'Cache-Control': 'no-cache',
            'Authorization': req.headers.authorization,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {}
    };

    request(options, function (error, response, body) {
        if (error) {
            // appLogger.error("Failed to authenticate user token", response.statusMessage);
            res.status(500).send({ name: "ERROR-VERIFYING-TOKEN", message: "Error in token verification" });
            return;
        }

        if (response.statusCode == 200) {
            next();
            return;
            // nJwt.verify(tok, null, function (err, verifiedJwt) {
            //     if (err) {
            //         role_arr = err.parsedBody.realm_access.roles;
            //     } else {
            //         role_arr = verifiedJwt.parsedBody.realm_access.roles;
            //     }
            // });
        }
        else {
            // appLogger.error("Failed to authenticate user token", response.statusMessage);
            res.status(500).send({ name: "ERROR-VERIFYING-TOKEN", message: "Error in token verification" });
        }
    });
}

module.exports.createUser = createUser;
module.exports.createUsers = createUsers;
module.exports.deleteUser = deleteUser;
module.exports.deleteUsers = deleteUsers;
module.exports.updateUserDetails = updateUserDetails;
module.exports.resetPassword = resetPassword;
module.exports.deactivateUser = deactivateUser;
module.exports.activateUser = activateUser;
module.exports.addUserToGroup = addUserToGroup;
module.exports.addUsersToGroup = addUsersToGroup;
module.exports.verifyCallerWithKeycloak = verifyCallerWithKeycloak;
