import express from "express";
import {searchRestaurants,getRestaurant , searchFoodItems} from "../controllers/getRestaurantController.js"


const router = express.Router();


router.route("/search-restaurants").get(searchRestaurants)
router.route("/restaurant").get(getRestaurant)
router.route("/search-for-items/:restaurantId").get(searchFoodItems)



export default router