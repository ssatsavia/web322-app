const Sequelize = require('sequelize');
var sequelize = new Sequelize('ssatsavia', 'ssatsavia_owner', 'k8ONvJWZD6Sa', {
    dialectModule: require("pg"),
    host: 'ep-royal-star-a5el2rco.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});


// Define Item model
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

// Define Category model
const Category = sequelize.define('Category', {
    name: Sequelize.STRING
});

// Initialize the database
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                resolve(); // Communicate success to the calling code
            })
            .catch((err) => {
                reject("unable to sync the database"); // Communicate the error
            });
    });
};

// Get an item by its ID
module.exports.getItemById = function(id) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { id: id }
        })
        .then(data => {
            if (data.length > 0) {
                resolve(data[0]); // Pass the first object in the retrieved data to the resolve method
            } else {
                reject("no results returned"); // No data found, return a meaningful message
            }
        })
        .catch(err => {
            reject("no results returned"); // Handle any errors and return a meaningful message
        });
    });
};

// Get all items
module.exports.getAllItems = function() {
    return new Promise((resolve, reject) => {
        Item.findAll()
        .then(data => {
            if (data.length > 0) {
                resolve(data); // Pass the retrieved data to the resolve method
            } else {
                reject("no results returned"); // No data found, return a meaningful message
            }
        })
        .catch(err => {
            reject("no results returned"); // Handle any errors and return a meaningful message
        });
    });
};

// Get published items
module.exports.getPublishedItems = function() {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { published: true }
        })
        .then(data => {
            if (data.length > 0) {
                resolve(data); // Pass the retrieved data to the resolve method
            } else {
                reject("no results returned"); // No data found, return a meaningful message
            }
        })
        .catch(err => {
            reject("no results returned"); // Handle any errors and return a meaningful message
        });
    });
};

// Get items by category
module.exports.getItemsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { category: category }
        })
        .then(data => {
            if (data.length > 0) {
                resolve(data); // Pass the retrieved data to the resolve method
            } else {
                reject("no results returned"); // No data found, return a meaningful message
            }
        })
        .catch(err => {
            reject("no results returned"); // Handle any errors and return a meaningful message
        });
    });
};

// Get items by minimum date
module.exports.getItemsByMinDate = function(minDateStr) {
    const { gte } = Sequelize.Op;
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                postDate: { [gte]: new Date(minDateStr) }
            }
        })
        .then(data => {
            if (data.length > 0) {
                resolve(data); // Pass the retrieved data to the resolve method
            } else {
                reject("no results returned"); // No data found, return a meaningful message
            }
        })
        .catch(err => {
            reject("no results returned"); // Handle any errors and return a meaningful message
        });
    });
};

// Add a new item
module.exports.addItem = function(itemData) {
    return new Promise((resolve, reject) => {
        // Ensure the published property is set correctly
        itemData.published = (itemData.published) ? true : false;

        // Replace empty values with null
        for (let key in itemData) {
            if (itemData[key] === "") {
                itemData[key] = null;
            }
        }

        // Assign the current date to postDate
        itemData.postDate = new Date();

        // Create a new item in the database
        Item.create(itemData)
        .then(() => {
            resolve(); // Communicate success
        })
        .catch(err => {
            reject("unable to create item"); // Handle any errors and return a meaningful message
        });
    });
};

// Get published items by category
module.exports.getPublishedItemsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true,
                category: category
            }
        })
        .then(data => {
            if (data.length > 0) {
                resolve(data); // Pass the retrieved data to the resolve method
            } else {
                reject("no results returned"); // No data found, return a meaningful message
            }
        })
        .catch(err => {
            reject("no results returned"); // Handle any errors and return a meaningful message
        });
    });
};

// Get all categories
module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        Category.findAll()
        .then(data => {
            if (data.length > 0) {
                resolve(data); // Pass the retrieved data to the resolve method
            } else {
                reject("no results returned"); // No data found, return a meaningful message
            }
        })
        .catch(err => {
            reject("no results returned"); // Handle any errors and return a meaningful message
        });
    });
};

// Add a new category
module.exports.addCategory = function(categoryData) {
    return new Promise((resolve, reject) => {
        // Replace empty values with null
        for (let key in categoryData) {
            if (categoryData[key] === "") {
                categoryData[key] = null;
            }
        }

        Category.create(categoryData)
        .then(() => {
            resolve(); // Communicate success
        })
        .catch(err => {
            reject("unable to create category"); // Handle any errors and return a meaningful message
        });
    });
};

// Delete a category by ID
module.exports.deleteCategoryById = function(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { id: id }
        })
        .then(() => {
            resolve(); // Communicate success
        })
        .catch(err => {
            reject("unable to delete category"); // Handle any errors and return a meaningful message
        });
    });
};

// Delete an item by ID
module.exports.deleteItemById = function(id) {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: { id: id }
        })
        .then(() => {
            resolve(); // Communicate success
        })
        .catch(err => {
            reject("unable to delete item"); // Handle any errors and return a meaningful message
        });
    });
};


// Add the deletePostById function
module.exports.deletePostById = function(id) {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: { id: id }
        })
        .then((deleted) => {
            if (deleted) {
                resolve(); // The item was deleted
            } else {
                reject("Post not found"); // The item with the specified id was not found
            }
        })
        .catch((err) => {
            reject("Unable to remove post"); // Handle any errors
        });
    });
};