import { useEffect, useState } from "react";
import { TextInput, Button, Alert, Select } from "flowbite-react";
import { useNavigate } from "react-router-dom";

const amountOptions = ["20", "30", "40", "50", "100", "200"];
const rentOptions = ["18", "22", "27"];

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
    <div className="flex flex-col items-center space-y-4 max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <div className="flex flex-row  items-end  w-full justify-end">
      <button onClick={() => navigate("/dashboard?tab=allprice")} className="bg-fuchsia-500 hover:bg-fuchsia-600 rounded-md text-white">View All Prices</button>
      </div>
      <h2 className="text-2xl font-bold mb-2">Set Game Price</h2>
      {success && <Alert color="success">{success}</Alert>}
      {error && <Alert color="failure">{error}</Alert>}
      <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-semibold">Amount</label>
          <Select value={amount} onChange={e => setAmount(e.target.value)} required>
            <option value="" disabled>Select amount</option>
            {amountOptions.map(opt => (
              <option key={opt} value={opt}>{opt} Birr</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Rent Percentage</label>
          <Select value={rentpercent} onChange={e => setRentpercent(e.target.value)} required>
            <option value="" disabled>Select rent %</option>
            {rentOptions.map(opt => (
              <option key={opt} value={opt}>{opt}%</option>
            ))}
          </Select>
        </div>
        <Button type="submit" isProcessing={loading} disabled={loading} color="success">
          {loading ? "Saving..." : "Set Price"}
        </Button>
      </form>
    </div>
  );
};

export default SetPrice;
