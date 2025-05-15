import {Avatar, Button, Navbar} from 'flowbite-react'
import {Dropdown} from 'flowbite-react'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import {AiOutlineSearch} from 'react-icons/ai'
import {FaMoon} from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '../../redux/theme/themeSlice'
import { signOutSuccess } from '../../redux/user/userSlice'

import { lottery,amanuel3 }from '../../assets'
import { use } from 'react'
import { useEffect, useState } from 'react'




const Header = () => {
 

    const path = useLocation();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const handleToggle = () => {
      dispatch(toggleTheme()); // No payload needed
    };
  

    const{currentUser} = useSelector(state => state.user);
      console.log('current user', currentUser)

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
          }
        } catch (error) {
          console.log(error.message);
        }
      }
      useEffect(() => {
       const urlParams = new URLSearchParams(location.search);
       const searchTermFromUrl = urlParams.get('searchTerm');
        if(searchTermFromUrl){
          setSearchTerm(searchTermFromUrl);
      }
      }
      ,[location.search
      ])
      const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('searchTerm', searchTerm);
        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`);
      }

    return (
        
            <Navbar className=" fixed top-0 w-full z-50 bg-fuchsia-900">
                <Link to='/' className='self-center whitespace-nowrap 
                text-2xl sm:text-3xl font-semibold dark:text-white flex '>
                  
                     
                    <img src={ lottery} alt='logo' className='md:w-10 md:h-10 inline w-8 h-8'  />
                    
                    <p className='font-[cursive] italic tracking-wide ml-2 text-yellow-400 text-[18px] md:text-[24px]'
    style={{ fontFamily: 'Garamond, Georgia, serif' }}> Treasur Hunt</p>
                    
  
                </Link>

                {/* <form className='flex ' onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="border-2 rounded-lg hidden lg:inline w-56 h-10 bg-gray-100 text-gray-800"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                      <button className=' flex w-12 h-6 lg:hidden  border rounded-xl  justify-center items-center' color='gray' >

<AiOutlineSearch className='text-2xl' />
</button>
              
                </form> */}
               

               

                <div  className='flex gap-2 md:order-1 justify-center items-center'>
                   {/* <button className='w-8 h-6  sm:inline  dark:bg-gray-800 bg-white
                    dark:hover:bg-gray-900 hover:bg-gray-100 rounded-lg border flex justify-center items-center'>

                    <FaMoon className='text-2xl dark:text-white text-black w-8 h-6 ' onClick={()=>dispatch(toggleTheme())} />


                   </button>
                   
                   {currentUser?(
                      <Dropdown
                      arrowIcon={false} 
                      inline
                      label={
                      <Avatar alt='user'  
                      img={currentUser.profilePicture}
                      rounded />}
                      >
                        <Dropdown.Header>
                            <span className='block text-sm'>@{currentUser.username}</span>
                            <span className='block text-sm font-medium truncate'>{currentUser.email}</span>

                        </Dropdown.Header>
                        <Link to={'/dashboard?tab=file'}>
                            <Dropdown.Item>Profile</Dropdown.Item>    
                        </Link>
                        <Dropdown.Divider/>
                            <Dropdown.Item onClick={handelSignOut}>Sign out</Dropdown.Item>
                        </Dropdown>




                   ):(
                  //   <Link to ='/' >
                  //   <button className=' border rounded-lg hover:bg-gray-1000
                  //    w-20 h-10 border-gray-400'  >
                  //     <p className='text-[18px] font-[cursive] italic tracking-wide ml-2 hover:text-yellow-600 text-yellow-400'
                  //      style={{ fontFamily: 'Garamond, Georgia, serif' }} > sign in</p>
                         
                  //   </button>
                  //  </Link>

                   )}
                    */}

                   <Navbar.Toggle/> 


                </div>
                <Navbar.Collapse>
                    <Navbar.Link active={ path ==='/'} as={'div'}>
                        <Link to='/' className='text-[18px] font-[cursive] italic tracking-wide ml-2 hover:text-yellow-600 text-yellow-400' style={{ fontFamily: 'Garamond, Georgia, serif' }}>Home</Link>
                    </Navbar.Link >
                    <Navbar.Link active={ path ==='/about'} as={'div'}>
                        <Link to='/about' className='text-[18px] font-[cursive] italic tracking-wide ml-2 hover:text-yellow-600 text-yellow-400' style={{ fontFamily: 'Garamond, Georgia, serif' }}>About</Link>
                    </Navbar.Link>
                    <Navbar.Link active={ path ==='/projects'} as={'div'}>
                        <Link to='/projects' className='text-[18px] font-[cursive] italic tracking-wide ml-2 hover:text-yellow-600 text-yellow-400' style={{ fontFamily: 'Garamond, Georgia, serif' }}>News</Link>
                    </Navbar.Link>
                </Navbar.Collapse>

                


            
        </Navbar>
    )
}

export default Header;



