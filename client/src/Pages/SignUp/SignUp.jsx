import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Spinner } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { cement } from '../../assets';
import { mtr } from '../../assets';
import { c_cbe } from '../../assets';
import { FaUser, FaPhone, FaLock, FaSignInAlt } from 'react-icons/fa';

const SignUp = () => {
    const [isFirstSentence, setIsFirstSentence] = useState(true);
    const navigate = useNavigate();
  
    const {theme } =useSelector((state=>state.theme))
    
    const [loading, setLoading] = useState(false);
    const[errorMessage, setErrorMessage] = useState(null);
    const [formData, setFormData] = useState({
      firstname: '',
      lastname: '',
      email: '',
      phoneNumber: '',  // ✅ Initialized properly
      password: '',
      role: 'gust',
  });
    const handleChange = (e) => {
        setFormData({...formData, [e.target.id]: e.target.value.trim()})
    };
    const validateEmail = (email) => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(email);
    };
  
    const validatePhoneNumber = (phoneNumber) => {
      let normalized = phoneNumber.trim();
      if (normalized.startsWith('0')) {
        normalized = '+251' + normalized.substring(1); // Convert local format to international
      }
      if (normalized.startsWith('251')) {
        normalized = '+251' + normalized.substring(3);
      }
      const regex = /^\+2519\d{8}$/; // Enforces 9 digits after +2519
      return regex.test(normalized);
      
    };
    
    const handleSubmit =  async(e) => {
        e.preventDefault();
        
        if (!formData.firstname || !formData.lastname || !formData.phoneNumber || !formData.password) {
          setErrorMessage('All fields are required. Please fill them out');
          return;
      }
      
      if (!validatePhoneNumber(formData.phoneNumber)) {
        setErrorMessage('Phone number must start with 09 or 07 and be followed by 8 digits');
        return;
      }
      try {
        setLoading(true);
        setErrorMessage(null);
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await res.json(); // Always parse as JSON
        
        if (!res.ok) {
            throw new Error(data.message || 'Signup failed');
        }

        if (res.ok) {
            navigate('/signin');
        }
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
            }, 4000); // Switch every 2 seconds (adjust timing as needed)
            return () => clearInterval(interval);
          }, []);
        
          
          const wordVariants = {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 },
          };
        

    return (
    <div className="min-h-screen flex md:flex-row flex-col w-full bg-gradient-to-br from-fuchsia-800 to-fuchsia-900">
      {/* Left side - Branding */}
      <div className="py-12 md:py-0 flex-col justify-center items-center md:w-1/2 w-full md:h-screen h-auto hidden md:flex bg-fuchsia-800/90 backdrop-blur-sm">
        <div className="space-y-8 text-center">
          <img src={cement} alt="cement" className="md:w-[500px] md:h-[400px] h-40 w-40 mx-auto transform hover:scale-105 transition-transform duration-300" />
          <div className="flex items-center justify-center space-x-4">
            <img src={c_cbe} alt="logo" className="md:w-32 md:h-16 h-40 w-2" />
            <p className="text-yellow-400 font-bold text-xl">Powered by Commercial Bank of Ethiopia</p>
          </div>
        </div>
      </div>

      {/* Right side - Sign Up Form */}
      <div className="flex justify-center items-center md:w-1/2 w-full min-h-screen bg-white rounded-l-[60px] md:rounded-l-[90px] shadow-2xl">
        <div className="w-full max-w-md px-8 py-12">
          <div className="text-center mb-12">
            <img src={mtr} alt="logo" className="w-48 h-auto mx-auto mb-8" />
            <h1 className="text-3xl font-bold text-fuchsia-800 mb-2">Create an Account</h1>
            <p className="text-gray-600">Join us today and get started</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-fuchsia-800" />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 border-2 border-fuchsia-200 rounded-lg focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 transition-all duration-200"
                  id="firstname"
                  type="text"
                  placeholder="First Name"
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-fuchsia-800" />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 border-2 border-fuchsia-200 rounded-lg focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 transition-all duration-200"
                  id="lastname"
                  type="text"
                  placeholder="Last Name"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="text-fuchsia-800" />
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 border-2 border-fuchsia-200 rounded-lg focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 transition-all duration-200"
                id="phoneNumber"
                type="tel"
                placeholder="Phone Number (e.g. 09 or 07...)"
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-fuchsia-800" />
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 border-2 border-fuchsia-200 rounded-lg focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 transition-all duration-200"
                id="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
              />
            </div>

            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            <button
              className="w-full bg-fuchsia-800 hover:bg-fuchsia-900 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Spinner className="animate-spin text-white fill-fuchsia-500" />
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/signin" className="text-fuchsia-800 hover:text-fuchsia-900 font-semibold inline-flex items-center space-x-1">
                <span>Sign in</span>
                <FaSignInAlt className="text-sm" />
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
