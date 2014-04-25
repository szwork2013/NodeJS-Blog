var mongodb = require('./db');
var crypto = require('crypto');

function User(user) {
    this.username = user.username;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;

User.prototype.save = function(callback) {
    var md5 = crypto.createHash('md5'),
        emailMD5 = md5.update(this.email.toLowerCase()).digest('hex'),
        head = "http://www.gravatar.com/avatar/" + emailMD5 + "?s=48"

    var user = {
        username: this.username,
        password: this.password,
        email: this.email,
        head: head
    };

    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }

        // read user collections
        db.collection('users', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            // insert intot user collection
            collection.insert(user, {
                safe:true
            }, function(err, user) {
                mongodb.close();
                if (err) {                  // return err message
                    return callback(err);
                }

                callback(null, user[0]);   // success!
            })
        })
    })
}


User.get = function(username, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return  callback(err);
        }

        // get users collection
        db.collection('users', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }


            collection.findOne({
                username: username
            }, function(err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);     // error
                }

                callback(null, user);         //success
            });
        });
    });

}


