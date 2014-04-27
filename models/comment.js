var mongodb = require('./db');

function Comment(username, day, title, comment) {
    this.username = username;
    this.day = day;
    this.title = title;
    this.comment = comment;
}

module.exports = Comment;



Comment.prototype.save = function(callback) {
    var username = this.username;
    var day = this.day;
    var title = this.title;
    var comment = this.comment;

    mongodb.open(function(err ,db) {
        if (err) {
            callback(err);
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
                $push: {"comments" : comment}
            }, function(err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }

                callback(null);
            });
        });
    });
};
