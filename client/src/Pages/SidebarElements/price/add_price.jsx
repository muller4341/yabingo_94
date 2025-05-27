import { useState } from "react";
import { useEffect } from "react";
import { Button, Table, TextInput } from "flowbite-react";

const AddPriceTable = () => {
   const [products, setProducts] = useState([]);
  
    useEffect(() => {
      // Replace with your actual API endpoint
      fetch('/api/product/getproduct')
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch((err) => console.error('Error fetching products:', err));
    }, []);

  const handleSubmit = async () => {
    
    try {
      const res = await fetch("/api/price/setprice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ prices: payload }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Prices submitted successfully!");
      } else {
        alert(data.message || "Submission failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting prices.");
    }
  };

  return (
    <div className="p-4">
     <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Product List</h2>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Sales Location</th>
            <th className="border px-4 py-2">Product Name</th>
            <th className="border px-4 py-2">Product Type</th>
            <th className="border px-4 py-2">Withholding</th>
            <th className="border px-4 py-2">Unit</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Amount per unit</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product, index) => (
              <tr key={index} className="text-center">
                <td className="border px-4 py-2">{product.salesLocation}</td>
                <td className="border px-4 py-2">{product.productName}</td>
                <td className="border px-4 py-2">{product.productType}</td>
                <td className="border px-4 py-2">{product.withHolding}</td>
                <td className="border px-4 py-2">{product.unit}</td>
                <td className="border px-4 py-2">{product.status}</td>
                
                <TextInput
                    type="number"
                    min="0"
                    value={0}
                    onChange={(e) => handleAmountChange(idx, e.target.value)}
                    placeholder="Enter amount"
                  />
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="border px-4 py-2 text-center text-gray-500">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
            
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSubmit}>Submit Prices</Button>
      </div>
    </div>
  );
};

export default AddPriceTable;
