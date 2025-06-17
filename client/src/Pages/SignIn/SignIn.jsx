import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Spinner } from 'flowbite-react';
import { signInStart, signInSuccess, signInFail } from '../../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { cement } from '../../assets';
import { mtr } from '../../assets';
import { c_cbe } from '../../assets';
import { FaPhone, FaLock, FaUserPlus, FaIndustry, FaTruck, FaBuilding } from 'react-icons/fa';

const SignIn = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: <FaIndustry className="text-4xl text-yellow-400" />,
      title: "Quality Cement Products",
      description: "Premium cement products for all your construction needs"
    },
    {
      icon: <FaTruck className="text-4xl text-yellow-400" />,
      title: "Nationwide Delivery",
      description: "Fast and reliable delivery across Ethiopia"
    },
    {
      icon: <FaBuilding className="text-4xl text-yellow-400" />,
      title: "Trusted by Builders",
      description: "The preferred choice for construction professionals"
    }
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
    <div className="min-h-screen flex md:flex-row flex-col w-full bg-gradient-to-br bg-fuchsia-800 ">
      {/* Left side - Branding and Features */}
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

      {/* Right side - Login Form */}
      <div className="flex justify-center items-center md:w-1/2 w-full min-h-screen bg-white rounded-l-[60px] md:rounded-l-[90px] ">
        <div className="w-full max-w-md px-8 py-12">
          <div className="text-center mb-12">
            <img src={mtr} alt="logo" className="w-78 h-auto mx-auto mb-8" />
            <h1 className="text-3xl font-bold text-fuchsia-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your cement orders</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-fuchsia-600" />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 border-2 border-fuchsia-200 rounded-lg focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 transition-all duration-200"
                  id="phoneNumber"
                  type="text"
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
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-fuchsia-800 hover:text-fuchsia-900 font-semibold inline-flex items-center space-x-1">
                <span>Sign up</span>
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
