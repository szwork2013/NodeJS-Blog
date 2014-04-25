var mongodb = require('./db');
var markdown = require('markdown').markdown;
var Comment = require('../models/comment.js');

function Post(username, title, tags, post) {
    this.username = username;
    this.title = title;
    this.tags = tags;
    this.post = post;
}


module.exports = Post;

Post.prototype.save = function(callback) {
    var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + '-' +(date.getMonth() - 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())

    };

    var post = {
        username: this.username,
        time: time,
        title: this.title,
        tags: this.tags,
        post: this.post,
        comments: [],
        pv: 0
    }

    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        // read post collections
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.insert(post, {safe: true} , function(err, post) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, post[0]);
            });
        });
    });
};

Post.getTen = function(username, page, callback) {
    // Open db
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            var query = {};
            if (username) {
                query.username = username;
            }

            collection.count(query, function(err, total) {
                collection.find(query, {
                    skip: (page - 1) * 10,
                    limit: 10
                }).sort({
                    time:-1
                }).toArray(function(err, docs) {
                        mongodb.close();
                        if (err) {
                            return callback(err);  // fail
                        }

                        if (docs) {
                            docs.forEach(function(doc) {
                                doc.post = markdown.toHTML(doc.post);
                            })
                        }

                        callback(null, docs, total); // success
                    });

            });


        });
    });
}


Post.getOne = function(username, day, title, callback) {
     // Open database
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.findOne({
                "username" : username,
                "time.day": day,
                "title": title

            }, function(err, doc) {

                if (err) {
                    mongodb.close();
                    return callback(err);
                }

                if (doc == null) {
                    return callback(err);
                }

                // Parse markdown to html, check if doc exist, my be null
                if (doc) {
                    // 每访问1次, PV 值 + 1
                    collection.update({
                        "username" : username,
                        "time.day": day,
                        "title": title
                    },{
                        $inc: {"pv" : 1}        // $inc to control mongodb increase
                    }, function(err) {
                        mongodb.close();
                        if (err) {
                            return callback(err);
                        }
                    });


                    doc.post = markdown.toHTML(doc.post);
                    if (doc.comments) {
                        doc.comments.forEach(function(comment) {
                            comment.content = markdown.toHTML(comment.content);
                        });
                    };
                };

                callback(null, doc);
            });
        });
    });
}


Post.edit = function(username, day, title, callback) {
    // Open databse
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        // Get Post collection
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            // Select post
            collection.findOne({
                "username": username,
                "time.day": day,
                "title": title
            }, function(err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }


                callback(null, doc);
            });
        });
    });
};


Post.update = function(username, day, title, post, callback) {
    // Open database
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.update({
                "username": username,
                "time.day": day,
                "title": title
            }, {
                $set: {post: post}
            },function(err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            })

        })

    })
}


Post.delete = function(username, day, title, callback) {
    // Open database
    mongodb.open(function(err, db) {
        if (err) {
            callback(err);
        }

        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.remove({
                "username": username,
                "time.day": day,
                "title": title

            }, {
                w:1
            },function(err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }

                callback(null);
            })
        })
    })
}

Post.getArchieve = function(callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            // find docs onlu combined with username, title, time.
            collection.find( {}, {
                "username": 1,
                "time": 1,
                "title": 1
            }).sort({
                    time :-1
            }).toArray(function(err, docs) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }

                    callback(null, docs);
                });
        });
    });
};


Post.getTags = function(callback) {
    mongodb.open(function(err, db) {
        if (err) {
            callback(err);
        }

        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                callback(err);
            }


            // distince is used for get all value for given key
            collection.distinct('tags', function(err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }

                 callback(null, docs);
            });
        });
    });
};


Post.getTag = function(tag, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            // find docs only contain given tag
            collection.find({
                "tags": tag
            }, {
                "username": 1,
                "time": 1,
                "title": 1
            }).sort({
                    time: -1
            }).toArray(function(err, docs) {

                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null, docs);
            });
        });
    });
}

Post.search = function(keyword, callback) {

    //Open database
    mongodb.open(function(err, db) {
        if (err) {
            callback(err);
        }

        db.collection('posts', function(err, collection) {
            if (err) {
              mongodb.close();
              return callback(err);
            }

            var pattern = new RegExp("^.*" + keyword + ".*$", "i");
            collection.find({
                "title": pattern
            }, {
                "username": 1,
                "time": 1,
                "title": 1
            }).sort({
                 time: -1

            }).toArray(function(err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }

                callback(null, docs);
            });
        });
    });
};




















