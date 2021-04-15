const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function (req, res, next) {

  productHelpers.getAllProducts().then((products) => {
    console.log(products)
    res.render('../views/admin/all-products', { admin: true, products })
  })

});

router.get('/add-product', function (req, res) {
  res.render('admin/add-product', { admin: true })
})
router.post('/add-product', (req, res) => {


  productHelper.addProduct(req.body, (id) => {
    let image = req.files.Image
    image.mv('public/product-images/' + id + '.jpg', (err, done) => {

      if (!err) {

      } else console.log(err)
      res.render('admin/add-product', { admin: true })

    })
    res.render('admin/add-product', { admin: true })
  })
})

router.get('/edit-product/:id', (req, res) => {
  let proId = req.params.id
  productHelpers.getProdectDetails(proId).then((proDetails) => {
    res.render('admin/edit-products', { admin: true, proDetails })
  })


})
router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin')
  })
})
router.post('/edit-product/:id',(req,res) => {
  
  productHelper.updateProduct(req.params.id,req.body).then(() => {
    res.redirect('/admin')
    if(req.files.Image){
      let image = req.files.Image
      image.mv('public/product-images/'+req.params.id + '.jpg')

    }
    
  })
})


module.exports = router;
