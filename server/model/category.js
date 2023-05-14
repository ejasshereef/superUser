const mongoose=require('mongoose')

let categorySchema=new mongoose.Schema({
    
    male:{
        type:String
        
    },
    female:{
        type:String
    },
    kids:{
        type:String
    }
})

const Categorydb=mongoose.model('categorydb',categorySchema)

module.exports=Categorydb