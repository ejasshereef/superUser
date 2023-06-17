const axios=require('axios');
const { Message } = require('twilio/lib/twiml/MessagingResponse');
const Branddb=require("../model/BrandModel");
const Categorydb = require('../model/category');
const Productdb=require('../model/productModel')

exports.signup_page=(req, res) => {
  res.render('registration');
}

exports.admin_page=(req,res)=>{
  res.render('adminSignin')
}

exports.login_page=(req,res)=>{
  res.render('login')
}



exports.login_otp_page=(req,res)=>{
  res.render('loginOtp')
}



 


exports.productPage=(req,res)=>{
  axios.get('http://localhost:3000/products')
  .then(function(response){
    
    res.render('productData',{activeLink:'product-data',products:response.data})
    
  }).catch(err=>{
        res.send(err)
      })
}

exports.userPage=(req,res)=>{
  axios.get('http://localhost:3000/users')
  .then(function(response){
     
    res.render('userData',{activeLink:'user-data',users:response.data})
   
      })
      .catch(err=>{
        res.send(err)
      })
}

exports.add_user=(req,res)=>{
  if(req.session){
    //res.setHeader("Cache-Control", "no-cache,no-store");
    console.log(req.session.admin);
    res.render('addUser')
  }
    
}

exports.add_product=async(req,res)=>{
  
   try {
   const brand=await Branddb.find()
   const category=await Categorydb.find()
   res.render('addProduct',{activeLink:'add-product',category, brand})
    
   } catch (err) {
    res.status(500).send(err)
   }
 }


exports.update_user=(req,res)=>{
   axios.get('http://localhost:3000/users',{params:{id:req.query.id}})
     .then(function(userdata){
       if(req.session){
        //res.setHeader("Cache-Control", "no-cache,no-store");
        res.render('updateUser',{users:userdata.data}) 
       }      
     })
    .catch(err=>{
        res.send(err)
    })
}

exports.update_prouduct=async(req,res)=>{
 
 try {
  const id=req.query.id
  const brand=await Branddb.find()
  const category=await Categorydb.find()
  const products=await Productdb.findById(id).populate("brand").populate("category")
  res.render('updateProduct',{activeLink:'update-product',products,category,brand})
  
 } catch (err) {
  res.status(500).send(err)
 }
  
}
exports.test=async(req,res)=>{
 
 const product=await Productdb.find(req.query)
 
  
}

exports.allProduct=async(req,res)=>{
 
    
    const page=req.query.page||0
    const limit=4;
    const search=req.query.search||""
    let sort=req.query.sort||req.query.selectedValue
    const brand=req.query.brand
   
    const query = {};


    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }


    try {
      const totalProducts = await Productdb.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);
      const currentPage = parseInt(page) || 1;
      const skip = (currentPage - 1) * limit;
  
      let sortOptions = {};
     
  
      // Sort by price
      if (sort === 'price_asc') {
        sortOptions.price = 1;
      } else if (sort === 'price_desc') {
        sortOptions.price = -1;
      }
      let array=[],arr=[]
  
      let products = await Productdb.find(query)
        .populate('brand')
        .populate('category')
        .sort(sortOptions)
        .sort({brand:1})
        .skip(skip)
        
      
         if(!brand){
          for (let i = 0; i < products.length; i++) {
            array[i]=products[i]
            
          }
         }else{
          for(let j=0, i=0;i<products.length;i++){
            if(products[i].brand.name === brand){
               array[j]=products[i]
               j++
            }
          }
         }
         arr=array.slice(0,limit)

         //res.json({brand, arr,search,sort,currentPage,totalPages,limit})
         
      res.render('allProduct',{brand, arr,search,sort,currentPage,totalPages,limit})
       
  } catch (err) {
    console.log(err);
    res.send(err)
    
  }
}



exports.adidas=async(req,res)=>{
  try {
    let array=[]
    const page=req.query.page||0;
    const limit=parseInt(req.query.limit)||9;

    content=await Productdb
    .find()
    .populate('brand')
    .sort({brand:1})
    .skip(page*limit)
    .limit(limit)
    
    // .then(content=>{console.log(content),res.render('adidas',{content})})
    .then(content=>{
      for(let i=0;i<content.length;i++){
        if(content[i].brand.name=="Adidas"){
           array[i]=content[i]
        }
      }
      res.render('adidas',{array})
      
      })
    
  } catch (err) {
    console.log("error is",err);
    res.send(err)
    
  }
}



exports.nike=async(req,res)=>{
  try {
    let array=[]
    const page=req.query.page||0;
    const limit=parseInt(req.query.limit)||9;

    content=await Productdb
    .find()
    .populate('brand')
    .sort({brand:1})
    .skip(page*limit)
    .limit(limit)
    .then(content=>{
      for(let i=0;i<content.length;i++){
        if(content[i].brand.name=="Nike"){
           array[i]=content[i]
        }
      }
      res.render('nike',{array})
      
      })
    
  } catch (err) {
    console.log("error is",err);
    res.send(err)
    
  }
}

exports.new_balance=async(req,res)=>{
  try {
    let array=[]
    const page=req.query.page||0;
    const limit=parseInt(req.query.limit)||9;

    content=await Productdb
    .find()
    .populate('brand')
    .sort({brand:1})
    .skip(page*limit)
    .limit(limit)
    .then(content=>{
      for(let i=0;i<content.length;i++){
        if(content[i].brand.name=="NewBalance"){
           array[i]=content[i]
        }
      }
      res.render('newBalance',{array})
      
      })
    
  } catch (err) {
    console.log("error is",err);
    res.send(err)
    
  }
}

exports.brand_filter=(req,res)=>{
  const route=req.body.brand
  console.log(route);
  res.redirect(route)


}