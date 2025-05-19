import { useEffect,useState } from "react";
import { useSelector } from "react-redux";
import {Table,Modal, Button} from "flowbite-react"
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";
import {log } from "../../assets";
import Distributor from "../../../../api/model/distributor";



const Distributors= () => {

    const { currentUser } = useSelector((state) => state.user);
    const [users, setUsers] = useState([]);
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState('');
    const [filterName, setFilterName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDateDropdown, setShowDateDropdown] = useState(false);
const [showSortDropdown, setShowSortDropdown] = useState(false);

 const [rowsPerPage, setRowsPerPage] = useState(5);

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

const filteredSortedUsers = users
  .filter((user) => {
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
    const matchesName = fullName.includes(filterName.toLowerCase());
    const matchesPhone = filterPhone ? user.phoneNumber.includes(filterPhone) : true;
    const matchesEmail = filterEmail ? user.email.toLowerCase().includes(filterEmail.toLowerCase()) : true;
    const matchesRole = filterRole ? user.role === filterRole : true;

    const createdAtDate = new Date(user.createdAt);
    const today = new Date();
    let matchesDateType = true;
    if (dateFilterType === "recent") {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      matchesDateType = createdAtDate >= sevenDaysAgo;
    } else if (dateFilterType === "previous") {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      matchesDateType = createdAtDate < sevenDaysAgo;
    }

    return matchesName && matchesPhone && matchesEmail && matchesRole && matchesDateType;
  })
  .sort((a, b) => {
    const nameA = `${a.firstname} ${a.lastname}`.toLowerCase();
    const nameB = `${b.firstname} ${b.lastname}`.toLowerCase();
    return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

const totalPages = Math.ceil(filteredSortedUsers.length / rowsPerPage);
const paginatedUsers = filteredSortedUsers.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);



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
<div className="rounded-lg border border-gray-200 overflow-y-auto max-h-[500px]">
  {/* Sticky header table */}
  <Table className="w-full table-auto border border-collapse">
    <Table.Head className="bg-white sticky top-0 z-10">
      <Table.HeadCell className="w-48 text-fuchsia-800 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-row items-center justify-center gap-2">
            <p>Date Created</p>
            <div className="relative">
  <button
    onClick={() => setShowDateDropdown((prev) => !prev)}
    className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm"
    title="Filter by Date"
  >
    ⏱️
  </button>

  {showDateDropdown && (
    <div className="absolute z-20 bg-white border border-gray-200 rounded shadow mt-1 w-24">
      <button
        onClick={() => {
          setDateFilterType("recent");
          setShowDateDropdown(false);
        }}
        className={`block w-full text-left px-2 py-1 hover:bg-gray-100 ${dateFilterType === "recent" ? "bg-gray-100 font-semibold" : ""}`}
      >
        ⬆️Recent
      </button>  
      <button
        onClick={() => {
          setDateFilterType("previous");
          setShowDateDropdown(false);
        }}
        className={`block w-full text-left px-2 py-1 hover:bg-gray-100 ${dateFilterType === "previous" ? "bg-gray-100 font-semibold" : ""}`}
      >
        ⬇️Previous
      </button>
    </div>
  )}
</div>


          </div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="p-2 border rounded-md w-28 h-8"
          />
        </div>
      </Table.HeadCell>

      <Table.HeadCell className="w-48 text-fuchsia-800 text-center">User Image</Table.HeadCell>

      <Table.HeadCell className="w-48 text-fuchsia-800 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-row items-center justify-center gap-2">
            <p>User Name</p>
           <div className="relative">
  <button
    onClick={() => setShowSortDropdown((prev) => !prev)}
    className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm"
    title="Sort Order"
  >
    🔽
  </button>

  {showSortDropdown && (
    <div className="absolute z-20 bg-white border border-gray-200 rounded shadow mt-1 w-24">
      <button
        onClick={() => {
          setSortOrder("asc");
          setShowSortDropdown(false);
        }}
        className={`block w-full text-left px-2 py-1 hover:bg-gray-100 ${sortOrder === "asc" ? "bg-gray-100 font-semibold" : ""}`}
      >
        ⬆️Ascending
      </button>
      <button
        onClick={() => {
          setSortOrder("desc");
          setShowSortDropdown(false);
        }}
        className={`block w-full text-left px-2 py-1 hover:bg-gray-100 ${sortOrder === "desc" ? "bg-gray-100 font-semibold" : ""}`}
      >
       ⬇️Descending
      </button>
    </div>
  )}
</div>

          </div>
          <input
            type="text"
            placeholder="Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="p-2 border rounded-md w-28 h-8 placeholder-fuchsia-800"
          />
        </div>
      </Table.HeadCell>

      <Table.HeadCell className="w-48 text-fuchsia-800 text-center">Phone Number</Table.HeadCell>
      <Table.HeadCell className="w-48 text-fuchsia-800 text-center">Email</Table.HeadCell>
       <Table.HeadCell className="w-48 text-fuchsia-800 text-center">Email</Table.HeadCell>
        <Table.HeadCell className="w-48 text-fuchsia-800 text-center">Email</Table.HeadCell>
         <Table.HeadCell className="w-48 text-fuchsia-800 text-center">Email</Table.HeadCell>
          <Table.HeadCell className="w-48 text-fuchsia-800 text-center">Email</Table.HeadCell>

      <Table.HeadCell className="w-48 text-fuchsia-800 text-center">
        <div className="flex flex-col items-center gap-2">
          <p>Role</p>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="p-1 border rounded-md w-28 h-8 text-[12px] items-center justify-center"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="finance">Finance</option>
            <option value="marketing">Marketing</option>
            <option value="dispatcher">Dispatcher</option>
          </select>
        </div>
      </Table.HeadCell>

      <Table.HeadCell className="w-48 text-fuchsia-800 text-center">Delete</Table.HeadCell>
    </Table.Head>
  </Table>

  {/* Scrollable table body */}
  <div className="overflow-y-auto max-h-[500px]">
    <Table className="w-full table-fixed">
      <Table.Body>
        {paginatedUsers.map((user) => (
          <Table.Row key={user._id} className="dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50">
            <Table.Cell className="w-48 text-center text-fuchsia-800 ">
              {new Date(user.createdAt).toLocaleDateString()}
            </Table.Cell>
            <Table.Cell className="w-48 text-center ">
              <img
                src={user.profilePicture}
                alt={user.username}
                className="md:h-10 md:w-10 w-6 h-6 object-cover rounded-full bg-gray-500 mx-auto"
              />
            </Table.Cell>
            <Table.Cell className="w-48 text-center text-fuchsia-800 ">
              {user.firstname} {user.lastname}
            </Table.Cell>
             <Table.Cell className="w-48 text-center text-fuchsia-800 ">
              {user.firstname} {user.lastname}
            </Table.Cell>
             <Table.Cell className="w-48 text-center text-fuchsia-800 ">
              {user.firstname} {user.lastname}
            </Table.Cell>
             <Table.Cell className="w-48 text-center text-fuchsia-800 ">
              {user.firstname} {user.lastname}
            </Table.Cell>
            
            <Table.Cell className="w-48 text-center text-fuchsia-800 ">
              {user.phoneNumber}
            </Table.Cell>
            <Table.Cell className="w-48 text-center text-fuchsia-800">{user.email}</Table.Cell>
            <Table.Cell className="w-48 text-center text-fuchsia-800">{user.role}</Table.Cell>
            <Table.Cell className="w-48 text-center text-fuchsia-800">
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
              <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4">
  {/* Rows per page selector */}
  <div className="flex items-center gap-2">
    <label className="text-sm text-fuchsia-800">Rows per page:</label>
    <select
      value={rowsPerPage}
      onChange={(e) => {
        setRowsPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Reset to first page
      }}
      className="p-1 border rounded-md"
    >
      {[5, 10, 20, 50].map((size) => (
        <option key={size} value={size}>{size}</option>
      ))}
    </select>
  </div>

  {/* Pagination buttons */}
  <div className="flex items-center gap-2">
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 border rounded-md disabled:opacity-50 text-fuchsia-800"
    >
      Prev
    </button>

   {/* Page Input */}
    <div className="flex items-center gap-1">
      
      <input
        type="number"
        min={1}
        max={totalPages}
        value={currentPage}
        onChange={(e) => {
          let val = parseInt(e.target.value);
          if (!isNaN(val)) {
            // Clamp value between 1 and totalPages
            val = Math.max(1, Math.min(val, totalPages));
            setCurrentPage(val);
          }
        }}
        className="w-16 px-2 py-1 border rounded-md text-center text-fuchsia-800"
      />
      <span className="text-sm text-gray-600">/ {totalPages}</span>
    </div>

    <button
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 border rounded-md disabled:opacity-50 text-fuchsia-800"
    >
      Next
    </button>
  </div>
</div>

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



export default Distributors