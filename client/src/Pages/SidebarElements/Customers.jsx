import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, Modal, Button,Spinner} from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle, HiSearch } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";
import { log } from "../../assets";

const Customers= () => {
  const { currentUser } = useSelector((state) => state.user);
  const [customers, setCustomers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [filterName, setFilterName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [filterZone, setFilterZone] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [dateFilterType, setDateFilterType] = useState(""); // 'recent' or 'previous'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  console.log("customers", customers);
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/distributor/getcustomers");
        const data = await res.json();
        if (res.ok) {
          setCustomers(data.customers);
          if (data.customers.length < 6) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
      finally{
        setLoading(false);
      }
    };
    if (currentUser?.role === "admin" || currentUser?.role === "marketing") {
      fetchCustomers();
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
        setCustomers((prev) => prev.filter((user) => user._id !== userIdToDelete));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const filteredSortedCustomers = customers
    .filter((customer) => {
      const fullName = `${customer.firstname} ${customer.lastname}`.toLowerCase();
      const matchesName = fullName.includes(filterName.toLowerCase());
      const matchesPhone = filterPhone
        ? customer.phoneNumber.includes(filterPhone)
        : true;
      const matchesRegion = filterRegion
        ? customer.region.toLowerCase().includes(filterRegion.toLowerCase())
        : true;
      const matchesZone = filterZone ? customer.zone === filterZone : true;

      return matchesName && matchesPhone && matchesRegion && matchesZone;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      if (dateFilterType === "recent") {
        return dateB - dateA; // Most recent first
      } else if (dateFilterType === "previous") {
        return dateA - dateB; // Oldest first
      } else {
        // Default sorting by name if no date filter is selected
        const nameA = `${a.firstname} ${a.lastname}`.toLowerCase();
        const nameB = `${b.firstname} ${b.lastname}`.toLowerCase();
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
    });

  const totalPages = Math.ceil(filteredSortedCustomers.length / rowsPerPage);
  const paginatedUsers = filteredSortedCustomers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300
     dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500 w-full h-auto gap-2">
      {(currentUser?.role === "admin" || currentUser?.role === "marketing") && customers.length > 0 ? (
        <>
          <h1 className="text-2xl font-bold mb-4 text-start">
            Customers List
          </h1>
          <div className="mb-4 flex flex-wrap gap-8 items-center ">
            <div className="flex items-center gap-2">
              <select
                value={dateFilterType}
                onChange={(e) => setDateFilterType(e.target.value)}
                className="p-2 border rounded-md w-48"
              >
                <option value="">All Dates</option>
                <option value="recent">Most Recent First</option>
                <option value="previous">Oldest First</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <HiSearch className="absolute left-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="p-2 pl-10 border rounded-md w-48"
              />
            </div>
            <div className="flex items-center gap-2 relative">
              <HiSearch className="absolute left-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search by phone..."
                value={filterPhone}
                onChange={(e) => setFilterPhone(e.target.value)}
                className="p-2 pl-10 border rounded-md w-48"
              />
            </div>
            <div className="flex items-center gap-2 relative">
              <HiSearch className="absolute left-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search by region..."
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="p-2 pl-10 border rounded-md w-48"
              />
            </div>
            
            
            {(filterName || filterDate || dateFilterType || sortOrder !== "asc") && (
              <button
                onClick={() => {
                  setFilterName("");
                  setFilterPhone("");
                  setFilterRegion("");
                  setFilterDate("");
                  setFilterZone("");
                  setDateFilterType("");
                  setSortOrder("asc");
                }}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <Table.Head>
                  <Table.HeadCell className="text-center border-b border-gray-200 capitalize">
                    Date Created
                  </Table.HeadCell>
                  <Table.HeadCell className="text-center border-b border-gray-200 capitalize">
                    Profile
                  </Table.HeadCell>
                  <Table.HeadCell className="text-center border-b border-gray-200 capitalize">
                    Name
                  </Table.HeadCell>
                  <Table.HeadCell className="text-center border-b border-gray-200 capitalize">
                    Phone
                  </Table.HeadCell>
                  <Table.HeadCell className="text-center border-b border-gray-200 capitalize">
                    Region
                  </Table.HeadCell>
                  <Table.HeadCell className="text-center border-b border-gray-200 capitalize">
                    Zone
                  </Table.HeadCell>
                  {currentUser?.role === "admin" && (
                  <Table.HeadCell className="text-center border-b border-gray-200 capitalize">
                    Actions
                  </Table.HeadCell>
                  )}
                </Table.Head>
                <Table.Body>
                  {paginatedUsers.map((customer) => (
                    <Table.Row key={customer._id} className="hover:bg-gray-50">
                      <Table.Cell className="text-center border-b border-gray-200">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell className="text-center border-b border-gray-200">
                        <img
                          src={customer.profilePicture}
                          alt={customer.firstname}
                          className="w-10 h-10 rounded-full mx-auto"
                        />
                      </Table.Cell>
                      <Table.Cell className="text-center border-b border-gray-200">
                        {customer.firstname} {customer.lastname}
                      </Table.Cell>
                      <Table.Cell className="text-center border-b border-gray-200">
                        {customer.phoneNumber}
                      </Table.Cell>
                      <Table.Cell className="text-center border-b border-gray-200">
                        {customer.region}
                      </Table.Cell>
                      <Table.Cell className="text-center border-b border-gray-200">
                        {customer.zone}
                      </Table.Cell>
                      {currentUser?.role === "admin" && (
                      <Table.Cell className="text-center border-b border-gray-200">
                        <span
                          onClick={() => {
                            setShowModal(true);
                            setUserIdToDelete(customer._id);
                          }}
                          className="font-medium text-red-500 hover:underline cursor-pointer"
                        >
                          Delete
                        </span>
                      </Table.Cell>
                      )}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full justify-center h-[500px] flex items-center">
          <Spinner className="animate-spin fill-fuchsia-800 text-gray-100 w-10 h-10"/>
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

export default Customers;
