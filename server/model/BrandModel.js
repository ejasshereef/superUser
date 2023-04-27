const mongoose=require('mongoose')

var brandSchema=new mongoose.Schema({
    name:{
        type:String,
        requierd:true
    },
    email:{
        type:String,

    }
})

const Branddb=mongoose.model('branddb',brandSchema)

module.exports=Branddb