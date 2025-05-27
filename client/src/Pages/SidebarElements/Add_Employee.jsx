import { Link,useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Spinner } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { cement } from '../../assets';
import { mtr } from '../../assets';
import { c_cbe } from '../../assets';


const Add_Employee= () => {
    const [isFirstSentence, setIsFirstSentence] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();
  
    const {theme } =useSelector((state=>state.theme))
    
    const [loading, setLoading] = useState(false);
    const[errorMessage, setErrorMessage] = useState(null);
  
    const [formData, setFormData] = useState({
      firstname: '',
      lastname: '',
      phoneNumber: '',  // ✅ Initialized properly
      password: '',
      role: 'guest',
      location:''
  });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.id]: e.target.value.trim()})
    };
  
    const validatePhoneNumber = (phoneNumber) => {
  const regex = /^(09|07)\d{8}$/;
  return regex.test(phoneNumber);
};

    
    const handleSubmit =  async(e) => {
        e.preventDefault();
        
        if (!formData.firstname || !formData.lastname ||!formData.phoneNumber || !formData.password) {
          setErrorMessage('All fields are required. Please fill them out');
          return;
      }
      if (formData.role === 'production' && !formData.location) {
  setErrorMessage('Please select a production location.');
  return;
}
  
      if (!validatePhoneNumber(formData.phoneNumber)) {
        setErrorMessage('Phone number must start with 09 or 07 and followed by 8 digits');
        return;
      }
      try {
        setLoading(true);
        setErrorMessage(null);
        const res = await fetch('/api/auth/addemployee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
  ...formData,
  location: formData.role === 'production' ? formData.location : ''
})
        });

        const data = await res.json(); // Always parse as JSON
        
        if (!res.ok) {
            throw new Error(data.message || 'Add employee  failed');
        }

        setSuccessMessage('You added a new employee successfully!');
    
    // Wait 2 seconds then navigate
         setTimeout(() => {
      navigate('/dashboard?tab=employees');

    }, 2000);
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
            }, 4000); 
            return () => clearInterval(interval);
          }, []);
        
          

    return (
            <div className=" flex  md:flex-row flex-col w-full h-full justify-center ">
              
              
                
                
        <div className=' flex justify-center items-center md:w-2/3 w-full h-auto 
          flex-col 
        '
        >
  


        <form className="   px-4   md:pb-8   w-full h-9/10 dark:bg-gray-800 dark:text-white gap-10 border border-gray-50 rounded-2xl shadow-2xl">
        <label className=" text-fuchsia-800 md:text-[24px] text-[16px]  font-bold mt-2 dark:text-white justify-center flex" htmlFor="username">
            Add New Employee
          </label>
        <div className="mb-4 mt-10 items-center flex justify-items-center flex-col  gap-4  px-6 py-2">
          
          <div className='flex justify-center items-center w-full md:flex-row flex-col md:gap-y-2 gap-y-1' >
          <input
            className="shadow appearance-none border rounded md:w-1/2 w-full py-4  px-3 text-fuchsia-800 border-fuchsia-800 md:text-[14px] text-[12px]  leading-tight focus:outline-none focus:shadow-outline md:mr-4 placeholder-yellow-400"
            id="firstname"
            type="text"
            placeholder="First Name"
            onChange={handleChange}
          />
          <input
            className="shadow appearance-none border rounded md:w-1/2 w-full py-4  px-3 text-fuchsia-800 border-fuchsia-800 md:text-[14px] text-[12px]  leading-tight focus:outline-none focus:shadow-outline md:mr-4 placeholder-yellow-400"
            id="lastname"
            type="text"
            placeholder="Last Name"
            onChange={handleChange}
          />
          </div>
        <div className="mb-4 w-full">
          
          <input
            className="shadow appearance-none border rounded md:w-1/2 w-full py-4  px-3 text-fuchsia-800 border-fuchsia-800 md:text-[14px] text-[12px]  leading-tight focus:outline-none focus:shadow-outline md:mr-4 placeholder-yellow-400"
            id="phoneNumber"
            type="tel"
          placeholder="Phone  (e.g. 09 or 07 ...)"
            onChange={handleChange}
          />
        </div>
        <div className="mb-4 w-full">
          
          <input
            className="shadow appearance-none border rounded md:w-1/2 w-full py-4 px-3 text-fuchsia-800 border-fuchsia-800 md:text-[14px] text-[12px]  leading-tight focus:outline-none focus:shadow-outline md:mr-4 placeholder-yellow-400"
            id="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />
        </div>
        <div className="mb-4 w-full">
          
        <select
  value={formData.role}
  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
  className="text-fuchsia-800 border rounded p-2 font-bold border-fuchsia-800 w-1/2 py-4"
>
  <option value="guest" disabled>Select role</option> {/* default value */}
  <option value="admin">Admin</option>
  <option value="marketing">Marketing</option>
  <option value="finance">Finance</option>
  <option value="cashier">Cashier</option>
  <option value="dispatcher">Dispatcher</option>
  <option value="production">Production</option>
</select>
 
        </div>

        {formData.role === 'production' && (
  <div className="mb-4 w-full">
    <select
      value={formData.location}
      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
      className="text-fuchsia-800 border rounded p-2 font-bold border-fuchsia-800 w-1/2 py-4"
    >
      <option value="" disabled>Select production site</option>
      <option value="adama">Adama</option>
      <option value="mugher">Mugher</option>
      <option value="tatek">Tatek</option>
    </select>
  </div>
)}

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

  {successMessage && (
  <div className="flex w-full h-8 rounded-lg m-2 justify-center items-center">
    <p className="text-green-600 m-2 text-[14px] font-semibold">
      {successMessage}
    </p>
  </div>
     )}


        <div className="mb-6">
          <button onClick={handleSubmit}
            className="w-full bg-fuchsia-800
             hover:bg-fuchsia-900
          text-white font-bold md:text-[20px] text-[16px] py-2 px-4 rounded-lg"
            type="button"
            disabled={loading}
          >
          { loading? ( 
            <>
            <Spinner className='w-8 h-8' color='fuchsia' />
            <span className='ml-2'>Loading...</span>
            </> )
          
         : 'Add New Employee ' }   
          </button>
        </div>
        
      </form>


            </div>

        </div>
    
        
            
    )
}

export default Add_Employee;

