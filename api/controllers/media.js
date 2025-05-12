// controllers/mediaController.js
import Media from '../model/media.js';
import Post from '../model/postModel.js'; 
import User from '../model/user.model.js';

// @desc    Upload media info to MongoDB
// @route   POST /api/media/upload
// @access  Public (can be secured later)
const uploadMedia = async (req, res) => {
  try {
    const { postId, userId, url, type } = req.body;
    // Step 1: Find the post to get the slug
    const post = await Post.findById(postId);
    const user = await User.findById(userId);
    if (!post) return res.status(404).json({ message: 'Post not found' });


    if (!postId || !userId || !url || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
       // Check if the user owns the post
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized user' });
    }

    }

    const newMedia = new Media({
      postId,
      userId,
      firstname: user.firstname,
      lastname: user.lastname,
      phoneNumber: user.phoneNumber,

      slug: post.slug,
      url,
      type
    });

    await newMedia.save();

    res.status(201).json({
      message: 'Media uploaded successfully',
      media: newMedia
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserUploadedSlugs = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }

    const media = await Media.find({ userId });

    const uploadedSlugs = media.map((item) => item.slug);

    res.status(200).json(uploadedSlugs);
  } catch (error) {
    console.error('Error fetching user slugs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Get media by task ID
// @route   GET /api/media/task/:taskId
// @access  Public (can be secured)
// const getMediaByTask = async (req, res) => {
//   try {
//     const { postId } = req.params;
//     const { userId } = req.query;
    
    

//     if (!userId) {
 
//       return res.status(400).json({ message: 'Missing userId' });
//     }
//     onst post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ message: 'Post not found' });

//     if (post.userId.toString() !== userId) {
//       return res.status(403).json({ message: 'Unauthorized user' });
//     }
//     const media = await Media.find({ postId });
    

//     res.status(200).json({ media });
//   } catch (error) {
//     console.error('Error fetching media:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


export { uploadMedia, getUserUploadedSlugs};
