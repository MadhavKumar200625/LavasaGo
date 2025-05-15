import HomePageModel from "../Models/homePageModel.js";
import Restaurant from "../Models/RestaurantSchema.js";
import moment from "moment-timezone";


const getHomePageContent = async(req,res)=>{
    try {
        // getting the restaurant with highest percentage

        const topDiscountRestaurants = await Restaurant.aggregate([
          { $unwind: "$discount" }, // Split discount array into separate documents
          { $sort: { "discount.discountPercentage": -1 } }, // Sort by discountPercentage descending
          {
            $group: {
              _id: "$_id", // Group by restaurant ID,
              name: { $first: "$name" },
              description: { $first: "$description" }, 
              image: { $first: "$image" },
              ratingNumber: { $first: "$ratings.ratingNumber" },
              ratedBy: { $first: "$ratings.ratedBy" },
              discountPercentage: { $first: "$discount.discountPercentage" },
              upto: { $first: "$discount.upto" },
            },
          },
          { $sort: { discountPercentage: -1 } }, // Sort by discount percentage again after grouping
          { $limit: 8 }, // Limit to top 8 restaurants
        ]);

        const date = moment().tz("Asia/Kolkata").format("DD-MM-YY").toString();
      
        const homePage = await HomePageModel.findOne({date}).select("topBanner banners")

        
    
        // returns
        res.status(200).json({
            banners:homePage.banners,
            topBanner : homePage.topBanner,
            topDiscountRestaurant: topDiscountRestaurants,
        });
      } catch (error) {
        console.error("Error fetching the restaurant with the highest discount:", error);
        res.status(500).json({
          message: "An error occurred while fetching the restaurant",
          error: error.message,
        });
      }
}


const createHomePageData = async (req, res) => {
  try {
    const { topBanner, banners , date } = req.body;

   
    const aldreadyPresent = await HomePageModel.find({date:date})

    if(aldreadyPresent.length != 0){
      
      return res.status(409).json({success:false,message:"Aldready Present"})
    }


  
    //creating the document
    const newHomePageData = new HomePageModel({
      date: date,
      topBanner: {
        heading: topBanner.heading,
        description: topBanner.description,
        leftImage: topBanner.leftImage,
        rightImage: topBanner.rightImage,
        buttonText: topBanner.buttonText,
      },
      banners,
    });

    // saving the data
    const savedData = await newHomePageData.save();


    // returns
    res.status(201).json({
      success:true,
      message: "HomePage data created successfully",
      
    });
  } catch (error) {
    console.error("Error creating HomePage data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {getHomePageContent , createHomePageData}