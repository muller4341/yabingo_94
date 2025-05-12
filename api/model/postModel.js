import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
       unique: true,
    },
  }, { timestamps: true });
  
const Post = mongoose.model('Post', postSchema);
export default Post;
// Compare this snippet from api/controllers/usercontroller.js: 