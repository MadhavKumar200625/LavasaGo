import express from "express";
import { addRestaurant , addCategories , addItem } from "../controllers/postRestaurantController.js";

const router = express.Router()

router.route("/addrestaurant").post(addRestaurant)
router.route("/addCategories").post(addCategories)
router.route("/addItem").post(addItem)


export default router