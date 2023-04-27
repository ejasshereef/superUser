const mongoose=require('mongoose')

const connectDB=async()=>{
    try{
        const con=await mongoose.connect('mongodb://127.0.0.1:27017/superuser',{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        })
        console.log("mongoDB connected");
    }catch(err){
        console.log(err)
        process.exit(1)
    }
}

module.exports=connectDB