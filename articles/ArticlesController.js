const express = require("express");
const router = express.Router()
const Category = require("../categories/Category")
const Article = require("./Article")
const slugify = require("slugify")
const adminAuth = require("../middlewares/adminauth")

router.get("/admin/articles", adminAuth, (req, res) => {
    Article.findAll({
        include: [{model: Category}]
    }).then(articles => {
        res.render("admin/articles/index", {articles: articles})    
    })
    
    
})

router.get("/admin/articles/new", adminAuth, (req, res) => {
    Category.findAll().then(categories => {
        console.log(categories)
        res.render("admin/articles/new",{categories: categories})    
    })
    
})

// delete article
router.get("/articles/delete", adminAuth, (req, res) => {      
    var id = req.query.id
    if(id != undefined){
        //isNaN (Not a Number) verifica se é numrico
        if(!isNaN(id)){
            Article.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/articles")
            })

        }else{
            res.redirect("/admin/articles")
        }
    }else{
        res.redirect("/admin/articles")
    }
})

// edit article
router.get("/admin/articles/edit/:id",adminAuth, (req, res) => {
    id = req.params.id
    console.log(id)
        if(isNaN(id)){
            console.log("Entered isNan(id)")
            res.redirect("/admin/articles")
        }

    Article.findByPk(id).then(article => {
        if(article != undefined){
            Category.findAll().then(categories => {
                res.render("admin/articles/edit",{
                    article: article,
                    categories: categories
                })
            })
        }
        else{
            res.redirect("/admin/articles")
        }
    }).catch(erro => {
        res.redirect("/admin/articles")
    })
    
})

router.post("/articles/save", adminAuth, (req, res) => {
    var title = req.body.title
    var body = req.body.body
    var category_id = req.body.category

    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: category_id
    }).then(() => {
        res.redirect("/admin/articles")
    })
})

router.post("/articles/update", adminAuth, (req, res) => {
    var id = req.body.id
    var title = req.body.title
    var body = req.body.body
    var category_id = req.body.category

    Article.update({
        title: title,
        body: body,
        categoryId: category_id,
        slug: slugify(title)},{

        where:{
            id: id
        }
    }).then(() => {
        res.redirect("/admin/articles")
    })

})

router.get("/articles/page/:num", adminAuth, (req, res) => {
    var page = req.params.num
    page = parseInt(page)
    var offset = 0
    var limit = 4

    if(isNaN(page) || page == 1){
        offset = 0
    }else{
        offset = (parseInt(page) * limit) - limit
    }
    console.log(page)
    console.log(offset)

    Article.findAndCountAll({
        limit: limit, // limite de linhas a retornar
        offset: offset,
        order:[
            ["id","DESC"]
        ],

    }).then(articles => {
        
        var next // existe próxima?

        if((offset + limit) >= articles.count) {
            // ja ultrapassei o limite
            next = false // estou na ultima pagina
        } else {
            next = true // existe proxima pagina
        }
        


        var result = {
            next: next,
            articles : articles,
            page: page
        }

      

        Category.findAll().then(categories => {

            res.render("admin/articles/page",{
                result: result,
                categories: categories
            })
        })
        

    })
})
module.exports = router