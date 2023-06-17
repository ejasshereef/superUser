const Userdb = require("../model/model");
const Branddb = require("../model/BrandModel");
const Productdb = require("../model/productModel");
const Coupondb = require("../model/coupon");
const { findById } = require("../model/model");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Orderdb = require("../model/order");
const Categorydb = require("../model/category");
const Walletdb = require("../model/wallet");
const Bannerdb = require("../model/banner");

//-------jwt-----//
const maxAge = 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "secret", {
    expiresIn: maxAge,
  });
};

exports.admin = async (req, res) => {
  admin = { email: "admin@admin.com", password: "admin" };
  const { email, password } = req.body;

  if (admin.email === email && admin.password === password) {
    const adminToken = createToken(admin.email);
    res.cookie("jwtAdmin", adminToken, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });
    res.redirect("/dashboard");
  } else {
    res.render("adminSignin", { message: "invalid entry" });
  }
};

exports.dashboard = async (req, res) => {
  const admin = res.locals.admin;
  const start = req.query.startDate;
  const end = req.query.endDate;

  const getMonthData = async (month) => {
    const order = await Orderdb.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$modifiedOn" }, month],
          },
        },
      },
    ]);
    return order;
  };
  const jan = await getMonthData(1);
  const feb = await getMonthData(2);
  const mar = await getMonthData(3);
  const april = await getMonthData(4);
  const may = await getMonthData(5);
  const june = await getMonthData(6);

  const getStatus = async (status) => {
    const order = await Orderdb.find({ status });
    return order;
  };

  const pendingOrder = await getStatus("Processing");
  const deliveredOrder = await getStatus("Delivered");
  const cancelledOrder = await getStatus("Cancelled");

  let totalSales = await Orderdb.find({ status: "Delivered" });
  let salesValue = 0;
  totalSales.forEach((element) => {
    salesValue += element.subTotal;
  });

  

  let salesData = Orderdb.find();
  if (start && end) {
    salesData = salesData
      .where("createdAt")
      .gte(new Date(start))
      .lte(new Date(end));
  } else if (start) {
    salesData = salesData.where("createdAt").gte(new Date(start));
  } else if (end) {
    salesData = salesData.where("createdAt").lte(new Date(end));
  }
  const sales = await salesData.populate("userId").exec();

  res.render("dashboard", {
    start,
    end,
    salesValue,
    sales,
    cancelledOrder,
    pendingOrder,
    deliveredOrder,
    jan,
    feb,
    mar,
    april,
    may,
    june,
    admin,
    activeLink: "dashboard",
  });
};

exports.add_brand = async (req, res) => {
  const brandName = req.body.brandName;

  try {
    const existingUser = await Branddb.findOne({ name: brandName });

    if (existingUser) {
      return res.send("Already Existing Brand Name");
    } else {
      const newBrand = new Branddb({
        name: brandName,
      });

      await newBrand.save();
      const brand = await Branddb.find();
      const category = await Categorydb.find();
      res.render("addCategory", {
        brand,
        category,
        activeLink: "add-category",
        catMsg: "",
        msg: "",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.adminLogout = (req, res) => {
  res.cookie("jwtAdmin", "", { maxAge: 1 });
  res.redirect("/admin");
};

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

exports.upload = multer({
  storage: storage,
  limits: {
    fields: 10,
    fieldNameSize: 50,
    fieldSize: 20000,
    fileSize: 15000000,
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).array("image", 7);

exports.uploadSingle = multer({
  storage: storage,
  limits: {
    fields: 10,
    fieldNameSize: 50,
    fieldSize: 20000,
    fileSize: 15000000,
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(null, false);
  }
}

exports.add_product = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({ message: "Content can not be empty" });
    }
    const product = new Productdb({
      name: req.body.addName,
      brand: req.body.addBrand,
      description: req.body.addDescription,
      stock:req.body.addStock,
      category:req.body.addCategory,
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
      .populate("brand").populate("category")
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

exports.add_category = async (req, res) => {
  const brand = await Branddb.find();
  const category = await Categorydb.find();
  res.render("addCategory", {
    brand,
    category,
    activeLink: "add-category",
    catMsg: "",
    msg: "",
  });
};

exports.updateProduct = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "data to update cannot be empty" });
  }
  const id = req.params.id;

  const existing = await Productdb.findById(id);

  Productdb.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      brand: req.body.addBrand,
      stock:req.body.addStock,
      category: req.body.addCategory,
      description: req.body.addDescription,
      price: req.body.addPrice,
      image: existing.image.concat(req.files.map((file) => file.filename)),
    },
    { useFindAndModify: false }
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
  Userdb.findByIdAndUpdate(
    id,
    {
      status: req.body.status,
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
        res.cookie("jwt", "", { maxAge: 1 });
        res.redirect("/user-data");
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

exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Productdb.findByIdAndRemove(id);

    if (result) {
      result.image.forEach((element) => {
        if (element !== "") {
          fs.unlinkSync("./uploads/" + element);
        }
      });
    }
    res.redirect("/product-data");
  } catch (err) {
    res.status(500).send(err.message); // Send error response with status code 500
  }
};

exports.order_data = async (req, res) => {
  const page = req.query.page || 0;
  const limit = 10;

  const order = await Orderdb.find().populate("address").populate("userId");
  // .skip(page*limit)
  // .limit(limit)
  res.render("orderData", { order, activeLink: "order-data" });
};

exports.admin_order_details = async (req, res) => {
  const id = req.params.id;
  const order = await Orderdb.findById(id)
    .populate("userId")
    .populate("address")
    .populate("products")
    .populate("products.brand");
  res.render("adminOrderDetails", { order, activeLink: "order-data" });
};

exports.change_order_status = async (req, res) => {
  const id = req.params.id;
  const order = await Orderdb.findByIdAndUpdate(
    id,
    { status: req.body.status },
    { useFindAndModify: false },
    { new: true }
  );
  res.redirect("/order-data/");
};

exports.add_new_category = async (req, res) => {
  try {
    const category = req.body.categoryName;
    const existingCategory = await Categorydb.findOne({ name: category });

    if (existingCategory) {
      return res.send("Already Existing Category ");
    } else {
      const newCategory = new Categorydb({
        name: category,
      });
      await newCategory.save();
      res.redirect("/add-category");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.delete_brand = async (req, res) => {
  try {
    const id = req.params.id;
    const pdt = await Productdb.findOne({ brand: id });
    if (pdt) {
      const brand = await Branddb.find();
      const category = await Categorydb.find();
      res.render("addCategory", {
        category,
        activeLink: "add-category",
        brand,
        catMsg: "",
        msg: "cant delete already used Brand",
      });
    } else {
      const result = await Branddb.findByIdAndRemove(id);
      res.redirect("/add-category");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.delete_category = async (req, res) => {
  try {
    const id = req.params.id;
    const pdt = await Productdb.findOne({ category: id });
    if (pdt) {
      const category = await Categorydb.find();
      const brand = await Branddb.find();

      res.render("addCategory", {
        brand,
        activeLink: "add-category",
        category,
        msg: "",
        catMsg: "cant delete already used Brand",
      });
    } else {
      const result = await Categorydb.findByIdAndRemove(id);
      res.redirect("/add-category");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.refund = async (req, res) => {
  try {
    const id = req.params.id;
    let order = await Orderdb.findByIdAndUpdate(
      id,
      { status: "Refunded" },
      { useFindAndModify: false },
      { new: true }
    )
      .populate("userId")
      .populate("address")
      .populate("products")
      .populate("products.brand");
    const userId = order.userId;
    const wallet = await Walletdb.findOne({ userId: userId });
    let sum = wallet.amount;
    order.products.forEach((element) => {
      sum += element.total;
    });
    const existingWallet = await Walletdb.findOneAndUpdate(
      { userId: userId },
      { amount: sum }
    );
    if (!existingWallet) {
      const newWallet = new Walletdb({
        userId: userId,
        amount: sum,
      });
      await newWallet.save();
    }
    res.redirect("/order-data");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.coupon_data = async (req, res) => {
  const coupon = await Coupondb.find();
  res.render("couponData", { activeLink: "coupon-data", coupon });
};

exports.add_coupon = async (req, res) => {
  try {
    const existingCoupon = Coupondb.findOne({ codeName: req.body.codeName });

    if (existingCoupon) {
      res.redirect("/coupon-data");
    }
    const coupon = new Coupondb(req.body);
    coupon.save(coupon);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.coupon = async (req, res) => {
  res.render("addCoupon", { activeLink: "add-coupon" });
};

exports.edit_coupon = async (req, res) => {
  try {
    const id = req.params.id;
    const coupon = await Coupondb.findByIdAndUpdate(
      id,
      req.body,
      { useFindAndModify: false },
      { new: true }
    ).then(res.redirect("/coupon-data"));
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.delete_image = async (req, res) => {
  const imageId = req.params.id1;
  const productId = req.params.id2;

  await Productdb.updateOne(
    { _id: productId },
    { $pull: { image: imageId } }
  ).then(res.redirect("/product-data"));
};

exports.add_banner = async (req, res) => {
  try {
    const { name, image } = req.body;
    const banner = new Bannerdb({
      name: name,
      image: req.file.filename,
    });
    await banner.save();
    res.redirect("/banner-data");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.banner = (req, res) => {
  res.render("addBanner", { activeLink: "add-banner" });
};

exports.banner_data = async (req, res) => {
  const banner = await Bannerdb.find();
  res.render("bannerData", { banner, activeLink: "banner-data" });
};

exports.edit_banner = async (req, res) => {
  const id = req.params.id;

  const banner = await Bannerdb.findByIdAndUpdate(
    id,
    req.body,
    { useFindAndModify: false },
    { new: true }
  );
  res.redirect("/banner-data");
};
