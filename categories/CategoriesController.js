const express = require("express");
const router = express.Router()
const Category = require("./Category")
const slugify = require("slugify")
const bodyParser = require('body-parser')
const adminAuth = require("../middlewares/adminauth")


router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

router.get("/admin/categories/new", adminAuth, (req, res) => {
    res.render("admin/categories/new")
})

// save category
router.post("/categories/save", adminAuth, (req, res) => {
    var title = req.body.title
    if(title != undefined){
        Category.create({
            title: title,
            slug: slugify(title)
        }).then(() => {
            res.redirect("/admin/categories")
        })

    }else{
        res.redirect("/admin/categories/new")
    }
})

// list all
router.get("/admin/categories",adminAuth,(req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/categories/index", {categories: categories})
    })
})

// delete category
router.get("/categories/delete",adminAuth,(req, res) => {      
    id = req.query.id
    if(id != undefined){
        //isNaN (Not a Number) verifica se é numrico
        if(!isNaN(id)){
            Category.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/categories")
            })

        }else{
            res.redirect("/admin/categories")
        }
    }else{
        res.redirect("/admin/categories")
    }
})

// edit category
router.get("/admin/categories/edit/:id",adminAuth,(req, res) => {
    id = req.params.id
    console.log(id)
        if(isNaN(id)){
            console.log("Entered isNan(id)")
            res.redirect("/admin/categories")
        }

    Category.findByPk(id).then(category => {
        if(category != undefined){

            res.render("admin/categories/edit",{category: category})

        }
        else{
            res.redirect("/admin/categories")
        }
    }).catch(erro => {
        res.redirect("/admin/categories")
    })
    
})

// update
router.post("/categories/update", adminAuth,(req, res) => {
    var id = req.body.id
    var title = req.body.title

    Category.update({title: title, slug: slugify(title)},{
        where:{
            id: id
        }
    }).then(() => {
        res.redirect("/admin/categories")
    })
})

module.exports = router