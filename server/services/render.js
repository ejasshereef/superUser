const axios=require('axios')


exports.productPage=(req,res)=>{
  axios.get('http://localhost:3000/products')
  .then(function(response){
    // console.log(response.data);
    if(req.session.authorized){
        console.log(req.session.authorized);
          res.setHeader("Cache-Control", "no-cache,no-store,must-revalidate");
          res.render('productData',{products:response.data})
        }
      })
      .catch(err=>{
        res.send(err)
      })
}

exports.add_user=(req,res)=>{
  if(req.session.authorized){
    res.setHeader("Cache-Control", "no-cache,no-store");
    console.log(req.session.admin);
    res.render('addUser')
  }
    
}

exports.add_product=(req,res)=>{
  if(req.session.authorized){
   // res.setHeader("Cache-Control", "no-cache,no-store");
    console.log(req.session.admin);
    res.render('addProduct')
  }
    
}

exports.update_user=(req,res)=>{
   axios.get('http://localhost:3000/api/users',{params:{id:req.query.id}})
     .then(function(userdata){
       if(req.session.authorized){
        res.setHeader("Cache-Control", "no-cache,no-store");
        res.render('update_user',{user:userdata.data}) 
       }      
     })
    .catch(err=>{
        res.send(err)
    })
}

exports.update_prouduct=(req,res)=>{
  axios.get('http://localhost:3000/products',{params:{id:req.query.id}})
    .then(function(productdata){
      if(req.session.authorized){
       res.setHeader("Cache-Control", "no-cache,no-store");
       res.render('updateProduct',{products:productdata.data}) 
      }      
    })
   .catch(err=>{
       res.send(err)
   })
}