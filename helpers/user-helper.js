var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt = require('bcrypt');
var objectId=require('mongodb').ObjectId;
const { response } = require('express');
const { ObjectId } = require('bson');
 
module.exports={
     doSignup:(userData)=>{
         return new Promise(async(resolve,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData),

                resolve(data.ops[0])

         })
         
        

     },
     doLogin:(userData)=>{
         return new Promise(async (resolve,reject)=>{
             let loginStatus=false
             let response={}
             let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
             if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log("login success")
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        console.log("login failed")
                        resolve({status:false})
                        
                    }
                })
             }else {
                console.log("login failed  n")
                resolve({status:false})
                
             }
         })
     },
     addtoCart:(proId,userId)=>{
        //  console.log(proId)
         let proObj={
             item:objectId(proId),
             quantity:1

         }
         return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
             if(userCart){    
                let proExist=userCart.products.findIndex(product=> product.item==proId)
                console.log(proExist)
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId),'products.item':objectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }).then(()=>{
                        resolve()
                    })
                }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},{
                    $push:{products:proObj}
                }).then((response)=>{
                    resolve()
                })
                }
              }else{
                 let cartObj={
                     user:objectId(userId),
                     products:[proObj]
                 }
                 db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                     resolve()
                 })
             }
         })
         
     },
     getCartproduct:(userId)=>{
         return new Promise(async(resolve,reject)=>{
            let cartItems= await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
                
            ]).toArray()
            
            resolve(cartItems)
         })

     },
     cartCount:(userId)=>{
        return new Promise (async(resolve,reject)=>{

            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            
            if(cart){
                count=cart.products.length
                 
            }else{
                count=0
            }
            resolve(count)
        })
     },
     changeProductQuantity:(data)=>{
        data.quantity=parseInt(data.quantity)
        data.count=parseInt(data.count)
        return new Promise((resolve,reject)=>{
            if(data.count==-1 && data.quantity==1){
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(data.cart)},
                {
                    $pull:{products:{item:objectId(data.product)}}
                }).then((response)=>{
                    resolve({removeProduct:true})
                })
            }else{

              db.get().collection(collection.CART_COLLECTION)
              .updateOne({_id:objectId(data.cart),'products.item':objectId(data.product)},
                    {
                  $inc:{'products.$.quantity':data.count}
                 }).then((respons)=>{
                   resolve({response:true})
               })
             }
        })
     },
     removeProduct:(data)=>{
         console.log(data) 
         return new Promise((resolve,reject)=>{
             db.get().collection(collection.CART_COLLECTION)
             .updateOne({_id:objectId(data.cart),'products.item':objectId(data.product)},
             {
                $pull:{products:{item:objectId(data.product)}}
             }).then((response)=>{
                 resolve({removeProduct:true})
             })
         })
     },
     totalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let total= await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.Prise']}}
                    }
                }
                
            ]).toArray()
            
            
            resolve(total[0].total)
         })
     }
 } 