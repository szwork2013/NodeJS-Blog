var mongodb = require('./db');
markdown = require('markdown').markdown;

function Post(username, title, post) {
    this.username = username;
    this.title = title;
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
        post: this.post
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

Post.getAll = function(username, callback) {
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

            collection.find(query).sort({
                time:-1
            }).toArray(function(err, docs) {
                    mongodb.close();
                    if (err) {
                        return callback(err);  // fail
                    }

                    docs.forEach(function(doc) {
                        doc.post = markdown.toHTML(doc.post);
                    })

                    callback(null, docs); // success
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
                mongodb.close();
                if (err) {
                    return callback(err);
                }

                if (doc == null) {
                    return callback(err);
                }

                // Parse markdown to html
                doc.post = markdown.toHTML(doc.post);
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





