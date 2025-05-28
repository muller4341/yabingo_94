import { useState, useEffect } from "react";
import { Button, TextInput, Modal } from "flowbite-react";
import { useNavigate } from "react-router-dom";


const formatDate = (isoString) => {
  const date = new Date(isoString);
  if (isNaN(date)) return "Invalid Date";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}`;
};

const Prices = () => {
  const [payload, setPayload] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/price/getallprices");
        const data = await res.json();

        console.log("Fetched data:", data);

      const preparedPayload = data.map(item => ({
  ...item,
  price: item.price || 0,
}));


        setPayload(preparedPayload);
        
      } catch (err) {
        console.error("Error fetching product data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-fuchsia-800">Price List</h2>
      <div className="overflow-y-auto max-h-[550px]">
      <table className="min-w-full border-gray-300 rounded-2xl shadow-lg">
        <thead className="bg-gray-200 text-center sticky top-0 z-10">
  <tr className="bg-gray-200 text-center">
    <th className="px-4 py-2">Sales Location</th>
    <th className="px-4 py-2">Product Name</th>
    <th className="px-4 py-2">Product Type</th>
    <th className="border px-4 py-2">Withholding</th>
    <th className="border px-4 py-2">Unit</th>
    <th className="border px-4 py-2">Status</th>
    <th className="border px-4 py-2">Price per Unit</th>
    <th className="border px-4 py-2">Duration</th> {/* New Column */}
  </tr>
</thead>

      <tbody>
  {payload.length > 0 ? (
    payload.map((product, index) =>
      product.prices.map((priceEntry, priceIndex) => {
        const createdAt = new Date(priceEntry.createdAt);
        const updatedAt = new Date(priceEntry.updatedAt);

        const durationMs = updatedAt - createdAt;
        const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
        const durationStr = durationDays === 0 ? 'Less than a day' : `${durationDays} day(s)`;

        return (
          <tr key={`${index}-${priceIndex}`} className="text-center hover:bg-slate-50">
            {priceIndex === 0 && (
              <>
                <td rowSpan={product.prices.length} className="border-b-2  border-gray-300 px-4 py-2 font-semibold  capitalize">{product.salesLocation}</td>
                <td rowSpan={product.prices.length} className="border-b-2  border-gray-300 px-4 py-2 font-semibold capitalize">{product.productName}</td>
                <td rowSpan={product.prices.length} className="border-b-2  border-gray-300 px-4 py-2 font-semiboldd capitalize">{product.productType}</td>
                <td rowSpan={product.prices.length} className="border-b-2  border-gray-300 px-4 py-2 font-semibold capitalize">{product.withHolding}</td>
                <td rowSpan={product.prices.length} className="border-b-2  border-gray-300 px-4 py-2 font-semibold capitalize">{product.unit}</td>
              </>
            )}

            <td className={` px-4 py-2 ${!priceEntry.isArchived ? "text-green-600 font-semibold border-t-2 border-gray-300" : "text-gray-500 border-b "}`}>
              {priceEntry.isArchived ? "Archived" : "Active"}
            </td>
            <td className={`b px-4 py-2 ${!priceEntry.isArchived ? "text-green-600 font-semibold border-t-2 border-gray-300" : "text-gray-500 border-b "}`}>{priceEntry.amount}</td>
           <td className={` px-4 py-2 ${!priceEntry.isArchived ? "text-green-600 font-semibold border-t-2 border-gray-300" : "text-gray-500 border-b "}`}>
  {formatDate(priceEntry.createdAt)} -{" "}
  {priceEntry.isArchived ? formatDate(priceEntry.updatedAt) : "Now"}
</td>
          </tr>
        );
      })
    )
  ) : (
    <tr>
      <td colSpan="8" className="border px-4 py-2 text-center text-gray-500">
        No products found.
      </td>
    </tr>
  )}
</tbody>



      </table>
      </div>
    </div>
  );
};

export default Prices;
