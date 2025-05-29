import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, Modal, Button, Spinner } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { HiArrowUp, HiArrowDown } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";
import { log } from "../../assets";

const Employees = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [filterName, setFilterName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [filterRole, setFilterRole] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterDate, setFilterDate] = useState(""); // used for exact date match
  const [createdAtSortOrder, setCreatedAtSortOrder] = useState("desc"); // default recent (latest first)

  const [dateFilterType, setDateFilterType] = useState(""); // 'recent' or 'previous'
  const [sortOrder, setSortOrder] = useState(""); // 'asc' or 'desc'

  console.log("users", users);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user/getemployees");
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          if (data.users.length < 6) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser.isAdmin) {
      fetchUsers();
    }
  }, [currentUser._id]);
  const handelDeleteUser = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        console.log(data.message);
      } else {
        setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const filteredSortedUsers = users
    .filter((user) => {
      const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
      const matchesName = fullName.includes(filterName.toLowerCase());
      const matchesPhone = filterPhone
        ? user.phoneNumber.includes(filterPhone)
        : true;
      const matchesRole = filterRole
  ? (() => {
      console.log('User Role:', user.role, 'Filter:', filterRole);
      return user.role.toLowerCase() === filterRole.toLowerCase();
    })()
  : true;



      const createdAtDate = new Date(user.createdAt);
      const matchesExactDate = filterDate
        ? new Date(filterDate).toDateString() === createdAtDate.toDateString()
        : true;

      return matchesName && matchesPhone && matchesRole && matchesExactDate;
    })

    .sort((a, b) => {
      // Sorting logic
      if (sortOrder === "asc") {
        return a.firstname.localeCompare(b.firstname);
      } else if (sortOrder === "desc") {
        return b.firstname.localeCompare(a.firstname);
      }

      // Default to sorting by createdAt
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return createdAtSortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const totalPages = Math.ceil(filteredSortedUsers.length / rowsPerPage);
  const paginatedUsers = filteredSortedUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div
      className="table-auto  md:mx-auto p-3  
         w-full h-auto  shadow-2xl rounded-3xl" 
    >
      {currentUser.isAdmin && users.length > 0 ? (
        <>
          <div className=" border border-gray-50  rounded-lg overflow-hidde  shadow-lg">
            {(filterName ||
              filterDate ||
              filterRole ||
              sortOrder ||
              createdAtSortOrder !== "desc") && (
              <button
                onClick={() => {
                  setFilterName("");
                  setFilterPhone("");
                  setFilterDate("");
                  setFilterRole("");
                  setSortOrder("");
                  setCreatedAtSortOrder("desc"); // Reset to most recent
                }}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
              >
                Clear Filters
              </button>
            )}

            <div className="rounded-lg border border-gray-200 p-4">
              {/* Sticky header table */}
              <Table className="w-full table-fixed">
                <Table.Head className="bg-white sticky top-0 z-10">
                  <Table.HeadCell className="w-48  text-center text-[12px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex flex-row items-center justify-center gap-2">
                        <p className="capitalize text-fuchsia-800 text-[18px]">
                          Date Created
                        </p>
                        <div className="relative">
                          <button
                            onClick={() => setShowDateDropdown((prev) => !prev)}
                            className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm"
                            title="Filter by Date"
                          >
                            <HiArrowUp className="text-[12px]" />
                            <HiArrowDown className="text-[12px]" />
                          </button>

                          {showDateDropdown && (
                            <div className="absolute z-20 bg-white border border-gray-200 rounded shadow mt-1 w-36">
                              <button
                                onClick={() => {
                                  setCreatedAtSortOrder("desc");
                                  setShowDateDropdown(false);
                                }}
                                className={`flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-gray-100 ${
                                  createdAtSortOrder === "desc"
                                    ? "bg-gray-100 font-semibold"
                                    : ""
                                }`}
                              >
                                <HiArrowUp size={16} /> Recent
                              </button>
                              <button
                                onClick={() => {
                                  setCreatedAtSortOrder("asc");
                                  setShowDateDropdown(false);
                                }}
                                className={`flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-gray-100 ${
                                  createdAtSortOrder === "asc"
                                    ? "bg-gray-100 font-semibold"
                                    : ""
                                }`}
                              >
                                <HiArrowDown size={16} /> Previous
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="p-2 border rounded-md w-28 h-10"
                      />
                    </div>
                  </Table.HeadCell>

                  <Table.HeadCell className="w-48 capitalize text-fuchsia-800 text-[18px]">
                    User Image
                  </Table.HeadCell>

                  <Table.HeadCell className="w-48 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex flex-row items-center justify-center gap-2">
                        <p className="capitalize text-fuchsia-800 text-[18px]">
                          User Name
                        </p>
                        <div className="relative">
                          <button
                            onClick={() => setShowSortDropdown((prev) => !prev)}
                            className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm"
                            title="Sort Order"
                          >
                            <HiArrowUp className="text-[12px]" />
                            <HiArrowDown className="text-[12px]" />
                          </button>

                          {showSortDropdown && (
                            <div className="absolute z-20 bg-white border border-gray-200 rounded shadow mt-1 w-24">
                              <button
                                onClick={() => {
                                  setSortOrder("asc");
                                  setShowSortDropdown(false);
                                }}
                                className={` w-full text-left px-2 py-1 hover:bg-gray-100 flex ${
                                  sortOrder === "asc"
                                    ? "bg-gray-100 font-semibold"
                                    : ""
                                }`}
                              >
                                <HiArrowUp size={16} /> Asc
                              </button>
                              <button
                                onClick={() => {
                                  setSortOrder("desc");
                                  setShowSortDropdown(false);
                                }}
                                className={`flex w-full text-left px-2 py-1 hover:bg-gray-100 ${
                                  sortOrder === "desc"
                                    ? "bg-gray-100 font-semibold"
                                    : ""
                                }`}
                              >
                                <HiArrowDown className="text-[12px]" />
                                Des
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
                        className="p-2 border rounded-md w-28 h-10 "
                      />
                    </div>
                  </Table.HeadCell>

                  <Table.HeadCell className="w-48 capitalize text-fuchsia-800 text-[18px]">
                    Phone Number
                  </Table.HeadCell>

                  <Table.HeadCell className="w-48  text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className=" capitalize text-fuchsia-800 text-[18px]">
                        Role
                      </p>
                     <select
  value={filterRole}
  onChange={(e) => setFilterRole(e.target.value)}
  className=" border rounded-md w-28 text-[14px] h-10 "
>
  <option value="">All Roles</option>
  <option value="admin">Admin</option>
  <option value="finance">Finance</option>
  <option value="marketing">Marketing</option>
  <option value="cashier">Cashier</option>
  <option value="dispatcher">Dispatcher</option>
</select>


                    </div>
                  </Table.HeadCell>

                  <Table.HeadCell className="w-48 capitalize text-fuchsia-800 text-[18px]   text-center">
                    Delete
                  </Table.HeadCell>
                </Table.Head>
              </Table>

              {/* Scrollable table body */}
              <div className="overflow-y-auto max-h-[500px]">
                <Table className="w-full table-fixed">
                  <Table.Body>
                    {paginatedUsers.map((user) => (
                      <Table.Row
                        key={user._id}
                        className="dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50"
                      >
                        <Table.Cell className="w-48 text-center capitalize  border-b">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell className="w-48 text-center border-b">
                          <img
                            src={user.profilePicture}
                            alt={user.username}
                            className="md:h-10 md:w-10 w-6 h-6 object-cover rounded-full bg-gray-500 mx-auto"
                          />
                        </Table.Cell>
                        <Table.Cell className="w-48 text-center capitalize border-b">
                          {user.firstname} {user.lastname}
                        </Table.Cell>
                        <Table.Cell className="w-48 text-center capitalize border-b ">
                          {user.phoneNumber}
                        </Table.Cell>
                        <Table.Cell className="w-48 text-center  border-b capitalize">
                          {user.role}
                        </Table.Cell>
                        <Table.Cell className="w-48 text-center  border-b">
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
              <label className="text-sm ">Rows per page:</label>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setCurrentPage(1); // Reset to first page
                }}
                className="p-1 border rounded-md"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50 "
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
                  className="w-16 px-2 py-1 border rounded-md text-center "
                />
                <span className="text-sm text-gray-600">/ {totalPages}</span>
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50 "
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full justify-center  h-[500px] flex items-center">
          <Spinner className="animate-spin e fill-fuchsia-800 text-gray-100 w-10  h-10" />
          <span> Loading...</span>
        </div>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className=" flex  flex-col justify-center items-center">
            <HiOutlineExclamationCircle className="text-red-500 text-[50px]" />
            <p className="text-red-600">
              {" "}
              Are you shure you want to delete this user?
            </p>
            <div className="flex flex-row  mx-4  md:space-x-20 space-x-4 mt-2">
              <Button onClick={handelDeleteUser} color="failure">
                yes,I'm sure
              </Button>
              <Button onClick={() => setShowModal(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Employees;
