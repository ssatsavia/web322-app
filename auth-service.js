const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
let Schema = mongoose.Schema;
        
const userSchema = new Schema({
            userName: { type: String, unique: true },
            password: String,
            email: String,
            loginHistory: [{
                dateTime: Date,
                userAgent: String
            }]
        });
        
        let User; // Defined later after database connection
        
        // Initialize the database connection and the User model
        module.exports.initialize = function () {
            return new Promise((resolve, reject) => {
                let db = mongoose.createConnection("mongodb+srv://sagesatsavia:xgzEDbjWVh3o1OR0@web322.xwyr4.mongodb.net/");
        
                db.on('error', (err) => {
                    reject(err);
                });
        
                db.once('open', () => {
                    User = db.model("users", userSchema);
                    resolve();
                });
            });
        };
        
        // Register a new user
        module.exports.registerUser = function (userData) {
            return new Promise((resolve, reject) => {
                if (userData.password !== userData.password2) {
                    reject("Passwords do not match");
                } else {
                    bcrypt.hash(userData.password, 10).then((hash) => {
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save()
                            .then(() => resolve())
                            .catch((err) => {
                                if (err.code === 11000) { // Handle unique constraint error (duplicate userName)
                                    reject("User Name already taken");
                                } else {
                                    reject(`There was an error creating the user: ${err}`);
                                }
                            });
                    }).catch(err => reject("There was an error encrypting the password"));
                }
            });
        };
        
        // Check if the user credentials are valid
        module.exports.checkUser = function (userData) {
            return new Promise((resolve, reject) => {
                User.findOne({ userName: userData.userName }).exec()
                    .then(user => {
                        if (!user) {
                            reject(`Unable to find user: ${userData.userName}`);
                        } else {
                            bcrypt.compare(userData.password, user.password).then(result => {
                                if (result) {
                                    user.loginHistory.push({
                                        dateTime: new Date(),
                                        userAgent: userData.userAgent
                                    });
        
                                    User.updateOne(
                                        { userName: user.userName },
                                        { $set: { loginHistory: user.loginHistory } }
                                    ).exec().then(() => {
                                        resolve(user);
                                    }).catch(err => reject(`There was an error verifying the user: ${err}`));
                                } else {
                                    reject(`Incorrect Password for user: ${userData.userName}`);
                                }
                            });
                        }
                    }).catch(err => {
                        reject(`Unable to find user: ${userData.userName}`);
                    });
            });
        };