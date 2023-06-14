const mongoose=require('mongoose')

let cartSchema=new mongoose.Schema({
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userdb"
      },
      products: [{
        productId:{type:mongoose.Schema.Types.ObjectId,ref:"productdb"},
        quantity: {type:Number},
        size:{type:Number},
        name: {type:String},
        price: {type:Number},
        brand:{type:mongoose.Schema.Types.ObjectId,ref:"branddb"},
        }],
        
      
      
      modifiedOn: {
        type: Date,
        default: Date.now
      }
    },
    { timestamps: true }
  );


const Cartdb=mongoose.model('cartdb',cartSchema)

module.exports=Cartdb





