const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const session = require("express-session")
const connection = require("./database/database")
const categoriesController = require("./categories/CategoriesController")
const articlesController = require("./articles/ArticlesController")
const usersController = require("./users/UsersController")
const fs = require('fs')
const Article = require("./articles/Article")
const Category = require("./categories/Category")
const User = require("./users/User")
const https = require('https')
const passport = require('passport')


// View Engine EJS
app.set('view engine','ejs')

// Sessions
// Saves session on ram, possible to save on redis
app.use(session({
    secret: "21313dsaçdlsakj123",
    cookie: {
        maxAge: 3000000
    }

}))




// Static
app.use(express.static('public'))

// Routes
app.use("/",categoriesController)
app.use("/",articlesController)
app.use("/",usersController)


// Body Parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// Database
    connection
        .authenticate()
        .then(() => {
            console.log("Conexão ao DB feita com sucesso")
        }).catch((error) => {
            console.log(error)
        })

app.get("/",(req, res) => {
    Article.findAll({
        order:[
            ["id","DESC"]
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render("index", {
                articles: articles,
                categories: categories
            })
        })
    })
    
})



// GET by SLUG
app.get("/:slug",(req, res)=> {
    var slug = req.params.slug
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {

        if(article != undefined){
            Category.findAll().then(categories => {
                res.render("article"),{
                    article: article,
                    categories: categories
                }
            })
        }else{
            res.redirect("/")
        }
    })
})

// filter by category
app.get("/category/:slug", (req, res) => {
    var slug = req.params.slug
    Category.findOne({
        where:{
            slug: slug
        },
        include: [
            {model: Article}
        ]
    }).then(category => {
        if(category != undefined) {

            // busca para preencher o navbar do index
            Category.findAll().then(categories => {
                res.render("index",{
                    articles: category.articles,
                    categories: categories
                })
            })

        }else{
            res.redirext("/")
        }
    })
})


https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert:  fs.readFileSync('./cert.pem'),
    passphrase: 'Test123$'
},app).listen(5040,()=>{console.log("server listening on port 5040")})