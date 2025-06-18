import { useState } from 'react';
import { Modal, Spinner, TextInput, Select, Button, Alert } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiCheck, HiExclamation, HiCube } from 'react-icons/hi';
import { HiPlus } from 'react-icons/hi2';

const Add_Production = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    salesLocation: currentUser.location,
    productName: '',
    productType: '',
    withHolding: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!formData.productName) errors.productName = 'Product name is required';
    if (!formData.productType) errors.productType = 'Product type is required';
    if (!formData.withHolding) errors.withHolding = 'Holding type is required';
    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || formData.quantity <= 0) {
      errors.quantity = 'Quantity must be a positive number';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value.trim() }));
    // Clear validation error when user starts typing
    if (validationErrors[id]) {
      setValidationErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
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
        body: JSON.stringify({
          ...formData,
          salesLocation: currentUser.location,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Product creation failed');

      setSuccessMessage('Product added successfully!');
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center items-center w-full h-full p-4"
    >
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-xl p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-center mb-8">
          <HiCube className="w-8 h-8 text-fuchsia-600 dark:text-fuchsia-400 mr-2" />
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Add New Product
          </h2>
        </div>

        <div className="space-y-6">
          <TextInput
            id="salesLocation"
            type="text"
            value={currentUser.location}
            disabled
            className="bg-gray-50 dark:bg-gray-700"
            helperText="Sales location is automatically set based on your account"
          />

          <div>
            <Select
              id="productName"
              value={formData.productName}
              onChange={handleChange}
              color={validationErrors.productName ? 'failure' : 'gray'}
              helperText={validationErrors.productName}
            >
              <option value="" disabled>Select Product Name</option>
              <option value="PPC PACKED">PPC PACKED</option>
              <option value="OPC PACKED">OPC PACKED</option>
              {currentUser.location !== "adama" && (
                <>
                  <option value="OPC BULK">OPC BULK</option>
                  <option value="PPC BULK">PPC BULK</option>
                </>
              )}
              <option value="new ">
      ➕  Add New Product name</option>
            </Select>
          </div>

          <div>
            <Select
              id="productType"
              value={formData.productType}
              onChange={handleChange}
              color={validationErrors.productType ? 'failure' : 'gray'}
              helperText={validationErrors.productType}
            >
              <option value="" disabled>Select Cement Type</option>
              <option value="cement">Cement</option>
              <option value="new ">  ➕  Add New Product type</option>
            </Select>
          </div>

          <div>
            <Select
              id="withHolding"
              value={formData.withHolding}
              onChange={handleChange}
              color={validationErrors.withHolding ? 'failure' : 'gray'}
              helperText={validationErrors.withHolding}
            >
              <option value="" disabled>Select Holding Type</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </div>

          <div>
            <TextInput
              id="quantity"
              type="number"
              placeholder="Enter quantity"
              value={formData.quantity}
              onChange={handleChange}
              color={validationErrors.quantity ? 'failure' : 'gray'}
              helperText={validationErrors.quantity}
              min="1"
              step="1"
            />
          </div>
        </div>

        {errorMessage && (
          <Alert color="failure" className="mt-4">
            <span className="font-medium">Error!</span> {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert color="success" className="mt-4">
            <span className="font-medium">Success!</span> {successMessage}
          </Alert>
        )}

        <div className="mt-8">
          <Button
            type="submit"
            gradientDuoTone="purpleToPink"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Adding Product...
              </>
            ) : (
              'Add Product'
            )}
          </Button>
        </div>
      </motion.form>

      <Modal
        show={showSuccessModal}
        size="md"
        popup
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/dashboard?tab=product');
        }}
      >
        <Modal.Header className="bg-green-50 dark:bg-green-900 rounded-t-lg">
          <div className="flex items-center justify-center w-full">
            <HiCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
            <span className="ml-2 text-green-700 dark:text-green-300 text-xl font-semibold">
              Success
            </span>
          </div>
        </Modal.Header>

        <Modal.Body className="bg-white dark:bg-gray-800 text-center rounded-b-lg">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
              🎉 Product has been{' '}
              <span className="font-semibold text-green-600 dark:text-green-400">
                added successfully!
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You will be redirected to the product dashboard shortly.
            </p>
          </motion.div>
        </Modal.Body>

        <Modal.Footer className="flex justify-center bg-white dark:bg-gray-800 rounded-b-lg">
          <Button
            gradientDuoTone="purpleToPink"
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/dashboard?tab=product');
            }}
          >
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
};

export default Add_Production;
