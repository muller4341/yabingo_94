import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, Modal, Button, Spinner } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";
import { HiArrowUp, HiArrowDown } from "react-icons/hi";
// or 'company'

const Distributors = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [distributors, setDistributors] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [filterCompanyName, setFilterCompanyName] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterTin, setFilterTin] = useState("");
  const [filterLicense, setFilterLicense] = useState("");
  const [filterZone, setFilterZone] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterMerchantId, setFilterMerchantId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [dateFilterType, setDateFilterType] = useState("");
  const [createdAtSortOrder, setCreatedAtSortOrder] = useState("desc");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState("date");

  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterApproval, setFilterApproval] = useState("accepted");
  const [loading, setLoading] = useState(true);
   const [showNoDataMessage, setShowNoDataMessage] = useState(false);

  console.log("distributors", distributors);

  useEffect(() => {
    // 1) Start the 2s timer immediately
    const timer = setTimeout(() => {
      setShowNoDataMessage(true);
    }, 2000);
    const fetchDistributors = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        // Pass approval filter as query param to backend controller
        const res = await fetch(
          `/api/distributor/getdistributorsbyapproval?approval=${filterApproval}`
        );
        const data = await res.json();
        if (res.ok) {
          setDistributors(data.distributors || data);
        } else {
          alert(data.message || "Failed to fetch distributors");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        alert("Network error while fetching distributors");
      } finally {
        setLoading(false);
      }
    };

    if (["admin"].includes(currentUser?.role)) {
      fetchDistributors();
    }
    // 3) Clean up timer if component unmounts
    return () => clearTimeout(timer);
  }, [currentUser, filterApproval]);


  if (loading) {
    return (
      <div className="w-full justify-center  h-[500px] flex items-center">
        <Spinner className="animate-spin fill-fuchsia-800 text-gray-100 w-10 h-10" />
        <span className="ml-2">Loading…</span>
      </div>
    );
  }

  // After loading completes, if 2s have passed AND there’s no data
  if (!loading && showNoDataMessage && distributors.length === 0) {
    return (
      <div className="w-full justify-center  h-[500px] flex items-center">
        <span>No distributors found</span>
      </div>
    );
  }


  const filteredSortedDistributors = distributors
    .filter((distributor) => {
      const nameMatch = distributor.companyname
        ?.toLowerCase()
        .includes(filterCompanyName.trim().toLowerCase());

      const approvalMatch = filterApproval
        ? distributor.approval === filterApproval
        : true;
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
        ? filterStatus === "active"
          ? distributor.approval === "accepted"
          : distributor.approval !== "accepted"
        : true;

      const createdAtDate = new Date(distributor.createdAt);
      const matchesExactDate = filterDate
        ? new Date(filterDate).toDateString() === createdAtDate.toDateString()
        : true;

      return (
        nameMatch &&
        zoneMatch &&
        regionMatch &&
        phoneMatch &&
        tinMatch &&
        merchantMatch &&
        licenseMatch &&
        statusMatch &&
        approvalMatch &&
        matchesExactDate
      );
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return createdAtSortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "company") {
        const nameA = a.companyname?.toLowerCase() || "";
        const nameB = b.companyname?.toLowerCase() || "";
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else if (sortBy === "tinnumber") {
        const tinA = Number(a.tinnumber) || 0;
        const tinB = Number(b.tinnumber) || 0;
        return sortOrder === "asc" ? tinA - tinB : tinB - tinA;
      } else if (sortBy === "merchantId") {
        const merchantA = Number(a.merchantId) || 0;
        const merchantB = Number(b.merchantId) || 0;
        return sortOrder === "asc"
          ? merchantA - merchantB
          : merchantB - merchantA;
      } else if (sortBy === "licensenumber") {
        const licenseA = Number(a.licensenumber) || 0;
        const licenseB = Number(b.licensenumber) || 0;
        return sortOrder === "asc" ? licenseA - licenseB : licenseB - licenseA;
      }
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

  const handleUpdateApproval = async (userId, action) => {
    try {
      const res = await fetch("/api/distributor/update-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Updated successfully");
        setDistributors((prev) =>
          prev.filter((distributor) => distributor._id !== userId)
        );
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };
  const handleRejectedToAccepted = async (userId, action) => {
    try {
      const res = await fetch("/api/distributor/rejecttoaccepted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Updated successfully");
        setDistributors((prev) =>
          prev.filter((distributor) => distributor._id !== userId)
        );
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="w-100% p-3 overflow-x-hidden">
      {(currentUser?.role === "admin" || currentUser?.role === "marketing") &&
      distributors.length > 0 ? (
        <>
          <div className="border border-gray-50 rounded-lg overflow-hidden shadow-lg">
            {/* Clear Filters button remains the same */}
            {(filterCompanyName ||
              filterDate ||
              filterTin ||
              filterMerchantId ||
              filterLicense ||
              dateFilterType ||
              sortOrder !== "asc" || // default is 'asc', if changed
              createdAtSortOrder !== "desc" ||
              filterPhone ||
              filterZone ||
              filterRegion ||
              filterStatus) && (
              <button
                onClick={() => {
                  setFilterCompanyName("");
                  setFilterTin("");
                  setFilterMerchantId("");
                  setFilterPhone("");
                  setFilterLicense("");
                  setFilterDate("");
                  setDateFilterType("");
                  setFilterZone("");
                  setFilterRegion("");
                  setFilterStatus("");
                  setSortOrder("asc");
                  setCreatedAtSortOrder("desc");
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
              >
                Clear Filters
              </button>
            )}

            {/* Table container with horizontal scrolling */}
            <div className="overflow-x-auto">
              <div className="min-w-[2550px]">
                {" "}
                {/* Set minimum width to ensure all columns are visible */}
                <Table className="w-auto">
                  <Table.Head className="bg-white sticky top-0 z-10">
                    {/* Date Created */}
                    <Table.HeadCell className="min-w-[150px] ">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <p className="capitalize text-fuchsia-800 text-[18px]">
                            Date Created
                          </p>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setShowDateDropdown((prev) => !prev)
                              }
                              className="gap-0 border rounded-sm border-slate-50 bg-slate-50 text-sm"
                              title="Filter by Date"
                            >
                              <HiArrowUp className="text-[12px]" />
                              <HiArrowDown className=" text-[12px]" />
                            </button>
                            {showDateDropdown && (
                              <div className="absolute z-20 bg-white border border-gray-200 rounded shadow mt-1 w-24">
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
                          className="p-1 border rounded-md w-full h-10"
                        />
                      </div>
                    </Table.HeadCell>

                    {/* Company Name */}
                    <Table.HeadCell className="min-w-[150px] ">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <p className="capitalize text-fuchsia-800 text-[18px]">
                            Company Name
                          </p>
                          <button
                            onClick={() => {
                              setSortBy("company");
                              setSortOrder((prev) =>
                                prev === "asc" ? "desc" : "asc"
                              );
                            }}
                            className="gap-0 border rounded-sm border-slate-50 bg-slate-50 text-sm"
                            title="Sort by Company Name"
                          >
                            {sortBy === "company" && sortOrder === "asc" ? (
                              <>
                                <HiArrowUp className="text-[12px]" /> <p>asc</p>
                              </>
                            ) : (
                              <>
                                <p>dsn</p>
                                <HiArrowDown className="text-[12px]" />
                              </>
                            )}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Name"
                          value={filterCompanyName}
                          onChange={(e) => setFilterCompanyName(e.target.value)}
                          className="p-1 border  rounded-md w-full h-10"
                        />
                      </div>
                    </Table.HeadCell>

                    {/* Merchant Id */}
                    <Table.HeadCell className="min-w-[150px] ">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <p className="capitalize text-fuchsia-800 text-[18px]">
                            Merchant Id
                          </p>
                          <button
                            onClick={() => {
                              setSortBy("merchantId");
                              setSortOrder((prev) =>
                                prev === "asc" ? "desc" : "asc"
                              );
                            }}
                            className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm"
                            title="Sort by merchantId"
                          >
                            {sortBy === "merchantId" && sortOrder === "asc" ? (
                              <>
                                <HiArrowUp className="text-[12px]" /> <p>asc</p>
                              </>
                            ) : (
                              <>
                                <p>dsn</p>
                                <HiArrowDown className="text-[12px]" />
                              </>
                            )}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Merchant ID"
                          value={filterMerchantId}
                          onChange={(e) => setFilterMerchantId(e.target.value)}
                          className="p-1 border rounded-md w-full h-10 "
                        />
                      </div>
                    </Table.HeadCell>

                    {/* Tin Number */}
                    <Table.HeadCell className="min-w-[150px] ">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <p className="capitalize text-fuchsia-800 text-[18px]">
                            Tin Number
                          </p>
                          <button
                            onClick={() => {
                              setSortBy("tinnumber");
                              setSortOrder((prev) =>
                                prev === "asc" ? "desc" : "asc"
                              );
                            }}
                            className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm"
                            title="Sort by tinnumber"
                          >
                            {sortBy === "tinnumber" && sortOrder === "asc" ? (
                              <>
                                <HiArrowUp className="text-[12px]" /> <p>asc</p>
                              </>
                            ) : (
                              <>
                                <p>dsn</p>
                                <HiArrowDown className="text-[12px]" />
                              </>
                            )}
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
                    <Table.HeadCell className="min-w-[150px] ">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <p className="capitalize text-fuchsia-800 text-[18px]">
                            License number
                          </p>
                          <button
                            onClick={() => {
                              setSortBy("licensenumber");
                              setSortOrder((prev) =>
                                prev === "asc" ? "desc" : "asc"
                              );
                            }}
                            className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm"
                            title="Sort Order"
                          >
                            {sortBy === "licensenumber" &&
                            sortOrder === "asc" ? (
                              <>
                                <HiArrowUp className="text-[12px]" /> <p>asc</p>
                              </>
                            ) : (
                              <>
                                <p>dsn</p>
                                <HiArrowDown className="text-[12px]" />
                              </>
                            )}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="License No"
                          value={filterLicense}
                          onChange={(e) => setFilterLicense(e.target.value)}
                          className="p-1 border rounded-md w-full h-10 "
                        />
                      </div>
                    </Table.HeadCell>

                    {/* Phone Number */}
                    <Table.HeadCell className="min-w-[150px] capitalize text-fuchsia-800 text-[16px]">
                      Phone Number
                    </Table.HeadCell>

                    {/* Status */}
                    <Table.HeadCell className="min-w-[150px] ">
                      <p className="capitalize text-fuchsia-800 text-[18px]">
                        Status
                      </p>
                    </Table.HeadCell>

                    {/* Region */}
                    <Table.HeadCell className="min-w-[150px] capitalize text-fuchsia-800 text-[18px]">
                      Region
                    </Table.HeadCell>

                    {/* Zone */}
                    <Table.HeadCell className="min-w-[150px] capitalize text-fuchsia-800 text-[18px]">
                      Zone
                    </Table.HeadCell>

                    {/* License Expiration Date */}
                    <Table.HeadCell className="min-w-[150px] ">
                      <div className="flex flex-col items-center gap-2">
                        <p className="capitalize text-fuchsia-800 text-[18px]">
                          License Expiration
                        </p>
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="p-1 border rounded-md w-full h-8"
                        />
                      </div>
                    </Table.HeadCell>

                    {/* document  */}
                    {filterApproval !== "accepted" && (
                      <Table.HeadCell className="min-w-[150px] capitalize text-fuchsia-800 text-[18px]">
                        Document
                      </Table.HeadCell>
                    )}

                    {/* Approval*/}
                    <Table.HeadCell className="min-w-[150px]">
                      <div className="flex flex-col items-center gap-2">
                        <label
                          htmlFor="approvalFilter"
                          className="mr-2 font-semibold capitalize text-fuchsia-800 text-[18px]"
                        >
                          Approval
                        </label>
                        <select
                          id="approvalFilter"
                          value={filterApproval}
                          onChange={(e) => setFilterApproval(e.target.value)}
                          className="p-1 border rounded-md"
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </Table.HeadCell>
                    {/* Delete */}
                    {currentUser.role !== "marketing" && (
                      <Table.HeadCell className="min-w-[150px] capitalize text-fuchsia-800 text-[18px]">
                        Delete
                      </Table.HeadCell>
                    )}
                  </Table.Head>

                  <Table.Body>
                    {paginatedDistributors.map((distributor) => (
                      <Table.Row
                        key={distributor._id}
                        className="hover:bg-gray-50"
                      >
                        <Table.Cell className="min-w-[150px] text-center  border-b capitalize">
                          {new Date(distributor.createdAt).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center  border-b capitalize">
                          {distributor.companyname}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center  border-b capitalize">
                          {distributor.merchantId}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center  border-b capitalize">
                          {distributor.tinnumber}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center  border-b capitalize">
                          {distributor.licensenumber}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center  border-b capitalize">
                          {distributor.phoneNumber}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center  border-b capitalize">
                          {distributor.status}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center  border-b capitalize">
                          {distributor.region}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center  border-b capitalize">
                          {distributor.zone}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px] text-center  border-b capitalize">
                          {distributor.licenseexipiration}
                        </Table.Cell>
                        {filterApproval !== "accepted" && (
                          <Table.Cell className="min-w-[150px] text-center text-blue-800 hover:underline-offset-1">
                            <a
                              href={distributor?.url || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:cursor-pointer "
                            >
                              View Document
                            </a>
                          </Table.Cell>
                        )}

                        <Table.Cell className="flex flex-col items-center gap-2 min-w-[150px] text-center">
                          {currentUser?.role === "marketing" &&
                          filterApproval === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateApproval(
                                    distributor._id,
                                    "accept"
                                  )
                                }
                                className="text-green-500 bg-green-100 p-1 rounded-md font-semibold"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateApproval(
                                    distributor._id,
                                    "reject"
                                  )
                                }
                                className="text-red-500 bg-red-100 p-1 rounded-md font-semibold"
                              >
                                Reject
                              </button>
                            </div>
                          ) : currentUser?.role === "marketing" &&
                            filterApproval === "rejected" ? (
                            <button
                              onClick={() =>
                                handleRejectedToAccepted(
                                  distributor._id,
                                  "accept"
                                )
                              }
                              className="text-green-500 bg-green-100 p-1 rounded-md font-semibold"
                            >
                              Make Accepted
                            </button>
                          ) : (
                            <span className="text-fuchsia-800">
                              {distributor.approval}
                            </span>
                          )}
                        </Table.Cell>
                        {currentUser.role !== "marketing" && (
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
                        )}
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
                  <option key={size} value={size}>
                    {size}
                  </option>
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50 text-fuchsia-800"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full justify-center  h-[500px] flex items-center">
          
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

export default Distributors;
