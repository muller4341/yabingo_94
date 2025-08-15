import { useEffect, useState } from "react";
import { TextInput, Button, Alert, Select } from "flowbite-react";
import { useNavigate } from "react-router-dom";

const amountOptions = ["20", "30", "40", "50", "100", "200"];
const rentOptions = ["20", "21", "22"];

const SetPrice = () => {
  const [amount, setAmount] = useState("");
  const [rentpercent, setRentpercent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    // Fetch current user's price
    const fetchPrice = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/price/me", { credentials: "include" });
        const data = await res.json();
        if (data.success && data.data) {
          setAmount(data.data.amount);
          setRentpercent(data.data.rentpercent);
        }
      } catch (err) {
        setError("Failed to fetch your price info.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrice();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/price/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount, rentpercent }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Price updated successfully!");
      } else {
        setError(data.message || "Failed to set price.");
      }
    } catch (err) {
      setError("Failed to set price.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-lg mx-auto mt-10 p-8 rounded-3xl shadow-lg bg-white">
      <div className="flex flex-row items-end w-full justify-end">
      <button onClick={() => navigate("/dashboard?tab=allprice")} className="bg-gradient-to-r from-fuchsia-500 to-yellow-400 hover:from-fuchsia-600 hover:to-yellow-500 rounded-xl text-white font-bold px-4 py-2 shadow transition-all">View All Prices</button>
      </div>
      <h2 className="text-3xl font-extrabold text-fuchsia-700 mb-4 text-center tracking-tight drop-shadow">Set Game Price</h2>
      {success && <Alert color="success">{success}</Alert>}
      {error && <Alert color="failure">{error}</Alert>}
      <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-2 font-bold text-fuchsia-700">Amount</label>
          <Select value={amount} onChange={e => setAmount(e.target.value)} required className="w-full rounded-xl border-fuchsia-300 focus:ring-fuchsia-400 focus:border-fuchsia-400 shadow-sm">
            <option value="" disabled>Select amount</option>
            {amountOptions.map(opt => (
              <option key={opt} value={opt}>{opt} Birr</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block mb-2 font-bold text-fuchsia-700">Rent Percentage</label>
          <Select value={rentpercent} onChange={e => setRentpercent(e.target.value)} required className="w-full rounded-xl border-fuchsia-300 focus:ring-fuchsia-400 focus:border-fuchsia-400 shadow-sm">
            <option value="" disabled>Select rent %</option>
            {rentOptions.map(opt => (
              <option key={opt} value={opt}>{opt}%</option>
            ))}
          </Select>
        </div>
        <Button type="submit" isProcessing={loading} disabled={loading} className="bg-gradient-to-r from-fuchsia-500 to-yellow-400 hover:from-fuchsia-600 hover:to-yellow-500 rounded-xl text-white font-bold px-6 py-2 shadow-lg transition-all">
          {loading ? "Saving..." : "Set Price"}
        </Button>
      </form>
    </div>
  );
};

export default SetPrice;
