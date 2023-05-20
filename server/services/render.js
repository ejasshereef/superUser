const axios=require('axios')
const Branddb=require("../model/BrandModel");
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

exports.add_brand=(req,res)=>{
  res.render('addBrand')
}

exports.login_otp_page=(req,res)=>{
  res.render('loginOtp')
}



 


exports.productPage=(req,res)=>{
  axios.get('http://localhost:3000/products')
  .then(function(response){
    
    res.render('productData',{products:response.data})
    
  }).catch(err=>{
        res.send(err)
      })
}

exports.userPage=(req,res)=>{
  axios.get('http://localhost:3000/users')
  .then(function(response){
     
    res.render('userData',{users:response.data})
   
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

exports.add_product=(req,res)=>{
  if(req.session){
   //res.setHeader("Cache-Control", "no-cache,no-store");
    // console.log(req.session.admin);
       Branddb.find({}).exec()
      .then(brand=>{res.render('addProduct',{brand})})
    
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
  // const brand=await Branddb.find()
  // axios.get('http://localhost:3000/products',{params:{id:req.query.id}})
  //   .then(function(productdata){
  //     console.log("this is from update product",productdata.data.brand);
  //     console.log(brand[2]._id);
  //      res.setHeader("Cache-Control", "no-cache,no-store");
  //      res.render('updateProduct',{products:productdata.data,brand}) 
          
  //   })
  //  .catch(err=>{
  //      res.send(err)
  //  })
  const id=req.query.id
  const brand=await Branddb.find()
  const products=await Productdb.findById(id).populate("brand")
  console.log("this is from update products",products);
  console.log("this is from update products",brand);
  res.render('updateProduct',{products,brand})
  
}

exports.allProduct=async(req,res)=>{
  try {
    // const page=parseInt(req.query.page)-1||0;
    // const limit=parseInt(req.query.limit)||5;
    // const search=req.query.search||'';
    // let sort=req.query.sort||'rating';
    // let brand=req.query.brand||'All';
    // const brandOptions=[
    //   'Adidas',
    //   'Nike',
    //   'New Balance'
    // ]
    // brand==='All'
    //  ? (brand=[...brandOptions])
    //  : (brand=req.query.brand.split(','));
    //  req.query.sort?(sort=req.query.sort.split(',')):(sort=[sort])

    //  let sortBy={};
    //  if(sort[1]){
    //   sortBy[sort[0]]=sort[1]
    //  }else{
    //   sortBy[sort[0]]='asc'
    //  }

    //  const pdt=await Productdb.find({name:{$regex:search,$options:"i"}})
    //   .where('name')
    //   .in({...brand})
    //   .sort(sortBy)
    //   .skip(page*limit)
    //   .limit(limit)

    //   const total=await Productdb.countDocuments({
    //     brand:{$in:[...brand]},
    //     name:{$regex:search,$options:"i"},
    //   })

    //   const response={
    //     error:false,
    //     total,
    //     page:page+1,
    //     limit,
    //     brand:brandOptions,
    //     name,
    //   }

    //   res.render('allProduct',{pdt})

    const page=req.query.page||0;
    const limit=parseInt(req.query.limit)||3;

    

    

    content=Productdb
    .find()
    .populate('brand')
    .sort({brand:1})
    .skip(page*limit)
    .limit(limit)
    
    .then(content=>{res.render('allProduct',{content})})

    //  Productdb.find().exec()
    //    .then(content=>{res.render('allProduct',{content})})
    
  } catch (err) {
    console.log("error is",err);
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
        if(content[i].brand.name=="New Balance"){
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