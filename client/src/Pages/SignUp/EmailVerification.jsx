import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'flowbite-react';
import { FaCheckCircle, FaExclamationCircle, FaSignInAlt } from 'react-icons/fa';
import { mtr } from '../../assets';

const EmailVerification = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (token) {
      verifyEmail(token);
    } else {
      setMessage('No verification token provided.');
      setIsLoading(false);
      setIsSuccess(false);
    }
  }, []);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`/api/auth/verifyemail?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
      } else {
        setMessage(data.message || 'Something went wrong.');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Error verifying your email. Please try again later.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-fuchsia-800 to-fuchsia-900 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={mtr} alt="logo" className="w-48 h-auto mx-auto mb-8" />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Spinner className="animate-spin text-fuchsia-800 fill-fuchsia-500" size="xl" />
              <p className="text-xl text-gray-700 font-medium">Verifying your email...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                {isSuccess ? (
                  <FaCheckCircle className="text-5xl text-green-500" />
                ) : (
                  <FaExclamationCircle className="text-5xl text-red-500" />
                )}
                <h1 className="text-2xl font-bold text-fuchsia-800">Email Verification</h1>
                <p className="text-gray-600 text-center">{message}</p>
              </div>

              {isSuccess && (
                <button
                  onClick={handleLoginRedirect}
                  className="w-full bg-fuchsia-800 hover:bg-fuchsia-900 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                >
                  <span>Go to Login</span>
                  <FaSignInAlt className="text-sm" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
