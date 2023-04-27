const express=require('express')
const morgan=require('morgan')
const bodyparser=require('body-parser')
const path=require('path')
require('dotenv').config();
const session=require('express-session')
const twilioRouter=require('./server/routes/router');
const fs=require('fs')
const multer=require('multer')



const connectDB=require('./server/database/connection')

const app=express()

//----port creation-----//
const {PORT}=process.env;
const port=3000||PORT

//------log requests----//
app.use(morgan('tiny'))


//-----mongoDB connection-----//
connectDB()

//------session-----//
app.use(session({
    secret:"secret",
    cookie:{sameSite:"strict"},
    resave:false,
    saveUninitialized:true
}))


//-----pase request to body-parser----//
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())

//--------load assets-------//
app.use(express.static(path.join(__dirname,'public')))
app.use('/js',express.static(path.resolve(__dirname,"assets/js")))

//-----using img in db-----//
let storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'uploads')
  },
  filename:(req,file,cb)=>{
    cb(null,file.fieldname + '-' + Date.now())
  }
})


//-----sms verification----//
app.use('/su_sms',twilioRouter)


//----set view engine-----//
app.set('view engine','ejs')
app.set('views', [
    __dirname + '/views/user',
    __dirname + '/views/admin',
  ]);


app.use('/',require('./server/routes/router'))

app.listen(port,()=>{console.log(`listening to http://localhost:${port}`)})

