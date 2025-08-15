import { Modal, TextInput, Button, Alert } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect, } from "react";
import { app, storage } from "../../firebase";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  updateStart,
  updateSuccess,
  updateFail,
  deleteUserFail,
  deleteUserStart,
  deleteUserSuccess,
  signOutSuccess
} from "../../redux/user/userSlice";
import { Link } from 'react-router-dom';

const DashProfile = () => {
  const { currentUser, error, loading } = useSelector((state) => state.user);
   const [showPassword, setShowPassword] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(0);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(false);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [formData, setFormData] = useState({});
  const filePickerRef = useRef();
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const imageChangeHandler = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setImageFileUploadError('File size must be less than 2MB');
        return;
      }
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        console.error('Upload error:', error);
        setImageFileUploadError('Image could not upload, file must be less than 2MB');
        setImageFile(null);
        setImageFileUploadProgress(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            setImageFileUrl(downloadURL);
            setFormData({ ...formData, profilePicture: downloadURL });
            setImageFileUploading(false);
          })
          .catch((error) => {
            console.error("Image upload failed:", error);
            setImageFileUploadError('Failed to get download URL');
          });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);

    if (imageFileUploading) {
      setUpdateUserError('Please wait for the image upload to complete');
      return;
    }

    // Only send fields relevant to password/profile picture
    const payload = {};
    if (formData.currentPassword && formData.newPassword) {
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.newPassword;
    }
    if (formData.profilePicture) {
      payload.profilePicture = formData.profilePicture;
    }

    if (Object.keys(payload).length === 0) {
      setUpdateUserError('No changes were made');
      return;
    }

    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update-password-picture/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("Profile updated successfully");
      } else {
        const errorData = await res.json();
        dispatch(updateFail(errorData.message));
        setUpdateUserError(errorData.message);
      }
    } catch (error) {
      dispatch(updateFail(error.message));
      setUpdateUserError(error.message);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        dispatch(deleteUserSuccess(data));
      } else {
        const errorData = await res.json();
        dispatch(deleteUserFail(errorData.message));
      }
    } catch (error) {
      dispatch(deleteUserFail(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signOutSuccess());
      }
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6  dark:bg-gray-800 rounded-3xl shadow-lg bg-white"
    >
      <h1 className="text-3xl font-bold text-center mb-8 text-fuchsia-600 dark:text-fuchsia-400">
        Profile Settings
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={imageChangeHandler}
            ref={filePickerRef}
            hidden
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-32 h-32 cursor-pointer"
            onClick={() => filePickerRef.current.click()}
          >
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-fuchsia-500 dark:border-fuchsia-400">
              {imageFileUploadProgress > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <CircularProgressbar
                    value={imageFileUploadProgress}
                    text={`${imageFileUploadProgress}%`}
                    styles={{
                      root: { width: '100%', height: '100%' },
                      path: { stroke: '#d946ef' },
                      text: { fill: '#fff', fontSize: '16px' },
                    }}
                  />
                </div>
              )}
              <img
                src={imageFileUrl || currentUser.profilePicture}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click to change profile picture
          </p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            id="firstname"
            type="text"
            placeholder="First Name"
            defaultValue={currentUser.firstname}
            readOnly
            className="w-full"
          />
          <TextInput
            id="lastname"
            type="text"
            placeholder="Last Name"
            defaultValue={currentUser.lastname}
            readOnly
            className="w-full"
          />
          <TextInput
            id="location"
            type="text"
            placeholder="Location"
            defaultValue={currentUser.location}
            readOnly
            className="w-full"
          />
          <TextInput
            id="phoneNumber"
            type="phoneNumber"
            placeholder="phoneNumber"
            defaultValue={currentUser.phoneNumber}
            onChange={changeHandler}
            readOnly
            className="w-full"
          />
        {/* Password change fields */}
        <div className="relative w-full rounded-md border ">
          <input
            id="currentPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Current Password"
            onChange={changeHandler}
            className="w-full pr-20 py-2 px-4 rounded-md focus:outline-none mb-2"
          />
          
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600 border-gray-50"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div> <input
  id="newPassword"
  type={showPassword ? "text" : "password"}
  placeholder="New Password"
  onChange={changeHandler}
  className="w-full pr-20 py-2 px-4 rounded-md focus:outline-none"
/>

        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {updateUserSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert color="success">{updateUserSuccess}</Alert>
            </motion.div>
          )}
          {updateUserError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert color="failure">{updateUserError}</Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            type="submit"
            gradientDuoTone="purpleToPink"
            className="w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
          
          <Button
            color="gray"
            onClick={handleSignOut}
            className="w-full sm:w-auto"
          >
            Sign Out
          </Button>
        </div>
      </form>

      {/* Delete Account Modal */}
      
    </motion.div>
  );
};

export default DashProfile;
