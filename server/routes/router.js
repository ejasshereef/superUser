const express = require("express");

const services = require("../services/render");
const controller = require("../controller/controller");
const forController=require('../../src/controller/su_sms');
const { requireAuth,checkUser,checkExistingUser } = require("../../middleware/userMiddleware");


//const {sendOTP,verifyOTP}=require('../../src/controller/su_sms')

const route = express.Router();
//----otp route------//
route.get('/forgetPassword',(req,res)=>{
  res.render('forgetPassword')
})
route.post('/send-otp',controller.sendOTP)
route.post('/verify-otp',controller.verifyOTP)



//------home route-----//
route.get("/", checkExistingUser,(req, res) => {
  res.render("landingPage");
});

route.get("/signup",checkExistingUser, services.signup_page);
route.get('/admin',services.admin_page)
route.post("/signup",controller.signup);
route.post("/admin",controller.admin);  
route.get('/dashboard',controller.dashboard)
route.get("/loadingPage",checkUser,requireAuth,controller.loadingPage);
route.get('/login',checkExistingUser,services.login_page)
route.post("/login", controller.login);
route.get('/login-otp',checkExistingUser,services.login_otp_page)
route.post('/login-otp',controller.login_otp)
route.post('/login-otp-verify',controller.login_otp_verify)
route.get("/user-logout", controller.userLogout);
route.get("/admin-logout", controller.adminLogout);
route.get('/add-brand',services.add_brand)
route.post('/add-brand',controller.add_brand)
route.post('/add-product',controller.upload,controller.add_product)
route.get('/product-data',services.productPage)
route.get('/user-data',services.userPage)
route.post("/products", controller.createProduct);
route.get("/products", controller.findProduct);
route.post("/update-product/:id",controller.upload, controller.updateProduct);
route.get("/update-product", services.update_prouduct);
route.get("/delete-product/:id", controller.deleteProduct);
route.get("/users", controller.findUser);
route.put("/users/:id", controller.updateUser);
route.get("/update-user", services.update_user);
route.get("/delete-user/:id", controller.deleteUser);
route.get("/add-user", services.add_user);
route.get('/add-product',services.add_product)
route.get("/update-user", services.update_user);
route.get('/all-product',checkUser,requireAuth,services.allProduct)
route.get('/product-detail',checkUser,requireAuth,controller.product_detail)
route.post('/product-detail',checkUser,requireAuth,controller.product_to_cart)
route.get('/cart',checkUser,requireAuth,controller.cart)
route.post('/cart/:id/inc',checkUser,requireAuth,controller.cart_inc)
route.post('/cart/dec',checkUser,requireAuth,controller.cart_dec) 
route.get('/adidas',checkUser,requireAuth,services.adidas)
route.get('/nike',checkUser,requireAuth,services.nike)
route.get('/new-balance',checkUser,requireAuth,services.new_balance)
route.post('/brand-filter',checkUser,requireAuth,services.brand_filter)
route.get('/delete-cart/:id',checkUser,requireAuth,controller.deleteCart)
route.get('/checkout/:id',checkUser,requireAuth,controller.checkout)
route.get('/address',checkUser,requireAuth,controller.address)
route.post('/address',checkUser,requireAuth,controller.add_address)



module.exports = route;
