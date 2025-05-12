import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmailVerification = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (token) {
      verifyEmail(token);
    } else {
      setMessage('No verification token provided.');
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`/api/auth/verifyemail?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.message || 'Something went wrong.');
      }
    } catch (error) {
      setMessage('Error verifying your email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-fuchsia-800 to-yellow-100 text-center p-6">
      {isLoading ? (
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          <p className="text-xl text-white">Verifying...</p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <h1 className="text-2xl font-semibold text-fuchsia-700 mb-4">Email Verification</h1>
          <p className="text-lg text-gray-700 mb-6">{message}</p>

          {message === 'Email verified successfully. You can now log in.' && (
            <button
              onClick={handleLoginRedirect}
              className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Go to Login
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailVerification;
