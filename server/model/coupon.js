const mongoose=require('mongoose')

let couponSchema=new mongoose.Schema({
    name:{type:String},
    codeName:{type:String},
    discount:{type:Number},
    status:{type:String}
    
})

const Coupondb=mongoose.model('coupondb',couponSchema)

module.exports=Coupondb