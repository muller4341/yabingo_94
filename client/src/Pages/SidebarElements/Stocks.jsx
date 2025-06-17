import React, { useEffect, useState } from 'react';
import { Table, Button, TextInput, Select, Spinner, Progress } from 'flowbite-react';
import { HiSearch, HiFilter, HiArrowUp, HiArrowDown, HiExclamation } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const StockTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [lowStockThreshold] = useState(10);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/product/getstock');
        const data = await res.json();
        const seen = new Set();
        const uniqueProducts = data.filter((product) => {
          const key = `${product.salesLocation}|${product.productName}|${product.productType}|${product.withHolding}|${product.unit}|${product.status}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setProducts(uniqueProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const nameMatch = product.productName.toLowerCase().includes(filterName.toLowerCase());
      const typeMatch = product.productType.toLowerCase().includes(filterType.toLowerCase());
      const locationMatch = product.salesLocation.toLowerCase().includes(filterLocation.toLowerCase());
      const statusMatch = filterStatus ? product.status === filterStatus : true;
      return nameMatch && typeMatch && locationMatch && statusMatch;
    })
    .sort((a, b) => {
      const aValue = a[sortField]?.toLowerCase() || '';
      const bValue = b[sortField]?.toLowerCase() || '';
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getStockLevelColor = (quantity) => {
    if (quantity <= lowStockThreshold) return 'red';
    if (quantity <= lowStockThreshold * 2) return 'yellow';
    return 'green';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Spinner size="xl" color="purple" />
        <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">
          Loading stock data...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Stock Management
        </h1>
        {/* <Link to="/dashboard?tab=addproduction">
          <Button gradientDuoTone="purpleToPink">
            Add Stock
          </Button>
        </Link> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         <TextInput
          icon={HiSearch}
          placeholder="Search by location..."
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
        />
        <TextInput
          icon={HiSearch}
          placeholder="Search by name..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
        <TextInput
          icon={HiSearch}
          placeholder="Search by type..."
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        />
       
        <Select
          icon={HiFilter}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <Table hoverable className="w-full">
          <Table.Head>
            <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center gap-2">
                Sales Location
                <button
                  onClick={() => {
                    setSortField('salesLocation');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {sortField === 'salesLocation' ? (
                    sortOrder === 'asc' ? <HiArrowUp /> : <HiArrowDown />
                  ) : (
                    <HiArrowUp />
                  )}
                </button>
              </div>
            </Table.HeadCell>
            <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center gap-2">
                Product Name
                <button
                  onClick={() => {
                    setSortField('productName');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {sortField === 'productName' ? (
                    sortOrder === 'asc' ? <HiArrowUp /> : <HiArrowDown />
                  ) : (
                    <HiArrowUp />
                  )}
                </button>
              </div>
            </Table.HeadCell>
            <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center gap-2">
                Product Type
                <button
                  onClick={() => {
                    setSortField('productType');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {sortField === 'productType' ? (
                    sortOrder === 'asc' ? <HiArrowUp /> : <HiArrowDown />
                  ) : (
                    <HiArrowUp />
                  )}
                </button>
              </div>
            </Table.HeadCell>
            <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">Withholding</Table.HeadCell>
            <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">Unit</Table.HeadCell>
            <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center gap-2">
                Status
                <button
                  onClick={() => {
                    setSortField('status');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {sortField === 'status' ? (
                    sortOrder === 'asc' ? <HiArrowUp /> : <HiArrowDown />
                  ) : (
                    <HiArrowUp />
                  )}
                </button>
              </div>
            </Table.HeadCell>
            <Table.HeadCell className="bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center gap-2">
                Quantity
                <button
                  onClick={() => {
                    setSortField('quantity');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {sortField === 'quantity' ? (
                    sortOrder === 'asc' ? <HiArrowUp /> : <HiArrowDown />
                  ) : (
                    <HiArrowUp />
                  )}
                </button>
              </div>
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            <AnimatePresence>
              {paginatedProducts.map((product, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="capitalize">{product.salesLocation}</Table.Cell>
                  <Table.Cell className="font-medium text-gray-900 dark:text-white capitalize">
                    {product.productName}
                  </Table.Cell>
                  <Table.Cell className="capitalize">{product.productType}</Table.Cell>
                  <Table.Cell>{product.withHolding}</Table.Cell>
                  <Table.Cell>{product.unit}</Table.Cell>
                  <Table.Cell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {product.status}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${
                          product.quantity <= lowStockThreshold
                            ? 'text-red-600 dark:text-red-400'
                            : product.quantity <= lowStockThreshold * 2
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {product.quantity}
                      </span>
                      {product.quantity <= lowStockThreshold && (
                        <HiExclamation className="text-red-500" />
                      )}
                    </div>
                    <Progress
                      progress={Math.min((product.quantity / (lowStockThreshold * 3)) * 100, 100)}
                      color={getStockLevelColor(product.quantity)}
                      size="sm"
                      className="mt-1"
                    />
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
    </motion.div>
  );
};

export default StockTable;
