import Comment from '../model/comment.js';

const createComment = async (req, res, next) => {
    try {
        const { postId , content, userId} = req.body;
        console.log('postId:', postId);
        console.log('content:', content);
        console.log('req.user.id:', req.user.id);
        console.log('userId:', userId);
        if(userId!== req.user.id) {
            res.status(401).json({ message: 'you are not allowed to comment ' });
            return;
        }
        const newComment = new Comment({
            postId,
            userId,
            content,
        });
        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const getPostComments = async (req, res, next) => {
    try {
        const comments= await Comment.find({postId: req.params.postId}).sort({createdAt: -1});
        res.status(200).json(comments);
    
    }
    catch (error) {
        next(error);
    }

}
const likeComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if(!comment) {
    
                res.status(404).json({ message: 'Comment not found' });
                return;
        }
        
        const userIndex = comment.likes.indexOf(req.user.id);
        if(userIndex === -1) {
            comment.numberOfLikes+=1;
            comment.likes.push(req.user.id);
        } else {
            comment.numberOfLikes-=1;
            comment.likes.splice(userIndex,1);
        }
     await comment.save(); 
        res.status(200).json(comment);
    
    } catch (error) {
        next(error);
        
    }
}

const editComment= async(req,res, next) =>  {
    try {
        const comment= await Comment.findById(req.params.commentId);
        if (!comment)
            {
return next(errorHandler(404, "comment not found "));
 

            }
if (comment.userId!==req.user.id &&!req.user.isAdmin){
return next(errorHandler(403, "you are not allowed to edit this comment ")

)


}
const editedComment=await Comment.findByIdAndUpdate(
req.params.commentId,
{
content:req.body.content,

},
{new:true}


);
res.status(200).json(editedComment);



        
    } catch (error) {
        next(error);
        
    }

    }
    const getComments= async(req,res, next) =>  {
        if (!req.user.isAdmin){
            return next(errorHandler(403, "you are not allowed to get all comments ")
            
            )
            
            }
        try {
            const startIndex = parseInt(req.query.startIndex) || 0;
            const limit = parseInt(req.query.limit) || 9;
            const sortDiraction = req.query.sortDiraction || 'desc'? -1 : 1;

            const comments= await Comment.find()
            .sort({createdAt: sortDiraction})
            .skip(startIndex)
            .limit(limit);
            const totalComments= await Comment.countDocuments();
            const now = new Date();
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth()-1, now.getDate());
            const lastMonthComments= await Comment.countDocuments({createdAt: {$gte: oneMonthAgo}});
            res.status(200).json(
                {comments,
                 totalComments,
                  lastMonthComments});

    
        } catch (error) {
            next(error);

        }

    }


 

    const deleteComment= async(req,res, next) =>  {
        try {
            const comment= await Comment.findById(req.params.commentId);
            if (!comment)
                {
    return next(errorHandler(404, "comment not found "));
     
    
                }
    if (comment.userId!==req.user.id &&!req.user.isAdmin){
    return next(errorHandler(403, "you are not allowed to delete this comment ")
    
    )
    
    
    }
    await Comment.findByIdAndDelete(req.params.commentId);


    res.status(200).json({message:"comment deleted successfully"});
    
            }
        catch (error) {
            next(error);

        }
        
            }






export default {createComment, getPostComments, likeComment, editComment, deleteComment, getComments}; 