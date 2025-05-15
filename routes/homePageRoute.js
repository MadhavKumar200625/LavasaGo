import express from "express";
import {getHomePageContent , createHomePageData} from "../controllers/homePageController.js";

const router = express.Router();


router.route("/get-home-page-content").get(getHomePageContent);
router.route("/post-home-page-content").post(createHomePageData);


export default router;