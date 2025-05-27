import React, { useEffect, useState } from 'react';

const ProductTable = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Replace with your actual API endpoint
    fetch('/api/product/getproduct')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  return (
    <div className="p-4 ">
      <h2 className="text-xl font-bold mb-4 text-fuchsia-800 ">Product List</h2>
      <table className="min-w-full  border-gray-300 rounded-2xl shadow-lg">
        <thead>
          <tr className="bg-gray-200">
            <th className=" px-4 py-2">Sales Location</th>
            <th className=" px-4 py-2">Product Name</th>
            <th className=" px-4 py-2">Product Type</th>
            <th className="border px-4 py-2">Withholding</th>
            <th className="border px-4 py-2">Unit</th>
            <th className="border px-4 py-2">Status</th>
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
  );
};

export default ProductTable;
