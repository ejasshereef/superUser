const mongoose=require('mongoose')

let categorySchema=new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: {
          validator: function (name) {
            return this.constructor.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } })
              .then((category) => !category); // Return true if no category is found with case-insensitive match
          },
          message: 'Category name must be unique and case-sensitive',
        },
      },
    
})

const Categorydb=mongoose.model('categorydb',categorySchema)

module.exports=Categorydb