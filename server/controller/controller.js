const Userdb = require("../model/model");
const Branddb = require("../model/BrandModel");
const Productdb = require("../model/productModel");
const Addressdb = require("../model/address");
const bcrypt = require("bcrypt");
const { findById } = require("../model/model");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const swal = require("sweetalert2");
const Cartdb = require("../model/cart");


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
    console.log(existingUser);
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
    if (isValid) {
      const token = createToken(existingUser._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.redirect("/loadingPage");
    } else {
      res.render("landingPage");
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
      res.cookie("jwt", adminToken, { httpOnly: true, maxAge: maxAge * 1000 });
    res.redirect("/dashboard");
  } else {
    res.render("adminSignin", { message: "invalid entry" });
  }
};

exports.dashboard = (req, res) => {
  res.setHeader("Cache-Control", "no-cache,no-store, must-revalidate");
  if (req.session.admin) {
    res.render("dashboard");
  } else {
    console.log("passed to else in get dashboard");
    res.render("landingPage");
  }
};

exports.loadingPage = (req, res) => {
  res.setHeader("Cache-Control", "no-cache,no-store,must-revalidate");
  res.render("loadingPage");
};

exports.add_brand = async (req, res) => {
  const brandName = req.body.brandName; // Destructure request body

  if (req.session.admin) {
    try {
      const existingUser = await Branddb.findOne({ name: brandName }); // Check if user already exists in the database
      console.log(existingUser);
      if (existingUser) {
        return res.send("Already Existing User");
      } else {
        const newBrand = new Branddb({
          name: brandName,
        });

        await newBrand.save(); // Save the new user to the database

        res.render("addBrand"); // Render the login view with success message
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Error registering user");
    }
  } else {
    res.render("adminSignin");
  }
};

exports.userLogout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

exports.adminLogout = (req, res) => {
  res.setHeader("Cache-Control", "no-cache,no-store");
  req.session.destroy();
  res.redirect("/admin");
};

//-----create update delete-----//

exports.create = async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  console.log(req.session.admin);
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

exports.upload = multer({ storage: storage }).single("image");

exports.add_product = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({ message: "Content can not be empty" });
    }

    if (!req.file) {
      return res.status(400).send({ message: "Please upload an image" });
    }

    const product = new Productdb({
      name: req.body.addName,
      brand: req.body.addBrand,
      description: req.body.addDescription,
      image: req.file.filename,
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

exports.updateProduct = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "data to update cannot be empty" });
  }
  const id = req.params.id;
  Productdb.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      brand: req.body.addBrand,
      description: req.body.addDescription,
      price: req.body.addPrice,
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

exports.updateUser = (req, res) => {
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
      // Check if user was found and removed
      // if (result.image !== "") {
      //   fs.unlinkSync("./uploads/" + result.image);
      // }
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
  swal
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
      // Check if user was found and removed
      if (result.image !== "") {
        fs.unlinkSync("./uploads/" + result.image);
      }
      req.session.message = {
        type: "info",
        message: "Product deleted successfully",
      };
    } else {
      req.session.message = {
        type: "error",
        message: "Product not found",
      };
      req.session.authorized = true;
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
    const qty = req.body.qty || 1;
    const userId = res.locals.user._id;
    const product = await Productdb.findById(id).populate("brand");
    let cart=await Cartdb.findOne({userId:userId})
    const existingCart=await Cartdb.findOne({productId:id})
   
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
          brand:product.brand}],
         
        })
        
    
   
    }else{
      const itemIndex=cart.products.findIndex(products => products.productId.equals(product._id))
      
      if(itemIndex === -1){
        cart.products.push({productId:product._id,quantity:qty,name:product.name,price:product.price,brand:product.brand})
      }else{
        cart.products[itemIndex].quantity += parseInt(qty) 
      }
      
    }
    await cart.save();
    res.redirect('/cart')


    // if(existingCart){

    //   existingCart.quantity +=1;
    //   await existingCart.save();
    //   res.redirect("/cart");
      
    // else{
    //   const cart = new Cartdb({
    //     userId: userId._id,
    //     products:[{
    //     productId: products._id,
    //     quantity: qty,
    //     name: products.name,
    //     brand: products.brand.name,
    //     price: products.price,
    //     }]
    //   });
    //   cart.save(cart).then(() => {
    //     console.log("this is from else add to cart",cart);
    //     res.redirect("/cart");
    //   });
    // }

  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.cart = async (req, res) => {
  try {
    const userId = res.locals.user;
    const cart = await Cartdb.findOne({ userId: userId._id }).populate("products.brand");
    
   
    
    res.render("cart", { cart });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.cart_inc = async (req, res) => {
  const id = req.params.id;
  
  try {
    const userId=res.locals.user._id
    let cart = await Cartdb.findOne({userId:userId})
    
    const itemIndex=cart.products.findIndex(products => products._id.equals(id))
    //console.log("this is from cart inc",itemIndex);
    if (!cart) {
      return res.status(404).send("Cart item not found");
    }

    cart.products[itemIndex].quantity += 1;

    await cart.save();

    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.cart_dec = async (req, res) => {
  const id = req.params.id;

  try {
    const cartItem = await Cartdb.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).send("Cart item not found");
    }

    cartItem.quantity -= 1;

    await cartItem.save();  

    res.redirect("/cart");
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
    
    const user = res.locals.user;
    const address = await Addressdb.findById(id);
   

    const cart=await Cartdb.findOne({userId:user._id})
    
    
    if (!address && !cart) {
      res.redirect("/address");
    } else {
      
      res.render("checkout",  {address ,cart});
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
      res.redirect("/checkout");
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
