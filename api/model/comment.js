import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    postId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    likes: {
        type: Array,
        default: [],
    },
    numberOfLikes: {
        type: Number,
        default: 0,
    },

    

    }
, {timestamps: true});

const Comment = mongoose.model("Comment", CommentSchema);

export default Comment;

