const mongoose=require('mongoose')

let orderSchema=new mongoose.Schema({
    
    userId: {type:mongoose.Schema.Types.ObjectId,ref:"userdb"},
      products:[{productId:{type:mongoose.Schema.Types.ObjectId,ref:"productdb"}, name:{type:String},quantity:{type:Number},brand:{type:String},total:{type:Number},price:{type:Number},size:{type:Number}}],
      paymentMode:{type:String},
      primaryPaid:{type:Number},
      secondaryPaymentMode:{type:String},
      secondaryPaid:{type:Number},
      address:{type:mongoose.Schema.Types.ObjectId,ref:"addressdb"},
      status:{type:String},
      coupon:{type:String},
      subTotal:{type:Number},
      invoiceNumber:{type:String},
        
      modifiedOn: {
        type: Date,
        default: Date.now
      }
    },
    { timestamps: true }
  );


const Orderdb=mongoose.model('orderdb',orderSchema)

module.exports=Orderdb





