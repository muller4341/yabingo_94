import { errorHandler } from "../utils/error.js";
import Post from "../model/postModel.js";

const createPost = async (req, res, next) => {
  const { category, content } = req.body;
 
  console.log("admin of post", req.user.isAdmin)
  console.log("req.user", req.user)
  
  if(!req.user.isAdmin) {
    return next(errorHandler(403, 'you are not allowed to create a post'));
  }
  if (!category||!content) {
    return next(errorHandler(400, 'body and task category are required'));

  }
  // Normalize category value
  
  
 // Check for duplicate
 const existingTask = await Post.findOne({ category: category });
 if (existingTask) {
   return next(errorHandler(400, 'The task already exists. Please delete it before publishing again.'));
 }

  const slug = req.body.category.toLowerCase().replace(/[^a-zA-Z0-9-]/g, '').split('/\s+/').join('-');
  const newPost = new Post({
    ... req.body,
    slug,
    userId: req.user.id,
  });
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error (slug or category conflict)
      return next(errorHandler(400, 'The task already exists. Please delete it before publishing again.'));
    }
    next(error);
  }  
}

 const getPosts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    const posts = await Post.find({
     ...(req.query.userId &&{ userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && { 
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ]
       }),
    })
    .sort({ updatedAt: sortDirection })
    .skip(startIndex)
    .limit(limit);
    const totalPosts = await Post.countDocuments(); 
    const now = new Date();
    const oneMonthAgo= new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    });

    res.status(200).json({ 
      posts, 
      totalPosts, 
      lastMonthPosts });

  }
  
  catch (error) {
    next(error);
  }
};
const deletePost = async (req, res, next) => {
  if (!req.user.isAdmin || req.params.userId !== req.user.id) {
    return next(errorHandler(403, 'you are not allowed to delete a post'));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json('post has been deleted');
  } catch (error) {
    next(error);
  }
}

const updatePost = async (req, res, next) => {
  const {category, content}  = req.body;
  const { postId } = req.params;

  if (!req.user.isAdmin || req.params.userId !== req.user.id) {
    return next(errorHandler(403, 'you are not allowed to update a post'));

  }
   
 
  try {
     
     const currentPost = await Post.findById(postId);
    if (!currentPost) {
      return next(errorHandler(404, 'Post not found.'));
    }

    // Case 1: If the category (task number) is being changed, check if the new category exists
    if (category && category !== currentPost.category) {
      const existingTask = await Post.findOne({ category: category });
      if (existingTask) {
        return next(errorHandler(400, 'The task number already exists. Please choose a different number.'));
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      { $set:{
  content:content ,
  category:category,

      } },
      { new: true }
    );
    res.status(200).json(updatedPost);
  }
  catch (error) {
    next(error);
  }
}

export { createPost, getPosts, deletePost , updatePost,  };

