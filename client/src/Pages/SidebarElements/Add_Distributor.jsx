import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Spinner } from 'flowbite-react';
import { useSelector } from 'react-redux';

const Add_Distributor = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user); // assuming you store user in Redux

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    companyname: '',
    tinnumber: '',
    merchantId: '',
    licensenumber: '',
    licenseexipiration: '',
    region: '',
    zone: '',
    phoneNumber: '',
    password: '',
    profilePicture: '', // optional
  });

  useEffect(() => {
    // Only marketers can access this page
    if (!currentUser || currentUser.role !== 'marketing') {
      console("you are not not allowed this is for marketing") // Or show an access denied message
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const validatePhoneNumber = (phoneNumber) => {
    let normalized = phoneNumber.trim();
    if (normalized.startsWith('0')) {
      normalized = '+251' + normalized.substring(1);
    }
    if (normalized.startsWith('251')) {
      normalized = '+251' + normalized.substring(3);
    }
    const regex = /^\+2519\d{8}$/;
    return regex.test(normalized);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      'companyname',
      'tinnumber',
      'merchantId',
      'licensenumber',
      'licenseexipiration',
      'region',
      'zone',
      'phoneNumber',
      'password',
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setErrorMessage(`Please fill out ${field}`);
        return;
      }
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      setErrorMessage('Phone number must start with +251 and be followed by 9 digits');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch('/api/distributor/adddistributor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to add distributor');
      if(res.ok){

      setSuccessMessage('Distributor added successfully!');
      setTimeout(() => navigate('/dashboard?tab=distributors'), 2000);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center w-full h-full justify-center ">
      <div className="flex flex-col md:w-2/3 w-full">
        <form className="p-10 dark:bg-gray-800 dark:text-white  rounded-2xl shadow-2xl " onSubmit={handleSubmit}>
          <h2 className="text-center text-xl font-bold mb-10 text-fuchsia-800 dark:text-white">
            Register New Distributor
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              ['companyname', 'Company Name'],
              ['tinnumber', 'TIN Number'],
              ['merchantId', 'Merchant ID'],
              ['licensenumber', 'License Number'],
              ['licenseexipiration', 'License Expiration (YYYY-MM-DD)'],
              ['region', 'Region'],
              ['zone', 'Zone'],
              ['phoneNumber', 'Phone Number (e.g. +251...)'],
              ['password', 'Password'],
              
            ].map(([id, label]) => (
              <input
                key={id}
                id={id}
                type={id === 'password' ? 'password' : 'text'}
                placeholder={label}
                value={formData[id]}
                onChange={handleChange}
                className="border rounded py-2 px-3 text-fuchsia-800 border-fuchsia-800 placeholder-yellow-400"
              />
            ))}
          </div>

          {errorMessage && (
            <div className="text-red-500 mt-4 text-sm font-medium text-center">{errorMessage}</div>
          )}

          {successMessage && (
            <div className="text-green-600 mt-4 text-sm font-medium text-center">{successMessage}</div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fuchsia-800 hover:bg-fuchsia-900 text-white font-bold py-2 px-4 rounded-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner color="fuchsia" className="w-5 h-5" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Register Distributor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add_Distributor;
