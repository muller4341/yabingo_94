import { useState, useEffect,  } from "react";
import { Button, TextInput, Modal, Select, Badge, Pagination } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { HiSearch, HiFilter, HiSortAscending, HiSortDescending, HiPlus } from "react-icons/hi";
import { useSelector } from "react-redux";

const formatDate = (isoString) => {
  const date = new Date(isoString);
  if (isNaN(date)) return "Invalid Date";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}`;
};

const Prices = () => {
  const [payload, setPayload] = useState([]);
  const [filteredPayload, setFilteredPayload] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/price/getallprices");
        const data = await res.json();

        const preparedPayload = data.map(item => ({
          ...item,
          price: item.price || 0,
        }));

        setPayload(preparedPayload);
        setFilteredPayload(preparedPayload);
      } catch (err) {
        console.error("Error fetching product data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...payload];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.salesLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply location filter
    if (filterLocation) {
      filtered = filtered.filter(item => item.salesLocation === filterLocation);
    }

    // Apply type filter
    if (filterType) {
      filtered = filtered.filter(item => item.productType === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aPrice = a.prices[0]?.amount || 0;
      const bPrice = b.prices[0]?.amount || 0;
      return sortOrder === "asc" ? aPrice - bPrice : bPrice - aPrice;
    });

    setFilteredPayload(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filterLocation, filterType, sortOrder, payload, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const uniqueLocations = [...new Set(payload.map(item => item.salesLocation))];
  const uniqueTypes = [...new Set(payload.map(item => item.productType))];

  // Calculate pagination
  const totalPages = Math.ceil(filteredPayload.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredPayload.slice(startIndex, endIndex);

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-fuchsia-800">Price History</h2>
        <div className="flex flex-wrap gap-4">
          
          <TextInput
            icon={HiSearch}
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select
            icon={HiFilter}
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </Select>
          <Select
            icon={HiFilter}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
          <Button
            color="gray"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? <HiSortAscending className="w-5 h-5" /> : <HiSortDescending className="w-5 h-5" />}
          </Button>
          { currentUser?.role === "finance"&& (
          <Button
            gradientDuoTone="purpleToPink"
            onClick={() => navigate('/dashboard?tab=addprices')}
            className="flex items-center gap-2"
          >
            <HiPlus className="w-5 h-5" />
            Add Price
          </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-800"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sales Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Withholding</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price per Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {currentItems.length > 0 ? (
                  currentItems.map((product, index) =>
                    product.prices.map((priceEntry, priceIndex) => {
                      const createdAt = new Date(priceEntry.createdAt);
                      const updatedAt = new Date(priceEntry.updatedAt);
                      const durationMs = updatedAt - createdAt;
                      const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
                      const durationStr = durationDays === 0 ? 'Less than a day' : `${durationDays} day(s)`;

                      return (
                        <tr key={`${index}-${priceIndex}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          {priceIndex === 0 && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white" rowSpan={product.prices.length}>
                                {product.salesLocation}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white" rowSpan={product.prices.length}>
                                {product.productName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white" rowSpan={product.prices.length}>
                                {product.productType}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white" rowSpan={product.prices.length}>
                                {product.withHolding}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white" rowSpan={product.prices.length}>
                                {product.unit}
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge color={priceEntry.isArchived ? "gray" : "success"}>
                              {priceEntry.isArchived ? "Archived" : "Active"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {priceEntry.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(priceEntry.createdAt)} - {priceEntry.isArchived ? formatDate(priceEntry.updatedAt) : "Now"}
                            <br />
                            <span className="text-xs text-gray-400">{durationStr}</span>
                          </td>
                        </tr>
                      );
                    })
                  )
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No prices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300">Rows per page:</span>
              <Select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-20"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Button
                color="gray"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300">Page</span>
                <TextInput
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= totalPages) {
                      setCurrentPage(value);
                    }
                  }}
                  className="w-16 text-center"
                />
                <span className="text-gray-700 dark:text-gray-300">of {totalPages}</span>
              </div>
              <Button
                color="gray"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Prices;
