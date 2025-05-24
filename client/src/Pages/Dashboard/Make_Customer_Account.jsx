import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Spinner ,FileInput, Button,Alert} from 'flowbite-react';
import { useSelector } from 'react-redux';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "../../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';

const Make_Distributor_Account= () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user); // assuming you store user in Redux

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
    const[publishError, setPublishError]= useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError]= useState(null);
  const [file , setFile ]= useState(null);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    region: '',
    zone: '',
    phoneNumber: '',
    password: '',
    profilePicture: '',
  });


  useEffect(() => {
  if (!currentUser || currentUser.role !== 'gust' ) {
    console.log("Access denied: This page is for customers/guests only.");
    navigate('/unauthorized'); 
  }
  else {
    setFormData((prev) => ({
      ...prev,
      firstname: currentUser.firstname || '',
      lastname: currentUser.lastname || '',
      phoneNumber: currentUser.phoneNumber || '',
      password:currentUser.password|| '',
    }));
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

  const requiredFields = ['region', 'zone']; // exclude auto-filled fields

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

    const res = await fetch('/api/distributor/createcustomer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Failed to create customer account ');

    setSuccessMessage('Customer account created');

    // ✅ Send notification
    try {
      const notificationRes = await fetch('/api/notification/postnotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          message: 'You created a user account. You can make an order.',
        }),
      });

      if (!notificationRes.ok) {
        console.error('Failed to create notification:', await notificationRes.json());
      }
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
    }

    // ✅ Delete the guest user
    try {
      const deleteRes = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`, // if your delete route is protected
        },
      });

      const deleteData = await deleteRes.json();

      if (!deleteRes.ok) {
        console.error('Failed to delete guest user:', deleteData.message);
      } else {
        console.log('Guest user deleted:', deleteData.message);
      }
    } catch (deleteError) {
      console.error('Error deleting guest user:', deleteError.message);
    }

    setTimeout(() => navigate('/'), 2000);
  } catch (error) {
    setErrorMessage(error.message);
  } finally {
    setLoading(false);
  }
};

 

  return (
    <div className="flex items-center w-full h-full justify-center ">
      <div className="flex flex-col md:w-2/3 w-full">
        <form className="p-10 py-4 dark:bg-gray-800 dark:text-white  rounded-2xl shadow-2xl " onSubmit={handleSubmit}>
          <h2 className="text-center text-xl font-bold mb-10 text-fuchsia-800 dark:text-white">
            Create user Account
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              ['firstname', 'First Name'],
              ['lastname', 'Last Name'],
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
                readOnly={['firstname', 'lastname', 'phoneNumber'].includes(id)}
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
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Make_Distributor_Account;
