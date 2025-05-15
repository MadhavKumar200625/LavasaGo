import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },

  phoneNumber: { type: String, required: true , unique:true},

  address: [{
    street: { type: String, required: false },
    houseNo: {type:String , required: false}
  }],

  christStudent: { type: Boolean, default: false },
  

  foodCart: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant.menu.items"},
      restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant"},
      quantity: { type: Number, default: 1 }, 
    },
  ],
  

});


const User = mongoose.model("User", UserSchema);

export default User;