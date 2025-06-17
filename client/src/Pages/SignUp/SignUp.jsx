import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Spinner } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { cement, mtr, c_cbe } from '../../assets';
import { FaUser, FaPhone, FaLock, FaSignInAlt, FaIndustry, FaTruck, FaBuilding } from 'react-icons/fa';

const SignUp = () => {
  const [isFirstSentence, setIsFirstSentence] = useState(true);
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.theme);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: <FaIndustry className="text-amber-300 text-5xl mb-4" />,
      title: "Quality Cement Products",
      description: "Access our premium range of cement products for your construction needs"
    },
    {
      icon: <FaTruck className="text-amber-300 text-5xl mb-4" />,
      title: "Nationwide Delivery",
      description: "Fast and reliable delivery service across the country"
    },
    {
      icon: <FaBuilding className="text-amber-300 text-5xl mb-4" />,
      title: "Trusted by Builders",
      description: "Join thousands of satisfied customers who trust our products"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
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
    const regex = /^(07|09)\d{8}$/;
    return regex.test(phoneNumber.trim());
  };

  const handleSubmit = async(e) => {
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

      const data = await res.json();
      
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
  };

  return (
    <div className="min-h-screen flex md:flex-row flex-col w-full bg-gradient-to-br bg-fuchsia-800">
      {/* Left side - Branding */}
      <div className="py-12 md:py-0 flex-col justify-center items-center md:w-1/2 w-full md:h-screen h-auto hidden md:flex bg-fuchsia-800 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?ixlib=rb-4.0.3')] bg-cover bg-center opacity-20"></div>
        <div className="space-y-8 text-center relative z-10">
          <img src={cement} alt="cement" className="md:w-[400px] md:h-[300px] h-40 w-40 mx-auto transform hover:scale-105 transition-transform duration-300" />
          
          {/* Feature Slideshow */}
          <div className="relative h-48 overflow-hidden">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute w-full transition-opacity duration-500 ${
                  currentSlide === index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  {feature.icon}
                  <h3 className="text-2xl font-bold text-amber-300">{feature.title}</h3>
                  <p className="text-fuchsia-100 max-w-md">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-4">
            <img src={c_cbe} alt="logo" className="md:w-32 md:h-16 h-40 w-2" />
            <p className="text-amber-300 font-bold text-xl">Powered by Commercial Bank of Ethiopia</p>
          </div>
        </div>
      </div>

      {/* Right side - Sign Up Form */}
      <div className="flex justify-center items-center md:w-1/2 w-full min-h-screen bg-white rounded-l-[60px] md:rounded-l-[90px]">
        <div className="w-full max-w-md px-8 py-12">
          <div className="text-center mb-12">
            <img src={mtr} alt="logo" className="w-78 h-auto mx-auto mb-8" />
            <h1 className="text-3xl font-bold text-fuchsia-800 mb-2">Create an Account</h1>
            <p className="text-gray-600">Join our cement distribution network</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-fuchsia-600" />
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
                  <FaUser className="text-fuchsia-600" />
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
                <FaPhone className="text-fuchsia-600" />
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 border-2 border-fuchsia-200 rounded-lg focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 transition-all duration-200"
                id="phoneNumber"
                type="tel"
                placeholder="Phone Number (07 or 09...)"
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-fuchsia-600" />
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
              className="w-full bg-gradient-to-r from-fuchsia-800 to-amber-600 hover:from-fuchsia-900 hover:to-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
