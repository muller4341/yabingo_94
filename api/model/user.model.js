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
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: 
    { type: Boolean, 
    default: false 
}, 
    verificationToken: 
    { type: String
        
    }, // Token for verificatio
    profilePicture: {
        type: String,
        default:'/images/pp.png',
      //  default: 'https://media.istockphoto.com/id/1027708676/vector/man-avatar-icon-man-flat-icon-man-faceless-avatar-man-character-businessman-avatar-icon.jpg?s=612x612&w=0&k=20&c=PRBua8vvZ6lSvG7oe0fHrvQ-1nkGpixbwymm8CiHpqI=',
    }, 
    
    isAdmin: {
        type: Boolean,
        default: false
    },

    luckyNumber: { 
        type: Number,
         unique: true },

     taskFinalStatus: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
          },

},


  
{timestamps: true}
);

const User = mongoose.model('User', userSchema);
export default User;