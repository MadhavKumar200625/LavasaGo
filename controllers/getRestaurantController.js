import mongoose from "mongoose";
import Restaurant from "../Models/RestaurantSchema.js";
import Fuse from "fuse.js";




const getTopDiscountRestaurant = async(req,res)=>{
    try {
        // getting the restaurant with highest percentage
        const restaurantWithMostDiscount = await Restaurant.find()
          .sort({ "discount.discountPercentage": -1 }) //sort from highest to lowest
          .limit(8) // Limit top 8
          .select("name ratings.ratingNumber ratings.ratedBy discount.discountPercentage discount.upto");//to get seclected details
    
        
    
        res.status(200).json({
          message: "Restaurant with the highest discount fetched successfully",
          data: restaurantWithMostDiscount[0],
        });
      } catch (error) {
        console.error("Error fetching the restaurant with the highest discount:", error);
        res.status(500).json({
          message: "An error occurred while fetching the restaurant",
          error: error.message,
        });
      }
    

}



const searchRestaurants = async (req, res) => {
  try {
    const { query, foodType, minPrice, maxPrice, isAvailable, openOnly } = req.query;

    if (!query) {
        return res.status(400).json({ message: "Search query is required." });
    }

    // Fetch all restaurants
    let restaurants = await Restaurant.find().lean();

    // Fuse.js Search Configuration
    const options = {
        keys: [
            { name: "name", weight: 1 },
            { name: "menu.category", weight: 0.3 },
            { name: "menu.items.name", weight: 0.2 },
            { name: "description", weight: 0.4 },

        ],
        threshold: 0.5,
        includeScore: true
    };

    const fuse = new Fuse(restaurants, options);
    let results = fuse.search(query).map(result => result.item);

    // Apply Filters
    if (foodType) {
        results = results.filter(res =>
            res.menu.some(category =>
                category.items.some(item => item.foodType === foodType)
            )
        );
    }

    if (minPrice || maxPrice) {
        results = results.filter(res =>
            res.menu.some(category =>
                category.items.some(item => 
                    (!minPrice || item.price >= parseInt(minPrice)) &&
                    (!maxPrice || item.price <= parseInt(maxPrice))
                )
            )
        );
    }

    if (isAvailable) {
        results = results.filter(res =>
            res.menu.some(category =>
                category.items.some(item => item.isAvailable === (isAvailable === "true"))
            )
        );
    }

    if (openOnly === "true") {
        results = results.filter(res => res.open);
    }

    // Sort by Ratings (Highest First)
    results.sort((a, b) => b.ratings.ratingNumber - a.ratings.ratingNumber);

    const filteredResults = results.map(res => {
        // Find the best discount
        const bestDiscount = res.discount.length > 0 
            ? res.discount.reduce((best, current) => {
                return (current.discountPercentage > best.discountPercentage || 
                       (current.discountPercentage === best.discountPercentage && current.upto > best.upto)) 
                       ? current : best;
            })
            : null;
    
        return {
            _id: res._id,
            name: res.name,
            description: res.description,
            image: res.image,
            ratingNumber: res.ratings.ratingNumber,  
            ratedBy: res.ratings.ratedBy, 
            discountPercentage: bestDiscount ? bestDiscount.discountPercentage : null,
            upto: bestDiscount ? bestDiscount.upto : null,
            code: bestDiscount ? bestDiscount.code : null
        };
    });

    res.status(200).json(filteredResults);
} catch (error) {
    console.error("Error in searchRestaurants:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
}
}

const getRestaurant = async (req, res) => {
    try {
        const { id, foodType, minPrice, maxPrice, isAvailable } = req.query;

        if (!id) {
            return res.status(400).json({ message: "Restaurant ID is required." });
        }

        const restaurant = await Restaurant.findOne({ _id: id }).lean();

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Extract best offers (Top 2 Discounts)
        const bestOffers = restaurant.discount
            .sort((a, b) => b.discountPercentage - a.discountPercentage || b.upto - a.upto)
            .slice(0, 2)
            .map(({ code, upto, discountPercentage, minOrderValue }) => ({
                code,
                upto,
                discountPercentage,
                minOrderValue
            }));

        // Format and filter the menu
        const formattedMenu = restaurant.menu
            .map(category => ({
                _id:category._id,
                category: category.category,  // Keep category name
                items: category.items
                    .filter(item => 
                        (!foodType || item.foodType === foodType) &&
                        (!minPrice || item.price >= parseInt(minPrice)) &&
                        (!maxPrice || item.price <= parseInt(maxPrice)) &&
                        (!isAvailable || item.isAvailable === (isAvailable === true))
                    )
                    .map(({ _id, name, price, description, image, isAvailable, foodType, serves }) => ({
                        name,
                        price,
                        description,
                        image,
                        isAvailable,
                        foodType,
                        serves,
                        _id
                    }))
            }))
            .filter(category => category.items.length > 0);  // Remove empty categories

        const restaurantData = {
            _id:restaurant._id,
            name: restaurant.name,
            location: restaurant.location,
            description: restaurant.description,
            ratingNumber: restaurant.ratings.ratingNumber,
            ratedBy: restaurant.ratings.ratedBy,
            bestOffers,
            menu: formattedMenu
        };

        res.status(200).json(restaurantData);
    } catch (error) {
        console.error("Error fetching restaurant:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const searchFoodItems = async (req, res) => {
    try {
      const { restaurantId } = req.params; 
      const { query } = req.query;
  
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
  
      // Find the restaurant by ID and only get the menu
      const restaurant = await Restaurant.findOne({_id:restaurantId}, { menu: 1 });
  
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      let items = [];
  
      // Extract all items from the restaurant's menu
      restaurant.menu.forEach((category) => {
        category.items.forEach((item) => {
          items.push({
            ...item.toObject(),
            category: category.category, 
          });
        });
      });
  
      // Fuse.js options
      const options = {
        keys: ["name", "description", "category"], // Prioritizing name, then description, then category
        threshold: 0.3, // Lower = stricter matching
        distance: 100, // Maximum distance for fuzzy matching
      };
  
      const fuse = new Fuse(items, options);
      const results = fuse.search(query).map((result) => result.item);
  
      res.status(200).json( results );
    } catch (error) {
      console.error("Error searching food items:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
};

export {getTopDiscountRestaurant,searchRestaurants,getRestaurant,searchFoodItems}