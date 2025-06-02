import { useState, useEffect } from "react";
import { Button, TextInput, Modal, Alert, Spinner, Badge, Select } from "flowbite-react";
import { useNavigate } from 'react-router-dom';
import { HiSearch, HiExclamationCircle, HiCheckCircle } from "react-icons/hi";

const AddPriceTable = () => {
  const [products, setProducts] = useState([]);
  const [payload, setPayload] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [initialPayload, setInitialPayload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const navigate = useNavigate();

  useEffect(() => { 
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productRes, priceRes] = await Promise.all([
          fetch("/api/product/getproduct"),
          fetch("/api/price/getprice"),
        ]);

        if (!productRes.ok || !priceRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const productsData = await productRes.json();
        const pricesData = await priceRes.json();

        // Deduplicate products
        const seen = new Set();
        const uniqueProducts = productsData.filter((product) => {
          const key = `${product.salesLocation}|${product.productName}|${product.productType}|${product.withHolding}|${product.unit}|${product.status}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // For each product, find its current (non-archived) price
        const payloadWithPrices = uniqueProducts.map((product) => {
          const matchedPrice = pricesData.find(
            (p) =>
              !p.isArchived &&
              p.salesLocation === product.salesLocation &&
              p.productName === product.productName &&
              p.productType === product.productType &&
              p.unit === product.unit &&
              p.withHolding === product.withHolding
          );
          return {
            ...product,
            price: matchedPrice?.price || 0,
          };
        });

        setProducts(uniqueProducts);
        setPayload(payloadWithPrices);
        setInitialPayload(JSON.parse(JSON.stringify(payloadWithPrices)));
      } catch (err) {
        console.error("Error fetching product/price data:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const handleAmountChange = (index, value) => {
    const updatedPayload = [...payload];
    const numValue = Number(value);
    
    if (numValue < 0) {
      setError("Price cannot be negative");
      return;
    }
    
    updatedPayload[index].price = numValue;
    setPayload(updatedPayload);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      // Compare current payload with initialPayload
      const changedItems = payload.filter((item, index) => {
        return item.price !== initialPayload[index]?.price;
      });

      if (changedItems.length === 0) {
        setError("No price changes detected. Please modify at least one price.");
        return;
      }

      // Submit only changed items
      for (const item of changedItems) {
        const priceData = {
          salesLocation: item.salesLocation,
          productName: item.productName,
          productType: item.productType,
          withHolding: item.withHolding,
          unit: item.unit,
          price: item.price,
        };

        const res = await fetch("/api/price/addprice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(priceData),
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.message || "Submission failed.");
        }
      }

      setSuccess("Prices updated successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error submitting prices.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.salesLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-fuchsia-800">Update Prices</h2>
        <div className="flex items-center gap-4">
          <TextInput
            icon={HiSearch}
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {error && (
        <Alert color="failure" className="mb-4">
          <span className="font-medium">Error!</span> {error}
        </Alert>
      )}

      {success && (
        <Alert color="success" className="mb-4">
          <span className="font-medium">Success!</span> {success}
        </Alert>
      )}

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {currentItems.length > 0 ? (
                  currentItems.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.salesLocation}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.productType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.withHolding}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge color={product.status === "active" ? "success" : "gray"}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payload[index]?.price || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <TextInput
                          type="number"
                          min="0"
                          value={payload[index]?.price || ''}
                          onChange={(e) => handleAmountChange(index, e.target.value)}
                          placeholder="Enter new price"
                          color={payload[index]?.price !== initialPayload[index]?.price ? "success" : "gray"}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No products found.
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
                <option value={6}>6</option>
                <option value={10}>10</option>
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

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              gradientDuoTone="purpleToPink"
              className="w-full md:w-auto"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Updating Prices...
                </>
              ) : (
                'Update Prices'
              )}
            </Button>
          </div>
        </>
      )}

      <Modal
        show={showSuccessModal}
        size="md"
        popup
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/dashboard?tab=prices');
        }}
      >
        <Modal.Header className="bg-green-100 rounded-t-lg">
          <div className="flex items-center justify-center w-full">
            <HiCheckCircle className="w-10 h-10 text-green-600" />
            <span className="ml-2 text-green-700 text-xl font-semibold">Success</span>
          </div>
        </Modal.Header>
      
        <Modal.Body className="bg-white text-center rounded-b-lg">
          <p className="text-gray-700 text-lg mb-4">
            🎉 Prices have been <span className="font-semibold text-green-600">updated successfully!</span>
          </p>
          <p className="text-sm text-gray-500">
            You will be redirected to the prices dashboard shortly.
          </p>
        </Modal.Body>
      
        <Modal.Footer className="flex justify-center bg-white rounded-b-lg">
          <Button
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/dashboard?tab=prices');
            }}
            gradientDuoTone="purpleToPink"
          >
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddPriceTable;
