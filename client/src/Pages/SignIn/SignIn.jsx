import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Spinner } from 'flowbite-react';
import {signInStart, signInSuccess,signInFail} from '../../redux/user/userSlice'
import { useDispatch, useSelector } from 'react-redux';
import GoogleAuth from '../GoogleAuth/GoogleAuth';
import {amanuel3} from '../../assets';
import { lottery } from '../../assets';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import log from '../../assets/log.jpg';




const SignIn = () => {

    const dispatch = useDispatch();
    const [isFirstSentence, setIsFirstSentence] = useState(true);

    const [formData, setFormData] = useState({})
    const navigate = useNavigate();
    const {currentUser }= useSelector((state) => state.user);
    const {loading, error: errorMessage} = useSelector(state => state.user);  

    
    const handleChange = (e) => {
        setFormData({...formData, [e.target.id]: e.target.value.trim()})
    };
    const handleSubmit =  async(e) => {
        e.preventDefault();

        if ( !formData.email || !formData.password) {
            return dispatch(signInFail('All fields are required. please fill them out'));
        }
        try {
            dispatch(signInStart());  
        const res= await fetch('api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success=== false) {
            return dispatch(signInFail(data.message || 'Login failed.'));
            }
            
            if (res.ok){
                dispatch(signInSuccess(data));
                if (data.isAdmin) {
                  navigate('/dashboard');
              } else {
                  navigate('/client');
              }
                }
            
        }
        catch (error) {
            console.error('Error during fetch:', error);
            dispatch(signInFail(error.message));
            }   
            


    }

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
      <div className=" flex  md:flex-row flex-col w-full md:h-full h-auto justify-center items-center  "
      style={{
              backgroundImage: `url(${log})`, // Path to the image
              backgroundSize: 'cover', // Makes the image cover the entire element
              backgroundPosition: 'center', // Centers the image
              height: '100vh', // Make the container take up the full height of the screen
              width: '100%', // Full width of the screen
            }}>
              <div className='flex w-1/2'>

              </div>
              
      {/* left
      <div className=' py-28 md:py-0 flex  flex-col justify-center items-center  md:w-1/3 w-full md:h-screen h-auto
       bg-fuchsia-800 
        dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 
       dark:hover:border-gray-800  ' >
       <img src={lottery} alt='logo' className='md:w-60 md:h-60 h-40 w-40 inline' />
       <AnimatePresence mode="wait">
{isFirstSentence ? (
 <motion.h1
   key="welcome"
   className="text-3xl font-bold text-center lg:text-5xl bg-gradient-to-r
    from-pink-500 to-yellow-500 bg-clip-text text-transparent
    font-[cursive] italic tracking-wide ml-2 "
     style={{ fontFamily: 'Garamond, Georgia, serif' }}
   variants={wordVariants}
   initial="hidden"
   animate="visible"
   exit="exit"
   transition={{
     duration: 1,
     staggerChildren: 0.5,
   }}
 >
   <motion.span variants={wordVariants}>treasure  </motion.span>
   <motion.span variants={wordVariants}>hunt </motion.span>
 </motion.h1>
) :null 

}
</AnimatePresence>
       </div> */}
                {/* right */}
        <div className=' flex justify-center items-center md:w-1/2 w-full md:h-screen h-auto mt-20 md:mt-0
      '>

        <form className=" px-4 pt-4 pb-8 mb-4  md:w-3/4 md:h-2/3 w-full h-auto dark:bg-gray-800 dark:text-white ">
        
        <div className="mb-4 flex justify-items-center items-center flex-col">
          <label className="block text-fuchsia-800  md:text-[24px] text-[16px] font-bold mb-2 dark:text-white" htmlFor="email">
            Login
          </label>
          <input
            className="shadow appearance-none border rounded border-fuchsia-800 w-full md:py-4 md:px-5 py-3 px-4 placeholder-yellow-400   leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
        
          <input
            className="shadow appearance-none border  border-fuchsia-800 rounded w-full md:py-4 md:px-5 py-3 px-4 placeholder-yellow-400 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="******"
            onChange={handleChange}
          />
        </div>

            {
                errorMessage&& 
                ( 
                    <div  className=' flex w-full h-8   rounded-lg m-2 justify-center items-center '>
                <p  className='text-red-500 m-2 text-[14px] font-semibold justify-center items-center'>
                    {errorMessage}
                    </p>
                    </div>
                    
                ) 
            }

        <div className="mb-6">
          <button
            className="w-full bg-fuchsia-800
             hover:bg-fuchsia-900
          text-white font-bold md:text-[24px] text-[16px] py-2 px-4 rounded-lg "
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
          >
             {loading? ( 
             <><Spinner className="animate-spin"color='fuchsia' />
             <span> Loading...</span>
             </>)
             :"Login" }
             
            
          </button> 
        </div>
        <p className=" text-center text-fuchsia-900  font-semibold md:text-[16px] text-[12px] py-2">
          Have not account?{' '}
          <Link to='/signup' className=" md:text-[24px] text-[16px] text-fuchsia-900 hover:underline" >
            Sign up
          </Link>
        </p>
      </form>


            </div>

        </div>
    
        
            
    )
}

export default SignIn;
