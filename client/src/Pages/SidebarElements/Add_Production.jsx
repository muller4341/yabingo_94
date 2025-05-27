import { useState } from 'react';
import { Modal,Spinner } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Add_product = () => {
   const { currentUser } = useSelector((state) => state.user);
   console.log("saleslocation",currentUser.location)
   const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    salesLocation: currentUser.location,
    productName: '',
    productType: '',
    withHolding: '',
    quantity: ''
  });
  const finalFormData = {
    ...formData,
    salesLocation: currentUser.location, // inject location here
  };
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const { salesLocation, productName, productType, withHolding, quantity } = formData;
    if (!salesLocation || !productName || !productType || !withHolding || !quantity) {
      setErrorMessage('All fields are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/product/addproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(finalFormData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Product creation failed');

      setShowSuccessModal(true);
      // setTimeout(() => navigate('/dashboard?tab=products'), 2000);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        <h2 className="text-xl font-bold text-center text-fuchsia-800 dark:text-white mb-6">
          Add New Product
        </h2>

        <div className="space-y-4">
          <input
            id="salesLocation"
            type="text"
           value={currentUser.location}
            disabled
            className="w-full border border-fuchsia-800 rounded px-3 py-2 text-fuchsia-800 placeholder-gray-400"
          />

          <select
          id="productName"
          value={formData.productName}
          onChange={handleChange}
          className="w-full p-3 border rounded border-fuchsia-800 text-fuchsia-800"
        >
          <option value="" disabled>Select Product Name</option>
          <option value="PPC PACKED">PPC PACKED</option> "PPC PACKED", "OPC BULK", "OPC PACKED", "PPC BULK"
          <option value="OPC PACKED">OPC PACKED</option>
          {currentUser.location !== "adama" &&(
             <>
           <option value="OPC BULK">OPC BULK</option>
          <option value="PPC BULK">PPC BULK</option>
          </>
          )}
        </select>

          <select
          id="productType"
          value={formData.productType}
          onChange={handleChange}
          className="w-full p-3 border rounded border-fuchsia-800 text-fuchsia-800"
        >
          <option value="" disabled>Select Cement Type</option>
          <option value="cement">Cement</option>
        </select>

         <select
          id="withHolding"
          value={formData.withHolding}
          onChange={handleChange}
          className="w-full p-3 border rounded border-fuchsia-800 text-fuchsia-800"
        >
          <option value=""disabled>Select Holding Type</option>
          <option value="yes">yes</option>
          <option value="no">No</option>
        </select>
          <input
            id="quantity"
            type="number"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border border-fuchsia-800 rounded px-3 py-2 text-fuchsia-800 placeholder-gray-400"
          />
        </div>

        {errorMessage && (
          <p className="mt-4 text-red-500 text-sm text-center">{errorMessage}</p>
        )}

        {successMessage && (
          <p className="mt-4 text-green-600 text-sm text-center">{successMessage}</p>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-fuchsia-800 text-white font-semibold rounded hover:bg-fuchsia-900 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Spinner className="w-6 h-6" color="fuchsia" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              'Add Product'
            )}
          </button>
        </div>
      </form>
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
        navigate('/dashboard?tab=products');
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

export default Add_product;
