/*********************************************************************************
<<<<<<< HEAD
*  WEB322 – Assignment 06
=======
*  WEB322 â€“ Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name: Sage Satsavia Student ID:132238197 Date: 
*
*  Cyclic Web App URL: ________________________________________________________
*
*  GitHub Repository URL: ______________________________________________________
*
********************************************************************************/ 

const express = require('express');
const authData = require('./auth-service.js'); // for assignment 6
const clientSessions = require ('client-sessions'); // for assignment 6
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const storeService = require('./store-service');  // Assuming store-service.js is in the same directory
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 8080;


cloudinary.config({
  cloud_name: "dutprg1nu",
  api_key: "336757864295157",
  api_secret: "vD51121hgR1Lhr2bIyJz8wgRNhU",
  secure: true,
});

// Setup multer for memory storage
const upload = multer();


function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}


// Handlebars Configuration
const handlebars = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'Views/layouts'),
  helpers: {
      navLink: function(url, options) {
          return `<li class="nav-item">
                      <a class="nav-link${url == app.locals.activeRoute ? ' active' : ''}" href="${url}">
                          ${options.fn(this)}
                      </a>
                  </li>`;
      },
      equal: function (lvalue, rvalue, options) {
          if (arguments.length < 3)
              throw new Error("Handlebars Helper equal needs 2 parameters");
          if (lvalue != rvalue) {
              return options.inverse(this);
          } else {
              return options.fn(this);
          }
      },
      safeHTML: function(context) {
          return new handlebars.handlebars.SafeString(context);
      },
      formatDate: function(dateObj) {
          let year = dateObj.getFullYear();
          let month = (dateObj.getMonth() + 1).toString();
          let day = dateObj.getDate().toString();
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
      }
  }
});

app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'Views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data


app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});


app.use(clientSessions({
    cookieName: "session", // Cookie name dictates the key name added to the request object
    secret: "yourSecretKey", // Secret key used to sign the session ID cookie
    duration: 2 * 60 * 1000, // Duration of the session in milliseconds (e.g., 2 minutes)
    activeDuration: 1000 * 60 // Extend the session by this many milliseconds if the session is still active (e.g., extend by 1 minute)
}));
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

// Routes



app.get('/check-deps', (req, res) => {
    const pgVersion = require('pg/package.json').version;
    const pgHstoreVersion = require('pg-hstore/package.json').version;
    res.send(`pg: ${pgVersion}, pg-hstore: ${pgHstoreVersion}`);
  });
  
app.get('/', (req, res) => {
    res.redirect('/shop');
});

app.get('/about', (req, res) => {
    res.render('about', { title: "Sage'Store" });
});

app.get('/items/add', ensureLogin, (req, res) => {
    storeService.getCategories()
        .then((data) => {
            res.render('addItem', { categories: data, title: "Add Item" });
        })
        .catch((err) => {
            res.render('addItem', { categories: [], title: "Add Item" });
        });
});

app.post('/items/add', ensureLogin, upload.single('featureImage'), async (req, res) => {
    if (req.file) {
        try {
            let result = await streamUpload(req);
            processItem(req, result.url, res);
        } catch (error) {
            console.error('Failed to upload image:', error);
            processItem(req, "", res); // Proceed without image URL on error
        }
    } else {
        processItem(req, "", res);
    }
});

async function streamUpload(req) {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            { folder: "web322" }, // Optional: specify a folder in Cloudinary
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
}

function processItem(req, imageUrl, res) {
    req.body.featureImage = imageUrl;
    storeService.addItem(req.body)
        .then(() => res.redirect('/items'))
        .catch(err => {
            console.error('Error adding item:', err);
            res.status(500).send("Failed to add item");
        });
}

app.get('/shop', ensureLogin, (req, res) => {
    let viewData = {};
    storeService.getPublishedItems().then((items) => {
        viewData.items = items;
        if (req.query.category) {
            return storeService.getPublishedItemsByCategory(req.query.category);
        } else {
            return items;
        }
    }).then((itemsByCategory) => {
        if (Array.isArray(itemsByCategory)) {
            viewData.item = itemsByCategory[0];
        } else {
            viewData.item = itemsByCategory;
        }
        return storeService.getCategories();
    }).then((categories) => {
        viewData.categories = categories;
        res.render('shop', { title: "Sage's Store - Shop", data: viewData });
    }).catch((err) => {
        viewData.message = "no results";
        res.render('shop', { title: "Sage's Store - Shop", data: viewData });
    });
});

app.get('/shop/:id', ensureLogin, (req, res) => {
    let viewData = {};
    storeService.getItemById(req.params.id).then((item) => {
        viewData.item = item;
        return storeService.getPublishedItems();
    }).then((items) => {
        viewData.items = items;
        return storeService.getCategories();
    }).then((categories) => {
        viewData.categories = categories;
        res.render('shop', { title: "Sage's Store - Shop", data: viewData });
    }).catch((err) => {
        viewData.message = "no results";
        res.render('shop', { title: "Sage's Store - Shop", data: viewData });
    });
});

app.get('/items',ensureLogin,  (req, res) => {
    const { category, minDate } = req.query;
    
    if (category) {
        storeService.getItemsByCategory(category)
            .then(items => {
                if (items.length > 0) {
                    res.render('items', { items });
                } else {
                    res.render('items', { message: "no results" });
                }
            })
            .catch(err => res.render('items', { message: "no results" }));
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then(items => {
                if (items.length > 0) {
                    res.render('items', { items });
                } else {
                    res.render('items', { message: "no results" });
                }
            })
            .catch(err => res.render('items', { message: "no results" }));
    } else {
        storeService.getAllItems()
            .then(items => {
                if (items.length > 0) {
                    res.render('items', { items });
                } else {
                    res.render('items', { message: "no results" });
                }
            })
            .catch(err => res.render('items', { message: "no results" }));
    }
});

app.get('/item/:id', ensureLogin, (req, res) => {
    const { id } = req.params;

    storeService.getItemById(id)
        .then(item => {
            if (item) {
                res.render('item', { item });
            } else {
                res.status(404).render('404', { message: "Item not found" });
            }
        })
        .catch(err => res.status(500).render('404', { message: "Error retrieving item: " + err }));
});

app.get('/categories', ensureLogin, (req, res) => {
    storeService.getCategories().then((categories) => {
        if (categories.length > 0) {
            res.render('categories', { categories });
        } else {
            res.render('categories', { message: "no results" });
        }
    }).catch((err) => {
        res.render('categories', { message: "no results" });
    });
});

app.get('/categories/add', ensureLogin, (req, res) => {
    res.render('addCategory', { title: "Add Category" });
});

app.post('/categories/add', ensureLogin, (req, res) => {
    storeService.addCategory(req.body)
        .then(() => {
            res.redirect('/categories');
        })
        .catch(err => {
            console.error('Error adding category:', err);
            res.status(500).send("Failed to add category");
        });
});

app.get('/categories/delete/:id', ensureLogin, (req, res) => {
    storeService.deleteCategoryById(req.params.id)
        .then(() => {
            res.redirect('/categories');
        })
        .catch(err => {
            console.error('Error deleting category:', err);
            res.status(500).send("Unable to Remove Category / Category not found");
        });
});

app.get('/items/delete/:id',ensureLogin, (req, res) => {
    storeService.deletePostById(req.params.id)
        .then(() => {
            res.redirect('/items');
        })
        .catch(err => {
            console.error('Error deleting item:', err);
            res.status(500).send("Unable to Remove Item / Item not found");
        });
});

app.use((req, res) => {
    res.status(404).render('404');
});

// New routes

app.get('/login',ensureLogin,  (req, res) => {
    res.render('login', { title: "Login" });
});

app.get('/register', ensureLogin, (req, res) => {
    res.render('register', { title: "Register" });
});

app.post('/register', ensureLogin, (req, res) => {
    authData.registerUser(req.body)
        .then(() => {
            res.render('register', { successMessage: "User created" });
        })
        .catch(err => {
            res.render('register', { 
                errorMessage: err, 
                userName: req.body.userName, 
                title: "Register" 
            });
        });
});

app.post('/login', ensureLogin, (req, res) => {
    authData.checkUser(req.body)
        .then((user) => {
            req.session.user = {
                userName: user.userName,  // Authenticated user's userName
                email: user.email,        // Authenticated user's email
                loginHistory: user.loginHistory // Authenticated user's loginHistory
            };
            res.redirect('/items');
        })
        .catch((err) => {
            res.render('login', { 
                errorMessage: err, 
                userName: req.body.userName, 
                title: "Login" 
            });
        });
});

app.get('/logout', ensureLogin, (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory', {
        title: "User History",
        user: req.session.user
    });
});


// Initialize and start server
storeService.initialize()
    .then(authData.initialize)  
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Failed to initialize data:', error);
        process.exit(1);
    });

/*storeData.initialize()
     .then(authData.initialize)
     .then(function(){
        app.listen(HTTP_PORT, function(){
            console.log("app listening on: " + HTTP_PORT)
        });
    })
    .catch(function(err){
        console.log("unable to start server: " + err);
    });
    */
