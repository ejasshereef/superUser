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
       type:String,
       contentType:String
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

productSchema.index({'$**':'text'})


const Productdb=mongoose.model('productdb',productSchema)

module.exports=Productdb