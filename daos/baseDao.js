var mongodb = require('./MongodDbUtil');

function create(record, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());
    coll.insert(record, function (err, result) {
        if (!err) {
            callback(null, result.ops[0]);
        } else {
            callback(err, null);
        }
    });
}

function createMany(records, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());
    coll.insertMany(records, function (err, result) {
        if (!err) {
            callback(null, result.ops[0]);
        } else {
            callback(err, null);
        }
    });
}

function getAll(callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());
    coll.find({}).toArray(function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });
}

function getById(id, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());
    coll.findOne({ _id: mongodb.ObjectID(id) }, function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });

}

function getByQuery(query, projection, callback) {
    if (typeof projection == "function") {
        callback = projection;
        projection = null;
    }
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());

    var cursor;
    if (projection) {
        var projectionObj = {};
        projection.forEach(function (p) {
            projectionObj[p] = 1;
        });
        cursor = coll.find(query, projectionObj);
    } else {
        cursor = coll.find(query);
    }

    cursor.toArray(function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });

}

function getAndSortByQuery(query, projection, sortCriteria, callback) {
    if (typeof projection == "function") {
        callback = projection;
        projection = null;
    }
    if (typeof sortCriteria == "function") {
        callback = sortCriteria;
        sortCriteria = null;
    }

    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());

    var cursor;
    if (projection) {
        var projectionObj = {};
        projection.forEach(function (p) {
            projectionObj[p] = 1;
        });
        cursor = coll.find(query, projectionObj);
    } else {
        cursor = coll.find(query);

    }

    if (sortCriteria) {
        cursor.sort(sortCriteria);
    }

    cursor.toArray(function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });

}

function update(query, detailsToUpdate, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());
    coll.update(query, { $set: detailsToUpdate }, { multi: false }, function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });
}

function upsert(query, detailsToUpdate, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());
    coll.update(query, { $set: detailsToUpdate }, { multi: false, upsert: true }, function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });

}


function updateToUnset(query, detailsToUpdate, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());
    coll.update(query, { $unset: detailsToUpdate }, { multi: false }, function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });

}

function updateArrayById(id, elementsToPush, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());

    coll.update({ _id: mongodb.ObjectID(id) }, { $push: elementsToPush }, { multi: false }, function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });
}


function updateArrayByQuery(query, elementsToPush, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());

    coll.update(query, { $push: elementsToPush }, { multi: false }, function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });
}

function removeItemInArrayByQuery(query, elementToDelete, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());

    coll.update(query, { $pull: elementToDelete }, { multi: false }, function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });
}

function updateById(id, detailsToUpdate, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());

    var deletedId;
    if (detailsToUpdate._id) {
        deletedId = detailsToUpdate._id;
        delete detailsToUpdate._id;
    }

    coll.update({ _id: mongodb.ObjectID(id) }, { $set: detailsToUpdate }, { multi: false }, function (err, result) {
        if (deletedId) {
            detailsToUpdate._id = deletedId;
        }

        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });

}

function updateMany(query, detailsToUpdate, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());
    coll.updateMany(query, { $set: detailsToUpdate }, function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });

}

function distinctByQuery(field, query, callback){
    if (typeof query == "function") {
        callback = query;
        query = null;
    }
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());
    if(!query)
        query = {};
    coll.distinct(field, query, function(err, result){
        if(!err){
            callback(null,result);
        } else {
            callback(err, null);
        }
    })
}

function remove(id, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());
    coll.remove({ _id: mongodb.ObjectID(id) }, function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });
}

function removeByQuery(query, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());
    coll.remove(query, function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });
}

function getIdFilter(entity) {
    return {_id: mongodb.ObjectID(entity._id)};
}

function removeItemInArrayById(id, elementToDelete, callback) {
    var db = mongodb.getDb();
    var coll = db.collection(this.getCollectionName());

    coll.update({ _id: mongodb.ObjectID(id) }, { $pull: elementToDelete }, { multi: false }, function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });
}

function getMongoDb() {
    return mongodb;
}

function bulkWrite(bulk, callback) {
    var db = mongodb.getDb();

    var coll = db.collection(this.getCollectionName());

    coll.bulkWrite(bulk, function (err, result) {
        if (!err) {
            callback(null, result);
        } else {
            callback(err, null);
        }
    });
}

function getDb() {
    return monogdb.getDb();
}

module.exports = function BaseDao(collectionName) {
    return {
        create: create,
        createMany: createMany,
        getAll: getAll,
        getById: getById,
        getByQuery: getByQuery,
        getAndSortByQuery: getAndSortByQuery,
        update: update,
        upsert: upsert,
        updateById: updateById,
        updateMany: updateMany,
        updateToUnset: updateToUnset,
        updateArrayById: updateArrayById,
        updateArrayByQuery: updateArrayByQuery,
        removeItemInArrayByQuery: removeItemInArrayByQuery,
        distinctByQuery : distinctByQuery,
        remove: remove,
        removeByQuery: removeByQuery,
        removeItemInArrayById: removeItemInArrayById,
        bulkWrite: bulkWrite,
        getIdFilter: getIdFilter,
        getDb: getDb,
        getCollectionName: function () {
            return collectionName;
        },
    };
};