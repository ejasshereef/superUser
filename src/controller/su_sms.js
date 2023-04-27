const {TWILIO_SERVICE_SID,TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN}=process.env;
const client =require('twilio')(TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN,{
    lazyLoading:true
})
let forPhone='',forCountry=''
exports.sendOTP=async(req,res,next)=>{
    const {forPhone,forCountry}=req.body;
    try{
        const otpResponse=await client.verify.v2
        .services(TWILIO_SERVICE_SID)
        .verifications.create({
            to:forCountry+forPhone,
            channel:"sms",
        });
        res.send(`OTP send successfully: ${JSON.stringify(otpResponse)}`)
    }catch(error){
        res.status(error?.status||400).send(error?.message||`something went wrong`)
    }
}


exports.verifyOTP=async(req,res,next)=>{
    const {forOtp}=req.body;
    try{
        const verifiedResponse=await client.verify.v2
        .services(TWILIO_SERVICE_SID)
        .verificationChecks.create({
            to:forCountry+forPhone,
            code:forOtp,
        })
        res.status(200).send(`OTP verified successfully : ${JSON.stringify(verifiedResponse)}`)
    }catch(error){
        res.status(error?.status||400).send(error?.message||`something went wrong`)
}
}