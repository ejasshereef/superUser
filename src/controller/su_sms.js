const {TWILIO_SERVICE_SID,TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN}=process.env;
const client =require('twilio')(TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN,{
    lazyLoading:true
})

var Userdb = require("../../server/model/model");
var bcrypt = require("bcrypt");
const jwt=require('jsonwebtoken')

const maxAge=60*60
const createToken=(id)=>{
  return jwt.sign({id},'secret',{
    expiresIn:maxAge
  })
}



let phoneP
exports.sendOTP=async(req,res,next)=>{
    //req.session.phone=req.body.forPhone;
     phoneP=req.body.forPhone;
    try{
        const otpResponse=await client.verify.v2
        .services(TWILIO_SERVICE_SID)
        .verifications.create({
            to:"+91"+phoneP,
            channel:"sms",
        });
        res.render('forgetPassword',{otpMessage:JSON.stringify(otpResponse)})
    }catch(error){
        res.status(error?.status||400).send(error?.message||`something went wrong`)
    }
}


exports.verifyOTP=async(req,res,next)=>{
    let phone=phoneP
    let otp=req.body.forOtp
    let password=req.body.forPassword
    try{
        const verifiedResponse=await client.verify.v2
        .services(TWILIO_SERVICE_SID)
        .verificationChecks.create({
            to:'+91'+phone,
            code:otp,
        })
       // res.status(200).send(`OTP verified successfully : ${JSON.stringify(verifiedResponse)}`)
       //res.render('forgetPassword',{verificationMessage:JSON.stringify(verifiedResponse.status) })

       if(verifiedResponse.status=="approved"){
           const hash = await bcrypt.hash(password, 10);
        Userdb.findOneAndUpdate({phone:phone}, { password: hash})
        .then(data=>{
            if(!data){
                res.status(404).send({message:`cannot update user with Phone no:${phone}.user not found`})
            }else{
                res.render('forgetPassword',{verificationMessage:JSON.stringify(verifiedResponse.status) })

            }
        }).catch(err=>{
            res.status(500).send({message:"error updating user information"})
        })

            
       }

    }catch(error){
        res.status(error?.status||400).send(error?.message||`something went wrong`)
}
}



let phoneOtp
exports.login_otp=async(req,res)=>{
   
     phoneOtp=req.body.phone;
    try{
        const otpResponse=await client.verify.v2
        .services(TWILIO_SERVICE_SID)
        .verifications.create({
            to:"+91"+phoneOtp,
            channel:"sms",
        });
        res.render('loginOtpVerify',{otpMessage:JSON.stringify(otpResponse)})
    }catch(error){
        res.status(error?.status||400).send(error?.message||`something went wrong`)
    }
}

exports.login_otp_verify=async(req,res,next)=>{
    let phone=phoneOtp
    let otp=req.body.otp
    try{
        const verifiedResponse=await client.verify.v2
        .services(TWILIO_SERVICE_SID)
        .verificationChecks.create({    
            to:'+91'+phone,
            code:otp,
        })
       // res.status(200).send(`OTP verified successfully : ${JSON.stringify(verifiedResponse)}`)
       //res.render('forgetPassword',{verificationMessage:JSON.stringify(verifiedResponse.status) })

       if(verifiedResponse.status=="approved"){
         await Userdb.findOne({phone:phone})
        .then((data)=>{
            console.log(data);
            if(!data){
                res.status(404).send({message:`cannot find user with Phone no:${phone}.user not found`})
            }else{
                const token= createToken(data._id);
                res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
                res.redirect('/loadingPage')
                

            }
        }).catch(err=>{
            res.status(500).send({message:"error updating user information"})
        })

            
       }

    }catch(error){
        res.status(error?.status||400).send(error?.message||`something went wrong`)
}
}