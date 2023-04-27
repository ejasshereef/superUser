const express = require("express");

const services = require("../services/render");
const controller = require("../controller/controller");
const forController=require('../../src/controller/su_sms')

//const {sendOTP,verifyOTP}=require('../../src/controller/su_sms')

const route = express.Router();
//----otp route------//
route.get('/forgetPassword',(req,res)=>{
  res.render('forgetPassword')
})
route.post('/send-otp',forController.sendOTP)
route.post('/verify-otp',forController.verifyOTP)



//------home route-----//
route.get("/", (req, res) => {
  res.render("landingPage");
});

route.get("/signup", (req, res) => {
  res.render('registration');
});

route.get('/admin',(req,res)=>{
  res.render('adminSignin')
})

route.post("/signup",controller.signup);

route.post("/admin",controller.admin);  

route.get('/dashboard',controller.dashboard)

route.get("/loadingPage",controller.loadingPage);

route.get('/login',(req,res)=>{
  res.render('login')
})

route.post("/login", controller.login);


route.get("/logout", controller.logout);


route.get('/add-brand',(req,res)=>{
  res.render('addBrand')
})

route.post('/add-brand',controller.add_brand)

route.post('/add-product',controller.add_product)

route.get('/product-data',services.productPage)

route.post("/products", controller.createProduct);
route.get("/products", controller.findProduct);
route.put("/products/:id", controller.updateProduct);
route.get("/update-product", services.update_prouduct);
route.delete("/products/:id", controller.delete);



//-----crud route------//
//route.get("/home", services.homeRoutes);
route.get("/add-user", services.add_user);
route.get('/add-product',services.add_product)
route.get("/update-user", services.update_user);

//----api----//
// route.post("/api/users", controller.create);
// route.get("/api/users", controller.find);
route.put("/api/users/:id", controller.update);
route.delete("/api/users/:id", controller.delete);

module.exports = route;
