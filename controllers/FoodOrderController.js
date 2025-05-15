import FoodOrder from "../Models/FoodOrderModel"


const createOrder = async (req, res) => {
  try {
    const {
      userPhoneNumber,
      restaurantId,
      itemIds,
      userAddress,
      offerUsed,
      platformFee,
      paymentDetails,
      specialInstructions,
    } = req.body;


    const currentISTTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const orderTime = new Date(currentISTTime);

    // Calculate discountAmount
    const discountAmount = Math.min(
      (offerUsed.itemTotal * offerUsed.discountPercentage) / 100,
      offerUsed.upto
    );

    // Calculate final subtotal
    const subtotal = offerUsed.itemTotal - discountAmount + platformFee;

    // Create order object
    const newOrder = new FoodOrder({
      userPhoneNumber,
      restaurantId,
      itemIds,
      userAddress,
      offerUsed,
      receipt: {
        itemTotal: offerUsed.itemTotal,
        discountAmount,
        platformFee,
        subtotal,
      },
      paymentDetails,
      time: orderTime, 
      status: "Pending",
      specialInstructions,
    });

    const savedOrder = await FoodOrder.save();

    return res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};