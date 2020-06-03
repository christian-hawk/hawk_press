const express = require("express")
const router = express.Router()
const User = require("./User")
const bcrypt = require("bcryptjs")
const adminAuth = require("../middlewares/adminauth")
const passport = require('passport')
const fetch = require('node-fetch')
const fs = require('fs')
var SamlStrategy = require('passport-saml').Strategy;

router.use(passport.initialize())
router.use(passport.session())
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

/*
url = 'http://localhost:3001/strategies/samltest'
samlStrategy = fetch(url).then(res => res.json()).then(jsonResp => {
    console.log(typeof jsonResp)
    console.log(jsonResp.strategy)
    return jsonResp.strategy
}).catch(err =>{
    console.log(`Error: ${err}`)
})
*/

// set my idp provider
function setProvider(){
    provider = {
        "id": "hawk_press",
        "displayName": "hawk_press",
        "type": "saml",
        "mapping": "saml_ldap_profile",
        "passportStrategyId": "passport-saml",
        "enabled": true,
        "callbackUrl": "https://localhost:5040/callback",
        "requestForEmail": false,
        "emailLinkingSafe": false,
        "options": {
            "validateInResponseTo": true,
            "requestIdExpirationPeriodMs": 3600000,
            "decryptionPvk": fs.readFileSync("./private_key.pem", 'utf-8'),
            "decryptionCert": fs.readFileSync("./certificate.crt", 'utf-8'),
            "authnRequestBinding": "HTTP-POST",
            "identifierFormat": "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
            "cert": "MIIDYzCCAksCFHRi6X7jLVppwbXMU7Hi7kiG0T5EMA0GCSqGSIb3DQEBCwUAMG4xCzAJBgNVBAYTAkJSMQswCQYDVQQIDAJTUDEOMAwGA1UEBwwFU2FvIFAxEjAQBgNVBAoMCUNocmlzIGluYzEWMBQGA1UEAwwNY2hyaXMuaWRwLm9yZzEWMBQGCSqGSIb3DQEJARYHYUBiLmNvbTAeFw0yMDA1MjMyMzU5NTFaFw0yMTA1MjMyMzU5NTFaMG4xCzAJBgNVBAYTAkJSMQswCQYDVQQIDAJTUDEOMAwGA1UEBwwFU2FvIFAxEjAQBgNVBAoMCUNocmlzIGluYzEWMBQGA1UEAwwNY2hyaXMuaWRwLm9yZzEWMBQGCSqGSIb3DQEJARYHYUBiLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJYrUTPu1to6USVUyOjGsoHr9Kd1uBXoxB03Z7meXZ3W16Xurn6U6LayLlIlvsvdPFbeKSlYhunhQKWYeo8dbE/7WHBuTE9dK4JfK80qAnpSeVozPxjOc67HRXaLSdNSY1M8KmLl1sAtZjZccbfC0bea0raQv9vn85Yid6ZR2eOh8/TL0lH4g7v4qmLVmkKspiboy9JiPUUAvkPIB3d5v2Q9kJcxnbqjt45dOdUtYXorzhbaFk9ttsIeIgf/eUdEuYGnKH/bI5shrHy0pVzJPyqi0m2FI9hheV7Wvkwp7U8SU7ENd24KVLRApdOnXVKk9pJP+Mrkgpij4QpH1NH3HWECAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAMDwkVe1930unIt1blZG4QPXLRLwdy4xccmYb9RRV4V4FuSoxbYuImLtwo2j5sZzFFMcsXV4xqhgvyt0dcn/SqaZBxIjkVzrx+2ZsiPbnv63cke75oZB67+wSZLRbxiUwelA5Up2m4tAfFVUmNgj2cA0aR2QYLKdttVcQKC9bzSmPnTY4x8L1BoA0I7ljqKro9djclh8hGIqET4dGw8CrsXGJVyZPcH9Ko95Ej/MrNCLR3rWQ5g58cl6Ed5KZvcgf9k3ERYL1LvnAJkChgIpPZJq2rtthSLI7aHvFoAC6a9ry809T9yy9Kx36LRreB0zyN1nt5Fxm98AzEKGqFHocYA==",
            "entryPoint": "https://idp.example.com/idp/profile/SAML2/POST/SSO",
            "issuer": "urn:test:example",
            "callbackUrl": "https://localhost:5040/callback"
        },
        "passportAuthnParams": {},
        "verifyCallbackArity": 2
    }
    /*
    console.log("PROVIDER:")
    console.log(provider.options.validateInResponseTo)
    console.log(provider.type)
    console.log(provider.options.decryptionCert)
    */

    /*
    post_body = provider
    post_url = "http://localhost:3000/provider/create"
    post_options = {
        method:'POST',
        body: JSON.stringify(post_body),
        headers: { 'Content-Type': 'application/json' }
        
    }
    fetch(post_url,post_options).then(response => {
        //console.log(response.json())
        return response.json()}).then(jsonRes => {
        //console.log("REPONSE: " + JSON.stringify(jsonRes))
    })
    */
    
}

// get my idpProvider
function getProvider(provider_id,callback){
    console.log("Entered getProvider")
    fetch('http://localhost:3000/provider/'+provider_id).then(response => {return response.json()}).then(jsonRes => {
        provider = jsonRes
        //console.log(provider)
        return callback(null, provider)
    }).catch(err => {
        console.log("Error: " + err)
        return callback(err)
    })
}






const str = function createStrategy(provider,callback){
    options = provider.options
    strategy = new SamlStrategy(options,(profile,done)=>{
        findByEmail(profile.email), (err, user) => {
            if(err) {
                return done(err)
            }else{
                return done(null, user)
            }
        }
    })
    return callback(null, strategy)
}


function generateMetadataFile(meta,callback){
    fs.writeFile('metafilexample.xml',meta,(err) =>{
        if (err){
            console.log("Error: " + err)
            return callback(err)
        }else{
            console.log("!!!! saved")
            return callback()
        }

    })
    
}


//doIt('hawk_press',createStrategy())

//gprv = getProvider('hawk_press',createStrategy())

function getPubKeys(){
    decryptionCert
}

getProvider('hawk_press', (err,provider) => {
    str(provider,(err,strategy) => {
        console.log(provider)
        let options = provider.options
        dcert = options.decryptionCert

        
        meta = strategy.generateServiceProviderMetadata(dcert)

        generateMetadataFile(meta,(err) => {
            if(err){
                console.log(err)
            }else{
                passport.use(strategy)        
            }
        })
        
        console.log(meta)
    })
})

/*
var gprv = getProvider('hawk_press',(err,provider)=>{
    if(err){
        console.log(err)
    }else{
        return provider
    }
})
console.log('gprv:')
console.log(gprv)

const strat = createStrategy(gprv)

console.log(strat)
*/



/*
getProvider('hawk_press',(err,provider)=>{
    createStrategy(provider,(err,strategy) =>{
        console.log("STRATEGY")
        console.log(strategy)
    })
})
*/



function getStrategy(provider_id,callback){

    

    return callback(strategy)
}











router.get("/admin/users", adminAuth, (req, res) => {

    User.findAll().then(users => {
        res.render("admin/users/index",{users: users})
    })
})

router.get("/admin/users/create", adminAuth, (req, res) => {
    res.render("admin/users/create")
})

router.post("/users/create", adminAuth, (req, res) => {
    var email = req.body.email
    var password = req.body.password

    User.findOne({
        where: {
            email : email
        }
    }).then( user => {
        console.log("ENTROU NO then(user)")
        if (user == undefined){

            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt)

            User.create({
                email: email,
                password: hash
            }).then(() => {
                res.send("/admin/users")
            })

        }else{
            res.redirect('/admin/users/create')
        }
    })


})

router.get("/login",
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    (req, res) => {
    res.redirect('/');
  }
    //res.render("admin/users/login")
)

router.post('/login/callback',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  }
);

router.post("/authenticate", (req, res) => {
    console.log("Entrou no post authenticate")
    var email = req.body.email
    var password = req.body.password

    User.findOne({
        where: {
            email: email
        }
    }).then(user => {
        if (user != undefined){
            
            // valida senha
            var correct = bcrypt.compareSync(password, user.password)

            if(correct){
                req.session.user = {
                    id: user.id,
                    email: user.email
                }

            res.redirect("/admin/articles")
                
            }else{
                res.redirect("/login")
            }

        }else{
            res.redirect("/login")
        }
    })
})

router.get("/logout", (req, res) => {
    req.session.user = undefined
    res.redirect("/")
})

module.exports = router