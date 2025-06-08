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
    companyname: '',
    tinnumber: '',
    merchantId: '',
    licensenumber: '',
    licenseexipiration: '',
    region: '',
    zone: '',
    phoneNumber: '',
    password: '',
    profilePicture: '',
    url:''
  });
  const handleUploadImage = async () => {
  try {
    if (!file) {
      setImageUploadError('Please select a document');
      return;
    }

    const storage = getStorage(app);
    const filename = new Date().getTime() + '-' + file.name;
    const storageRef = ref(storage, filename);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageUploadError('An error occurred during upload');
        setImageUploadProgress(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUploadProgress(null);
          setImageUploadError(null);
          setFormData((prev) => ({ ...prev, url: downloadURL }));
        });
      }
    );
  } catch (error) {
    setImageUploadError('Upload failed');
    setImageUploadProgress(null);
  }
};


  useEffect(() => {
  if (!currentUser || (currentUser.role !== 'customer' && currentUser.role !== 'guest')) {
    console.log("Access denied: This page is for customers/guests only.");
    navigate('/unauthorized'); 
  }
}, [currentUser, navigate]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const validatePhoneNumber = (phoneNumber) => {
  const regex = /^(09|07)\d{8}$/;
  return regex.test(phoneNumber);
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
      "url",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setErrorMessage(`Please fill out ${field}`);
        return;
      }
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      setErrorMessage('Phone number must start with 09 or 07  and be followed by 8 digits');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch('/api/distributor/createdistributor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to add distributor');
      if(res.ok){

      setSuccessMessage('Distributor added successfully!');
     // Send notification
      try {
        const notificationRes = await fetch('/api/notification/postnotification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.token}`
          },
          body: JSON.stringify({
            message: "You created a distributor account. Just wait until it's approved — it is under review."
          })
        });

        if (!notificationRes.ok) {
          console.error('Failed to create notification:', await notificationRes.json());
        }
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
      }

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
        <form className="p-10 py-4 dark:bg-gray-800 dark:text-white  rounded-2xl shadow-2xl " onSubmit={handleSubmit}>
          <h2 className="text-center text-xl font-bold mb-10 text-fuchsia-800 dark:text-white">
            Create Distributor Account
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
              ['phoneNumber', 'Phone Number (e.g. 09 or 07...)'],
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
          <div>
            <lable>upload document</lable>
              <div  className="flex items-center  justify-between gap-4 p-3
             border border-fuchsia-800  rounded-3xl"> 
             <FileInput
              type='file' 
              accept="image/*,application/pdf"
              onChange={(e)=>setFile(e.target.files[0])}/>
             <Button type="button" 
             size='sm'  outline
             onClick={handleUploadImage} 
             disabled={imageUploadProgress}>
                {imageUploadProgress ? (
                    <div className="flex items-center gap-2">
                        <CircularProgressbar value={imageUploadProgress} text={`${imageUploadProgress ||0}%`} />
                        <p>Uploading...</p>
                    </div>
                ) : (
                  'Upload file'
                )}
                  
                  </Button>
             </div>
             {imageUploadError && (
                <Alert color="failure"> {imageUploadError} </Alert>
                )}  
                
                {formData.image && (
                    <img src={formData.image} alt="uploaded"
                     className="w-120 h-120  mx-auto" />
                )} 



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
