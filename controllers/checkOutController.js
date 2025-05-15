import Restaurant from "../Models/RestaurantSchema.js"
import User from "../Models/UserSchema.js";



const getCheckoutData = async (req, res) => {
  try {
    const { restaurantId, items, userPhoneNumber, offerId } = req.body; // offerId is optional

    // Find user by phone number
    const user = await User.findOne({ phoneNumber: userPhoneNumber });

    // Extract user address if available
    const userAddress = user?.address?.length > 0 
      ? user.address.map(addr => `${addr.street}, ${addr.houseNo}`)
      : [];
    
    const platformFee = 2;

    // Fetch restaurant details
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    let subtotal = 0;
    let totalItems = 0;

    // Get selected items from restaurant menu
    const selectedItems = items
      .map(({ itemId, qty }) => {
        const item = restaurant.menu.flatMap(category => category.items)
          .find(item => item._id.toString() === itemId);

        if (!item) return null;

        subtotal += item.price * qty;
        totalItems += qty;

        return {
          _id: item._id,
          name: item.name,
          description: item.description || "",
          image: item.image || "",
          isAvailable: item.isAvailable,
          price: item.price,
          serves: item.serves || "",
        };
      })
      .filter(Boolean); // Remove null values (invalid items)

    // Get available discounts
    const availableDiscounts = restaurant.discount.map(discount => ({
      _id:discount._id,
      code: discount.code,
      minOrderValue: discount.minOrderValue,
      discountPercentage: discount.discountPercentage,
      upto: discount.upto,
      applicable: subtotal >= discount.minOrderValue,
    }));

    // Apply discount if a valid offerId is provided
    let discountAmount = 0;
    let appliedDiscount = null;

    if (offerId) {
      const discount = restaurant.discount.find(d => d._id.toString() === offerId);

      if (discount && subtotal >= discount.minOrderValue) {
        discountAmount = Math.min(
          (subtotal * discount.discountPercentage) / 100,
          discount.upto
        );

        appliedDiscount = {
          code: discount.code,
          discountPercentage: discount.discountPercentage,
          upto: discount.upto,
        };
      }
    }

    // Calculate final total
    const finalSubtotal = subtotal - discountAmount + platformFee;

    // Receipt object
    const receipt = {
      itemTotal: subtotal,
      discountAmount,
      platformFee,
      subtotal: finalSubtotal,
    };

    // Send response
    res.json({
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      userAddress,
      items: selectedItems,
      offers: availableDiscounts.length > 0 ? availableDiscounts : null,
      appliedDiscount, // Null if no offer applied
      christStudent: user?.christStudent || false,
      receipt, // Added receipt object
      totalItems,
    });

  } catch (error) {
    console.error("Error fetching checkout data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { getCheckoutData };