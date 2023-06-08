const express = require("express");

const services = require("../services/render");
const controller = require("../controller/adminController");

const forController=require('../../src/controller/su_sms');
const { requireAuthAdmin,checkAdmin,checkExistingAdmin} = require("../../middleware/userMiddleware");

const route = express.Router();


route.get('/admin',checkExistingAdmin,services.admin_page)
route.post("/admin",controller.admin);  
route.get('/dashboard',requireAuthAdmin,checkAdmin,controller.dashboard)
route.get("/admin-logout", controller.adminLogout);
route.get('/add-category',requireAuthAdmin,checkAdmin,controller.add_category)
route.post('/add-category',requireAuthAdmin,checkAdmin,controller.add_new_category)
route.post('/add-brand',requireAuthAdmin,checkAdmin,controller.add_brand)
route.post('/add-product',controller.upload,controller.add_product)
route.get('/product-data',requireAuthAdmin,checkAdmin,services.productPage)
route.get('/user-data',requireAuthAdmin,checkAdmin,services.userPage)
route.post("/products", controller.createProduct);
route.get("/products", controller.findProduct);
route.post("/update-product/:id",controller.upload, controller.updateProduct);
route.get("/update-product",requireAuthAdmin,checkAdmin,services.update_prouduct);
route.get("/delete-product/:id", controller.deleteProduct);
route.get("/users", controller.findUser);
route.get("/delete-brand/:id",requireAuthAdmin,checkAdmin,controller.delete_brand)
route.get("/delete-category/:id",requireAuthAdmin,checkAdmin,controller.delete_category)
route.get("/delete-user/:id", controller.deleteUser);
route.get("/add-user",requireAuthAdmin,checkAdmin, services.add_user);
route.get('/add-product',requireAuthAdmin,checkAdmin,services.add_product)
route.post('/update-user-status/:id',controller.uploadSingle,controller.update_user_status)
route.get("/update-user",requireAuthAdmin,checkAdmin, services.update_user);
route.get('/order-data',requireAuthAdmin,checkAdmin,controller.order_data)
route.get('/order-data/detail/:id',requireAuthAdmin,checkAdmin,controller.admin_order_details)
route.post('/change-order-status/:id',requireAuthAdmin,checkAdmin,controller.change_order_status)
route.get('/coupon-data',requireAuthAdmin,checkAdmin,controller.coupon_data)
route.get('/add-coupon',requireAuthAdmin,checkAdmin,controller.coupon)
route.post('/add-coupon',requireAuthAdmin,checkAdmin,controller.add_coupon)
route.post('/edit-coupon/:id',requireAuthAdmin,checkAdmin,controller.edit_coupon)
route.get('/delete-image/:id1/:id2',requireAuthAdmin,checkAdmin,controller.delete_image)
route.get('/add-banner',requireAuthAdmin,checkAdmin,controller.banner)
route.get('/banner-data',requireAuthAdmin,checkAdmin,controller.banner_data)
route.post('/add-banner',requireAuthAdmin,checkAdmin,controller.uploadSingle,controller.add_banner)
route.post('/edit-banner/:id',requireAuthAdmin,checkAdmin,controller.edit_banner)
// route.get('/sales-report',requireAuthAdmin,checkAdmin,controller.salesReport)
module.exports = route;
