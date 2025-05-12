import { Link } from "react-router-dom";
import CallToAction from "../PostPages/CallToAction";
import PostCard from "../PostPages/PostCard";
import { useEffect } from "react";
import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import cement from "../../assets"
import mtr from "../../assets";
const Home = () => {
  const[posts, setPosts]= useState([]);
  const [isFirstSentence, setIsFirstSentence] = useState(true);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/post/getposts");
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchPosts();
  }
  , []);
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFirstSentence((prev) => !prev);
    }, 4000); // Switch every 2 seconds (adjust timing as needed)
    return () => clearInterval(interval);
  }, []);

  
  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };


  return (
    <div  className="">
      <div className=" flex  flex-1 flex-col lg:flex-row  h-auto  mx-auto py-8  " 
      style={{ justifyContent:'center', alignItems:'center', gap:'10px'}}>
      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto h-auto">
      
      {/* <p className="text-gray-500 text-xs sm:text-sm">
        Here you will find different posts of photos and other things that can make the right thing.
      </p> */}
      <Link to="/search" className="text-teal-500 text-xs sm:text-sm font-bold hover:underline w-auto">
        View Posts
      </Link>
    </div>
    <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}
     className="border-2 b   dark:border-gray-700 rounded-md shadow-md
     w-11/12 md:w-1/2 mx-auto p-1/2
     h-64
     "
     >

    <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19602.978615082473!2d37.554594947747916!3d10.441818548668303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164fc14effb982a9%3A0x4d3c3ac7f781bac5!2sAmanuel%20Town!5e0!3m2!1sen!2set!4v1737253946368!5m2!1sen!2set"
        width="100%" 
        height="full" 
        style={{ border: "0", maxWidth: "800px" }}
        allowfullscreen="" 
        loading="lazy" 
        referrerpolicy="no-referrer-when-downgrade">
    </iframe>
</div>
      </div>
      {/* <div className="p-3 bg-amber-100 dark:bg-sate-700"> d
        <CallToAction/>

      </div> */}
      <div className="max-w-6x1 mx-auto p-3 flex flex-col gap-8 py-7">

        {posts&& posts.length>0 &&(
         <div className=" flex flex-col gap-6">
          <h2 className="text-2x1 font-semibold"> Recent Posts</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />

            ))}
            </div>
            <Link to="/search" className="text-teal-500 text-xs sm:text-sm font-bold hover:underline  w-auto">
            View all posts
            </Link>
          </div>

        )}
      </div>
       

    </div>
  );
}

export default Home;

