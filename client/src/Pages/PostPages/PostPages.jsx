import { set } from "mongoose";
import { useEffect, useState } from "react"; 
import { useParams } from "react-router-dom";
import { Button, Spinner } from 'flowbite-react'
import {log } from "../../assets";
import { Link } from "react-router-dom";
import { Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CallToAction from "./CallToAction";
import CommentSection from "./CommentSection";
import PostCard from "./PostCard";

const PostPages = () => {
    const [showModal, setShowModal] = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState('');
    const currentUser = useSelector((state) => state.user.currentUser);
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState(null);
    const { postSlug } = useParams();
    const [error, setError] = useState(false);
    const [recentPosts, setRecentPosts] = useState(null); 
    const navigate = useNavigate();
   
   


    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
                const data = await res.json();
                if (!res.ok) {
                    console.log(data.message);
                    return;
                }
               if (res.ok) {
                   setPost(data.posts[0]);
                   setLoading(false);
                   setError(false);
                   return
               }
            } catch (error) {
               
                setError(true);
                setLoading(false);
            }
        };

        fetchPost();
    }
    , [postSlug]);
    useEffect(() => {
        try {
            const fetchRecentPosts = async () => {

                const res = await fetch('/api/post/getposts?limit=3');  
                const data = await res.json();
                if (res.ok) {
                    setRecentPosts(data.posts);
                    
            }
                
            }
            fetchRecentPosts();
            
        } catch (error) {
            console.log(error);
            
        }
    }, []);
    if(loading) 
        return (
            <div className="flex items-center justify-center h-screen">
            <Spinner size="xl" />
          </div>
        );

        const handelDeletePost = async() => {

            setShowModal(false);

            try{
                const res = await fetch(`/api/post/deletepost/${postIdToDelete}/${currentUser._id}`, {
                    method: 'DELETE',
                    
                });
                const data = await res.json();
                if (res.ok){
                     navigate('/dashboard?tab=posts');
                    console.log(data.message)
                    
                }
                else
                {
                    console.log(data.message)
                }
        
            }
            catch (error) {
                console.log(error.message)
        
        
        }
        };
    return(
    <div className="container mx-auto px-4 py-20 flex  justify-center gap-4 flex-col"
    style={{
        backgroundImage: `url(${log})`, // Path to the image
        backgroundSize: 'cover', // Makes the image cover the entire element
        backgroundPosition: 'center', // Centers the image
        height: '100vh', // Make the container take up the full height of the screen
        width: '100%', // Full width of the screen
      }}>

            
            <p className="text-fuchsia-800 font-bold ml-80">{post && post.category}</p>
            
            <div className="flex justify-center">
    <div className="content-container w-3/4 md:w-2/3 h-auto object-cover my-4 border border-fuchsia-800 rounded-lg justify-center items-center flex bg-white">
        <div className="text-content text-fuchsia-800" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
</div>
            
             <div className="flex justify-between   border-slate-500 border-fuchsia-800">
                <span className="text-fuchsia-800 ml-80">
                    {post && new Date(post.createdAt).toLocaleDateString()} 
                </span>
                <div className="flex gap-2">
                    <div className="flex gap-2 mr-60">

                <button className="bg-fuchsia-800 text-white px-4 py-2  w-20 h-10 rounded-lg hover:bg-fuchsia-900 transition duration-300 ease-in-out">
                <Link className='text-teal-500   'to="/dashboard?tab=posts">
                                    <span> Save</span>
                                    </Link></button>
                                    <button className="bg-fuchsia-800 text-white px-4 py-2  w-20 h-10 rounded-lg hover:bg-fuchsia-900 transition duration-300 ease-in-out">
                <Link className='text-teal-500   'to={`/update-post/${post._id}`}>
                                    <span> Edit</span>
                                    </Link></button>
                    <button className="bg-fuchsia-800  w-20 h-10   text-white px-4 py-2 rounded-lg hover:bg-fuchsia-900 transition duration-300 ease-in-out">
                    <span  onClick={() => {
                                    setShowModal(true);
                                    setPostIdToDelete(post._id);


                                    }}
                                     className="font-medium text-red-500 "> Delete
                                    </span></button>
                            </div>
                </div>
                
             </div>
             

             {/* <div className="max-w-4x1 mx-auto w-full">
                <CallToAction />
             </div>
         */}
         <Modal show={showModal} onClose={()=> setShowModal(false)}  popup size='md'>
                   <Modal.Header/>
                   <Modal.Body>
                     <div  className=" flex  flex-col justify-center items-center">
                       <HiOutlineExclamationCircle className="text-red-500 text-[50px]"/>
                       <p className="text-red-600"> Are you shure you want to delete this post?
                         
                       </p>  
                       <div className="flex flex-row  mx-4  md:space-x-20 space-x-4 mt-2">
                         <Button onClick={handelDeletePost} color='failure' >yes,I'm sure</Button>
                         <Button onClick={()=> setShowModal(false)} >No, cancel</Button>
         
         
         
                       </div>
         
                     </div>
                   </Modal.Body>
                     
         
         
                   </Modal>
                
            
    </div>
    );
 

    
};

export default PostPages;