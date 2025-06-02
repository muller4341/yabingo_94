import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, Modal, Button, Spinner, TextInput, Select } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle, HiSearch, HiFilter } from "react-icons/hi";
import { FaBuilding, FaPhone, FaIdCard, FaMapMarkerAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterApproval, setFilterApproval] = useState("accepted");
  const [loading, setLoading] = useState(true);
   const [showNoDataMessage, setShowNoDataMessage] = useState(false);

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
          console.error(data.message || "Failed to fetch distributors");
        }
      } catch (error) {
        console.error("Fetch error:", error);
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
      <div className="flex items-center justify-center h-[500px]">
        <Spinner size="xl" color="purple" />
        <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">
          Loading distributors...
        </span>
      </div>
    );
  }

  if (!loading && showNoDataMessage && distributors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center">
        <FaBuilding className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          No distributors found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Get started by adding a new distributor.
        </p>
        <Link to="/dashboard?tab=distributoraccount">
          <Button gradientDuoTone="purpleToPink">
            Add New Distributor
          </Button>
        </Link>
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

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setDistributors((prev) =>
          prev.filter((distributor) => distributor._id !== userIdToDelete)
        );
      }
    } catch (error) {
      console.error("Error deleting distributor:", error);
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
        setDistributors((prev) =>
          prev.filter((distributor) => distributor._id !== userId)
        );
      }
    } catch (error) {
      console.error("Error updating approval:", error);
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
        setDistributors((prev) =>
          prev.filter((distributor) => distributor._id !== userId)
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      {(currentUser?.role === "admin" || currentUser?.role === "marketing") &&
      distributors.length > 0 ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Distributor Management
            </h1>
            <Link to="/dashboard?tab=distributoraccount">
              <Button gradientDuoTone="purpleToPink">
                Add New Distributor
              </Button>
            </Link>
                      </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <TextInput
              icon={FaBuilding}
              placeholder="Search by company..."
                          value={filterCompanyName}
                          onChange={(e) => setFilterCompanyName(e.target.value)}
            />
            <TextInput
              icon={FaPhone}
              placeholder="Search by phone..."
              value={filterPhone}
              onChange={(e) => setFilterPhone(e.target.value)}
            />
            <TextInput
              icon={FaIdCard}
              placeholder="Search by TIN..."
                          value={filterTin}
                          onChange={(e) => setFilterTin(e.target.value)}
            />
            <TextInput
              icon={FaMapMarkerAlt}
              placeholder="Search by region..."
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
                        />
                      </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Select
              icon={HiFilter}
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
            >
              <option value="">All Zones</option>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
            </Select>
            <Select
              icon={HiFilter}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <Select
              icon={HiFilter}
              value={filterApproval}
              onChange={(e) => setFilterApproval(e.target.value)}
            >
              <option value="accepted">Accepted</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </Select>
                      </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table hoverable className="w-full">
              <Table.Head>
                <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">
                  Date Created
                    </Table.HeadCell>
                <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">
                  Company Name
                    </Table.HeadCell>
                <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">
                      Region
                    </Table.HeadCell>
                <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">
                      Zone
                    </Table.HeadCell>
                <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">
                  Phone
                    </Table.HeadCell>
                <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">
                  TIN
                      </Table.HeadCell>
                <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">
                  Status
                    </Table.HeadCell>
                <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">
                  Actions
                      </Table.HeadCell>
                  </Table.Head>
              <Table.Body className="divide-y">
                <AnimatePresence>
                    {paginatedDistributors.map((distributor) => (
                    <motion.tr
                        key={distributor._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                      <Table.Cell>
                          {new Date(distributor.createdAt).toLocaleDateString()}
                        </Table.Cell>
                      <Table.Cell className="font-medium text-gray-900 dark:text-white">
                          {distributor.companyname}
                        </Table.Cell>
                      <Table.Cell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {distributor.region}
                        </span>
                        </Table.Cell>
                      <Table.Cell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          {distributor.zone}
                        </span>
                        </Table.Cell>
                      <Table.Cell>{distributor.phone}</Table.Cell>
                      <Table.Cell>{distributor.tinnumber}</Table.Cell>
                      <Table.Cell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            distributor.approval === "accepted"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : distributor.approval === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {distributor.approval}
                        </span>
                          </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          {distributor.approval === "pending" && (
                            <>
                              <Button
                                size="xs"
                                color="success"
                                onClick={() =>
                                  handleUpdateApproval(distributor._id, "accept")
                                }
                              >
                                Accept
                              </Button>
                              <Button
                                size="xs"
                                color="failure"
                                onClick={() =>
                                  handleUpdateApproval(distributor._id, "reject")
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="xs"
                            color="failure"
                              onClick={() => {
                              setUserIdToDelete(distributor._id);
                                setShowModal(true);
                              }}
                            >
                              Delete
                          </Button>
                        </div>
                          </Table.Cell>
                    </motion.tr>
                    ))}
                </AnimatePresence>
                  </Table.Body>
                </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                color="gray"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : null}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this distributor?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </motion.div>
  );
};

export default Distributors;
