const { response } = require('express');
var express = require('express');
const session = require('express-session');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();

var productHelper = require('../helpers/product-helpers')
var userHelpers = require('../helpers/user-helper')

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  console.log(user)
  let cartCound = null
  if (req.session.user) {
    cartCound = await userHelpers.cartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products) => {

    res.render('../views/user/view-products', { admin: false, products, user, cartCound })
  })

});
router.get('/login', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/')

  } else {
    res.render('../views/user/login', { 'loggedErr': req.session.loggedErr })
    req.session.loggedErr = false
  }

})
router.get('/signup', function (req, res) {
  res.render('../views/user/signup')

})
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.loggedErr = true
      res.redirect('/login')
    }
  })



})
router.post('/signup', (req, res) => {

  userHelpers.doSignup(req.body).then((response) => {
    console.log(response)


  })

  res.redirect('/login')

})
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
router.get('/cart', verifyLogin, async (req, res) => {
  let user = req.session.user
  let products = await userHelpers.getCartproduct(req.session.user._id)
  let totalAmount = await userHelpers.totalAmount(user._id)
  res.render('../views/user/cart', { totalAmount, products, user })
})
router.get('/add-to-cart/:id', (req, res) => {
  userHelpers.addtoCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })

})
router.post('/change-product-quantity', (req, res, next) => {

  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    console.log(req.body)
    response.total = await userHelpers.totalAmount(req.body.userId)
    res.json(response)
  })
})
router.post('/remove-product', (req, res, next) => {

  userHelpers.removeProduct(req.body).then((respons) => {
    res.json(response)
  })
})
router.get('/place-order', verifyLogin, async (req, res) => {
  let user = req.session.user
  let totalAmount = await userHelpers.totalAmount(user._id)
  res.render('user/place-oders', { totalAmount, user })
})
router.post('/place-order', async (req, res) => {
  let products = await userHelpers.getCartproductList(req.body.userId)
  let totalAmount = await userHelpers.totalAmount(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalAmount).then((orderId) => {
    if (req.body['payement-methord'] === 'COD') {
      res.json({codSuccess: true })
    } else if (req.body['payement-methord'] === 'ONLINE') {
      userHelpers.generateRazorepay(orderId, totalAmount).then((response) => {
        
        res.json(response)
      })
    } else {
      console.log(err)
    }


  })

})
router.get('/order-placed', verifyLogin, (req, res) => {
  let user = req.session.user
  res.render('user/order-placed', { user })
})
router.get('/my-oders', verifyLogin, async (req, res) => {
  let user = req.session.user
  let oders = await userHelpers.myOders(user._id)
  res.render('user/my-oders', { user, oders })
})
router.get('/vew-products/:id', async (req, res) => {
  let product = await userHelpers.getProductDetails(req.params.id)
  res.render('user/oderd-products', { product, user: req.session.user })
})
router.post('/verfy-payement', (req, res) => {
  console.log(req.body)
  userHelpers.verFyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    }).catch((err)=>{
      console.log(err)
      res.json({status:false,errMsg:''})
    })

  })
})





module.exports = router;
