const mongoose=require('mongoose')

let walletSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"userdb"},
    amount:{type:Number,default:0},
    modifiedOn: {
        type: Date,
        default: Date.now
      }
}, { timestamps: true })

const Walletdb=mongoose.model('walletdb',walletSchema)

module.exports=Walletdb