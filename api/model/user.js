import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
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
  isAdmin: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: [
      "guest",
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
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
