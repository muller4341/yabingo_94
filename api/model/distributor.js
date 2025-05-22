import mongoose from "mongoose";

const distributorSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  tinnumber: {
    type: String,
    unique: true,
  },
  companyname: {
    type: String,    
  },
  
  merchantId: {
    type: String,
    unique: true,
  },
  licensenumber: {
    type: String,
    unique: true,
  },
  
  licenseexipiration: {
    type: String,
    unique: true,
  },
  region: {
    type: String,
  },
 zone: {
    type: String,
  },
  profilePicture: {
    type: String,
   default: "/images/pp.png",
  },
  role: {
    type: String,
    enum: [
      
      "distributor",
      
    ],
    default: "distributor",
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
   url: {
    type: String,
    required: true
  },
  approval:{
    type:String,
     enum: ["pending", "approved", "rejected"],
     dafault:"pending",
  }

}, { timestamps: true });

const Distributor = mongoose.model("Distributor", distributorSchema);
export default Distributor;