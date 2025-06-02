import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaEnvelope, FaSignInAlt } from 'react-icons/fa';
import { mtr } from '../../assets';

const Success = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-fuchsia-800 to-fuchsia-900 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={mtr} alt="logo" className="w-48 h-auto mx-auto mb-8" />
        </div>

        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center justify-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <FaCheckCircle className="text-6xl text-green-500" />
            </motion.div>

            <motion.h1
              className="text-3xl font-bold text-fuchsia-800 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Account Created Successfully!
            </motion.h1>

            <motion.div
              className="flex items-center space-x-2 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <FaEnvelope className="text-fuchsia-800" />
              <p className="text-center">
                Please check your email to verify your account.
              </p>
            </motion.div>

            <motion.div
              className="w-full pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/signin"
                className="w-full bg-fuchsia-800 hover:bg-fuchsia-900 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
              >
                <span>Go to Sign In</span>
                <FaSignInAlt className="text-sm" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Success;
