import { useEffect,useState } from "react";
import { useSelector } from "react-redux";
import {Table,Modal, Button} from "flowbite-react"
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";
import {log } from "../../assets";



const Employees = () => {

    const { currentUser } = useSelector((state) => state.user);
    const [users, setUsers] = useState([]);
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState('');

    console.log ("users",users)
    useEffect(() => {
        
        const fetchUsers= async() =>{
     try {
        
        const res = await fetch ('/api/user/getemployees')
        const data = await res.json()
        if (res.ok ){
            setUsers(data.users);
            if (data.users.length < 9){
                setShowMore(false)
             }

     } 
    }
     
     catch (error) {
        console.log(error.message)
        
     }

        };
        if (currentUser.isAdmin){
             fetchUsers();
           
        }
    }, [currentUser._id]);

    

const handelShowMore= async() => {

    const startIndex = users.length;

    try {
            
            const res = await fetch (`/api/user/getusers?startIndex=${startIndex}`)
            const data = await res.json()
            if (res.ok ){
                setUsers((prev) => [...prev, ...data.users]);
                if (data.users.length < 9){
                    setShowMore(false)
                }
    
            }


        } 
        
        catch (error) {
            console.log(error.message)
            
        }


};
const handelDeleteUser= async() => {
    setShowModal(false);
    try{
        const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
            method: 'DELETE',
            
        });
        const data = await res.json();
        if (res.ok){
            console.log(data.message)
        }
        else
        {
            setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
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
          }}>
            {currentUser.isAdmin && users.length > 0? (
                <>
                 <div className=" border border-fuchsia-900 rounded-lg overflow-hidde ">
                <Table hoverable className = 'shadow-md' >
                    
                    <Table.Head style={{
                                backgroundImage: `url(${log})`,
                              
                                }}>
                        <Table.HeadCell className="text-fuchsia-800" style={{
                                backgroundImage: `url(${log})`,
                              
                                }}> Date  created </Table.HeadCell>
                        <Table.HeadCell  className="text-fuchsia-800" style={{
                                backgroundImage: `url(${log})`,
                              
                                }}> User  Image</Table.HeadCell>
                        <Table.HeadCell  className="text-fuchsia-800" style={{
                                backgroundImage: `url(${log})`,
                              
                                }}> Username</Table.HeadCell>
                        <Table.HeadCell  className="text-fuchsia-800" style={{
                                backgroundImage: `url(${log})`,
                              
                                }}> Email</Table.HeadCell>
                        <Table.HeadCell  className="text-fuchsia-800" style={{
                                backgroundImage: `url(${log})`,
                              
                                }}> Admin </Table.HeadCell>
                       <Table.HeadCell  className="text-fuchsia-800" style={{
                                backgroundImage: `url(${log})`,
                              
                                }}> Delete</Table.HeadCell>
            
                    </Table.Head>
                    {users.map((user) => (
                        <Table.Body key={user._id}>
                            <Table.Row className=" dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50" >
                                <Table.Cell  className="text-fuchsia-800">
                                     { new Date (user.createdAt).toLocaleDateString()}
                                </Table.Cell>
                                <Table.Cell>
                                    
                                    <img src={user.profilePicture} 
                                    alt={user.username}
                                     className="md:h-10 md:w-10 w-6 h-6 object-cover  rounded-full
                                     bg-gray-500"/>
                                
                                </Table.Cell>
                                <Table.Cell  className="text-fuchsia-800">
                                    
                                    {user.username}
                                </Table.Cell >
                                <Table.Cell  className="text-fuchsia-800">
                                    {user.email}
                                </Table.Cell>
                                <Table.Cell  className="text-fuchsia-800">
                                    {user.role}
                                </Table.Cell>
                                <Table.Cell  className="text-fuchsia-800">
                                    <span  onClick={() => {
                                    setShowModal(true);
                                    setUserIdToDelete(user._id);


                                    }}
                                     className="font-medium text-red-500 hover:underline cursor-pointer"> Delete
                                    </span>

                                </Table.Cell>
                            

                            </Table.Row>
                            

                        </Table.Body>
                    ))

                    
}

                </Table>
                </div>
                {showMore && (
                                <button className="bg-fuchsia-800  hover:bg-fuchsia text-white p-2 w-full rounded-lg mt-1"
                                onClick={handelShowMore}>
                                    Show More
                                </button>)
                                }
                    </>
                
            ):(
                <p>
                    No users found

                    </p>
                )}

        <Modal show={showModal} onClose={()=> setShowModal(false)}  popup size='md'>
          <Modal.Header/>
          <Modal.Body>
            <div  className=" flex  flex-col justify-center items-center">
              <HiOutlineExclamationCircle className="text-red-500 text-[50px]"/>
              <p className="text-red-600"> Are you shure you want to delete this user?
                
              </p>  
              <div className="flex flex-row  mx-4  md:space-x-20 space-x-4 mt-2">
                <Button onClick={handelDeleteUser} color='failure' >yes,I'm sure</Button>
                <Button onClick={()=> setShowModal(false)} >No, cancel</Button>



              </div>

            </div>
          </Modal.Body>
            


          </Modal>

            </div>

    )
}



export default Employees