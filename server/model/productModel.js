const mongoose=require('mongoose')

var productSchema=new mongoose.Schema({
    
    name:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
       
    },
    description:{
        type:String,
        required:true
    },
    image:{
        data:Buffer,
        contentType:String
    },
    price:{
        type:Number,
        required:true
    }
   
})


const Productdb=mongoose.model('productdb',productSchema)

module.exports=Productdb