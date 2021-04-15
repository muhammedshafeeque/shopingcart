var db=require('../config/connection')
var collection=require('../config/collections')
var objectId=require('mongodb').ObjectId
module.exports={

    addProduct:(data,callback)=>{
        
        let product={
            _id:data._id,
            Name:data.Name,
            Catogory:data.Catogory,
            Prise:parseInt(data.Prise),
            Description:data.Description

        }
        return new Promise((resolve,reject)=>{
            db.get().collection('product').insertOne(product).then((data)=>{
                callback(data.ops[0]._id)
            })
            resolve()
        })
        
        
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(proId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    getProdectDetails:(proId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((proData)=>{
                resolve(proData)
            })
        })
    },
    updateProduct:(proId,productData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    Name:productData.Name,
                    Description:productData.Description,
                    Prise:productData.Prise,
                    Catogory:productData.Catogory
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    }
} 