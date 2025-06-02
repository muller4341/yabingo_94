import { Link,useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Spinner, Modal, TextInput, Select, Button, Alert } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { cement } from '../../assets';
import { mtr } from '../../assets';
import { c_cbe } from '../../assets';
import { motion } from 'framer-motion';
import { HiCheck, HiExclamation, HiUserAdd } from 'react-icons/hi';


const Add_Employee= () => {
    const [isFirstSentence, setIsFirstSentence] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    const navigate = useNavigate();
  
    const {theme } =useSelector((state=>state.theme))
    
    const [formData, setFormData] = useState({
      firstname: '',
      lastname: '',
      phoneNumber: '',  // ✅ Initialized properly
      password: '',
      role: 'guest',
      location:''
  });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value.trim() }));
        // Clear validation error when user starts typing
        if (validationErrors[id]) {
          setValidationErrors(prev => ({ ...prev, [id]: '' }));
        }
    };
  
    const validatePhoneNumber = (phoneNumber) => {
  const regex = /^(09|07)\d{8}$/;
  return regex.test(phoneNumber);
};

    
    const validateForm = () => {
        const errors = {};
        if (!formData.firstname) errors.firstname = 'First name is required';
        if (!formData.lastname) errors.lastname = 'Last name is required';
        if (!formData.phoneNumber) {
          errors.phoneNumber = 'Phone number is required';
        } else if (!validatePhoneNumber(formData.phoneNumber)) {
          errors.phoneNumber = 'Phone number must start with 09 or 07 and be followed by 8 digits';
        }
        if (!formData.password) {
          errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }
        if (formData.role === 'guest') {
          errors.role = 'Please select a role';
        }
        if (formData.role === 'production' && !formData.location) {
          errors.location = 'Please select a production location';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    
    const handleSubmit =  async(e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setErrorMessage(null);
            const res = await fetch('/api/auth/addemployee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
  ...formData,
  location: formData.role === 'production' ? formData.location : ''
})
            });

            const data = await res.json(); // Always parse as JSON
            
            if (!res.ok) {
                throw new Error(data.message || 'Add employee  failed');
            }

            setSuccessMessage('You added a new employee successfully!');
            setShowSuccessModal(true);
        } catch (error) {
            setErrorMessage(error.message);    
        } finally {
            setLoading(false);
        }
        
    }

    console.log(formData)
    useEffect(() => {
            const interval = setInterval(() => {
              setIsFirstSentence((prev) => !prev);
            }, 4000); 
            return () => clearInterval(interval);
          }, []);
        
          

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
                        <HiUserAdd className="w-8 h-8 text-fuchsia-600 dark:text-fuchsia-400 mr-2" />
                        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                            Add New Employee
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextInput
                                id="firstname"
                                type="text"
                                placeholder="First Name"
                                value={formData.firstname}
                                onChange={handleChange}
                                color={validationErrors.firstname ? 'failure' : 'gray'}
                                helperText={validationErrors.firstname}
                            />
                            <TextInput
                                id="lastname"
                                type="text"
                                placeholder="Last Name"
                                value={formData.lastname}
                                onChange={handleChange}
                                color={validationErrors.lastname ? 'failure' : 'gray'}
                                helperText={validationErrors.lastname}
                            />
                        </div>
                        <TextInput
                            id="phoneNumber"
                            type="tel"
                            placeholder="Phone (e.g. 09 or 07...)"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            color={validationErrors.phoneNumber ? 'failure' : 'gray'}
                            helperText={validationErrors.phoneNumber}
                        />
                        <TextInput
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            color={validationErrors.password ? 'failure' : 'gray'}
                            helperText={validationErrors.password}
                        />
                        <Select
                            id="role"
                            value={formData.role}
                            onChange={handleChange}
                            color={validationErrors.role ? 'failure' : 'gray'}
                            helperText={validationErrors.role}
                        >
                            <option value="guest" disabled>Select role</option>
                            <option value="admin">Admin</option>
                            <option value="marketing">Marketing</option>
                            <option value="finance">Finance</option>
                            <option value="cashier">Cashier</option>
                            <option value="dispatcher">Dispatcher</option>
                            <option value="production">Production</option>
                        </Select>

                        {formData.role === 'production' && (
                            <Select
                                id="location"
                                value={formData.location}
                                onChange={handleChange}
                                color={validationErrors.location ? 'failure' : 'gray'}
                                helperText={validationErrors.location}
                            >
                                <option value="" disabled>Select production site</option>
                                <option value="adama">Adama</option>
                                <option value="mugher">Mugher</option>
                                <option value="tatek">Tatek</option>
                            </Select>
                        )}
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
                                    Adding Employee...
                                </>
                            ) : (
                                'Add Employee'
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
                        navigate('/dashboard?tab=employees');
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
                                🎉 Employee has been{' '}
                                <span className="font-semibold text-green-600 dark:text-green-400">
                                    added successfully!
                                </span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                You will be redirected to the employees dashboard shortly.
                            </p>
                        </motion.div>
                    </Modal.Body>

                    <Modal.Footer className="flex justify-center bg-white dark:bg-gray-800 rounded-b-lg">
                        <Button
                            gradientDuoTone="purpleToPink"
                            onClick={() => {
                                setShowSuccessModal(false);
                                navigate('/dashboard?tab=employees');
                            }}
                        >
                            Continue
                        </Button>
                    </Modal.Footer>
                </Modal>
            </motion.div>
        )
    }

export default Add_Employee;

