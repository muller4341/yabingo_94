import { useState, useEffect } from "react";
import { Button, TextInput,Modal } from "flowbite-react";
import { useNavigate } from 'react-router-dom';

const AddPriceTable = () => {
  const [products, setProducts] = useState([]);
  const [payload, setPayload] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [initialPayload, setInitialPayload] = useState([]);
  const navigate=useNavigate()


  useEffect(() => { 
  const fetchData = async () => {
    try {
      const [productRes, priceRes] = await Promise.all([
        fetch("/api/product/getproduct"),
        fetch("/api/price/getprice"),
      ]);

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
          price: matchedPrice?.price || 0, // default to 0 if not found
        };
      });

   setProducts(uniqueProducts);
      setPayload(payloadWithPrices);
      setInitialPayload(JSON.parse(JSON.stringify(payloadWithPrices)));
    } catch (err) {
      console.error("Error fetching product/price data:", err);
    }
  };

  fetchData();
}, []);


  const handleAmountChange = (index, value) => {
    const updatedPayload = [...payload];
    updatedPayload[index].price = Number(value);
    setPayload(updatedPayload);
  };

   const handleSubmit = async () => {
  try {
    // Compare current payload with initialPayload
    const changedItems = payload.filter((item, index) => {
      return item.price !== initialPayload[index]?.price;
    });

    if (changedItems.length === 0) {
      alert("❌ No price changes detected. Please modify at least one price.");
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

    setShowSuccessModal(true);
  } catch (err) {
    console.error(err);
    alert("Error submitting prices.");
  }
};


  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-fuchsia-800">Price List</h2>
      <table className="min-w-full border-gray-300 rounded-2xl shadow-lg">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">Sales Location</th>
            <th className="px-4 py-2">Product Name</th>
            <th className="px-4 py-2">Product Type</th>
            <th className="border px-4 py-2">Withholding</th>
            <th className="border px-4 py-2">Unit</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Price per Unit</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product, index) => (
              <tr key={index} className="text-center hover:bg-slate-50">
                <td className="border-b px-4 py-2">{product.salesLocation}</td>
                <td className="border-b px-4 py-2">{product.productName}</td>
                <td className="border-b px-4 py-2">{product.productType}</td>
                <td className="border-b px-4 py-2">{product.withHolding}</td>
                <td className="border-b px-4 py-2">{product.unit}</td>
                <td className="border-b px-4 py-2">{product.status}</td>
                <td className="border-b px-4 py-2">
                  <TextInput
                    type="number"
                    min="0"
                    value={payload[index]?.price || ''}
                    onChange={(e) => handleAmountChange(index, e.target.value)}
                    placeholder="Enter amount"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="border px-4 py-2 text-center text-gray-500">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSubmit} className="bg-fuchsia-800 hover:bg-fuchsia-900">Submit Prices</Button>
      </div>
      <Modal
        show={showSuccessModal}
        size="md"
        popup
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/dashboard?tab=products');
        }}
      >
        <Modal.Header className="bg-green-100 rounded-t-lg">
          <div className="flex items-center justify-center w-full">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="ml-2 text-green-700 text-xl font-semibold">Success</span>
          </div>
        </Modal.Header>
      
        <Modal.Body className="bg-white text-center rounded-b-lg">
          <p className="text-gray-700 text-lg mb-4">
            🎉 Product has been <span className="font-semibold text-green-600">added successfully!</span>
          </p>
          <p className="text-sm text-gray-500">
            You will be redirected to the product dashboard shortly.
          </p>
        </Modal.Body>
      
        <Modal.Footer className="flex justify-center bg-white rounded-b-lg">
          <button
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/dashboard?tab=prices');
            }}
            className="bg-fuchsia-800 hover:bg-fuchsia-900 text-white px-6 py-2 rounded-full shadow-md transition duration-200"
          >
            Continue
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddPriceTable;
