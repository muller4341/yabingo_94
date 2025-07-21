import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Spinner } from 'flowbite-react';
import { signInStart, signInSuccess, signInFail } from '../../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { bingo } from '../../assets';
import { FaPhone, FaLock, FaUserPlus, FaMoneyBillWave, FaTrophy, FaGift } from 'react-icons/fa';
import { GiPerspectiveDiceSixFacesRandom, GiPartyPopper } from 'react-icons/gi';

const SignIn = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ phoneNumber: '', password: '' });
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

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
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phoneNumber || !formData.password) {
      return dispatch(signInFail('Phone number and password are required.'));
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      dispatch(signInStart());

      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (data.success === false) {
        return dispatch(signInFail(data.message || 'Login failed.'));
      }

      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error during fetch:', error);
      dispatch(signInFail(error.message));
    } finally {
      setLoading(false);
    }
  };

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
        {/* Animated gradient overlay for extra effect - only inside left side */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#808000]/90 via-yellow-400/30 to-fuchsia-700/40 animate-pulse z-0 pointer-events-none"></div>
      </div>

      {/* Right side - Login Card */}
      <div className="flex justify-center items-center md:w-1/2 w-full min-h-screen  rounded-l-[60px] md:rounded-l-[90px]">
        <div className="w-full max-w-md px-6 py-10 bg-white/90 shadow-2xl rounded-2xl mx-4">
          <div className="text-center mb-8">
            <img src={bingo} alt="logo" className="w-32 h-auto mx-auto mb-6 rounded-xl shadow-md" />
            <h1 className="text-3xl font-bold text-green-800 mb-1">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access Ethio-BINGO</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-green-800" />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 border border-fuchsia-200 rounded-xl focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 transition-all duration-200 bg-white/80"
                  id="phoneNumber"
                  type="text"
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
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-fuchsia-800 hover:text-fuchsia-900 font-semibold inline-flex items-center space-x-1 ">
                Sign up
                <FaUserPlus className="text-sm" />
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
