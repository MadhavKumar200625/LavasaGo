import mongoose from "mongoose";


const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },

  phoneNumber: { type: String, required: true },

  description:{type:String,required:true},
  
  image: { type: String, required: true },

  location: { type: String, required: true }, 

  ratings: {
    ratingNumber: { type: Number, default: 0.0 }, 
    ratedBy: { type: Number, default: 0 },
  },

  pureVeg: { type: Boolean, default: false },

  timing: {
    openTime: { type: String, required: true }, 
    closeTime: { type: String, required: true }, 
  },

  open: { type: Boolean, default: true },

  discount: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    code:{type:String,required:true},
    minOrderValue: { type: Number, required: true }, 
    discountPercentage: { type: Number, required: true }, 
    upto: { type: Number, required: true }, 
  }],

  menu: [
    {
      category: { type: String, required: true },
      items: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          description: { type: String },
          isAvailable: { type: Boolean, default: true },
          foodType: { 
            type: String, 
            enum: ["Veg", "Non-Veg", "Egg"], 
            required: true 
          },
          image: { type: String }, 
          serves: { type: String }, //"Serves 2"
        },
      ],
    },
  ],

})

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

export default Restaurant;