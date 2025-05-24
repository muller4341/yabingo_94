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
  firstname: {
    type: String,
    
  },
  lastname: {
    type: String,
  
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
      "gust",
      "distributor",
      "customer",
      "admin",
      "finance",
      "marketing",
      "production",
      "cashier",
      "dispatcher"
    ],
    default: "gust",
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
   url: {
    type: String,
  },
  approval:{
    type:String,
     enum: ["pending", "accepted", "rejected"],
     default:"pending",
  }

}, { timestamps: true });

const Distributor = mongoose.model("Distributor", distributorSchema);
export default Distributor;