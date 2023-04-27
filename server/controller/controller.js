var Userdb = require("../model/model");
var Branddb=require("../model/BrandModel");
var Productdb=require('../model/productModel')
var bcrypt = require("bcrypt");
 const { findById } = require("../model/model");

//-----signup and login----//

let status, result;

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

      const status = "You have successfully signed up as";
      const loggedInUser = newUser.email;
      const result = "Login";

      res.render("login", { user: loggedInUser, status, result }); // Render the login view with success message
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
      console.log("going to first else", existingUser);
      res.redirect("/landingPage");
    }
    const isValid = await bcrypt.compare(password, existingUser.password);
    if (isValid) {
      req.session.user = email;
      req.session.authorized = true;
      status = "you have successfully loggined in as";
      result = "SignOut";
      res.redirect("/loadingPage");
    }else{
      console.log("going to second else", existingUser);
      res.render("landingPage");
    }
  });
};

exports.admin = async (req, res) => {
  admin = { email: "admin@admin.com", password: "admin" };
  let email = req.body.email;
  let password = req.body.password;

  if (admin.email === email && admin.password === password) {
    req.session.admin = email;
    req.session.authorized = true;
    res.redirect("/dashboard");
  } else {
    res.render("adminSignin", { message: "invalid entry" });
  }
};

exports.dashboard = (req, res) => {
  res.setHeader("Cache-Control", "must-revalidate");
  if (req.session.authorized) {
    res.render("dashboard");
  } else {
    console.log("passed to else in get dashboard");
    res.render("landingPage");
  }
};

exports.loadingPage = (req, res) => {
  res.setHeader("Cache-Control", "no-cache,no-store,must-revalidate");
  if (req.session.authorized) {
    console.log(req.session.user);
    res.render("loadingPage", { user: req.session.user, status, result });
  } else {
    res.render("landingPage");
    console.log("passed to else in get dashboard");
  }
};

exports.add_brand=async (req, res) => {
  const { addBrand,  brandEmail } = req.body; // Destructure request body

  try {
    const existingUser = await Branddb.findOne({ email: brandEmail }); // Check if user already exists in the database
    console.log(existingUser);
    if (existingUser) {
      return res.send("Already Existing User");
    } else {

      const newBrand = new Branddb({
        name: addBrand,
        email: brandEmail,
      });

      await newBrand.save(); // Save the new user to the database

      res.render("addBrand"); // Render the login view with success message
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user");
  }
};
      
        


exports.logout = (req, res) => {
  console.log(req.session.authorized);
  //res.setHeader("Cache-Control", "no-cache,no-store");
  req.session.destroy();
  res.redirect("/");
};

//-----create update delete-----//

exports.create = async(req, res) => {
   
  const hash= await bcrypt.hash(req.body.password,10)
  console.log(req.session.admin);
  if (!req.body) {
    res.send(400).send({ message: "content can not be empty" });
    return;
  }
  const user = new Userdb({
    name: req.body.regName,
    email: req.body.regEmail,
    phone:req.body.regPhone,
    gender: req.body.gender,
    status: req.body.status,
    password: hash,
  });

  user
    .save(user)
    .then((data) => {
      // res.send(data)
      res.redirect("/add-user",{message:"user added succesfully"});
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "some error occurred while creating a create operation",
      });
    });
};


exports.add_product = async(req, res) => {
  if (!req.body) {
    res.send(400).send({ message: "content can not be empty" });
    return;
  }
  const product = new Productdb({
    name: req.body.addName,
    brand: req.body.addBrand,
    description:req.body.addDescription,
    price: req.body.addPrice,
    
  });

  product
    .save(product)
    .then((data) => {
      // res.send(data)
      res.render("addProduct");
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "some error occurred while creating a create operation",
      });
    });
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
      .then((products) => {
        res.send(products);
      })
      .catch((err) => {
        res
          .status(500)
          .send({
            message:
              err.message || "error occurred while retriving user information",
          });
      });
  }
};  


exports.createProduct = async(req, res) => {
  if (!req.body) {
    res.send(400).send({ message: "content can not be empty" });
    return;
  }
  const products = new Productdb({
    name: req.body.regName,
    brand: req.body.regEmail,
    description:req.body.regPhone,
    price: req.body.gender,
  });

  products
    .save(products)
    .then((products) => {
      // res.send(data)
      res.redirect("/product-data",{message:"user added succesfully"});
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
  Productdb.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({
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

// exports.find = (req, res) => {
//   if (req.query.id) {
//     const id = req.query.id;

//     Userdb.findById(id)
//       .then((data) => {
//         if (!data) {
//           res.status(404).send({ message: `not found user with id ${id}` });
//         } else {
//           res.send(data);
//         }
//       })
//       .catch((err) => {
//         res
//           .status(500)
//           .send({ message: `error retrieving user with id ${id}` });
//       });
//   } else {
//     Userdb.find()
//       .then((user) => {
//         res.send(user);
//       })
//       .catch((err) => {
//         res
//           .status(500)
//           .send({
//             message:
//               err.message || "error occurred while retriving user information",
//           });
//       });
//   }
// };

exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "data to update cannot be empty" });
  }
  const id = req.params.id;
  Userdb.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({
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

exports.delete = (req, res) => {
  const id = req.params.id;

  Userdb.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `cannot delete wiht id ${id},maybe id is wrong ` });
      } else {
        res.send({
          message: "user was deleted successfully",
        });
      }
    })
    .catch((err) => {
      message: `could not delete user with id ${id}`;
    });
};



