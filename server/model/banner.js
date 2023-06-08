const mongoose=require('mongoose')

let bannerSchema=new mongoose.Schema({
     name:{type:String},
    image:{type:String},
    status:{type:String,default:"Inactive"}

})

const Bannerdb=mongoose.model('bannerdb',bannerSchema)

module.exports=Bannerdb