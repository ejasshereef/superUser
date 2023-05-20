const mongoose=require('mongoose')

let productSchema=new mongoose.Schema({
    
    name:{
        type:String,
        required:true
    },
    brand:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'branddb'
        
       
    },
    description:{
        type:String,
        required:true
    },
    image:[{
       type:String
    }],
    price:{
        type:Number,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'categorydb'
    }
   
})


const Productdb=mongoose.model('productdb',productSchema)

module.exports=Productdb