const Userdb = require("../model/model");
const Productdb = require("../model/productModel");
const Addressdb = require("../model/address");
const Coupondb = require("../model/coupon");
const bcrypt = require("bcrypt");
const { findById } = require("../model/model");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const Swal = require("sweetalert2");
const Cartdb = require("../model/cart");
const Orderdb = require("../model/order");
const paypal = require("paypal-rest-sdk");
const Walletdb = require("../model/wallet");
const Bannerdb = require("../model/banner");
const { v4: uuidv4 } = require("uuid");
const Categorydb = require("../model/category");
const Branddb = require("../model/BrandModel");


const { TWILIO_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } =
  process.env;
const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
});

exports.contact = (req, res) => {
  res.render("contact");
};

//-------jwt-----//
const maxAge = 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "secret", {
    expiresIn: maxAge,
  });
};

//---login using OTP and forgot password using OTP-------//
let phoneP;
exports.sendOTP = async (req, res, next) => {
  //req.session.phone=req.body.forPhone;
  phoneP = req.body.forPhone;
  try {
    const otpResponse = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verifications.create({
        to: "+91" + phoneP,
        channel: "sms",
      });
    res.render("forgetPassword", { otpMessage: JSON.stringify(otpResponse) });
  } catch (error) {
    res
      .status(error?.status || 400)
      .send(error?.message || `something went wrong`);
  }
};

exports.verifyOTP = async (req, res, next) => {
  let phone = phoneP;
  let otp = req.body.forOtp;
  let password = req.body.forPassword;
  try {
    const verifiedResponse = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: "+91" + phone,
        code: otp,
      });

    if (verifiedResponse.status == "approved") {
      const hash = await bcrypt.hash(password, 10);
      Userdb.findOneAndUpdate({ phone: phone }, { password: hash })
        .then((data) => {
          if (!data) {
            res
              .status(404)
              .send({
                message: `cannot update user with Phone no:${phone}.user not found`,
              });
          } else {
            res.render("forgetPassword", {
              verificationMessage: JSON.stringify(verifiedResponse.status),
            });
          }
        })
        .catch((err) => {
          res.status(500).send({ message: "error updating user information" });
        });
    }
  } catch (error) {
    res
      .status(error?.status || 400)
      .send(error?.message || `something went wrong`);
  }
};

let phoneOtp;
exports.login_otp = async (req, res) => {
  phoneOtp = req.body.phone;
  try {
    const otpResponse = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verifications.create({
        to: "+91" + phoneOtp,
        channel: "sms",
      });
    res.render("loginOtpVerify", { otpMessage: JSON.stringify(otpResponse) });
  } catch (error) {
    res
      .status(error?.status || 400)
      .send(error?.message || `something went wrong`);
  }
};

exports.login_otp_verify = async (req, res, next) => {
  let phone = phoneOtp;
  let otp = req.body.otp;
  try {
    const verifiedResponse = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: "+91" + phone,
        code: otp,
      });
    

    if (verifiedResponse.status == "approved") {
      await Userdb.findOne({ phone: phone })
        .then((data) => {
          console.log(data);
          if (!data) {
            res
              .status(404)
              .send({
                message: `cannot find user with Phone no:${phone}.user not found`,
              });
          } else {
            const token = createToken(data._id);
            res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.redirect("/loadingPage");
          }
        })
        .catch((err) => {
          res.status(500).send({ message: "error updating user information" });
        });
    }
  } catch (error) {
    res
      .status(error?.status || 400)
      .send(error?.message || `something went wrong`);
  }
};

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
      const wallet = new Walletdb({
        userId: newUser._id,
      });
      await wallet.save();
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
 try {
  const email = req.body.loginName;
  const password = req.body.loginPassword;

  existingUser = Userdb.findOne({ email: email }).then(async (existingUser) => {
    
    if (!existingUser) {
      res.redirect("/login");
    }else{

      if (existingUser.status === "Unblocked") {
        const isValid = await bcrypt.compare(password, existingUser.password);
        if (isValid) {
          const token = createToken(existingUser._id);
          res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
          
          res.redirect("/loadingPage");
        } else {
          res.render("landingPage");
        }
      } else {
        
        res.redirect("/");
      }
    }
    
  });
  
 } catch (err) {
  res.status(500).send(err.message)
 }
};

exports.landing_page = async (req, res) => {
  const page = req.query.page || 0;
  const limit = parseInt(req.query.limit) || 8 || 3;

  const banner = await Bannerdb.findOne({ status: "Active" });
  const category=await Categorydb.findOne({name:"Female"})
  const ladies=await Productdb.find({category})

  const findBrand=async(brand)=>{
    let brandName=await Branddb.find({name:brand})
    let content=await Productdb.find({brand:brandName}).limit(8)
    return content
  }
  const adidas=await findBrand("Adidas")
  const nike=await findBrand("Nike")
  const newBalance=await findBrand("NewBalance")
  const allProduct=await Productdb.find()

  
    res.render("landingPage", {allProduct,ladies,nike,newBalance, adidas, banner });
};

exports.loadingPage = async (req, res) => {
  const page = req.query.page || 0;
  const limit = parseInt(req.query.limit) || 8 || 3;

  const banner = await Bannerdb.findOne({ status: "Active" });
  const category=await Categorydb.findOne({name:"Female"})
  const ladies=await Productdb.find({category})

  const findBrand=async(brand)=>{
    let brandName=await Branddb.find({name:brand})
    let content=await Productdb.find({brand:brandName}).limit(8)
    return content
  }
  const adidas=await findBrand("Adidas")
  const nike=await findBrand("Nike")
  const newBalance=await findBrand("NewBalance")
  const allProduct=await Productdb.find()
  
  res.render("loadingPage", { allProduct,ladies,nike,newBalance, adidas, banner });
  
};


exports.userLogout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

//-----using img in db-----//
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

exports.upload = multer({ storage: storage }).array("image", 7);
exports.uploadSingle = multer({ storage: storage }).single("image");

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
    const pId = req.params.id || id;
    const qty = req.body.qty || 1;
    const size=parseInt(req.body.size)||7
    const userId = res.locals.user._id;
    const product = await Productdb.findById(pId).populate("brand");
    let cart = await Cartdb.findOne({ userId: userId });

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    if (!cart) {
      cart = new Cartdb({
        userId: userId,
        products: [
          {
            productId: product._id,
            quantity: qty,
            size:size,
            name: product.name,
            price: product.price,
            brand: product.brand,
          },
        ],
      });
    } else {
      const itemIndex = cart.products.findIndex((products) =>
        products.productId.equals(product._id)
      );
      // total=parseInt((cart.products[itemIndex].price)*(cart.products[itemIndex].quantity))
      if (itemIndex === -1) {
        cart.products.push({
          productId: product._id,
          quantity: qty,
          size:size,
          name: product.name,
          price: product.price,
          brand: product.brand,
        });

        //cart.subTotal=sum+=cart.products[itemIndex].total
      } else {
        cart.products[itemIndex].quantity += parseInt(qty);
        cart.products[itemIndex].total =
          cart.products[itemIndex].quantity * cart.products[itemIndex].price;
        cart.products[itemIndex].size=size
      }
    }
    await cart.save();
    res.redirect("/cart");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.cart = async (req, res) => {
  try {
    const userId = res.locals.user;
    const cart = await Cartdb.findOne({ userId: userId._id })
      .populate("products.brand")
      .populate("products.productId");
    
    res.render("cart", { cart });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.cart_inc = async (req, res) => {
  try {
    const id = req.body.id;
    const userId = res.locals.user._id;
    let cart = await Cartdb.findOne({ userId: userId });

    const itemIndex = cart.products.findIndex((products) =>
      products._id.equals(id)
    )

    if (!cart) {
      return res.status(404).send("Cart item not found");
    }

    const productId = cart.products[itemIndex].productId;
    const product=await Productdb.findById(productId)
    const maxQuantity = product.stock;

   if(cart.products[itemIndex].quantity < maxQuantity){
    cart.products[itemIndex].quantity += 1;
    await cart.save();
   }

    const quantity = cart.products[itemIndex].quantity;
    const total =
      cart.products[itemIndex].quantity * cart.products[itemIndex].price;

    res.status(200).json({
      success: true,
      message: "Quantity update successfully",
      total: parseInt(total),
      quantity,
      maxQuantity,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.cart_dec = async (req, res) => {
  try {
    const id = req.body.id;
    const userId = res.locals.user._id;
    let cart = await Cartdb.findOne({ userId: userId });
    const itemIndex = cart.products.findIndex((products) =>
      products._id.equals(id)
    );

    if (!cart) {
      return res.status(404).send("Cart item not found");
    }

    if (cart.products[itemIndex].quantity != 1) {
      cart.products[itemIndex].quantity -= 1;
    }

    await cart.save();
    const quantity = cart.products[itemIndex].quantity;
    const total =
      cart.products[itemIndex].quantity * cart.products[itemIndex].price;


     

    res.status(200).json({
      success: true,
      message: "Quantity update successfully",
      total: parseInt(total),
      quantity,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = res.locals.user._id;

    const result = await Cartdb.findOneAndUpdate(
      { userId },
      { $pull: { products: { _id: id } } },
      { new: true }
    );
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
    const wallet = await Walletdb.findOne({ userId: userId });
    const cart = await Cartdb.findOne({ userId: userId });
    const coupon = await Coupondb.find();
    const user = await Userdb.findById(userId);
    if (!address && !cart) {
      res.redirect("/address");
    } else {
      res.render("checkout", { user, coupon, address, cart, wallet });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.address = async (req, res) => {
  try {
    const user = res.locals.user._id;
    const address = await Addressdb.find({ user });
    res.render("address", { address });
  } catch (err) {
    res.status(500).send(err.message);
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

let paypalTotal = 0;
exports.checkoutPayment = async (req, res) => {
  try {
    const primaryPayment = req.body.primaryPayment;
    const secondaryPayment = req.body.secondaryPayment;
    const subTotal = parseInt(req.body.sum);
    const couponApplied = req.body.coupon;
    const addressId = req.params.id;
    const userId = res.locals.user._id;
    const address = await Addressdb.findById(addressId);
    const cart = await Cartdb.findOne({ userId: userId }).populate("products");
    const wallet = await Walletdb.findOne({ userId: userId });
    const coupon = await Coupondb.findOne({ codeName: couponApplied });
    const date = new Date();
    const timestamp = date.getHours();
    const randomNumber = Math.floor(Math.random() * 1000);
    const invoiceNumber = `INV-${timestamp}-${randomNumber}`;

    const user = await Userdb.findById(userId);

    if (!primaryPayment && !secondaryPayment) {
      res.send("Kindly select any of payment method to complete your order");
    }
    if (secondaryPayment && wallet.amount === 0) {
      res.send("As wallet is empty use other Payment Options");
    }

    if (
      (primaryPayment === "cod" && !secondaryPayment) ||
      (primaryPayment === "cod" &&
        secondaryPayment === "wallet" &&
        wallet.amount < subTotal)
    ) {
      let sum = 0;
      cart.products.forEach((element) => {
        sum += element.quantity * element.price;
      });

      let found = false;
      for (let i = 0; i < user.couponUsed.length; i++) {
        if (user.couponUsed[i] === couponApplied) {
          found = true;
          break;
        }
      }

      if (coupon && sum > 5000 && !found) {
        sum = sum - (coupon.discount * sum) / 100;
      }

      let amount = sum;
      let secondaryAmount = 0;
      if (secondaryPayment) {
        amount = sum - wallet.amount;
        secondaryAmount = wallet.amount;
      }
      const order = new Orderdb({
        userId: userId,
        invoiceNumber: invoiceNumber,
        paymentMode: "cod",
        primaryPaid: amount,
        secondaryPaymentMode: secondaryPayment,
        secondaryPaid: secondaryAmount,
        address: addressId,
        status: "Processing",
        coupon: couponApplied,
        subTotal: sum,
      });

      for (let i = 0; i < cart.products.length; i++) {
        order.products.push({
          productId:cart.products[i].productId,
          name: cart.products[i].name,
          price: cart.products[i].price,
          quantity: cart.products[i].quantity,
          size:cart.products[i].size,
          brand: cart.products[i].brand,
          total: cart.products[i].quantity * cart.products[i].price,
        });
      }

      await order.save();

      for(let i=0;i<order.products.length;i++){
        let  pdt = await Productdb.findById(order.products[i].productId)
        let stk=pdt.stock-order.products[i].quantity
        pdt.stock=stk
        await pdt.save()
      }

      if (order.secondaryPaid > 0) {
        wallet.amount = 0;
        await wallet.save();
      }
      if (order.coupon) {
        user.couponUsed.push(couponApplied);
        await user.save();
      }

      const result = await Cartdb.findOneAndDelete({ userId: userId });
      res.render("confirmedOrder", { order, address });
    }

    if (
      (primaryPayment === "paypal" && !secondaryPayment) ||
      (primaryPayment === "paypal" &&
        secondaryPayment === "wallet" &&
        wallet.amount < subTotal)
    ) {
      let createPayment = {};
      let sum = 0;
      cart.products.forEach((element) => {
        sum += element.quantity * element.price;
      });

      let found = false;
      for (let i = 0; i < user.couponUsed.length; i++) {
        if (user.couponUsed[i] === couponApplied) {
          found = true;
          break;
        }
      }

      if (coupon && sum > 5000 && !found) {
        sum = sum - (coupon.discount * sum) / 100;
      }

      let amount = sum;
      let secondaryAmount = 0;
      if (secondaryPayment) {
        amount = sum - wallet.amount;
        secondaryAmount = wallet.amount;
      }
      const order = new Orderdb({
        userId: userId,
        invoiceNumber: invoiceNumber,
        paymentMode: "paypal",
        primaryPaid: amount,
        secondaryPaymentMode: secondaryPayment,
        secondaryPaid: secondaryAmount,
        address: addressId,
        status: "Processing",
        coupon: couponApplied,
        subTotal: sum,
      });

      for (let i = 0; i < cart.products.length; i++) {
        order.products.push({
          productId:cart.products[i].productId,
          name: cart.products[i].name,
          price: cart.products[i].price,
          quantity: cart.products[i].quantity,
          size:cart.products[i].size,
          brand: cart.products[i].brand,
          total: cart.products[i].quantity * cart.products[i].price,
        });
      }
      await order.save();

      for(let i=0;i<order.products.length;i++){
        let  pdt = await Productdb.findById(order.products[i].productId)
        let stk=pdt.stock-order.products[i].quantity
        pdt.stock=stk
        await pdt.save()
      }

      let paypalSum = amount;

      paypalTotal = parseInt(paypalSum / 82);

      createPayment = {
        intent: "sale",
        payer: { payment_method: "paypal" },
        redirect_urls: {
          return_url: "http://superu.shop/paypal-success",
          cancel_url: "http://superu.shop/paypal-err",
        },
        transactions: [
          {
            amount: {
              currency: "USD",
              total: paypalTotal,
            },
            description: "Super User Paypal Payment",
          },
        ],
      };

      paypal.payment.create(createPayment, function (error, payment) {
        if (error) {
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === "approval_url") {
              res.redirect(payment.links[i].href);
            }
          }
        }
      });
      if (order.secondaryPaid > 0) {
        wallet.amount = 0;
        await wallet.save();
      }

      if (order.coupon) {
        user.couponUsed.push(couponApplied);
        await user.save();
      }

      const result = await Cartdb.findOneAndDelete({ userId: userId });
    }
    if (secondaryPayment === "wallet" && wallet.amount > subTotal) {
      let sum = 0;
      cart.products.forEach((element) => {
        sum += element.quantity * element.price;
      });

      let found = false;
      for (let i = 0; i < user.couponUsed.length; i++) {
        if (user.couponUsed[i] === couponApplied) {
          found = true;
          break;
        }
      }

      if (coupon && sum > 5000 && !found) {
        sum = sum - (coupon.discount * sum) / 100;
      }

      let secondaryAmount = sum;

      const order = new Orderdb({
        userId: userId,
        invoiceNumber: invoiceNumber,
        secondaryPaymentMode: "wallet",
        secondaryPaid: secondaryAmount,
        address: addressId,
        status: "Processing",
        coupon: couponApplied,
        subTotal: sum,
      });

      for (let i = 0; i < cart.products.length; i++) {
        order.products.push({
          productId:cart.products[i].productId,
          name: cart.products[i].name,
          price: cart.products[i].price,
          quantity: cart.products[i].quantity,
          size:cart.products[i].size,
          brand: cart.products[i].brand,
          total: cart.products[i].quantity * cart.products[i].price,
        });
      }
      await order.save();

      for(let i=0;i<order.products.length;i++){
        let  pdt = await Productdb.findById(order.products[i].productId)
        let stk=pdt.stock-order.products[i].quantity
        pdt.stock=stk
        await pdt.save()
      }

      wallet.amount = wallet.amount - sum;
      await wallet.save();

      if (order.coupon) {
        user.couponUsed.push(couponApplied);
        await user.save();
      }

      const result = await Cartdb.findOneAndDelete({ userId: userId });
      res.render("confirmedOrder", { order, address });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.paypal_success = async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: paypalTotal,
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.

      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.render("paypalSuccess", { payment });
      }
    }
  );
};

exports.paypal_err = (req, res) => {
  console.log(req.query);
  res.send("error");
};

exports.user_profile = async (req, res) => {
  const userId = res.locals.user._id;
  const user = await Userdb.findById(userId);
  const address = await Addressdb.findOne({ user: userId });
  const order = await Orderdb.find({ userId: userId })
    .populate("userId")
    .populate("address")
    .populate("products");
  res.render("userProfile", { user, address, order });
};

exports.order_details = async (req, res) => {
  const id = req.params.id;

  const order = await Orderdb.findById(id)
    .populate("userId")
    .populate("address")
    .populate("products")
    .populate("products.brand");

  res.render("orderDetails", { order });
};

exports.cancel_order = async (req, res) => {
  const id = req.params.id;
  let order = await Orderdb.findByIdAndUpdate(
    id,
    { status: "Cancelled" },
    { useFindAndModify: false },
    { new: true }
  )
    .populate("userId")
    .populate("address")
    .populate("products")
    .populate("products.brand");
  res.redirect("/order-details/" + id);
};

exports.return_order = async (req, res) => {
  try {
    const id = req.params.id;
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const validOrder = await Orderdb.findById(id);
    if (validOrder.createdAt > twoWeeksAgo) {
      let order = await Orderdb.findByIdAndUpdate(
        id,
        { status: "Returned" },
        { useFindAndModify: false },
        { new: true }
      )
        .populate("userId")
        .populate("address")
        .populate("products")
        .populate("products.brand");
      res.redirect("/order-details/" + id);
    } else {
      res.send("You cant return order which is older than two weeks");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.add_profile_pic = async (req, res) => {
  const userId = res.locals.user._id;
  const user = await Userdb.findByIdAndUpdate(
    userId,
    { image: req.file.filename },
    { useFindAndModify: false },
    { new: true }
  )

    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `cannot update user with $(userId) May be user not found`,
        });
      } else {
        res.redirect("/user-profile");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "error update user information" });
    });
};

exports.couponAjax = async (req, res) => {
  const userId = res.locals.user._id;
  const couponUsed = req.body.coupon;
  const user = await Userdb.findById(userId);
  const couponData = await Coupondb.find();

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
    res.json({ success: false, message: "Invalid coupon" });
  }
};

exports.invoice = async (req, res) => {
  const id = req.params.id;
  const order = await Orderdb.findById(id)
    .populate("userId")
    .populate("address");
  res.render("invoice", { order });
};

exports.wallet_history = async (req, res) => {
  const userId = res.locals.user._id;
  const wallet = await Walletdb.findOne({ userId });
  const order = await Orderdb.find({
    userId: userId,
    $or: [
      { status: "Refunded" },
      { userId: userId, secondaryPaymentMode: "wallet" },
    ],
  }).populate("userId");
  res.render("walletHistory", { order, wallet });
};


exports.change_product_size=async (req,res)=>{
 try {
  const id=req.params.id;
  const userId=res.locals.user._id;
  const size=parseInt(req.body.size)
  
  let cart=await Cartdb.findOne({userId})
  for (let i = 0; i < cart.products.length; i++)  {
    if(cart.products[i]._id==id){
     
      cart.products[i].size=size;
     
      await cart.save()
    }
  };
  res.redirect('/cart')
 } catch (err) {
  res.status(500).send(err.message)
 }
}