const Userdb = require("../model/model");
const Branddb = require("../model/BrandModel");
const Productdb = require("../model/productModel");
const Addressdb = require("../model/address");
const Coupondb=require("../model/coupon")
const bcrypt = require("bcrypt");
const { findById } = require("../model/model");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Swal = require("sweetalert2");
const Cartdb = require("../model/cart");
const Orderdb = require("../model/order");
const paypal=require('paypal-rest-sdk');
const Categorydb = require("../model/category");
const Walletdb = require("../model/wallet");
const PDFDocument = require('pdfkit');
const Bannerdb = require("../model/banner");



const {TWILIO_SERVICE_SID,TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN}=process.env;
const client =require('twilio')(TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN,{
    lazyLoading:true
})

//-----signup and login----//

//-------jwt-----//
const maxAge = 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "secret", {
    expiresIn: maxAge,
  });
};

//---login using OTP and forgot password using OTP-------//
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




//------pagination-----//

exports.signup = async (req, res) => {
  const { regName, regPhone, regEmail, regPassword } = req.body; // Destructure request body

  try {
    const existingUser = await Userdb.findOne({ email: regEmail }); // Check if user already exists in the database
   
    if (existingUser) {
      return res.send("Already Existing User");
    } else {
      const hash = await bcrypt.hash(regPassword, 10); // Hash the password
      const newUser = new Userdb({
        name: regName,
        phone: regPhone,
        email: regEmail,
        password: hash,
      });

      await newUser.save(); // Save the new user to the database
      const wallet =new Walletdb({
        userId:newUser._id,
      })
      await wallet.save()
      // const token = createToken(newUser._id);
      // res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.render("login"); // Render the login view with success message
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user");
  }
};




exports.login = (req, res) => {
  let email = req.body.loginName;
  let password = req.body.loginPassword;
  existingUser = Userdb.findOne({ email: email }).then(async (existingUser) => {
  
    if (!existingUser) {
      res.redirect("/landingPage");
    }
    const isValid = await bcrypt.compare(password, existingUser.password);
   
    if(existingUser.status === "Unblocked"){
      if (isValid) {
        const token = createToken(existingUser._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        
        res.redirect("/loadingPage");
       
      } else {
       
        res.render("landingPage");
        
      }
    }else{
     
      res.render("landingPage")
      
    }
  });
};

exports.admin = async (req, res) => {
  admin = { email: "admin@admin.com", password: "admin" };
  const { email, password } = req.body;

  if (admin.email === email && admin.password === password) {
    // req.session.admin = email;
    // req.session.authorized = true;
     const adminToken = createToken(admin.email);
      res.cookie("jwtAdmin", adminToken, { httpOnly: true, maxAge: maxAge * 1000 });
    res.redirect("/dashboard");
  } else {
    res.render("adminSignin", { message: "invalid entry" });
  }
};

exports.dashboard = async(req, res) => {
  const admin=res.locals.admin

      const getMonthData=async(month)=>{
        const order=await Orderdb.aggregate([{
          $match:{
            $expr:{
              $eq:[{$month:'$modifiedOn'},month]
            }
          }
         }])
         return order
      }
      const jan=await getMonthData(1);
      const feb=await getMonthData(2);
      const mar=await getMonthData(3);
      const april=await getMonthData(4);
      const may=await getMonthData(5); 
      
   res.render("dashboard",{jan,feb,mar,april,may,admin});
};


exports.landing_page=async(req, res) => {
  const page=req.query.page||0;
  const limit=parseInt(req.query.limit)||8||3;

  const banner=await Bannerdb.findOne({status:"Active"})

  content=Productdb
  .find()
  .populate('brand')
  .sort({brand:1})
  .skip(page*limit)
  .limit(limit)
  .then(content=>{res.render("landingPage",{content,banner});})
}

exports.loadingPage = async (req, res) => {

  const page=req.query.page||0;
  const limit=parseInt(req.query.limit)||8||3;

  const banner=await Bannerdb.findOne({status:"Active"})

  content=Productdb
  .find()
  .populate('brand')
  .sort({brand:1})
  .skip(page*limit)
  .limit(limit)
  
  .then(content=>{res.render('loadingPage',{content,banner})})
 
};

exports.add_brand = async (req, res) => {
  const brandName = req.body.brandName; // Destructure request body

  
    try {
      const existingUser = await Branddb.findOne({ name: brandName }); // Check if user already exists in the database
      
      if (existingUser) {
        return res.send("Already Existing Brand Name");
      } else {
        const newBrand = new Branddb({
          name: brandName,
        });

        await newBrand.save(); // Save the new user to the database

        res.render("addBrand"); // Render the login view with success message
      }
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }

};

exports.userLogout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

exports.adminLogout = (req, res) => {
  res.cookie("jwtAdmin", "", { maxAge: 1 });
  res.redirect("/admin");
};

//-----create update delete-----//

exports.create = async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  if (!req.body) {
    res.send(400).send({ message: "content can not be empty" });
    return;
  }
  const user = new Userdb({
    name: req.body.regName,
    email: req.body.regEmail,
    phone: req.body.regPhone,
    gender: req.body.gender,
    status: req.body.status,
    password: hash,
  });

  user
    .save(user)
    .then((data) => {
      // res.send(data)
      res.redirect("/add-user", { message: "user added succesfully" });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "some error occurred while creating a create operation",
      });
    });
};

//-----using img in db-----//
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

exports.upload = multer({ storage: storage }).array('image',7)
exports.uploadSingle = multer({ storage: storage }).single('image')

exports.add_product = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({ message: "Content can not be empty" });
    }
    const product = new Productdb({
      name: req.body.addName,
      brand: req.body.addBrand,
      description: req.body.addDescription,
      image: req.files.map((file) => file.filename),
      price: req.body.addPrice,
    });
    const data = await product.save();
    return res.redirect("/add-product");
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message:
        err.message || "Some error occurred while creating a create operation",
    });
  }
};

exports.findProduct = (req, res) => {
  if (req.query.id) {
    const id = req.query.id;

    Productdb.findById(id)
      .then((data) => {
        if (!data) {
          res.status(404).send({ message: `not found user with id ${id}` });
        } else {
          res.send(data);
        }
      })
      .catch((err) => {
        res
          .status(500)
          .send({ message: `error retrieving user with id ${id}` });
      });
  } else {
    Productdb.find()
      .populate("brand")
      .then((products) => {
        res.send(products);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "error occurred while retriving user information",
        });
      });
  }
};

exports.findUser = (req, res) => {
  if (req.query.id) {
    const id = req.query.id;

    Userdb.findById(id)
      .then((data) => {
        if (!data) {
          res.status(404).send({ message: `not found user with id ${id}` });
        } else {
          res.send(data);
        }
      })
      .catch((err) => {
        res
          .status(500)
          .send({ message: `error retrieving user with id ${id}` });
      });
  } else {
    Userdb.find()
      .then((users) => {
        res.send(users);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "error occurred while retriving user information",
        });
      });
  }
};

exports.createProduct = async (req, res) => {
  if (!req.body) {
    res.send(400).send({ message: "content can not be empty" });
    return;
  }
  const products = new Productdb({
    name: req.body.regName,
    brand: req.body.regEmail,
    description: req.body.regPhone,
    price: req.body.gender,
  });

  products
    .save(products)
    .then((products) => {
      // res.send(data)
      res.redirect("/product-data", { message: "user added succesfully" });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "some error occurred while creating a create operation",
      });
    });
};


exports.add_category=async(req,res)=>{
const brand=await Branddb.find()
const category=await Categorydb.find()
  res.render('addCategory',{brand,category,catMsg:"",msg:""})
}


exports.updateProduct = (req, res) => {
  
  if (!req.body) {
    return res.status(400).send({ message: "data to update cannot be empty" });
  }
  const id = req.params.id;
  
  Productdb.findByIdAndUpdate(
    id,
    {
      name: req.body.addName,
      brand: req.body.addBrand,
      description: req.body.addDescription,
      price: req.body.addPrice,
      image:req.files.map((file)=>file.filename)
    },
    { useFindAndModify: false },
    { new: true }
  )
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `cannot update user with $(id).May be user not found`,
        });
      } else {
        res.redirect("/product-data");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "error update user information" });
    });
};

exports.update_user_status = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "data to update cannot be empty" });
  }
  const id = req.params.id;
  Userdb.findByIdAndUpdate(id, {
    status:req.body.status
  }, { useFindAndModify: false },{ new: true })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `cannot update user with $(id).May be user not found`,
        });
      } else {
        res.cookie("jwt", "", { maxAge: 1 });
        res.redirect('/user-data')
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "error update user information" });
    });
};

exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "data to update cannot be empty" });
  }
  const id = req.params.id;
  Userdb.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `cannot update user with $(id).May be user not found`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "error update user information" });
    });
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Userdb.findByIdAndRemove(id);

    if (result) {
      //Check if user was found and removed
      if (result.image !== "") {
        fs.unlinkSync("./uploads/" + result.image);
      }
      req.session.message = {
        type: "info",
        message: "User deleted successfully",
      };
    } else {
      req.session.message = {
        type: "error",
        message: "User not found",
      };
      req.session.authorized = true;
    }
    const msg = "user deleted successfully";
    res.redirect("/user-data");
  } catch (err) {
    res.status(500).send(err.message); // Send error response with status code 500
  }
};

function del() {
  Swal
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    })
    .then((result) => {
      if (result.isConfirmed) {
        swal.fire("Deleted!", "Your file has been deleted.", "success");
      }
    });
}

exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Productdb.findByIdAndRemove(id);
    if (result) {
      
      if (result.image !== "") {
        fs.unlinkSync("./uploads/" + result.image);
      }
      
    } 
    res.redirect("/product-data");
  } catch (err) {
    res.status(500).send(err.message); // Send error response with status code 500
  }
};

let id;

exports.product_detail = async (req, res) => {
  id = req.query.id;
  try {
    const products = await Productdb.findById(id);
    res.render("productDetail", { products });
  } catch (err) {
    res.status(500).send(err.message);
  }
};



exports.product_to_cart = async (req, res) => {
  
  try {
    const pId=req.params.id||id
    const qty = req.body.qty || 1;
    const userId = res.locals.user._id;
    const product = await Productdb.findById(pId).populate("brand");
    let cart=await Cartdb.findOne({userId:userId})
    
    
    
    if(!product){
      return res.status(404).json({message:"product not found"})
    }

    
    if(!cart){
      
      cart= new Cartdb({
        userId:userId,
        products:[{ 
          productId:product._id,
          quantity:qty,
          name:product.name,
          price:product.price,
          brand:product.brand,
          
          }],
        
          
        })
   
    }else{
      const itemIndex=cart.products.findIndex(products => products.productId.equals(product._id))
     // total=parseInt((cart.products[itemIndex].price)*(cart.products[itemIndex].quantity))
      if(itemIndex === -1){
        cart.products.push({productId:product._id,quantity:qty,name:product.name,price:product.price,brand:product.brand})
        
        //cart.subTotal=sum+=cart.products[itemIndex].total
      }else{
        cart.products[itemIndex].quantity += parseInt(qty) 
        cart.products[itemIndex].total=cart.products[itemIndex].quantity*cart.products[itemIndex].price
      }
      
    }
    await cart.save();
    res.redirect('/cart')

  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.cart = async (req, res) => {
  try {
    const userId = res.locals.user;
    const cart = await Cartdb.findOne({ userId: userId._id }).populate("products.brand").populate("products.productId")
    res.render("cart", { cart});
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.cart_inc = async (req, res) => {
  
  try {
    
    const id=req.body.id
    const userId=res.locals.user._id
    let cart = await Cartdb.findOne({userId:userId})
    
    const itemIndex=cart.products.findIndex(products => products._id.equals(id))
   
    if (!cart) {
      return res.status(404).send("Cart item not found");
    }

    cart.products[itemIndex].quantity += 1;


    await cart.save();
    const quantity=cart.products[itemIndex].quantity
    const total=cart.products[itemIndex].quantity*cart.products[itemIndex].price

    res.status(200).json({
      success:true,
      message:"Quantity update successfully",
      total:parseInt(total),
      quantity
    })
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.cart_dec = async (req, res) => {
  
  
  try {
    const id=req.body.id
    const userId=res.locals.user._id
    let cart = await Cartdb.findOne({userId:userId});
    const itemIndex=cart.products.findIndex(products=>products._id.equals(id))

    if (!cart) {
      return res.status(404).send("Cart item not found");
    }

   if(cart.products[itemIndex].quantity != 1){
    cart.products[itemIndex].quantity -= 1;
   }

    await cart.save(); 
    const quantity=cart.products[itemIndex].quantity
    const total=cart.products[itemIndex].quantity*cart.products[itemIndex].price

    res.status(200).json({
      success:true,
      message:"Quantity update successfully",
      total:parseInt(total),
      quantity
    })
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const id = req.params.id;
    const userId=res.locals.user._id
    
    const result = await Cartdb.findOneAndUpdate({userId},{$pull:{products:{_id:id}}},{new:true});
    res.redirect("/cart");
  } catch (err) {
    res.status(500).send(err.message); // Send error response with status code 500
  }
};

exports.checkout = async (req, res) => {
  try {
    const id = req.params.id;
    
    const userId = res.locals.user._id;
    const address = await Addressdb.findById(id);
    const wallet=await Walletdb.findOne({userId:userId})
    const cart=await Cartdb.findOne({userId:userId})
    const coupon=await Coupondb.find()
    const user=await Userdb.findById(userId)
    if (!address && !cart) {
      res.redirect("/address");
    } else {
      
      res.render("checkout",  {user,coupon,address,cart,wallet});
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.address = async (req, res) => {

  try {
    const user=res.locals.user._id
    const address= await Addressdb.find({user})
    res.render("address",{address});
    
  } catch (err) {
    res.status(500).send(err.message)
    
  }
};

exports.add_address = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({ message: "data should not be empty" });
    }
    user = res.locals.user;
    const address = new Addressdb({
      user: user._id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      companyName: req.body.companyName,
      phone: req.body.phone,
      email: req.body.email,
      country: req.body.country,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      state: req.body.state,
      district: req.body.district,
      postcode: req.body.postcode,
    });

    address.save(address).then(() => {

      res.redirect("/address");
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
let paypalTotal=0
exports.checkoutPayment= async (req,res)=>{
  try {
   
   
    const primaryPayment=req.body.primaryPayment
    const secondaryPayment=req.body.secondaryPayment
    const subTotal=parseInt(req.body.sum)
    const couponApplied=req.body.coupon
    const addressId=req.params.id
    const userId=res.locals.user._id
    const address=await Addressdb.findById(addressId)
    const cart=await Cartdb.findOne({userId:userId}).populate("products")
    const wallet=await Walletdb.findOne({userId:userId})
    const coupon=await Coupondb.findOne({codeName:couponApplied})
    
    const user=await Userdb.findById(userId)


    if(!primaryPayment && !secondaryPayment){
      res.send("Kindly select any of payment method to complete your order")
    }
    if(secondaryPayment && wallet.amount === 0){
      res.send("As wallet is empty use other Payment Options")
    }


    if( primaryPayment === "cod" && !secondaryPayment || primaryPayment === "cod" && secondaryPayment === "wallet" && wallet.amount < subTotal){
     let sum=0
      cart.products.forEach(element=>{
        sum+=(element.quantity*element.price)
      })
      
      let found=false
      for (let i = 0; i < (user.couponUsed).length; i++) {
        if(user.couponUsed[i]===couponApplied){
         
          found=true
          break;
        }
        
      }
     
        
      if(coupon && sum>5000 && !found ){
       
        sum=sum-(coupon.discount*sum)/100
      }
     
     let amount =sum
     let secondaryAmount=0
     if(secondaryPayment){
      amount=sum-wallet.amount
      secondaryAmount=wallet.amount
     }
      const order=new Orderdb({
        userId:userId,
        paymentMode:"cod",
        primaryPaid:amount,
        secondaryPaymentMode:secondaryPayment,
        secondaryPaid:secondaryAmount,
        address:addressId,
        status:"Processing",
        coupon:couponApplied,
        subTotal:sum
      })

      for (let i = 0; i < (cart.products).length; i++) {
        order.products.push({
          name:cart.products[i].name,
          price : cart.products[i].price,
          quantity:cart.products[i].quantity,
          brand:cart.products[i].brand,
          total:cart.products[i].quantity*cart.products[i].price
        })
        
      }
      
        await order.save()
      
     if(order.secondaryPaid>0){
      wallet.amount=0
      await wallet.save();
     }
     if(order.coupon){
      user.couponUsed.push(couponApplied)
      await user.save()
     }
      
      const result = await Cartdb.findOneAndDelete({userId:userId})
      res.render('confirmedOrder',{order,address})
    }
    
    // if(primaryPayment === "cod" && !secondaryPayment){
    //   let sum=0
    //   cart.products.forEach(element=>{
    //     sum+=(element.quantity*element.price)
    //   })
    //   const order=new Orderdb({
    //     userId:userId,
    //     paymentMode:"cod",
    //     address:addressId,
    //     status:"Processing",
    //     subTotal:sum
    //   })

    //   for (let i = 0; i < (cart.products).length; i++) {
    //     order.products.push({
    //       name:cart.products[i].name,
    //       price : cart.products[i].price,
    //       quantity:cart.products[i].quantity,
    //       brand:cart.products[i].brand,
    //       total:cart.products[i].quantity*cart.products[i].price
    //     })
        
    //   }
    //   await order.save()
   
    //   const result = await Cartdb.findOneAndDelete({userId:userId})
    
    //   res.render('confirmedOrder',{order,address})
    
    // }
    if(primaryPayment === "paypal" && !secondaryPayment || primaryPayment === "paypal" && secondaryPayment === "wallet" && wallet.amount < subTotal){
      let createPayment={}
      let sum=0
      cart.products.forEach(element=>{
        sum+=(element.quantity*element.price)
      })


      let found=false
      for (let i = 0; i < (user.couponUsed).length; i++) {
        if(user.couponUsed[i]===couponApplied){
         
          found=true
          break;
        }
        
      }

      if(coupon && sum>5000 && !found ){
       
        sum=sum-(coupon.discount*sum)/100
      }


       let amount=sum
       let secondaryAmount=0
      if(secondaryPayment){
         amount=sum-wallet.amount
         secondaryAmount=wallet.amount
      }
      const order=new Orderdb({
        userId:userId,
        paymentMode:"paypal",
        primaryPaid:amount,
        secondaryPaymentMode:secondaryPayment,
        secondaryPaid:secondaryAmount,
        address:addressId,
        status:"Processing",
        coupon:couponApplied,
        subTotal:sum
      })

      for (let i = 0; i < (cart.products).length; i++) {
        order.products.push({
          name:cart.products[i].name,
          price : cart.products[i].price,
          quantity:cart.products[i].quantity,
          brand:cart.products[i].brand,
          total:cart.products[i].quantity*cart.products[i].price
        })
        
      }
      await order.save()
      let paypalSum=amount
        
         paypalTotal=parseInt(paypalSum/82)
        
       

         createPayment={
          'intent':'sale',
          'payer':{'payment_method':'paypal'},
          'redirect_urls':{
            "return_url":"http://localhost:3000/paypal-success",
            "cancel_url":"http://localhost:3000/paypal-err"
          },
          "transactions":[{
            "amount":{
              "currency": "USD",
              "total": paypalTotal
            },
            "description":"Super User Paypal Payment"
          }]
        }
     
     paypal.payment.create(createPayment,function (error,payment){
      if(error){
        throw error;
      }else{
        for(let i=0;i<payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href)
          }
        }
      }
     })
     if(order.secondaryPaid>0){
      wallet.amount=0
      await wallet.save()
     }

     if(order.coupon){
      user.couponUsed.push(couponApplied)
      await user.save()
     }

     const result = await Cartdb.findOneAndDelete({userId:userId})
    }
    if(secondaryPayment==="wallet" && wallet.amount > subTotal){
      let sum=0
      cart.products.forEach(element=>{
        sum+=(element.quantity*element.price)
      })

      let found=false
      for (let i = 0; i < (user.couponUsed).length; i++) {
        if(user.couponUsed[i]===couponApplied){
         
          found=true
          break;
        }
        
      }

       if(coupon && sum>5000 && !found ){
       
        sum=sum-(coupon.discount*sum)/100
      }


       let amount =sum
     let secondaryAmount=0
     if(secondaryPayment){
      amount=sum-wallet.amount
      secondaryAmount=wallet.amount
     }


      const order=new Orderdb({
        userId:userId,
        secondaryPaymentMode:"wallet",
        secondaryPaid:secondaryAmount,
        address:addressId,
        status:"Processing",
        coupon:couponApplied,
        subTotal:sum
      })

      for (let i = 0; i < (cart.products).length; i++) {
        order.products.push({
          name:cart.products[i].name,
          price : cart.products[i].price,
          quantity:cart.products[i].quantity,
          brand:cart.products[i].brand,
          total:cart.products[i].quantity*cart.products[i].price
        })
       
      }
      await order.save()
     
      wallet.amount=wallet.amount-sum
      await wallet.save();

       if(order.coupon){
      user.couponUsed.push(couponApplied)
      await user.save()
     }
      
      const result = await Cartdb.findOneAndDelete({userId:userId})
      res.render('confirmedOrder',{order,address})
    }
   

  } catch (err) {
    res.status(500).send(err.message)
    
  }
}


exports.paypal_success= async(req,res)=>{
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
 
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
          "currency": "USD",
            "total": paypalTotal
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function  (error, payment) {
    //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.

    
  if  (error)  {
      console.log(error.response);
      throw error;
  } else  {
    
      console.log(JSON.stringify(payment));
     res.render("paypalSuccess",{payment})
  }
});

}

exports.paypal_err=(req,res)=>{
  console.log(req.query);
  res.send("error")
}


exports.user_profile=async(req,res)=>{
  const userId=res.locals.user._id
  const user=await Userdb.findById(userId)
  const address=await Addressdb.findOne({user:userId})
  const order=await Orderdb.find({userId:userId}).populate("userId").populate("address").populate("products")
  res.render("userProfile",{user,address,order})
}

exports.order_data=async (req,res)=>{
  const order=await Orderdb.find().populate("userId").populate("address").populate("products")
  res.render('orderData',{order})
}

exports.order_details=async (req,res)=>{
  const id=req.params.id
 
  const order=await Orderdb.findById(id).populate("userId").populate("address").populate("products").populate("products.brand")
  
  res.render('orderDetails',{order})
}

exports.cancel_order=async (req,res)=>{
  const id=req.params.id
  let order=await Orderdb.findByIdAndUpdate(id,{status:"Cancelled"},{useFindAndModify:false},{new:true}).populate("userId").populate("address").populate("products").populate("products.brand")
  res.redirect('/order-details/'+id)
  //res.render('orderDetails',{order})
}

exports.admin_order_details=async(req,res)=>{
  const id=req.params.id
  const order=await Orderdb.findById(id).populate("userId").populate("address").populate("products").populate("products.brand")
  res.render('adminOrderDetails',{order})
}

exports.change_order_status=async (req,res)=>{
  const id=req.params.id
  const order=await Orderdb.findByIdAndUpdate(id,{status:req.body.status},{useFindAndModify:false},{new:true})
  res.redirect('/order-data/')
}


exports.add_new_category=async (req,res)=>{
 try {
  const category=req.body.categoryName
  const existingCategory=await Categorydb.findOne({name:category})
  
  if(existingCategory){
    return res.send("Already Existing Category ")
  }else{
    const newCategory=new Categorydb({
      name:category
    })
    await newCategory.save()
    res.redirect("/add-category")
  }
 } catch (err) {
    res.status(500).send(err.message)
 }
}

exports.delete_brand=async(req,res)=>{
 try {
  const id=req.params.id;
  const pdt=await Productdb.find({brand:id})
  if(pdt){
    const brand=await Branddb.find()
    const category= await Categorydb.find()
    res.render("addCategory",{category,brand,catMsg:"",msg:"cant delete already used Brand"})
  }else{
    const result=await Branddb.findByIdAndRemove(id)
    res.redirect("/add-category")
  }
  
 } catch (err) {
  res.status(500).send(err.message)
 }
}

exports.delete_category=async(req,res)=>{
  try {
   const id=req.params.id;
   const pdt=await Productdb.find({category:id})
   
   if(pdt){
     const category=await Categorydb.find()
     const brand=await Branddb.find()
     
     res.render("addCategory",{brand,category,msg:"",catMsg:"cant delete already used Brand"})
   }else{
     const result=await Branddb.findByIdAndRemove(id)
     res.redirect("/add-category")
   }
   
  } catch (err) {
   res.status(500).send(err.message)
  }
 }

 exports.return_order=async(req,res)=>{
  try {
    const id=req.params.id
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const validOrder=await Orderdb.findById(id)
    if(validOrder.createdAt > twoWeeksAgo){

      let order=await Orderdb.findByIdAndUpdate(id,{status:"Returned"},{useFindAndModify:false},{new:true}).populate("userId").populate("address").populate("products").populate("products.brand")
      res.redirect('/order-details/'+id)
    }
    
  } catch (err) {
    res.status(500).send(err.message)
  }
 }


 exports.refund=async(req,res)=>{
  try {
    const id=req.params.id
    let order=await Orderdb.findByIdAndUpdate(id,{status:"Refunded"},{useFindAndModify:false},{new:true}).populate("userId").populate("address").populate("products").populate("products.brand")
    const userId=order.userId
    const wallet =await Walletdb.findOne({userId:userId})
    let sum=wallet.amount
    order.products.forEach(element => {
      sum+=element.total
    });
    const existingWallet=await Walletdb.findOneAndUpdate({userId:userId},{amount:sum})
    if(!existingWallet){
      const newWallet=new Walletdb({
        userId:userId,
        amount:sum
      }) 
      await newWallet.save()
    }
    res.redirect('/order-data')
  } catch (err) {
    res.status(500).send(err.message)
  }
 }



 exports.search = async (req, res) => {
  const userId=res.locals.user._id

  try {
    const query = req.query.name;
   
    const product  = await Productdb.find({ name: { $regex: new RegExp(query, 'i') } }).populate('category')
    res.render('shop', { product,user,userId  });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}


exports.add_to_cart=async (req,res)=>{
  const id=req.params.id;
  const qty=1;
  const product=await Productdb.findById(id).populate("brand")
  let cart=await Cartdb.findOne({useId:userId})

  

}


exports.coupon_data=async(req,res)=>{
  const coupon=await Coupondb.find()
  res.render('couponData',{coupon})

}

exports.add_coupon=async(req,res)=>{
  try {
    const existingCoupon=Coupondb.findOne({codeName:req.body.codeName})
   
    if(existingCoupon){
      res.redirect('/coupon-data')
    }
    const coupon=new Coupondb(req.body)
    coupon.save(coupon)

    
    
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.coupon=async(req,res)=>{
  res.render('addCoupon')
}

exports.edit_coupon=async(req,res)=>{
 try {
  const id=req.params.id;
  const coupon=await Coupondb.findByIdAndUpdate(id,req.body,{ useFindAndModify: false },{new:true})
  .then(res.redirect('/coupon-data'))
 } catch (err) {
  res.status(500).send(err.message)
 }
}




exports.add_profile_pic=async(req,res)=>{
  const userId=res.locals.user._id
  const user=await Userdb.findByIdAndUpdate(userId,{image:req.file.filename},{ useFindAndModify: false },{ new: true })

  .then((data) => {
    if (!data) {
      res.status(404).send({
        message: `cannot update user with $(userId) May be user not found`,
      });
    } else {
      res.redirect('/user-profile')
    }
  })
  .catch((err) => {
    res.status(500).send({ message: "error update user information" });
  });
}

exports.couponAjax = async (req, res) => {
  const userId = res.locals.user._id
  const couponUsed = req.body.coupon;
  const user = await Userdb.findById(userId);
  const couponData=await Coupondb.find()
 
  let validCoupon = true;
  for (let i = 0; i < user.couponUsed.length; i++) {
    if (user.couponUsed[i] === couponUsed) {
      
      validCoupon = false;
      break;
    }
  }

  if (validCoupon) {
    
    res.json({ success: true, data: couponData });

  } else {
   
    res.json({ success: false, message: 'Invalid coupon' });
  }
}


exports.get_invoice=async(req,res)=>{
  const id=req.params.id
  
  const order=await Orderdb.findById(id).populate("userId").populate("address")
  
  async function createInvoice (order, path) {
    let doc = new PDFDocument({ size: "A4", margin: 50 });
   
    generateHeader(doc);
    generateCustomerInformation(doc, order);
    generateInvoiceTable(doc, order);
    generateFooter(doc);
  
    doc.end();
    doc.pipe(fs.createWriteStream(path));
  }
  
  
  function generateHeader(doc) {
    doc
      //.image("D:\project\superUser\public\assets\img", 50, 45, { width: 50 })
      .fillColor("#444444")
      .fontSize(20)
      .text("ACME Inc.", 110, 57)
      .fontSize(10)
      .text("ACME Inc.", 200, 50, { align: "right" })
      .text("123 Main Street", 200, 65, { align: "right" })
      .text("New York, NY, 10025", 200, 80, { align: "right" })
      .moveDown();
  }


  function generateCustomerInformation(doc, order) {
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Invoice", 50, 160);
  
    generateHr(doc, 185);
  
    const customerInformationTop = 200;
  
    doc
      .fontSize(10)
      .text("Invoice Number:", 50, customerInformationTop)
      .font("Helvetica-Bold")
      .text(order._id, 150, customerInformationTop)
      .font("Helvetica")
      .text("Invoice Date:", 50, customerInformationTop + 15)
      .text(formatDate(new Date()), 150, customerInformationTop + 15)
      .text("Balance Due:", 50, customerInformationTop + 30)
      .text(
        formatCurrency( 666 ),
        150,
        customerInformationTop + 30
      )
  
      .font("Helvetica-Bold")
      .text(order.userId.name, 300, customerInformationTop)
      .font("Helvetica")
      .text(order.address.addressLine1, 300, customerInformationTop + 15)
      .text(
          order.address.city +
          ", " +
          order.address.state +
          ", " +
          order.address.country,
        300,
        customerInformationTop + 30
      )
      .moveDown();
  
    generateHr(doc, 252);
  }



  function generateInvoiceTable(doc, order) {
    let i;
    const invoiceTableTop = 330;
  
    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      invoiceTableTop,
      "Item",
      "Description",
      "Unit Cost",
      "Quantity",
      "Line Total"
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");
      
    for (i = 0; i < (order.products).length; i++) {
      const item = order.products[i];
      const position = invoiceTableTop + (i + 1) * 30;
      generateTableRow(
        doc,
        position,
        item.name,
        item.description,
        formatCurrency(item.amount / item.quantity),
        item.quantity,
        formatCurrency(item.amount)
      );
  
      generateHr(doc, position + 20);
    }
  
    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      subtotalPosition,
      "",
      "",
      "Subtotal",
      "",
      formatCurrency(order.subTotal)
    );
  
    const paidToDatePosition = subtotalPosition + 20;
    generateTableRow(
      doc,
      paidToDatePosition,
      "",
      "",
      "Paid To Date",
      "",
      formatCurrency(order.subTotal)
    );
  
    const duePosition = paidToDatePosition + 25;
    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      duePosition,
      "",
      "",
      "Balance Due",
      "",
      formatCurrency(order.subTotal )
    );
    doc.font("Helvetica");
  }

  function generateFooter(doc) {
    doc
      .fontSize(10)
      .text(
        "Thank you for purchasing from  SuperUser.Ⓒ",
        50,
        780,
        { align: "center", width: 500 }
      );
  }
  
  function generateTableRow(
    doc,
    y,
    item,
    description,
    unitCost,
    quantity,
    lineTotal
  ) {
    doc
      .fontSize(10)
      .text(item, 50, y)
      .text(description, 150, y)
      .text(unitCost, 280, y, { width: 90, align: "right" })
      .text(quantity, 370, y, { width: 90, align: "right" })
      .text(lineTotal, 0, y, { align: "right" });
  }
  
  function generateHr(doc, y) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }
  
  function formatCurrency(cents) {
    return "₹" + (cents / 100).toFixed(2);
  }
  
  function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
  
    return year + "/" + month + "/" + day;
  }
  
  createInvoice(order,'invoice.pdf');

 //res.sendFile('/project/superUser','/invoice.pdf')

}

exports.invoice=async(req,res)=>{
 const id =req.params.id;
 const order=await Orderdb.findById(id).populate("userId").populate("address")
  res.render("invoice",{order})
}

exports.wallet_history=async(req,res)=>{
  const userId =res.locals.user._id
  const wallet=await Walletdb.findOne({userId})
  const order = await Orderdb.find({userId: userId,$or: [{ status: "Refunded" },{ userId: userId, secondaryPaymentMode: "wallet" }]}).populate("userId");
  res.render("walletHistory",{order,wallet})
}
