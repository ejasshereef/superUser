const jwt =require('jsonwebtoken');
const Userdb = require('../server/model/model');
const Walletdb = require('../server/model/wallet');



const wallet=async(req,res,next)=>{
    const userId=res.locals.user._id
    const userWallet=await Walletdb.findOne({userId:userId})
    if(userWallet){
        res.locals.wallet=userWallet
        next()
    }

}


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

const requireAuthAdmin=(req,res,next)=>{
    const adminToken=req.cookies.jwtAdmin
    res.setHeader("Cache-Control", "no-cache,no-store,must-revalidate");

    if(adminToken){
        jwt.verify(adminToken,'secret',(err,decodedToken)=>{
            if(err){
                console.log(err.message);
                res.redirect('/admin')
            }else{
                next()
            }
        })
    }else{
        res.redirect('/admin')
    }
}

const checkAdmin=(req,res,next)=>{
    const adminToken=req.cookies.jwtAdmin;

    if(adminToken){
        jwt.verify(adminToken,'secret',async(err,decodedToken)=>{
            if(err){
                res.locals.admin=null;
                next();
                
            }else{
                let admin={email:"admin@admin.com",name:"Admin"}
                res.locals.admin=admin
                next()
            }
        })
    }else{
        res.locals.admin=null;
        next();
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

const checkExistingAdmin=(req,res,next)=>{
    try {
        const tokenAdmin=req.cookies.jwtAdmin
        if(tokenAdmin){
            res.redirect('/dashboard')
        }else{
            res.locals.user=null
            next()

        }
        
    } catch (err) {
        res.status(500).send(err.message)
        
    }
}

module.exports={requireAuth,checkUser,checkExistingUser,requireAuthAdmin,checkAdmin,checkExistingAdmin,wallet}