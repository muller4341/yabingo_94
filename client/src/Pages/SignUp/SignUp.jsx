import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Spinner } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { bingo } from '../../assets';
import { FaUser, FaPhone, FaLock, FaSignInAlt, FaMoneyBillWave, FaTrophy, FaGift } from 'react-icons/fa';
import { GiPerspectiveDiceSixFacesRandom, GiPartyPopper } from 'react-icons/gi';
import { useRef } from 'react';

const SignUp = () => {
  const [isFirstSentence, setIsFirstSentence] = useState(true);
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.theme);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  // Remove pendingUserId and pollingRef

  const features = [
    {
      icon: <FaMoneyBillWave className="text-4xl text-yellow-400" />,
      title: "Win Real Prizes",
      description: "እውነተኛ ሽልማቶችን አሸንፉ!"
    },
    {
      icon: <GiPerspectiveDiceSixFacesRandom className="text-4xl text-green-600" />,
      title: "Random Draws",
      description: "ድንገተኛ ማሰባሰብ!"
    },
    {
      icon: <FaTrophy className="text-4xl text-amber-500" />,
      title: "Leaderboard",
      description: "የአሸናፊዎች ዝርዝር!"
    },
    {
      icon: <FaGift className="text-4xl text-pink-500" />,
      title: "Daily Bonuses",
      description: "ዕለታዊ ተጨማሪ እነሆች!"
    },
    {
      icon: <GiPartyPopper className="text-4xl text-fuchsia-500" />,
      title: "Fun & Social",
      description: "ደስታና ማህበራዊነት!"
    },
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
    phoneNumber: '',
    password: '',
    location: '',
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
        setShowApprovalModal(true);
        setTimeout(() => {
          setShowApprovalModal(false);
          navigate('/signin');
        }, 3000);
      }
    } catch (error) {
      setErrorMessage(error.message);    
    } finally {
      setLoading(false);
    }
  };

  // Polling for approval
  // useEffect(() => {
  //   if (showApprovalModal && pendingUserId) {
  //     pollingRef.current = setInterval(async () => {
  //       try {
  //         const res = await fetch(`/api/users/${pendingUserId}`);
  //         const data = await res.json();
  //         if (res.ok && data.status === 'approved') {
  //           clearInterval(pollingRef.current);
  //           setShowApprovalModal(false);
  //           navigate('/signin');
  //         }
  //       } catch {}
  //     }, 3000);
  //     return () => clearInterval(pollingRef.current);
  //   }
  // }, [showApprovalModal, pendingUserId, navigate]);

  return (
    <div className="min-h-screen flex md:flex-row flex-col w-full bg-gradient-to-br from-[#808000] via-yellow-400/30 to-fuchsia-700/40 overflow-hidden">
      {/* Left side - Branding and Features */}
      <div className="flex flex-col justify-center items-center md:w-1/2 w-full h-full min-h-screen md:flex bg-[inherit] ">
        {/* Large logo centered */}
        <div className="flex flex-col items-center justify-center w-full h-full z-10">
          <img src={bingo} alt="bingo" className="w-[380px] h-[280px] mx-auto mb-10 mt-8 drop-shadow-2xl rounded-3xl border-4 border-amber-300 bg-white/20" />
          {/* Feature Slideshow */}
          <div className="relative h-48 flex flex-col items-center justify-center w-full">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute w-full flex flex-col items-center justify-center transition-opacity duration-700 ${
                  currentSlide === index ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="bg-white/30 rounded-full p-4 shadow-md mb-2 border-2 border-amber-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-green-800 drop-shadow-lg">{feature.title}</h3>
                  <p className="text-red-800 max-w-md text-center text-lg">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-4 mt-12">
            <img src={bingo} alt="bingo" className="w-12 h-12 rounded shadow-md" />
            <p className="text-amber-300 font-bold text-lg drop-shadow">ሐበሻ-BINGO</p>
          </div>
        </div>
      </div>
      {/* Right side - Sign Up Card */}
      <div className="flex justify-center items-center md:w-1/2 w-full min-h-screen rounded-l-[60px] md:rounded-l-[90px]">
        <div className="w-full max-w-md px-6 py-4 mt-8 bg-white/90 shadow-2xl rounded-2xl mx-4">
          <div className="text-center mb-8">
            <img src={bingo} alt="bingo" className="w-32 h-auto mx-auto mb-6 rounded-xl shadow-md" />
            <h1 className="text-3xl font-bold text-green-800 mb-1">Create an Account</h1>
            <p className="text-gray-600">Join the Bingo fun and win real prizes!</p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-green-800" />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 border border-fuchsia-200 rounded-xl focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 transition-all duration-200 bg-white/80"
                  id="firstname"
                  type="text"
                  placeholder="First Name"
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-green-800" />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 border border-fuchsia-200 rounded-xl focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 transition-all duration-200 bg-white/80"
                  id="lastname"
                  type="text"
                  placeholder="Last Name"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="text-green-800" />
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 border border-fuchsia-200 rounded-xl focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 transition-all duration-200 bg-white/80"
                id="phoneNumber"
                type="tel"
                placeholder="Phone Number (07 or 09...)"
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-green-800" />
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 border border-fuchsia-200 rounded-xl focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 transition-all duration-200 bg-white/80"
                id="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-green-800" />
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 border border-fuchsia-200 rounded-xl focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 transition-all duration-200 bg-white/80"
                id="location"
                type="text"
                placeholder="Location"
                onChange={handleChange}
              />
            </div>
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
                <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
              </div>
            )}
            <button
              className="w-full bg-gradient-to-r from-red-400 to-yellow-400 hover:from-green-400 hover:to-yellow-400 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Spinner className="animate-spin text-white fill-green-200" />
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
      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold text-green-700 mb-4">You registered successfully!</h2>
            <p className="text-lg text-gray-700 mb-6 text-center">Wait until approved by the admin.<br/>You can now sign in after approval.</p>
            <button
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              onClick={() => { setShowApprovalModal(false); navigate('/signin'); }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
