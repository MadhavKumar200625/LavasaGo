import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userPhoneNumber: { type: String, required: true },

  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },

  itemIds: [{ type: mongoose.Schema.Types.ObjectId, required: true }],

  userAddress: { type: String, required: true },

  offerUsed: {
    discountPercentage: { type: Number, required: true },
    upto: { type: Number, required: true },
    itemTotal: { type: Number, required: true }, 
  },

  receipt: {
    itemTotal: { type: Number, required: true },
    discountAmount: { type: Number },
    platformFee: { type: Number }, 
    subtotal: { type: Number, required: true },
  },

  paymentDetails: {
    orderId: { type: String, required: true },
    paymentId: { type: String },
    signature: { type: String },
    status: { type: String, enum: ["Pending", "Paid", "Failed", "Refunded"], default: "Pending" },
  },

  time: { type: Date, required: true }, 

  status: {
    type: String,
    enum: ["Pending", "Preparing", "Out for Delivery", "Delivered"],
    default: "Pending",
  },

  specialInstructions: { type: String },
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;