const mongoose=require('mongoose')

let brandSchema=new mongoose.Schema({
    name:{
        type:String,
        requierd:true
    }
})

const Branddb=mongoose.model('branddb',brandSchema)

module.exports=Branddb