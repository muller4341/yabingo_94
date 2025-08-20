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
  password: {
  type: String,
  required: true,
},
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
 
  location: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
   default: "/images/pp.png",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },

  packages: {
    type: Number,
    default: 10, // Default package value
  },


  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
