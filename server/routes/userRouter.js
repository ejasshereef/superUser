const express = require("express");

const services = require("../services/render");
const controller=require("../controller/userController")
const { requireAuth,checkUser,checkExistingUser,wallet} = require("../../middleware/userMiddleware");

const route = express.Router();

//------home route-----//
route.get("/", checkExistingUser,controller.landing_page);

//----otp route------//
route.get('/forgotPassword',(req,res)=>{
    res.render('forgotPassword')
  })
  
  route.get('/contact',checkUser, controller.contact)
  route.post('/send-otp',controller.sendOTP)
  route.post('/verify-otp',controller.verifyOTP)
  route.get("/user-profile",checkUser,requireAuth,wallet,controller.user_profile)
  route.get("/signup",checkExistingUser, services.signup_page);
  route.post("/signup",checkExistingUser,controller.signup);
  route.get("/loadingPage",checkUser,requireAuth,wallet,controller.loadingPage);
  route.get('/login',checkExistingUser,services.login_page)
  route.post("/login",checkExistingUser, controller.login);
  route.get('/login-otp',checkExistingUser,services.login_otp_page)
  route.post('/login-otp',controller.login_otp)
  route.post('/login-otp-verify',controller.login_otp_verify)
  route.get("/user-logout",checkUser,requireAuth, controller.userLogout);
  route.get('/all-product',checkUser,requireAuth,wallet,services.allProduct)
  route.get('/product-detail',checkUser,requireAuth,wallet,controller.product_detail)
  route.post('/product-detail',checkUser,requireAuth,controller.product_to_cart)
  route.get('/cart',checkUser,requireAuth,wallet,controller.cart)
  route.post('/cart/inc',checkUser,requireAuth,controller.cart_inc)
  route.post('/cart/dec',checkUser,requireAuth,controller.cart_dec) 
  route.get('/adidas',checkUser,requireAuth,wallet,services.adidas)
  route.get('/nike',checkUser,requireAuth,wallet,services.nike)
  route.get('/new-balance',checkUser,requireAuth,wallet,services.new_balance)
  route.post('/brand-filter',checkUser,requireAuth,services.brand_filter)
  route.get('/delete-cart/:id',checkUser,requireAuth,controller.deleteCart)
  route.get('/checkout/:id',checkUser,requireAuth,wallet,controller.checkout)
  route.get('/address',checkUser,requireAuth,wallet,controller.address)
  route.post('/address',checkUser,requireAuth,controller.add_address)
  route.post('/checkout/:id',checkUser,requireAuth,wallet,controller.checkoutPayment)
  route.get('/order-details/:id',checkUser,requireAuth,wallet,controller.order_details)
  route.get('/cancel-order/:id',checkUser,requireAuth,controller.cancel_order)
  route.get('/paypal-success',checkUser,requireAuth,controller.paypal_success)
  route.get('/paypal-err',checkUser,requireAuth,controller.paypal_err)
  route.get('/return-order/:id',checkUser,requireAuth,controller.return_order)
  route.get('/add-to-cart/:id',checkUser,requireAuth,controller.product_to_cart)
  route.post('/add-profile-pic',checkUser,requireAuth,controller.uploadSingle, controller.add_profile_pic)
  route.post('/coupon',checkUser,requireAuth,controller.couponAjax)
  route.get('/invoice/:id',checkUser,requireAuth,controller.invoice)
  route.get('/wallet-history',checkUser,requireAuth,wallet,controller.wallet_history)
  

  module.exports=route