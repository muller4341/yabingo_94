import { useEffect,useState } from "react";
import { useSelector } from "react-redux";
import {Table,Modal, Button} from "flowbite-react"
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";
import {log } from "../../assets";



const Users = () => {

    const { currentUser } = useSelector((state) => state.user);
    const [users, setUsers] = useState([]);
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState('');
    const [filterName, setFilterName] = useState('');
const [filterRole, setFilterRole] = useState('');
const [filterDate, setFilterDate] = useState('');
const [filterPhone, setFilterPhone] = useState('');
const [filterEmail, setFilterEmail] = useState('');
const [dateFilterType, setDateFilterType] = useState(''); // 'recent' or 'previous'
const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

    console.log ("users",users)
    useEffect(() => {
        
        const fetchUsers= async() =>{
     try {
        
        const res = await fetch ('/api/user/getemployees')
        const data = await res.json()
        if (res.ok ){
            setUsers(data.users);
            if (data.users.length < 6){
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
            
            const res = await fetch (`/api/user/getemployees?startIndex=${startIndex}`)
            const data = await res.json()
            if (res.ok ){
                setUsers((prev) => [...prev, ...data.users]);
                if (data.users.length < 6){
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
        dark:scrollbar-thumb-slate-500 w-full h-auto "
       >
            {currentUser.isAdmin && users.length > 0? (
                <>
                 <div className=" border border-gray-50  rounded-lg overflow-hidde  shadow-lg">
                {(filterName || filterDate || filterRole || dateFilterType || sortOrder !== 'asc') && (
  <button
    onClick={() => {
      setFilterName('');
      setFilterPhone('');
      setFilterEmail('');
      setFilterDate('');
      setFilterRole('');
      setDateFilterType('');
      setSortOrder('asc');
    }}
    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
  >
    Clear Filters
  </button>
)}
<div className="rounded-lg border border-gray-200">
  {/* Sticky header outside scrollable div */}
  <Table className="w-full">
    <Table.Head className="bg-white sticky top-0 z-10">
      <Table.HeadCell className="text-fuchsia-800">
        <div className="flex flex-row items-center justify-center gap-2">
          <p>Date Created</p>
          <select
            value={dateFilterType}
            onChange={(e) => setDateFilterType(e.target.value)}
            className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm w-2 h-4"
          >
            <option value="recent">Recent</option>
            <option value="previous">Previous</option>
          </select>
        </div>
        <div className="mt-2 flex justify-center">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="p-2 border rounded-md w-28"
          />
        </div>
      </Table.HeadCell>

      <Table.HeadCell className="text-fuchsia-800">User Image</Table.HeadCell>

      <Table.HeadCell className="text-fuchsia-800">
        <div className="flex flex-row items-center justify-center gap-2">
          <p>user name</p>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border rounded-sm w-2 h-4 border-slate-50 bg-slate-50"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
        <div className="mt-2 flex justify-center">
          <input
            type="text"
            placeholder="Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="p-2 border rounded-md w-28 placeholder-fuchsia-800"
          />
        </div>
      </Table.HeadCell>

      <Table.HeadCell className="text-fuchsia-800">Phone Number</Table.HeadCell>
      <Table.HeadCell className="text-fuchsia-800">Email</Table.HeadCell>

      <Table.HeadCell className="text-fuchsia-800 flex flex-col items-center gap-2">
        Role
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="p-2 border rounded-md w-28"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="finance">Finance</option>
          <option value="marketing">Marketing</option>
          <option value="dispatcher">Dispatcher</option>
        </select>
      </Table.HeadCell>

      <Table.HeadCell className="text-fuchsia-800">Delete</Table.HeadCell>
    </Table.Head>
  </Table>

  {/* Scrollable table body */}
  <div className="overflow-y-auto max-h-[500px]">
    <Table className="w-full shadow-lg">
      <Table.Body>
        {users
          .filter((user) => {
            const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
            const matchesName = fullName.includes(filterName.toLowerCase());
            const matchesRole = filterRole ? user.role === filterRole : true;
            const createdAtDate = new Date(user.createdAt);
            const today = new Date();
            let matchesDateType = true;
            if (dateFilterType === "recent") {
              const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
              matchesDateType = createdAtDate >= sevenDaysAgo;
            } else if (dateFilterType === "previous") {
              const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
              matchesDateType = createdAtDate < sevenDaysAgo;
            }
            return matchesName && matchesRole && matchesDateType;
          })
          .sort((a, b) => {
            const nameA = `${a.firstname} ${a.lastname}`.toLowerCase();
            const nameB = `${b.firstname} ${b.lastname}`.toLowerCase();
            return sortOrder === "asc"
              ? nameA.localeCompare(nameB)
              : nameB.localeCompare(nameA);
          })
          .map((user) => (
            <Table.Row
              key={user._id}
              className="dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50"
            >
              <Table.Cell className="text-fuchsia-800">
                {new Date(user.createdAt).toLocaleDateString()}
              </Table.Cell>
              <Table.Cell>
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="md:h-10 md:w-10 w-6 h-6 object-cover rounded-full bg-gray-500"
                />
              </Table.Cell>
              <Table.Cell className="text-fuchsia-800">
                {user.firstname} {user.lastname}
              </Table.Cell>
              <Table.Cell className="text-fuchsia-800">
                {user.phoneNumber}
              </Table.Cell>
              <Table.Cell className="text-fuchsia-800">
                {user.email}
              </Table.Cell>
              <Table.Cell className="text-fuchsia-800">{user.role}</Table.Cell>
              <Table.Cell className="text-fuchsia-800">
                <span
                  onClick={() => {
                    setShowModal(true);
                    setUserIdToDelete(user._id);
                  }}
                  className="font-medium text-red-500 hover:underline cursor-pointer"
                >
                  Delete
                </span>
              </Table.Cell>
            </Table.Row>
          ))}
      </Table.Body>
    </Table>
  </div>
</div>

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



export default Users