import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, Modal, Button, Spinner, Card, Badge, TextInput, Label } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle, HiPlus } from "react-icons/hi";
import { HiArrowUp, HiArrowDown } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";
import { log } from "../../assets";

const Employees = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [userToEdit, setUserToEdit] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit form state
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phoneNumber: "",
    role: "",
    location: "",
  });

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

  const handleEdit = (user) => {
    setUserToEdit(user);
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      phoneNumber: user.phoneNumber,
      role: user.role,
      location: user.location || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/user/update/${userToEdit._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          email: userToEdit.email, // Include the original email in the request
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userToEdit._id ? { ...user, ...formData } : user
          )
        );
        setShowEditModal(false);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

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
    <div className="p-4">
      <Card className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Employee Management</h1>
          <Link to="/dashboard?tab=add_employee">
            <Button gradientDuoTone="purpleToPink" size="sm">
              <HiPlus className="mr-2 h-5 w-5" />
              Add Employee
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
              <option value="production">Production</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
            />
          </div>
        </div>

        {(filterName || filterDate || filterRole || sortOrder || createdAtSortOrder !== "desc") && (
          <Button
            color="failure"
            size="sm"
            onClick={() => {
              setFilterName("");
              setFilterPhone("");
              setFilterDate("");
              setFilterRole("");
              setSortOrder("");
              setCreatedAtSortOrder("desc");
            }}
          >
            Clear Filters
          </Button>
        )}
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      ) : currentUser.isAdmin && users.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2 capitalize">
                    Date Created
                    <button
                      onClick={() => setShowDateDropdown((prev) => !prev)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {createdAtSortOrder === "desc" ? <HiArrowDown /> : <HiArrowUp />}
                    </button>
                  </div>
                </Table.HeadCell>
                <Table.HeadCell className="capitalize">User Image</Table.HeadCell>
                <Table.HeadCell>
                  <div className="flex items-center gap-2 capitalize">
                    User Name
                    <button
                      onClick={() => setShowSortDropdown((prev) => !prev)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {sortOrder === "desc" ? <HiArrowDown /> : <HiArrowUp />}
                    </button>
                  </div>
                </Table.HeadCell>
                <Table.HeadCell className="capitalize">Phone Number</Table.HeadCell>
                <Table.HeadCell className="capitalize">Role</Table.HeadCell>
                <Table.HeadCell className="capitalize">Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {paginatedUsers.map((user) => (
                  <Table.Row key={user._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell className="whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <img
                        src={user.profilePicture}
                        alt={user.firstname}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </Table.Cell>
                    <Table.Cell className="font-medium  dark:text-white">
                      {user.firstname} {user.lastname}
                    </Table.Cell>
                    <Table.Cell>{user.phoneNumber}</Table.Cell>
                    <Table.Cell>
                      <Badge color={user.role === "admin" ? "purple" : "info"}>
                        {user.role}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Button size="xs" color="info" onClick={() => handleEdit(user)}  gradientDuoTone="purpleToPink">
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          color="failure"
                          onClick={() => {
                            setShowModal(true);
                            setUserIdToDelete(user._id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-400">
                Rows per page:
              </span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="p-1 border rounded"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No employees found</p>
          </div>
        </Card>
      )}

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
              Are you sure you want to delete this employee?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handelDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} popup size="md">
        <Modal.Header>Edit Employee</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="firstname">First Name</Label>
              <TextInput
                id="firstname"
                type="text"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastname">Last Name</Label>
              <TextInput
                id="lastname"
                type="text"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <TextInput
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="finance">Finance</option>
                <option value="marketing">Marketing</option>
                <option value="production">Production</option>
              </select>
            </div>
            {formData.role === "production" && (
              <div>
                <Label htmlFor="location">Production Location</Label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Location</option>
                  <option value="Addis Ababa">adama</option>
                  <option value="Dire Dawa">mugher</option>
                  <option value="Mekelle">tatek</option>

                </select>
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-4">
              <Button color="gray" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" gradientDuoTone="purpleToPink">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Employees;
