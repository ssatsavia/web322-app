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

// Define Models
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    itemDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Item.belongsTo(Category, { foreignKey: 'category' });

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch((err) => reject("unable to sync the database"));
    });
};

module.exports.getAllItems = function () {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
    });
};

module.exports.getItemsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { category: category } })
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
    });
};

module.exports.getItemsByMinDate = function (minDateStr) {
    const { gte } = Sequelize.Op;
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                itemDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
    });
};

module.exports.getItemById = function (id) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { id: id } })
            .then(data => resolve(data[0]))
            .catch(err => reject("no results returned"));
    });
};

module.exports.addItem = function (itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = (itemData.published) ? true : false;
        for (let prop in itemData) {
            if (itemData[prop] === "") itemData[prop] = null;
        }
        itemData.itemDate = new Date();

        Item.create(itemData)
            .then(data => resolve(data))
            .catch(err => reject("unable to create item"));
    });
};

module.exports.getPublishedItems = function () {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true } })
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
    });
};

module.exports.getPublishedItemsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true, category: category } })
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
    });
};

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
    });
};

module.exports.addCategory = function (categoryData) {
    return new Promise((resolve, reject) => {
        for (let prop in categoryData) {
            if (categoryData[prop] === "") categoryData[prop] = null;
        }

        Category.create(categoryData)
            .then(data => resolve(data))
            .catch(err => reject("unable to create category"));
    });
};

module.exports.deleteCategoryById = function (id) {
    return new Promise((resolve, reject) => {
        Category.destroy({ where: { id: id } })
            .then(() => resolve())
            .catch(err => reject("unable to delete category"));
    });
};

module.exports.deleteItemById = function (id) {
    return new Promise((resolve, reject) => {
        Item.destroy({ where: { id: id } })
            .then(() => resolve())
            .catch(err => reject("unable to delete item"));
    });
};