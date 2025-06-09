import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, Modal, Button, Spinner, Card, Badge, Tooltip } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle, HiSearch, HiFilter, HiX, HiArrowUp, HiArrowDown } from "react-icons/hi";
import { FaCheck, FaTimes, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
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
    const timer = setTimeout(() => {
      setShowNoDataMessage(true);
    }, 2000);
    const fetchDistributors = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
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

    if (["admin", "marketing"].includes(currentUser?.role)) {
      fetchDistributors();
    }
    return () => clearTimeout(timer);
  }, [currentUser, filterApproval]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading distributors...</p>
        </div>
      </div>
    );
  }

  if (!loading && showNoDataMessage && distributors.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="text-center p-8">
          <HiOutlineExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No distributors found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
        </Card>
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
        setDistributors((prev) => prev.filter((user) => user._id !== userIdToDelete));
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-[2000px] mx-auto"
    >
      {(currentUser?.role === "admin" || currentUser?.role === "marketing") &&
      distributors.length > 0 ? (
        <>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-fuchsia-50 to-purple-50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Distributors Management</h1>
                  
                </div>
                <div className="flex gap-4">
                  <select
                    value={filterApproval}
                    onChange={(e) => setFilterApproval(e.target.value)}
                    className="rounded-lg border-gray-300 focus:border-fuchsia-500 focus:ring-fuchsia-500"
                  >
                    <option value="accepted">Accepted</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  {currentUser?.role === "marketing" && (
                    <Link to="/dashboard?tab=add_distributor">
                      <Button gradientDuoTone="purpleToPink">
                        Add New Distributor
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Filter Summary */}
              {(filterCompanyName ||
                filterDate ||
                filterTin ||
                filterMerchantId ||
                filterLicense ||
                dateFilterType ||
                sortOrder !== "asc" ||
                createdAtSortOrder !== "desc" ||
                filterPhone ||
                filterZone ||
                filterRegion ||
                filterStatus) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge color="info" className="flex items-center gap-2">
                    <HiFilter className="h-4 w-4" />
                    Active Filters
                  </Badge>
                  <Button
                    size="xs"
                    color="failure"
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
                    className="flex items-center gap-2"
                  >
                    <HiX className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <Table hoverable className="w-full">
                <Table.Head className="bg-gray-50">
                  {/* Date Created */}
                  <Table.HeadCell className="min-w-[150px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <p className="capitalize text-fuchsia-800 text-[18px] font-semibold">
                          Date Created
                        </p>
                        <Tooltip content="Sort by date">
                          <button
                            onClick={() => {
                              setSortBy("date");
                              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                            }}
                            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                          >
                            {sortBy === "date" ? (
                              sortOrder === "asc" ? (
                                <FaSortUp className="text-fuchsia-600" />
                              ) : (
                                <FaSortDown className="text-fuchsia-600" />
                              )
                            ) : (
                              <FaSort className="text-gray-400" />
                            )}
                          </button>
                        </Tooltip>
                      </div>
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="p-2 border rounded-lg w-full focus:border-fuchsia-500 focus:ring-fuchsia-500 transition-colors"
                      />
                    </div>
                  </Table.HeadCell>

                  {/* Company Name */}
                  <Table.HeadCell className="min-w-[150px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <p className="capitalize text-fuchsia-800 text-[18px] font-semibold">
                          Company Name
                        </p>
                        <Tooltip content="Sort by company name">
                          <button
                            onClick={() => {
                              setSortBy("company");
                              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                            }}
                            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                          >
                            {sortBy === "company" ? (
                              sortOrder === "asc" ? (
                                <FaSortUp className="text-fuchsia-600" />
                              ) : (
                                <FaSortDown className="text-fuchsia-600" />
                              )
                            ) : (
                              <FaSort className="text-gray-400" />
                            )}
                          </button>
                        </Tooltip>
                      </div>
                      <div className="relative w-full">
                        <input
                          type="text"
                          placeholder="Search company..."
                          value={filterCompanyName}
                          onChange={(e) => setFilterCompanyName(e.target.value)}
                          className="p-2 pl-8 border rounded-lg w-full focus:border-fuchsia-500 focus:ring-fuchsia-500 transition-colors"
                        />
                        <HiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
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
                  {currentUser?.role === "marketing" && filterApproval !== "accepted" && (
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
                  {currentUser?.role === "admin" && (
                    <Table.HeadCell className="min-w-[150px] capitalize text-fuchsia-800 text-[18px]">
                      Delete
                    </Table.HeadCell>
                  )}
                </Table.Head>

                <Table.Body className="divide-y">
                  {paginatedDistributors.map((distributor) => (
                    <Table.Row
                      key={distributor._id}
                      className="hover:bg-gray-50 transition-all duration-200 ease-in-out"
                    >
                      <Table.Cell className="min-w-[150px] text-center border-b capitalize">
                        {new Date(distributor.createdAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell className="min-w-[150px] text-center border-b capitalize">
                        <span className="font-medium text-gray-800">{distributor.companyname}</span>
                      </Table.Cell>
                      <Table.Cell className="min-w-[150px] text-center border-b capitalize">
                        <span className="font-medium text-gray-800">{distributor.merchantId}</span>
                      </Table.Cell>
                      <Table.Cell className="min-w-[150px] text-center border-b capitalize">
                        <span className="font-medium text-gray-800">{distributor.tinnumber}</span>
                      </Table.Cell>
                      <Table.Cell className="min-w-[150px] text-center border-b capitalize">
                        <span className="font-medium text-gray-800">{distributor.licensenumber}</span>
                      </Table.Cell>
                      <Table.Cell className="min-w-[150px] text-center border-b capitalize">
                        <span className="font-medium text-gray-800">{distributor.phoneNumber}</span>
                      </Table.Cell>
                      <Table.Cell className="min-w-[150px] text-center border-b capitalize">
                        <Badge
                          color={
                            distributor.status === "active"
                              ? "success"
                              : distributor.status === "pending"
                              ? "warning"
                              : "failure"
                          }
                        >
                          {distributor.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="min-w-[150px] text-center border-b capitalize">
                        <span className="font-medium text-gray-800">{distributor.region}</span>
                      </Table.Cell>
                      <Table.Cell className="min-w-[150px] text-center border-b capitalize">
                        <span className="font-medium text-gray-800">{distributor.zone}</span>
                      </Table.Cell>
                      <Table.Cell className="min-w-[150px] text-center border-b capitalize">
                        <span className="font-medium text-gray-800">{distributor.licenseexipiration}</span>
                      </Table.Cell>
                      {/* Document cell - only visible to marketing role */}
                      {currentUser?.role === "marketing" && filterApproval !== "accepted" && (
                        <Table.Cell className="min-w-[150px] text-center text-blue-800 hover:underline-offset-1">
                          <a
                            href={distributor?.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:cursor-pointer"
                          >
                            View Document
                          </a>
                        </Table.Cell>
                      )}
                      <Table.Cell className="flex flex-col items-center gap-2 min-w-[150px] text-center">
                        {currentUser?.role === "marketing" && filterApproval === "pending" ? (
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
                      {/* Delete cell - only visible to admin role */}
                      {currentUser?.role === "admin" && (
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

            {/* Pagination Section */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Rows per page:</label>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border-gray-300 focus:border-fuchsia-500 focus:ring-fuchsia-500"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    gradientDuoTone="purpleToPink"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          val = Math.max(1, Math.min(val, totalPages));
                          setCurrentPage(val);
                        }
                      }}
                      className="w-16 px-2 py-1 border rounded-lg text-center focus:border-fuchsia-500 focus:ring-fuchsia-500"
                    />
                    <span className="text-sm text-gray-600">of {totalPages}</span>
                  </div>

                  <Button
                    size="sm"
                    gradientDuoTone="purpleToPink"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-[500px]">
          <Card className="text-center p-8">
            <HiOutlineExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Access</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to view this page.
            </p>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header className="bg-red-50">
          <div className="flex items-center gap-2">
            <HiOutlineExclamationCircle className="h-6 w-6 text-red-500" />
            <span className="text-red-600 font-semibold">Confirm Deletion</span>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this distributor? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={handelDeleteUser}
                className="flex items-center gap-2"
              >
                <FaTimes className="h-4 w-4" />
                Yes, Delete
              </Button>
              <Button
                color="gray"
                onClick={() => setShowModal(false)}
                className="flex items-center gap-2"
              >
                <FaCheck className="h-4 w-4" />
                No, Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </motion.div>
  );
};

export default Distributors;
