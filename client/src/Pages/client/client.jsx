import {Avatar, Button, Navbar} from 'flowbite-react'
import React from 'react';
import {log} from '../../assets';
import {Dropdown} from 'flowbite-react'
import { useSelector } from 'react-redux';
import {Link} from 'react-router-dom'
import {useDispatch} from 'react-redux'
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import {signOutSuccess} from '../../redux/user/userSlice'
import { useNavigate } from 'react-router-dom';
import { markAsUploaded } from '../../redux/media/mediaSlice';
import { setUploadedSlugs } from '../../redux/media/mediaSlice';
import CongratulationsPopup from './congradulation';




const Client = () => {
    const{currentUser} = useSelector(state => state.user);
    const uploadedTasks = useSelector((state) => state.user.uploadedTasks); // assume this tracks completed task numbers
    const [showPopup, setShowPopup] = useState(false);
    const [luckyNumber, setLuckyNumber] = useState(null);
  
    
  // Get the list of uploaded slugs from Redux state
  const uploadedSlugsByUser = useSelector(state => state.media.uploadedSlugsByUser);
const uploadedSlugs = uploadedSlugsByUser?.[currentUser?._id] || [];
const completedTasks = uploadedSlugs.length; // Count how many tasks the user has uploaded
const totalTasks = 10;
const tasksRemaining = totalTasks - completedTasks;
const message = tasksRemaining > 0

  ? `You completed ${completedTasks} task${completedTasks > 1 ? 's' : ''}, please continue to be lucky!`
  : '';
  
   // Function to generate a unique 10-digit lucky number
   const generateLuckyNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000);
  };

  // Trigger popup when all tasks are completed
  useEffect(() => {
    if (completedTasks === 10 && !luckyNumber) {
      const number = generateLuckyNumber();
      setLuckyNumber(number);
      setShowPopup(true);
    }
  }, [uploadedTasks]);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  

const hasUploaded = (slug) => uploadedSlugs.includes(slug);

    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState(null);
    const {postSlug} = useParams();
    const dispatch = useDispatch();
    const [media, setMedia] = useState({
        isUploaded: false,
        isLoading: true,
    });
    
    
   
       const handleButtonClick = (postSlug) => {
          navigate(`/task/${postSlug}`);
         
        };
       
      

        const handelSignOut = async () => {
          try {
            const res= await fetch(`/api/user/signout`,{
              method: 'POST',
            });  
            const data = await res.json();
            
            if (!res.ok) {
              console.log(data.message);
            } else {
              
              dispatch(signOutSuccess());
              navigate('/');
             
            }
          } catch (error) {
            console.log(error.message);
          }
        }
      
          useEffect(() => {
            const fetchUploadedSlugs = async () => {
              try {
                const res = await fetch(`/api/media/user-slugs/${currentUser._id}`);
                const data = await res.json();
                console.log('çurrentuser.luckyNumber', currentUser.luckyNumber)
                dispatch(setUploadedSlugs(data));
              } catch (err) {
                console.error('Failed to fetch uploaded slugs:', err);
              }
            };
          
            if (currentUser?._id) {
              fetchUploadedSlugs();
            }
          }, [currentUser]);
         
  return (
    <div className='flex  md:flex-row flex-col w-full md:h-full h-auto'
      style={{
        backgroundImage: `url(${log})`, // Path to the image
        backgroundSize: 'cover', // Makes the image cover the entire element
        backgroundPosition: 'center', // Centers the image
        height: 'auto', // Make the container take up the full height of the screen
        width: '100%', // Full width of the screen
      }}
    >
         {/* left side */}
      <div className="md:w-1/4 w-full   md:ml-20 mt-20 flex flex-col justify-start items-center  p-6 gap-2 ">
       <div className=' md:h-1/3 h-auto w-full '>
         {currentUser?(
                             <Dropdown
                             arrowIcon={false} 
                             inline
                             
                             label={
                                <div className=" flex w-[160px] h-[130px] border-1  rounded-lg hover:scale-105 transition-transform duration-300 overflow-hidden justify-center items-center
                                border border-fuchsia-800 bg-white">
                                  <img 
                                    src={currentUser.profilePicture} 
                                    alt="user"
                                    className="w-1/2 h-2/3 object-cover  "
                                  />
                                </div>
                              }
                             >
                               <Dropdown.Header>
                                  
                                   <span className='block text-sm font-medium truncate text-yellow-400 hover:text-yellow-600'>{currentUser.firstname} {currentUser.lastname}</span>
       
                               </Dropdown.Header>
                               <Link to={'/dashboard?tab=profile'} >
                                   <Dropdown.Item
                                   className="text-yellow-400 hover:bg-fuchsia-100 hover:text-yellow-600 text-sm">
                                     Manage Profile</Dropdown.Item>    
                               </Link>
                               <Dropdown.Divider/>
                                   <Dropdown.Item onClick={handelSignOut}
                                   className="text-red-700 hover:bg-fuchsia-100 hover:text-red-900 text-sm font-semibold"
                                    >Sign out</Dropdown.Item>
                               </Dropdown>
                               
       
       
       
       
                          ):(
                           <Link to ='/signin' >
                           <button className=' border rounded-lg hover:bg-gray-1000
                            w-20 h-10 border-gray-400'  >
                             <p className='text-[18px] font-[cursive] italic tracking-wide ml-2 hover:text-yellow-600 text-yellow-400'
                              style={{ fontFamily: 'Garamond, Georgia, serif' }} > sign in</p>
                                
                           </button>
                          </Link>
       
                          )}

<div className="px-4">
  <div className="border-b-2 border-fuchsia-800 mb-2 flex flex-row items-center gap-4">
    <span className="block text-sm font-bold text-fuchsia-800">
      Full Name:
      
    </span>
    <span className="block text-sm font-semibold text-fuchsia-800">{currentUser.firstname} {currentUser.lastname}</span>
  </div>
  <div className="border-b-2 border-fuchsia-800 mb-2 flex flex-row items-center gap-4">
    <span className="block text-sm font-bold text-fuchsia-800">
      phone Number:
      </span>
      <span className="block text-sm font-semibold text-fuchsia-800">  {currentUser.phoneNumber} </span>
    
  </div>
  <div className="border-b-2 border-fuchsia-800 mb-2 flex flex-row items-center gap-4">
    <span className="block text-sm font-bold text-fuchsia-800">Lucky Number:</span>
    <span className="block text-sm font-semibold text-fuchsia-800">  {currentUser.luckyNumber || 'no lucky number'}</span>
    
  </div>
</div>


       </div>
       
        
      </div>
      {/* right side  */}
      
      <div className='md:w-3/4 w-full justify-end md:mb-40 items-center flex flex-col   md:p-6 md:gap-6 p-4 gap-4 md:mt-20'>
      <div className='text-fuchsia-900 border border-fuchsia-800 rounded-lg md:px-2 md:py-2 px-3  md:w-3/4 w-full'>
        <h2 className='text-content font-bold md:text-[24px] text-[16px]'>Welcome to the Treasure Hunt Site!</h2>
        <p className='.text-content p md:text-[16px] text-[14px]'>Get ready to embark on an exciting journey where luck meets opportunity.
           This platform is your gateway to a thrilling adventure—complete the following 10 unique tasks and unlock your chance to become one of the lucky winners! 
          Dive in, test your skills, and let the treasure hunt begin.</p>

      </div>
      <div className="flex flex-col md:h-3/5 md:w-2/3 h-auto w-full border border-fuchsia-800 rounded-lg items-center justify-center py-2 ">
      <div className=' md:p-6 p-3 flex flex-wrap items-center justify-center md:gap-2 gap-1'>
                    <div className='flex flex-col md:w-[100px] md:h-[90px] w-[90px] h-[80px]  shadow-lg p-6 items-center justify-center gap-1'> 
                <p className='text-fuchsia-800 font-bold text-[12px] inline px-4'>Task1</p>

            <button
                 disabled={!!currentUser.luckyNumber || uploadedSlugs.includes('task1')}
                  className={`md:px-10 md:py-5 px-9 py-4 rounded 
                  ${!!currentUser.luckyNumber||uploadedSlugs.includes('task1')
                 ? 'bg-fuchsia-800 text-white cursor-not-allowed'
                  : 'border border-fuchsia-800  hover:bg-fuchsia-900 text-fuchsia-800 hover:text-white' }
                  `}
                 
                   onClick={() => handleButtonClick('task1')}
                 >
                   {uploadedSlugs.includes('task1') ? '-' : '0'}
            </button>
         </div>
<div className='flex flex-col md:w-[100px] md:h-[90px] w-[90px] h-[80px]  shadow-lg p-6 items-center justify-center gap-1'> 
                <p className='text-fuchsia-800 font-bold text-[12px] inline px-4'>Task2</p>

            <button
                 disabled={!!currentUser.luckyNumber || uploadedSlugs.includes('task2')}

                  className={`md:px-10 md:py-5 px-9 py-4 rounded 
                  ${!!currentUser.luckyNumber||uploadedSlugs.includes('task2')
                 ? 'bg-fuchsia-800 text-white cursor-not-allowed'
                  : 'border border-fuchsia-800  hover:bg-fuchsia-900 text-fuchsia-800 hover:text-white' }
                  `}
                   onClick={() => handleButtonClick('task2')}
                 >
                   {uploadedSlugs.includes('task2') ? '-' : '1'}
            </button>
</div>
<div className='flex flex-col md:w-[100px] md:h-[90px] w-[90px] h-[80px]  shadow-lg p-6 items-center justify-center gap-1'> 
                <p className='text-fuchsia-800 font-bold text-[12px] inline px-4'>Task3</p>

                <button
                  disabled={!!currentUser.luckyNumber || uploadedSlugs.includes('task3')}

                  className={`md:px-10 md:py-5 px-9 py-4 rounded 
                  ${!!currentUser.luckyNumber||uploadedSlugs.includes('task3')
                 ? 'bg-fuchsia-800 text-white cursor-not-allowed'
                  : 'border border-fuchsia-800  hover:bg-fuchsia-900 text-fuchsia-800 hover:text-white' }
                  `}
                   onClick={() => handleButtonClick('task3')}
                 >
                   {uploadedSlugs.includes('task3') ? '-' : '2'}
            </button>
</div>
       <div className='flex flex-col md:w-[100px] md:h-[90px] w-[90px] h-[80px] shadow-lg p-6 items-center justify-center gap-1'> 
        
        <label className='text-fuchsia-800 font-bold text-[12px] inline px-4'>Task4</label>
        <button
                  disabled={!!currentUser.luckyNumber || uploadedSlugs.includes('task4')}

                  className={`md:px-10 md:py-5 px-9 py-4 rounded 
                  ${!!currentUser.luckyNumber||uploadedSlugs.includes('task4')
                 ? 'bg-fuchsia-800 text-white cursor-not-allowed'
                  : 'border border-fuchsia-800  hover:bg-fuchsia-900 text-fuchsia-800 hover:text-white' }
                  `}
                   onClick={() => handleButtonClick('task4')}
                 >
                   {uploadedSlugs.includes('task4') ? '-' : '3'}
            </button>

       </div>
       <div className='flex flex-col md:w-[100px] md:h-[90px] w-[90px] h-[80px]  shadow-lg p-6 items-center justify-center gap-1'> 
        
        <label className='text-fuchsia-800 font-bold text-[12px] inline px-4'>Task5</label>
        <button
                  disabled={!!currentUser.luckyNumber || uploadedSlugs.includes('task5')}

                  className={`md:px-10 md:py-5 px-9 py-4 rounded 
                  ${!!currentUser.luckyNumber||uploadedSlugs.includes('task5')
                 ? 'bg-fuchsia-800 text-white cursor-not-allowed'
                  : 'border border-fuchsia-800  hover:bg-fuchsia-900 text-fuchsia-800 hover:text-white' }
                  `}
                   onClick={() => handleButtonClick('task5')}
                 >
                   {uploadedSlugs.includes('task5') ? '-' : '4'}
            </button>

       </div>
       <div className='flex flex-col md:w-[100px] md:h-[90px] w-[90px] h-[80px] border  shadow-lg p-6 items-center justify-center gap-1'> 
        
        <label className='text-fuchsia-800 font-bold text-[12px] inline px-4'>6</label>
        <button
                  disabled={!!currentUser.luckyNumber || uploadedSlugs.includes('task6')}

                  className={`md:px-10 md:py-5 px-9 py-4 rounded 
                  ${!!currentUser.luckyNumber||uploadedSlugs.includes('task6')
                 ? 'bg-fuchsia-800 text-white cursor-not-allowed'
                  : 'border border-fuchsia-800  hover:bg-fuchsia-900 text-fuchsia-800 hover:text-white' }
                  `}
                   onClick={() => handleButtonClick('task6')}
                 >
                   {uploadedSlugs.includes('task6') ? '-' : '5'}
            </button>

       </div>
       <div className='flex flex-col md:w-[100px] md:h-[90px]  w-[90px] h-[80px] shadow-lg p-6 items-center justify-center gap-1'> 
        
        <label className='text-fuchsia-800 font-bold text-[12px] inline px-4'>Task7</label>
        <button
                  disabled={!!currentUser.luckyNumber || uploadedSlugs.includes('task7')}

                  className={`md:px-10 md:py-5 px-9 py-4 rounded 
                  ${ !!currentUser.luckyNumber||uploadedSlugs.includes('task7')
                 ? 'bg-fuchsia-800 text-white cursor-not-allowed'
                  : 'border border-fuchsia-800  hover:bg-fuchsia-900 text-fuchsia-800 hover:text-white' }
                  `}
                   onClick={() => handleButtonClick('task7')}
                 >
                   {uploadedSlugs.includes('task7') ? '-' : '6'}
            </button>

       </div>
       <div className='flex flex-col md:w-[100px] md:h-[90px] w-[90px] h-[80px] shadow-lg p-6 items-center justify-center gap-1'> 
        
        <label className='text-fuchsia-800 font-bold text-[12px] inline px-4'>Task8</label>
        <button
                 disabled={!!currentUser.luckyNumber || uploadedSlugs.includes('task8')}

                  className={`md:px-10 md:py-5 px-9 py-4 rounded 
                  ${!!currentUser.luckyNumber||uploadedSlugs.includes('task8')
                 ? 'bg-fuchsia-800 text-white cursor-not-allowed'
                  : 'border border-fuchsia-800  hover:bg-fuchsia-900 text-fuchsia-800 hover:text-white' }
                  `}
                   onClick={() => handleButtonClick('task8')}
                 >
                   {uploadedSlugs.includes('task8') ? '-' : '7'}
            </button>

       </div>
       <div className='flex flex-col md:w-[100px] md:h-[90px] w-[90px] h-[80px]  shadow-lg p-6 items-center justify-center gap-1'> 
        
        <label className='text-fuchsia-800 font-bold text-[12px] inline px-4'>Task9</label>
        <button
                  disabled={!!currentUser.luckyNumber || uploadedSlugs.includes('task9')}

                  className={`md:px-10 md:py-5 px-9 py-4 rounded 
                  ${!!currentUser.luckyNumber||uploadedSlugs.includes('task9')
                 ? 'bg-fuchsia-800 text-white cursor-not-allowed'
                  : 'border border-fuchsia-800  hover:bg-fuchsia-900 text-fuchsia-800 hover:text-white ' }
                  `}
                   onClick={() => handleButtonClick('task9')}
                 >
                   {uploadedSlugs.includes('task9') ? '-' : '8'}
            </button>

       </div>
       <div className='flex flex-col md:w-[100px] md:h-[90px] w-[90px] h-[80px]  shadow-lg p-6 items-center justify-center gap-1'> 
        
        <label className='text-fuchsia-800 font-bold text-[12px] inline px-4'>Task10</label>
        <button
                  disabled={!!currentUser?.luckyNumber || uploadedSlugs.includes('task10')}

                  className={`md:px-10 md:py-5 px-9 py-4 rounded 
                  ${!!currentUser.luckyNumber||uploadedSlugs.includes('task10')
                 ? 'bg-fuchsia-800 text-white cursor-not-allowed'
                  : 'border border-fuchsia-800  hover:bg-fuchsia-900 text-fuchsia-800 hover:text-white' }
                  `}
                   onClick={() => handleButtonClick('task10')}
                 >
                   {uploadedSlugs.includes('task10') ? '-' : '9'}
            </button>

       </div>
       
       </div>
       {uploadedSlugs.length === 0 ? (
  <p className='text-fuchsia-800 font-bold text-[20px] inline px-4'>
    Select one of them and click to start the task
  </p>
) : (
  <div>
    <h2 className="text-fuchsia-800 font-bold text-[20px] inline px-4">{message}</h2>
    
  </div>
)}
<div className="client-page">
      
      {showPopup && (
        <CongratulationsPopup
          currentUser={currentUser}
          generatedLuckyNumber={luckyNumber}
          onClose={handleClosePopup}
        />
      )}
    </div>
</div>


      </div>
    </div>
  );
};

export default Client;
