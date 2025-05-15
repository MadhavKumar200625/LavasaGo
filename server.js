import express from "express";
import dotevn from "dotenv";
import mongoose from "mongoose"
import authentication from "./middlewares/authentication.js"
import restaurantRouter from "./routes/restaurantRoute.js"
import userRouter from "./routes/userRoute.js"
import homePageRoute from "./routes/homePageRoute.js"
import getRestaurantRoute from "./routes/getRestaurantsRoute.js";
import cartRoute from "./routes/cartRoutes.js";


const app = express();
dotevn.config()
app.use(express.json())

app.get("/",(req,res)=>{
    res.json({"health":"ok"})
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

app.use(authentication);

app.use("/user", userRouter);

app.use("/restaurant",restaurantRouter);

app.use("/home-page",homePageRoute)

app.use("/get-restaurant",getRestaurantRoute)

app.use("/cart",cartRoute)

const port = process.env.PORT || 3000;


app.listen(port);
