import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Spinner, Table, Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { HiSearch } from 'react-icons/hi';

const Orders = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [filterProduct, setFilterProduct] = useState('');
  const [dateFilterType, setDateFilterType] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/order/paid-shipping-orders', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSortedOrders = orders
    .filter((order) => {
      const matchesProduct = order.productName.toLowerCase().includes(filterProduct.toLowerCase());
      return matchesProduct;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      if (dateFilterType === "recent") {
        return dateB - dateA;
      } else if (dateFilterType === "previous") {
        return dateA - dateB;
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Paid & Shipped Orders</h2>
      </div>
      <Card className="rounded-3xl">
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
          {(filterProduct || dateFilterType) && (
            <button
              onClick={() => {
                setFilterProduct("");
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
            <Table.HeadCell className='capitalize'>Created By</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Product</Table.HeadCell>
             <Table.HeadCell className='capitalize'>Product Location</Table.HeadCell>
              <Table.HeadCell className='capitalize'>destination</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Quantity</Table.HeadCell>

            <Table.HeadCell className='capitalize'>Total Price(ETB)</Table.HeadCell>
            
            <Table.HeadCell className='capitalize'>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredSortedOrders.map((order) => (
              <Table.Row key={order._id}>
                <Table.Cell>{order._id}</Table.Cell>
                <Table.Cell>{order.createdByName}</Table.Cell>
                <Table.Cell>{order.productName}</Table.Cell>
                <Table.Cell>{order.salesLocation}</Table.Cell>
                <Table.Cell>{order.destination}</Table.Cell>
                <Table.Cell>{order.quantity} {order.unit}</Table.Cell>
                <Table.Cell>{order.totalPrice}</Table.Cell>
                <Table.Cell className='flex gap-2'>
                  <Button size="xs" onClick={() => navigate(`/dashboard?tab=orderdetails&orderId=${order._id}`)}  gradientDuoTone="purpleToPink">
                    View Details
                  </Button>
                  <Button size="xs" onClick={() => navigate('/dashboard?tab=dispatch', { state: { orderId: order._id } })}>
                    Dispatch Order
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};

export default Orders; 