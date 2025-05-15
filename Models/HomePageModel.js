import mongoose from "mongoose";


const homePageSchema = new mongoose.Schema({
    date:{type:String , required:true},
    topBanner:{
        heading:{type:String},
        description:{type:String},
        leftImage:{type:String},
        rightImage:{type:String},
        buttonText :{type:String,default:"ORDER NOW"}
    },
    banners:[{type:String}]
})


const HomePage = mongoose.model("HomePage",homePageSchema)


export default HomePage