import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, Modal, Button,Spinner } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";

const RejectedDistributors = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [distributors, setDistributors] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [showCompanySortDropdown, setShowCompanySortDropdown] = useState(false);
  const [showMerchantSortDropdown, setShowMerchantSortDropdown] = useState(false);
  const [showTinSortDropdown, setShowTinSortDropdown] = useState(false);
  const [showLicenseSortDropdown, setShowLicenseSortDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  
  // Filters
  const [filterCompanyName, setFilterCompanyName] = useState("");
  const [filterTin, setFilterTin] = useState("");
  const [filterLicense, setFilterLicense] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterZone, setFilterZone] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterMerchantId, setFilterMerchantId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [dateFilterType, setDateFilterType] = useState("");

  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  console.log("distributors", distributors)

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const res = await fetch("/api/distributor/getdistributors");
        const data = await res.json();
        console.log("Fetched data:", data);

        if (res.ok) {
          setDistributors(data.distributors || data); // handles both array or object
          if ((data.distributors || data)?.length < 6) setShowMore(false);
        }
      } catch (error) {
        console.error("Failed to fetch distributors:", error.message);
      }
    };

    if (currentUser?.role === "admin" || currentUser?.role === "marketing") {
      fetchDistributors();
    }
  }, [currentUser?._id]);

  const filteredSortedDistributors = distributors 
    .filter((distributor) => {
      const nameMatch = distributor.companyname?.toLowerCase().includes(
       filterCompanyName.toLowerCase()
      );
      const zoneMatch = distributor.zone
        ?.toLowerCase()
        .includes(filterZone.toLowerCase());
      const regionMatch = distributor.region
        ?.toLowerCase()
        .includes(filterRegion.toLowerCase());
      const phoneMatch = filterPhone
        ? distributor.phone?.includes(filterPhone)
        : true;
      const tinMatch = filterTin
        ? distributor.tinnumber?.includes(filterTin)
        : true;
      const merchantMatch = filterMerchantId
        ? distributor.merchantId?.includes(filterMerchantId)
        : true;
      const licenseMatch = filterLicense
        ? distributor.licensenumber?.includes(filterLicense)
        : true;
      const statusMatch = filterStatus
        ? distributor.status === filterStatus
        : true;

      const today = new Date();
      const createdAt = new Date(distributor.createdAt || today);
      let dateMatch = true;
      if (dateFilterType === "recent") {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        dateMatch = createdAt >= sevenDaysAgo;
      } else if (dateFilterType === "previous") {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        dateMatch = createdAt < sevenDaysAgo;
      }

      return (
        nameMatch &&
        zoneMatch &&
        regionMatch &&
        phoneMatch &&
        tinMatch &&
        merchantMatch &&
        licenseMatch &&
        statusMatch &&
        dateMatch
      );
    })
    .sort((a, b) => {
      const nameA = a.Companyname?.toLowerCase() || "";
      const nameB = b.Companyname?.toLowerCase() || "";
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

  const totalPages = Math.ceil(filteredSortedDistributors.length / rowsPerPage);
  const paginatedDistributors = filteredSortedDistributors.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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

  return (
     <div className="w-100% p-3 overflow-x-hidden">
      {(currentUser?.role === "admin" || currentUser?.role === "marketing") &&
      distributors.length > 0 ? (
        <>
          <div className="border border-gray-50 rounded-lg overflow-hidden shadow-lg">
            {/* Clear Filters button remains the same */}
            {(filterCompanyName || filterDate || filterTin || filterZone || filterRegion || 
              filterMerchantId || filterLicense || dateFilterType || sortOrder !== "asc") && (
              <button
                onClick={() => {
                  setFilterCompanyName("");
                  setFilterTin("");
                  setFilterZone("");
                  setFilterRegion("");
                  setFilterMerchantId("");
                  setFilterPhone("");
                  setFilterDate("");
                  setDateFilterType("");
                  setSortOrder("asc");
                }}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
              >
                Clear Filters
              </button>
            )}

            {/* Table container with horizontal scrolling */}
            <div className="overflow-x-auto">
              <div className="min-w-[2500px]"> {/* Set minimum width to ensure all columns are visible */}
                <Table className="w-auto">
                 
                  <Table.Head className="bg-white sticky top-0 z-10">
                    {/* Date Created */}
                    <Table.HeadCell className="min-w-[150px] text-fuchsia-800">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <p>Date Created</p>
                          <button
                            onClick={() => setShowDateDropdown((prev) => !prev)}
                            className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm"
                            title="Filter by Date"
                          >
                            ⏱️
                          </button>
                        </div>
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="p-1 border rounded-md w-full h-8"
                        />
                      </div>
                    </Table.HeadCell>

                    {/* Company Name */}
                    <Table.HeadCell className="min-w-[150px] text-fuchsia-800">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <p>Company Name</p>
                          <button
                            onClick={() => setShowCompanySortDropdown((prev) => !prev)}
                            className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm"
                            title="Sort Order"
                          >
                            🔽
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Name"
                          value={filterCompanyName}
                          onChange={(e) => setFilterCompanyName(e.target.value)}
                          className="p-1 border rounded-md w-full h-8 placeholder-fuchsia-800"
                        />
                      </div>
                    </Table.HeadCell>

                    {/* Merchant Id */}
                    <Table.HeadCell className="min-w-[150px] text-fuchsia-800">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <p>Merchant Id</p>
                          <button
                            onClick={() => setShowMerchantSortDropdown((prev) => !prev)}
                            className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm"
                            title="Sort Order"
                          >
                            🔽
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Merchant ID"
                          value={filterMerchantId}
                          onChange={(e) => setFilterMerchantId(e.target.value)}
                          className="p-1 border rounded-md w-full h-8 placeholder-fuchsia-800"
                        />
                      </div>
                    </Table.HeadCell>

                    {/* Tin Number */}
                    <Table.HeadCell className="min-w-[150px] text-fuchsia-800">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <p>Tin Number</p>
                          <button
                            onClick={() => setShowTinSortDropdown((prev) => !prev)}
                            className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm"
                            title="Sort Order"
                          >
                            🔽
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Tin number"
                          value={filterTin}
                          onChange={(e) => setFilterTin(e.target.value)}
                          className="p-1 border rounded-md w-full h-8 placeholder-fuchsia-800"
                        />
                      </div>
                    </Table.HeadCell>

                    {/* License number */}
                    <Table.HeadCell className="min-w-[150px] text-fuchsia-800">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <p>License number</p>
                          <button
                            onClick={() => setShowLicenseSortDropdown((prev) => !prev)}
                            className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm"
                            title="Sort Order"
                          >
                            🔽
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="License No"
                          value={filterLicense}
                          onChange={(e) => setFilterLicense(e.target.value)}
                          className="p-1 border rounded-md w-full h-8 placeholder-fuchsia-800"
                        />
                      </div>
                    </Table.HeadCell>

                    {/* Phone Number */}
                    <Table.HeadCell className="min-w-[150px] text-fuchsia-800">
                      Phone Number
                    </Table.HeadCell>

                    {/* Status */}
                    <Table.HeadCell className="min-w-[150px] text-fuchsia-800">
                      <div className="flex flex-col items-center gap-2">
                        <p>Status</p>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="p-1 border rounded-md w-full h-8 text-sm"
                        >
                          <option value="">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </Table.HeadCell>

                    {/* Region */}
                    <Table.HeadCell className="min-w-[150px] text-fuchsia-800">
                      Region
                    </Table.HeadCell>

                    {/* Zone */}
                    <Table.HeadCell className="min-w-[150px] text-fuchsia-800">
                      Zone
                    </Table.HeadCell>

                    {/* License Expiration Date */}
                    <Table.HeadCell className="min-w-[150px] text-fuchsia-800">
                      <div className="flex flex-col items-center gap-2">
                        <p>License Expiration</p>
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="p-1 border rounded-md w-full h-8"
                        />
                      </div>
                    </Table.HeadCell>

                    {/* Delete */}
                    <Table.HeadCell className="min-w-[150px] text-fuchsia-800">
                      Delete
                    </Table.HeadCell>
                  </Table.Head>
                  
                  
                
                   
                  <Table.Body >
                    {paginatedDistributors.map((distributor) => (
                      <Table.Row key={distributor._id} className="hover:bg-gray-50">
                        <Table.Cell className="min-w-[150px] text-center text-fuchsia-800">
                          {new Date(distributor.createdAt).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center text-fuchsia-800">
                          {distributor.companyname}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center text-fuchsia-800">
                          {distributor.merchantId}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center text-fuchsia-800">
                          {distributor.tinnumber}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center text-fuchsia-800">
                          {distributor.licensenumber}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center text-fuchsia-800">
                          {distributor.phoneNumber}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center text-fuchsia-800">
                          {distributor.status}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center text-fuchsia-800">
                          {distributor.region}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center text-fuchsia-800">
                          {distributor.zone}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center text-fuchsia-800">
                          {distributor.licenseexipiration}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center text-fuchsia-800">
                          <span
                            onClick={() => {
                              setShowModal(true);
                              setUserIdToDelete(distributor._id);
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
   <div className="flex flex-col md:flex-row items-center justify-between  p-4 w-[1350px] ">
  {/* Rows per page selector */}
  <div className="flex items-center gap-2 sticky top-0 left-0 z-10 p-4">
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
  <div className="flex items-center gap-2 sticky top-0 right-0 z-10 p-4">
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 border rounded-md disabled:opacity-50 text-fuchsia-800 w-10"
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
      ) :             (<div className="w-full justify-center  h-[500px] flex items-center">
                    
                    <Spinner className="animate-spin e fill-fuchsia-800 text-gray-100 w-10  h-10"/>
                   <span> Loading...</span>
                   </div>)}

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

export default RejectedDistributors;
