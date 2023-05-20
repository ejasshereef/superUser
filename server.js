const express=require('express')
const morgan=require('morgan')
const bodyparser=require('body-parser')
const path=require('path')
const {v4:uuidv4}=require('uuid')
require('dotenv').config();
const session=require('express-session')
const cookieParser=require('cookie-parser')
const jwt=require('jsonwebtoken')
const twilioRouter=require('./server/routes/router');


const connectDB=require('./server/database/connection')
const { checkUser } = require('./middleware/userMiddleware')

const app=express()

//----port creation-----//
const {PORT}=process.env;
const port=3000||PORT

//------log requests----//
 //app.use(morgan('tiny'))


//-----mongoDB connection-----//
connectDB()

app.use(cookieParser())

//------session-----//
app.use(session({
    secret:uuidv4(),
    resave:false,
    saveUninitialized:true

}))


//-----pase request to body-parser----//
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())

//--------load assets-------//
app.use(express.static(path.join(__dirname,'public')))
app.use('/js',express.static(path.resolve(__dirname,"assets/js")))

//upload file show

app.use(express.static('uploads'))



//-----sms verification----//
app.use('/su_sms',twilioRouter)


//----set view engine-----//
app.set('view engine','ejs')
app.set('views', [
    __dirname + '/views/user',
    __dirname + '/views/admin',
  ]);

//app.get('*',checkUser)
app.use(require('./server/routes/router'))

app.listen(port,()=>{console.log(`listening to http://localhost:${port}`)})

