import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const UserManagement = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [editForm, setEditForm] = useState({ firstname: '', lastname: '', phoneNumber: '', location: '' });

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) return;
    fetchUsers();
    // eslint-disable-next-line
  }, [currentUser]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user/getusers', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/user/delete/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setSuccess('User deleted successfully.');
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user._id);
    setEditForm({
      firstname: user.firstname,
      lastname: user.lastname,
      phoneNumber: user.phoneNumber,
      location: user.location,
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/user/update/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update user');
      setSuccess('User updated successfully.');
      setUsers(users.map(u => u._id === editUserId ? { ...u, ...editForm } : u));
      setEditUserId(null);
    } catch (err) {
      setError(err.message || 'Failed to update user.');
    }
  };

  if (!currentUser || !currentUser.isAdmin) {
    return <div className="text-red-600 font-bold text-center mt-10">Access denied. Admins only.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {loading ? (
        <div className="text-fuchsia-600 font-semibold">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-fuchsia-200 rounded-lg">
            <thead>
              <tr className="bg-fuchsia-100">
                <th className="px-4 py-2 border-b">First Name</th>
                <th className="px-4 py-2 border-b">Last Name</th>
                <th className="px-4 py-2 border-b">Phone Number</th>
                <th className="px-4 py-2 border-b">Location</th>
                <th className="px-4 py-2 border-b">Status</th>
                <th className="px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-fuchsia-400">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-fuchsia-50">
                    {editUserId === user._id ? (
                      <>
                        <td className="px-4 py-2 border-b">
                          <input
                            type="text"
                            name="firstname"
                            value={editForm.firstname}
                            onChange={handleEditChange}
                            className="border rounded px-2 py-1 w-28"
                          />
                        </td>
                        <td className="px-4 py-2 border-b">
                          <input
                            type="text"
                            name="lastname"
                            value={editForm.lastname}
                            onChange={handleEditChange}
                            className="border rounded px-2 py-1 w-28"
                          />
                        </td>
                        <td className="px-4 py-2 border-b">
                          <input
                            type="text"
                            name="phoneNumber"
                            value={editForm.phoneNumber}
                            onChange={handleEditChange}
                            className="border rounded px-2 py-1 w-32"
                          />
                        </td>
                        <td className="px-4 py-2 border-b">
                          <input
                            type="text"
                            name="location"
                            value={editForm.location}
                            onChange={handleEditChange}
                            className="border rounded px-2 py-1 w-32"
                          />
                        </td>
                        <td className="px-4 py-2 border-b flex gap-2 items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm 
                            ${user.status === 'approved' ? 'bg-green-100 text-green-700' : user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span>
                        </td>
                        <td className="px-4 py-2 border-b flex gap-2">
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            onClick={handleEditSubmit}
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                            onClick={() => setEditUserId(null)}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 border-b">{user.firstname}</td>
                        <td className="px-4 py-2 border-b">{user.lastname}</td>
                        <td className="px-4 py-2 border-b">{user.phoneNumber}</td>
                        <td className="px-4 py-2 border-b">{user.location}</td>
                        <td className="px-4 py-2 border-b flex gap-2 items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm 
                            ${user.status === 'approved' ? 'bg-green-100 text-green-700' : user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span>
                          {user.status === 'pending' && (
                            <button
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 ml-2"
                              onClick={async () => {
                                setError('');
                                setSuccess('');
                                try {
                                  const res = await fetch(`/api/user/update/${user._id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                      firstname: user.firstname,
                                      lastname: user.lastname,
                                      phoneNumber: user.phoneNumber,
                                      location: user.location,
                                      status: 'approved',
                                    }),
                                  });
                                  const data = await res.json();
                                  if (!res.ok) throw new Error(data.message || 'Failed to approve user');
                                  setSuccess('User approved successfully.');
                                  setUsers(users.map(u => u._id === user._id ? { ...u, status: 'approved' } : u));
                                } catch (err) {
                                  setError(err.message || 'Failed to approve user.');
                                }
                              }}
                            >
                              Approve
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-2 border-b flex gap-2">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => handleEdit(user)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            onClick={() => handleDelete(user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

