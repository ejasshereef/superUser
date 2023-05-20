const mongoose=require('mongoose')

let orderSchema=new mongoose.Schema({
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userdb"
      },
      products:[{name:{type:String},quantity:{type:Number},brand:{type:String},total:{type:Number},price:{type:Number}}],
      paymentMode:{type:String,required:true},
      address:{type:mongoose.Schema.Types.ObjectId,ref:"addressdb"},
      status:{type:String},
      subTotal:{type:Number},
      
      modifiedOn: {
        type: Date,
        default: Date.now
      }
    },
    { timestamps: true }
  );


const Orderdb=mongoose.model('orderdb',orderSchema)

module.exports=Orderdb





