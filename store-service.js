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

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Models
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Item.belongsTo(Category, { foreignKey: 'category' });

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(err => reject("Unable to sync the database: " + err));
    });
};

module.exports.getAllItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
    });
};

module.exports.getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { category: category } })
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
    });
};

module.exports.getItemsByMinDate = (minDateStr) => {
    const { gte } = Sequelize.Op;
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
        .then(data => resolve(data))
        .catch(err => reject("no results returned"));
    });
};

module.exports.getItemById = (id) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                id: id
            }
        })
        .then(data => resolve(data[0]))
        .catch(err => reject("no results returned"));
    });
};

module.exports.addItem = (itemData) => {
    itemData.published = (itemData.published) ? true : false;
    for (const prop in itemData) {
        if (itemData[prop] === "") {
            itemData[prop] = null;
        }
    }
    itemData.postDate = new Date();
    return new Promise((resolve, reject) => {
        Item.create(itemData)
            .then(() => resolve())
            .catch(err => reject("unable to create post"));
    });
};

module.exports.getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true
            }
        })
        .then(data => resolve(data))
        .catch(err => reject("no results returned"));
    });
};

module.exports.getPublishedItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true,
                category: category
            }
        })
        .then(data => resolve(data))
        .catch(err => reject("no results returned"));
    });
};

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll()
        .then(data => resolve(data))
        .catch(err => reject("no results returned"));
    });
};

module.exports.addCategory = (categoryData) => {
    for (const prop in categoryData) {
        if (categoryData[prop] === "") {
            categoryData[prop] = null;
        }
    }
    return new Promise((resolve, reject) => {
        Category.create(categoryData)
            .then(() => resolve())
            .catch(err => reject("unable to create category"));
    });
};

module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        })
        .then(() => resolve())
        .catch(err => reject("unable to delete category"));
    });
};

module.exports.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: {
                id: id
            }
        })
        .then(() => resolve())
        .catch(err => reject("unable to delete post"));
    });
};
