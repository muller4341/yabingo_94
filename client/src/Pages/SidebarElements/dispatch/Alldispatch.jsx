import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Spinner, Button, Modal } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';

const Alldispatch = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsOrderId, setDetailsOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'dispatcher' && currentUser.role !== 'admin')) {
      setError('Access denied: Only dispatchers or admins can view all dispatches.');
      setLoading(false);
      return;
    }
    fetchDispatches();
    // eslint-disable-next-line
  }, [currentUser]);

  const fetchDispatches = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dispatch');
      const data = await res.json();
      if (res.ok) setDispatches(data.dispatches);
      else setError(data.message || 'Failed to fetch dispatches');
    } catch (err) {
      setError('Failed to fetch dispatches');
    } finally {
      setLoading(false);
    }
  };

  // Group dispatches by orderId
  const grouped = {};
  for (const d of dispatches) {
    if (!grouped[d.orderId]) grouped[d.orderId] = [];
    grouped[d.orderId].push(d);
  }
  // Create summary rows
  const summaryRows = Object.entries(grouped).map(([orderId, group]) => {
    // Sort by createdAt ascending
    group.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const carPlates = [...new Set(group.map(d => d.carPlateNumber))].join(', ');
    const driverNames = [...new Set(group.map(d => d.driverName))].join(', ');
    const totalDispatched = group.reduce((sum, d) => sum + Number(d.dispatchAmount || 0), 0);
    const latest = group[group.length - 1];
    return {
      orderId,
      carPlates,
      driverNames,
      totalDispatched,
      remainingAmount: latest.remainingAmount,
      dispatchStatus: latest.dispatchStatus,
      lastDate: latest.createdAt,
      allDispatches: group,
    };
  });

  // Apply filters
  const filteredRows = summaryRows.filter(row => {
    const matchesStatus = statusFilter ? row.dispatchStatus === statusFilter : true;
    const matchesSearch =
      row.carPlates.toLowerCase().includes(search.toLowerCase()) ||
      row.driverNames.toLowerCase().includes(search.toLowerCase()) ||
      (row.orderId && row.orderId.toString().toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = (orderId) => {
    setDetailsOrderId(orderId);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsOrderId(null);
  };

  const getOrderDispatches = (orderId) => grouped[orderId] || [];

  if (loading) {
    return <div className="flex justify-center items-center h-40"><Spinner /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-xl font-bold mb-6">All Dispatches</h2>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Statuses</option>
          <option value="dispatched">Dispatched</option>
          <option value="partially dispatched">Partially Dispatched</option>
        </select>
        <input
          type="text"
          placeholder="Search by car, driver, or order ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <Button onClick={fetchDispatches} size="xs" gradientDuoTone="purpleToPink">Refresh</Button>
      </div>
      <Table>
        <Table.Head>
          <Table.HeadCell>Order ID</Table.HeadCell>
          <Table.HeadCell>Car Plate(s)</Table.HeadCell>
          <Table.HeadCell>Driver(s)</Table.HeadCell>
          <Table.HeadCell>Total Dispatched</Table.HeadCell>
          <Table.HeadCell>Remaining Amount</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Last Dispatch Date</Table.HeadCell>
          <Table.HeadCell>Action</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {filteredRows.map(row => (
            <Table.Row key={row.orderId}>
              <Table.Cell>{row.orderId}</Table.Cell>
              <Table.Cell>{row.carPlates}</Table.Cell>
              <Table.Cell>{row.driverNames}</Table.Cell>
              <Table.Cell>{row.totalDispatched}</Table.Cell>
              <Table.Cell>{row.remainingAmount}</Table.Cell>
              <Table.Cell>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.dispatchStatus === 'dispatched' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {row.dispatchStatus}
                </span>
              </Table.Cell>
              <Table.Cell>{new Date(row.lastDate).toLocaleString()}</Table.Cell>
              <Table.Cell className="flex gap-2">
                <Button size="xs" onClick={() => handleViewDetails(row.orderId)} gradientDuoTone="purpleToPink">
                  View Details
                </Button>
             {currentUser?.role === 'dispatcher' && row.dispatchStatus === 'partially dispatched' && (
                  <Button size="xs" onClick={() => navigate('/dashboard?tab=dispatch', { state: { orderId: row.orderId } })}>
                    Dispatch Order
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {filteredRows.length === 0 && (
        <div className="text-gray-500 text-center mt-8">No dispatches found.</div>
      )}
      {/* Details Modal */}
      <Modal show={showDetailsModal} popup onClose={closeDetailsModal} className="flex justify-center items-center !max-w-12xl">
        <Modal.Header>Dispatch Details</Modal.Header>
        <Modal.Body>
          <div className="overflow-x-auto w-full max-w-7xl">
            <Table className="text-base w-full">
              <Table.Head>
                <Table.HeadCell className="capitalize">Order ID</Table.HeadCell>
                <Table.HeadCell className="capitalize">Production Location</Table.HeadCell>
                <Table.HeadCell className="capitalize">Destination</Table.HeadCell>
                <Table.HeadCell className="capitalize">Production Name</Table.HeadCell>
                <Table.HeadCell className="capitalize">Withholding</Table.HeadCell>
                <Table.HeadCell className="capitalize">Created By</Table.HeadCell>
                <Table.HeadCell className="capitalize">Ordered Amount</Table.HeadCell>
                <Table.HeadCell className="capitalize">Car Plate</Table.HeadCell>
                <Table.HeadCell className="capitalize">Driver Name</Table.HeadCell>
                <Table.HeadCell className="capitalize">Dispatch Amount</Table.HeadCell>
                <Table.HeadCell className="capitalize">Remaining Amount</Table.HeadCell>
                <Table.HeadCell className="capitalize">Status</Table.HeadCell>
                <Table.HeadCell className="capitalize">Created At</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {detailsOrderId && getOrderDispatches(detailsOrderId).map(d => (
                  <Table.Row key={d._id}>
                    <Table.Cell>{d.orderId}</Table.Cell>
                    <Table.Cell>{d.productionLocation}</Table.Cell>
                    <Table.Cell>{d.destination}</Table.Cell>
                    <Table.Cell>{d.productionName}</Table.Cell>
                    <Table.Cell>{d.withholding}</Table.Cell>
                    <Table.Cell>{d.createdName}</Table.Cell>
                    <Table.Cell>{d.orderedAmount}</Table.Cell>
                    <Table.Cell>{d.carPlateNumber}</Table.Cell>
                    <Table.Cell>{d.driverName}</Table.Cell>
                    <Table.Cell>{d.dispatchAmount}</Table.Cell>
                    <Table.Cell>{d.remainingAmount}</Table.Cell>
                    <Table.Cell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.dispatchStatus === 'dispatched' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {d.dispatchStatus}
                      </span>
                    </Table.Cell>
                    <Table.Cell>{new Date(d.createdAt).toLocaleString()}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeDetailsModal} gradientDuoTone="purpleToPink">Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Alldispatch; 