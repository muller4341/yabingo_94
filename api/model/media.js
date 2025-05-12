import mongoose from 'mongoose';

const media = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post', // assumes you have a Task model
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // assumes you have a User model
    required: true
  },
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
  
},
  slug: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  isUploaded: {
    type: Boolean,
    default: true
},
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
});

export default mongoose.model('Media', media);
