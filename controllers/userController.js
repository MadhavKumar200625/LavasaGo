import User from "../Models/UserSchema.js";
import Twilio from "twilio/lib/rest/Twilio.js";
import Dotenv from "dotenv"

Dotenv.config()

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const checkRegister = async(req,res)=>{
  
  try{
    const {phoneNumber} = req.query
    
    const user = await User.findOne({phoneNumber:phoneNumber})

    if(user){
      return res.json({
        success:true,
        message:"login"
      })
    }

    return res.json({
      success:true,
      message:"register"
    })

  }
  catch(error){
    return res.status(500).json({
      success:false,
      message:error.message
    })
  }
}


const sendOtp = async(req,res)=>{
        
        // extract data from the query
        const {phoneNumber} = req.query


        await client.verify.v2.services(process.env.TWILIO_SERVICE_ID)
          .verifications
          .create({to: ("+91"+phoneNumber), channel: 'sms'})
          .then(verifiaction=>{
            res.status(200).json({success:true,message:"Sent"})
          } 
          ).catch(err=>{
            res.status(500).json({success:false,message:"not Sent"})
          })

}


const verifyOtp = async(phoneNumber,otp)=>{

  try{

    

    const verification_check = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
        .verificationChecks
        .create({ to: ("+91"+phoneNumber), code: otp });


      return verification_check.status === 'approved'

  }

  catch(error){
    return false
  }
}


const registerUser = async(req,res)=>{
  try{
    const {phoneNumber,otp,name,christStudent} = req.body;

    if(!verifyOtp(phoneNumber,otp)){
      return res.json({success:false,message:"Wrong Otp"})
    }

    const user = new User({name:name,phoneNumber,christStudent})

    await user.save()

    return res.status(201).json({success:true,message:"registered"})


  }
  catch(error){
    return res.status(500).json({success:false , message:error.message})
  }


}

const loginUser = async(req,res)=>{
  try{
    const {phoneNumber,otp} = req.body;

    if(!verifyOtp(phoneNumber,otp)){
      return res.json({success:false,message:"Wrong Otp"})
    }



    return res.status(200).json({success:true,message:"logged"})


  }
  catch(error){
    return res.status(500).json({success:false , message:error.message})
  }

}


const addAddress = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { street, houseNo } = req.body;

    if (!street || !houseNo) {
      return res.status(400).json({ success: false,message: "Street and house number are required" });
    }

    const user = await User.findOne({phoneNumber:phoneNumber});
    if (!user) {
      return res.status(404).json({success: false, message: "User not found" });
    }

    user.address.push({ street, houseNo });
    await user.save();

    res.status(200).json({ success: true, message:"Added" });
  } catch (error) {
    res.status(500).json({success: false, message: "Internal server error" });
    console.log(error)
  }
};




export{ loginUser , sendOtp, registerUser , checkRegister , addAddress }