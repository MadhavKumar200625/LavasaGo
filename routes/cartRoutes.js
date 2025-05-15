import { getCheckoutData } from "../controllers/checkOutController.js";
import express from "express";

const router = express.Router();


router.route("/get-checkout-data").post(getCheckoutData);








export default router