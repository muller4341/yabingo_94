import React, { useEffect, useState } from 'react';
import { Card, Spinner, Button, Table } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { HiSearch } from 'react-icons/hi';

const MarketingOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProduct, setFilterProduct] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterCreatedBy, setFilterCreatedBy] = useState('');
  const [dateFilterType, setDateFilterType] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/order');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/order/${orderId}/review`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchOrders();
        setTimeout(() => {
        navigate('/dashboard?tab=order');
      }, 2000);
      }
    } catch (err) {
      console.error('Error reviewing order:', err);
    }
  };

  const filteredSortedOrders = orders
    .filter((order) => {
      const matchesProduct = order.productName.toLowerCase().includes(filterProduct.toLowerCase());
      const matchesRole = filterRole ? order.role === filterRole : true;
      const matchesCreatedBy = order.createdBy.toLowerCase().includes(filterCreatedBy.toLowerCase());

      return matchesProduct && matchesRole && matchesCreatedBy;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      if (dateFilterType === "recent") {
        return dateB - dateA; // Most recent first
      } else if (dateFilterType === "previous") {
        return dateA - dateB; // Oldest first
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Card className='rounded-3xl'>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Pending Orders for Review</h2>
        </div>

        <div className="mb-4 flex flex-wrap gap-8 items-center">
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
              placeholder="Search by product..."
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="p-2 pl-10 border rounded-md w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="p-2 border rounded-md w-48"
            >
              <option value="">All Roles</option>
              <option value="distributor">Distributor</option>
              <option value="retailer">Retailer</option>
            </select>
          </div>

          <div className="flex items-center gap-2 relative">
            <HiSearch className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by creator..."
              value={filterCreatedBy}
              onChange={(e) => setFilterCreatedBy(e.target.value)}
              className="p-2 pl-10 border rounded-md w-48"
            />
          </div>

          {(filterProduct || filterRole || filterCreatedBy || dateFilterType) && (
            <button
              onClick={() => {
                setFilterProduct("");
                setFilterRole("");
                setFilterCreatedBy("");
                setDateFilterType("");
              }}
              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
            >
              Clear Filters
            </button>
          )}
        </div>

        <Table>
          <Table.Head>
            <Table.HeadCell className='capitalize'>Order ID</Table.HeadCell>
            <Table.HeadCell className='capitalize' > User role</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Product</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Quantity</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Total Price (ETB) </Table.HeadCell>
            <Table.HeadCell className='capitalize'>Created By</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredSortedOrders.map((order) => (
              <Table.Row key={order._id}>
                <Table.Cell>{order._id}</Table.Cell>
                <Table.Cell>{order.role}</Table.Cell>
                <Table.Cell>{order.productName}</Table.Cell>
                <Table.Cell>{order.quantity}</Table.Cell>
                <Table.Cell>{order.totalPrice} <p></p></Table.Cell>
                <Table.Cell>{order.createdBy}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button size="xs" onClick={() => navigate(`/dashboard?tab=orderdetails&orderId=${order._id}`)} gradientDuoTone="purpleToPink">
                                        View Details
                                      </Button>
                    <Button size="xs" color="info" onClick={() => handleReviewOrder(order._id)} >
                      Review
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};

export default MarketingOrders; 