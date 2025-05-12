import { useEffect,useState } from "react";
import { useSelector } from "react-redux";
import {Table,Modal, Button} from "flowbite-react"
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import {log } from "../../assets";



const DashPosts = () => {

    const { currentUser } = useSelector((state) => state.user);
    const [userPosts, setUserPosts] = useState([]);
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState('');
    const [post, setPost] = useState(null);

    console.log ("userposts", userPosts)
    useEffect(() => {
        
        const fetchPosts = async() =>{
     try {
        
        const res = await fetch (`/api/post/getposts?userId=${currentUser._id}`)
        const data = await res.json()
        if (res.ok ){
            setUserPosts(data.posts)
            if (data.posts.length < 9){
                setShowMore(false)
             }

     } 
    }
     
     catch (error) {
        console.log(error.message)
        
     }

        };
        if (currentUser.isAdmin){
             fetchPosts();
           
        }
    }, [currentUser._id]);

const handelShowMore= async() => {

    const startIndex = userPosts.length;

    try {
            
            const res = await fetch (`/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`)
            const data = await res.json()
            if (res.ok ){
                setUserPosts((prev) => [...prev, ...data.posts]);
                if (data.posts.length < 9){
                    setShowMore(false)
                }
    
            }


        } 
        
        catch (error) {
            console.log(error.message)
            
        }


};
const handelDeletePost = async() => {
    setShowModal(false);
    try{
        const res = await fetch(`/api/post/deletepost/${postIdToDelete}/${currentUser._id}`, {
            method: 'DELETE',
            
        });
        const data = await res.json();
        if (res.ok){
            setUserPosts((prev) => prev.filter((post) => post._id !== postIdToDelete));
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




    return (


        <div className="table-auto overflow-x-scroll md:mx-auto p-3  scrollbar
        scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700
        dark:scrollbar-thumb-slate-500"
         style={{
                backgroundImage: `url(${log})`, // Path to the image
                backgroundSize: 'cover', // Makes the image cover the entire element
                backgroundPosition: 'center', // Centers the image
                height: 'auto', // Make the container take up the full height of the screen
                width: '100%', // Full width of the screen
              }}
       >
            {currentUser.isAdmin && userPosts.length >0? (
                <>
                <div className=" border border-fuchsia-900 rounded-lg overflow-hidde ">
                <Table hoverable className = 'shadow-md  '
                
                style={{
                backgroundImage: `url(${log})`,
              
                }}
                >
                    <Table.Head>
                        <Table.HeadCell className="text-fuchsia-800 font-bold" style={{
                backgroundImage: `url(${log})`
                }}>Updated Date</Table.HeadCell>
                       
                        <Table.HeadCell className="text-fuchsia-800 font-bold" style={{
                backgroundImage: `url(${log})`
                }}> Category </Table.HeadCell>
                       <Table.HeadCell className="text-fuchsia-800 font-bold" style={{
                backgroundImage: `url(${log})`
                }}> Delete</Table.HeadCell>
                       <Table.HeadCell className="text-fuchsia-800 font-bold" style={{
                backgroundImage: `url(${log})`
                }}> 
                         Edit
                       </Table.HeadCell>
                    </Table.Head>
                    {userPosts.map((post) => (
                        <Table.Body className="divide-y" style={{
                            backgroundImage: `url(${log})`
                            }}>
                            <Table.Row className="hover:bg-gray-100"  >
                                <Table.Cell  className="text-fuchsia-800 font-semibold" >
                                     { new Date (post.updatedAt).toLocaleDateString()}
                                </Table.Cell>
                                
                                
                                <Table.Cell className="" >
                                <Link to={`/post/${post.slug}`}>
                                    <button className="h-10 w-20 
                                     bg-fuchsia-800 hover:bg-fuchsia-900 text-white font-bold py-2 px-4 rounded-lg">
                                        {post.category}
                                            </button>
                                    </Link>
                                </Table.Cell>
                                <Table.Cell className="">
                                <button className="h-10 w-20 
                                     bg-fuchsia-800 hover:bg-fuchsia-900  font-bold py-2 px-4 rounded-lg" >
                                        
                                          
                                    <span  onClick={() => {
                                    setShowModal(true);
                                    setPostIdToDelete(post._id);


                                    }}
                                     className="font-medium text-red-500 " > Delete
                                    </span>
                                    </button>

                                </Table.Cell>
                                <Table.Cell  className="">
                                <button className="h-10 w-20 
                                bg-fuchsia-800 hover:bg-fuchsia-900  font-bold py-2 px-4 rounded-lg" >

                                    <Link className='text-teal-500   'to={`/update-post/${post._id}`}>
                                    <span> Edit</span>
                                    </Link>
                                    </button>
                                </Table.Cell>

                            </Table.Row>
                            

                        </Table.Body>
                    ))

                    
}

                </Table>
                </div>
                
                {showMore && (
                                <button className="bg-fuchsia-800 hover:bg-fuchsia-900 text-white p-2 w-full rounded-lg mt-1"
                                onClick={handelShowMore}>
                                    Show More
                                </button>)
                                }
                    </>
                
            ):(
                <p className="text-fuchsia-800 font-semibold">
                   No task found

                    </p>
                )}

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

    )
}



export default DashPosts
