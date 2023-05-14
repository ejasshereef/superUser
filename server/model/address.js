const mongoose=require('mongoose')

let addressSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userdb'
    },
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    companyName:{type:String},
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
    country:{
        type:String,
        
    },
    addressLine1:{type:String,required:true},
    addressLine2:{type:String,required:true},
    city:{type:String,required:true},
    state:{type:String,required:true},
    district:{type:String,required:true},
    postcode:{type:Number,required:true}
   
})


const Addressdb=mongoose.model('addressdb',addressSchema)

module.exports=Addressdb