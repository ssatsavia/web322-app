const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userScheme = new Schema({
    propertyName1: {
        type: String, // Mongoose Schema Type
        required: true
    },
    propertyName2: {
        type: Number, // Mongoose Schema Type
        required: true
    },
    propertyName3: {
        type: Boolean, // Mongoose Schema Type
        default: false
    },
    propertyName4: {
        type: Date, // Mongoose Schema Type
        default: Date.now
    }
    // will add more properties as needed
});

let User; // to be defined on new connection (see initialize)



// Function to initialize the service (e.g., connecting to the database)
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("connectionString");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};


// Function to register a user
module.exports.registerUser = function(userData) {
    return new Promise((resolve, reject) => {
        // Check if user already exists
        checkUser(userData.username)
            .then((existingUser) => {
                if (existingUser) {
                    reject('User already exists');
                } else {
                    // Hash the password before saving
                    bcrypt.hash(userData.password, 10)
                        .then((hashedPassword) => {
                            // Create and save the new user
                            const newUser = new User({
                                username: userData.username,
                                password: hashedPassword,
                                email: userData.email
                            });

                            newUser.save()
                                .then(() => {
                                    resolve('User registered successfully');
                                })
                                .catch((err) => {
                                    reject('Error registering user: ' + err);
                                });
                        })
                        .catch((err) => {
                            reject('Error hashing password: ' + err);
                        });
                }
            })
            .catch((err) => {
                reject('Error checking user existence: ' + err);
            });
    });
}

// Function to check if a user exists
module.exports.checkUser = function(username) {
    return new Promise((resolve, reject) => {
        User.findOne({ username: username })
            .then((user) => {
                resolve(user);
            })
            .catch((err) => {
                reject('Error finding user: ' + err);
            });
    });
}
// Function to validate user credentials
module.exports.checkUserValid = function(userData) {
    return new Promise((resolve, reject) => {
        checkUser(userData.username)
            .then((user) => {
                if (!user) {
                    reject('User not found');
                } else {
                    // Compare the provided password with the stored hashed password
                    bcrypt.compare(userData.password, user.password)
                        .then((isMatch) => {
                            if (isMatch) {
                                resolve('User authenticated successfully');
                            } else {
                                reject('Invalid credentials');
                            }
                        })
                        .catch((err) => {
                            reject('Error comparing passwords: ' + err);
                        });
                }
            })
            .catch((err) => {
                reject('Error checking user: ' + err);
            });
    });
}