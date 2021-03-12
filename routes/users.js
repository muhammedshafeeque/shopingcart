const { response } = require('express');
var express = require('express');
const session = require('express-session');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();

var productHelper=require('../helpers/product-helpers')
var userHelpers=require('../helpers/user-helper')

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', function(req, res, next) {
  let user=req.session.user
  console.log(user)
  productHelpers.getAllProducts().then((products)=>{
  
    res.render('../views/user/view-products',{admin:false,products,user})
  })

});
router.get('/login',function(req,res){
  if(req.session.loggedIn){
    res.redirect('/')

  }else{
    res.render('../views/user/login',{'loggedErr':req.session.loggedErr})
    req.session.loggedErr=false
  }
  
})
router.get('/signup',function(req,res){
  res.render('../views/user/signup')
})
router.post('/login',(req,res)=>{
   userHelpers.doLogin(req.body).then((response)=>{
     if(response.status){
       req.session.loggedIn=true
       req.session.user=response.user
       res.redirect('/')
     }else{
       req.session.loggedErr=true
       res.redirect('/login')
     }
   })
   
  

})
router.post('/signup',(req,res)=>{
  
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response)
  })

})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
router.get('/cart',verifyLogin,(req,res)=>{
  res.render('../views/user/cart')
})






module.exports = router;
