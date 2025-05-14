import { Link,useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Spinner } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { cement } from '../../assets';
import { mtr } from '../../assets';
import { c_cbe } from '../../assets';


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
      role: 'null',
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
        
        if (!formData.firstname || !formData.lastname || !formData.email || !formData.phoneNumber || !formData.password) {
          setErrorMessage('All fields are required. Please fill them out');
          return;
      }
      if (!validateEmail(formData.email)) {
        setErrorMessage('Invalid email format');
        return;
      }
  
      if (!validatePhoneNumber(formData.phoneNumber)) {
        setErrorMessage('Phone number must start with +251 and be followed by 9 digits');
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
            <div className=" flex  md:flex-row flex-col w-full h-full bg-fuchsia-800  ">
              
               {/* left */}
               <div className=' py-28 md:py-0 md:flex  flex-col justify-center items-center  md:w-1/2 w-full md:h-screen h-auto hidden
                bg-fuchsia-800 
                 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 
                dark:hover:border-gray-800  ' >
               <img src={cement} alt='cement' className='md:w-[600px] md:h-[500px] h-40 w-40 inline' />
       <div className=' flex  w-auto h-auto p-4 justify-center items-center'>
        
        <img src={c_cbe} alt='logo' className='md:w-32 md:h-16 h-40 w-2 inline' />
        <p className='text-yellow-400 font-bold text-[20px]'>Powered by Comertial Bank of Ethiopia </p>

       </div>
               
                </div>
                
                {/* right */}
        <div className=' flex justify-center items-center md:w-1/2 w-full md:h-screen h-auto bg-white
          rounded-l-[90px] flex-col
        '
        >
          <div>
          <img src={mtr} alt='logo' className='md:w-[700px] md:h-60 h-40 w-[600px] inline mt-10' />
        </div>


        <form className="   rounded-md px-4 md:pt-4  md:pb-8  mb-4  w-3/4 h-2/3  dark:bg-gray-800 dark:text-white md:gap-y-2 gap-y-1">
        <div className="mb-4 items-center flex justify-center flex-col">
          <label className="block text-fuchsia-800 md:text-[24px] text-[16px]  font-bold mb-2 dark:text-white" htmlFor="username">
            Creact an Account
          </label>
          <div className='flex justify-center items-center w-full md:flex-row flex-col md:gap-y-2 gap-y-1' >
          <input
            className="shadow appearance-none border rounded md:w-1/2 w-full py-2 px-3 text-fuchsia-800 border-fuchsia-800 md:text-[14px] text-[12px]  leading-tight focus:outline-none focus:shadow-outline md:mr-4 placeholder-yellow-400"
            id="firstname"
            type="text"
            placeholder="First Name"
            onChange={handleChange}
          />
          <input
            className="shadow appearance-none border rounded md:w-1/2 w-full py-2 px-3 text-fuchsia-800 border-fuchsia-800 md:text-[14px] text-[12px]  leading-tight focus:outline-none focus:shadow-outline md:mr-4 placeholder-yellow-400"
            id="lastname"
            type="text"
            placeholder="Last Name"
            onChange={handleChange}
          />
          </div>
        </div>
        <div className="mb-4">
        
       <input
            className="shadow appearance-none border rounded md:w-1/2 w-full py-2 px-3 text-fuchsia-800 border-fuchsia-800 md:text-[14px] text-[12px] leading-tight focus:outline-none focus:shadow-outline md:mr-4 placeholder-yellow-400"
            id="email"
            type="email"
           placeholder="Email(e.g. yourname@example.com)"
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          
          <input
            className="shadow appearance-none border rounded md:w-1/2 w-full py-2 px-3 text-fuchsia-800 border-fuchsia-800 md:text-[14px] text-[12px]  leading-tight focus:outline-none focus:shadow-outline md:mr-4 placeholder-yellow-400"
            id="phoneNumber"
            type="tel"
          placeholder="Phone  (e.g. +251...)"
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          
          <input
            className="shadow appearance-none border rounded md:w-1/2 w-full py-2 px-3 text-fuchsia-800 border-fuchsia-800 md:text-[14px] text-[12px]  leading-tight focus:outline-none focus:shadow-outline md:mr-4 placeholder-yellow-400"
            id="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          
        {/* <select
              className="text-fuchsia-800 border  rounded p-2 font-bold border-fuchsia-800"
            onChange={(e)=>setFormData({...formData, role: e.target.value})}>
                <option value="uncategorized">Select role </option>
                <option   value="admin"> Admin </option>
                <option   value="marketing">Marketing </option>
                <option   value="finance">Finance</option>
                <option   value="cashier">Cashier </option>
                <option   value="dispatcher">Dispatcher</option>
                
               
                

            </select> */}
        </div>

        {
          errorMessage && 
        ( 
            <div  className=' flex w-full h-8   rounded-lg m-2 justify-center items-center '>
        <p  className='text-red-500 m-2 text-[14px] font-semibold justify-center items-center'>
            {errorMessage}
            </p>
            </div>
            
        ) 
}


        <div className="mb-6">
          <button onClick={handleSubmit}
            className="w-full bg-fuchsia-800
             hover:bg-fuchsia-900
          text-white font-bold md:text-[24px] text-[16px] py-2 px-4 rounded-lg"
            type="button"
            disabled={loading}
          >
          { loading? ( 
            <>
            <Spinner className='w-8 h-8' color='fuchsia' />
            <span className='ml-2'>Loading...</span>
            </> )
          
         : 'Create an Account ' }   
          </button>
        </div>
        <p className="text-center text-fuchsia-900  font-semibold md:text-[16px] text-[12px] py-2">
          Already have an account?{' '}
          <a className=" md:text-[24px] text-[16px] text-fuchsia-900 hover:underline  " href="/">
            Log in
          </a>
        </p>
      </form>


            </div>

        </div>
    
        
            
    )
}

export default SignUp;
