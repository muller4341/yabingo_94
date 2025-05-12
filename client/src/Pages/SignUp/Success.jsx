import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { lottery } from '../../assets';

const Success = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gradient-to-r from-fuchsia-800 to-yellow-100">
      <img src={lottery} alt="logo" className="w-60 h-60 mb-8" />
      
      <motion.h1
        className="text-4xl font-bold text-white mb-4"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        🎉 Account Created!
      </motion.h1>

      <motion.p
        className="text-lg text-white mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Please check your email to verify your account.
      </motion.p>

      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
       
      </motion.div>
    </div>
  );
};

export default Success;
