import { loginUser,checkRegister,sendOtp,registerUser, addAddress } from "../controllers/userController.js";
import express from "express";

const router = express.Router();


router.route("/login-user").post(loginUser);
router.route("/register-user").post(registerUser);


router.route("/check-register").get(checkRegister);
router.route("/send-otp").get(sendOtp);

router.route("/:phoneNumber/address").post(addAddress);

export default router