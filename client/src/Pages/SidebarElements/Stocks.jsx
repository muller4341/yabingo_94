import React, { useEffect, useState } from 'react';

const ProductTable = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/product/getstock')
      .then((res) => res.json())
      .then((data) => {
        const seen = new Set();
        const uniqueProducts = data.filter((product) => {
          const key = `${product.salesLocation}|${product.productName}|${product.productType}|${product.withHolding}|${product.unit}|${product.status}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setProducts(uniqueProducts);
      })
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-fuchsia-800">Product Stock Summary</h2>
        <div className="overflow-y-auto max-h-[550px]">
      <table className="min-w-full border-gray-300 rounded-2xl shadow-lg">
        <thead className="bg-gray-200 text-center sticky top-0 z-10">
          <tr className="bg-gray-200 text-center">
            <th className="px-4 py-2">Sales Location</th>
            <th className="px-4 py-2">Product Name</th>
            <th className="px-4 py-2">Product Type</th>
            <th className="px-4 py-2">Withholding</th>
            <th className="px-4 py-2">Unit</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Quantity</th> {/* NEW COLUMN */}
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product, index) => {
              const quantity = product.quantity;


              return (
                <tr key={index} className="text-center hover:bg-slate-50">
                  <td className="border-b px-4 py-2 capitalize">{product.salesLocation}</td>
                  <td className="border-b px-4 py-2 capitalize">{product.productName}</td>
                  <td className="border-b px-4 py-2 capitalize">{product.productType}</td>
                  <td className="border-b px-4 py-2">{product.withHolding}</td>
                  <td className="border-b px-4 py-2">{product.unit}</td>
                  <td className="border-b px-4 py-2">{product.status}</td>
                  <td className="border-b px-4 py-2 font-semibold text-green-600">{quantity}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className="border px-4 py-2 text-center text-gray-500">
                No product data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default ProductTable;
