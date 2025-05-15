import mongoose from "mongoose";
import Restaurant from "../Models/RestaurantSchema.js";

const addRestaurant = async (req, res) => {
  try {
    const restaurantData = req.body;//getting data

  //  creating new restaurant
    const newRestaurant = new Restaurant(restaurantData);

  //  saving new restaurant
    await newRestaurant.save();

    // returns
    res.status(201).json({
      message: "Restaurant created successfully",
    });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({
      message: "An error occurred while creating the restaurant",
      error: error.message,
    });
  }
};

const addCategories = async (req, res) => {

  try {
    // getting data
    const { restaurantId } = req.body; 
    const { category } = req.body;
// type casting to use find by id
    const id = new mongoose.Types.ObjectId(restaurantId)

    // finding restaurant 
    const restaurant = await Restaurant.findById(id);


    // checking that if the category is aldready there
    const existingCategory = restaurant.menu.find(
      (menuCategory) => menuCategory.category.toLowerCase() === category.toLowerCase()
    );

// returning if category existing
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }
// adding new category
    restaurant.menu.push({ category, items: [] });
// saving the restaurant
    await restaurant.save();
// returns
    res.status(201).json({
      message: "Category added successfully",
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({
      message: "An error occurred while adding the category",
      error: error.message,
    });
  }
};


const addItem = async(req,res)=>{
    try {
      // geting the data
        const { name, price, description, isAvailable, image, cookingInstructions, serves , restaurantId, category} = req.body; 
        const id = new mongoose.Types.ObjectId(restaurantId)
        
        // finding by id
        const restaurant = await Restaurant.findById(id);
    
      //  finding the exact category
        const menuCategory = restaurant.menu.find((menuCat) => menuCat.category === category);
       
    
        
    //  creating the new item
        const newItem = {
          name,
          price,
          description: description || '',
          isAvailable: isAvailable !== undefined ? isAvailable : true,
          image: image || '',
          cookingInstructions: cookingInstructions || '',
          serves: serves || '',
        };
    // adding the item
        menuCategory.items.push(newItem);
    // saving the document
        await restaurant.save();
    // returns
        res.status(201).json({
          message: 'Item added successfully',
        });
      } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({
          message: 'An error occurred while adding the item',
          error: error.message,
        });
      }
}



export { addRestaurant , addCategories , addItem }