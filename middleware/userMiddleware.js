const jwt =require('jsonwebtoken');
const Userdb = require('../server/model/model');

const requireAuth=(req,res,next)=>{
    const token=req.cookies.jwt
    res.setHeader("Cache-Control", "no-cache,no-store,must-revalidate");

    if(token){
        jwt.verify(token,'secret',(err,decodedToken)=>{
            if(err){
                console.log(err.message);
                res.redirect('/login')
            }else{
                next()
            }
        })
    }else{
        res.redirect('/login')
    }
}


const checkUser=(req,res,next)=>{
    const token=req.cookies.jwt;

    if(token){
        jwt.verify(token,'secret',async(err,decodedToken)=>{
            if(err){
                res.locals.user=null;
                next();
                
            }else{
                let user=await Userdb.findById(decodedToken.id)
                res.locals.user=user
                next()
            }
        })
    }else{
        res.locals.user=null;
        next();
    }

}

const checkExistingUser=(req,res,next)=>{
    try {
        const token=req.cookies.jwt
        if(token){
            res.redirect('/loadingPage')
        }else{
            res.locals.user=null
            next()

        }
        
    } catch (err) {
        res.status(500).send(err.message)
        
    }
}

module.exports={requireAuth,checkUser,checkExistingUser}