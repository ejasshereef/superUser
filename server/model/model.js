const mongoose=require('mongoose')

let userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
       
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    status:{
        type:String,
        
    },
    password:{
        type:String,
        required:true
    }
   
})


const Userdb=mongoose.model('userdb',userSchema)

module.exports=Userdb