import { Modal, TextInput } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import {Button} from  'flowbite-react';
import { useState , useRef, useEffect} from "react";
import {app}  from  "../../firebase"
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {  getDownloadURL,   getStorage, ref,  uploadBytesResumable} from 'firebase/storage';
import {Alert} from "flowbite-react";
import { Link } from 'react-router-dom';

import {log} from '../../assets'
//import { object } from "prop-types";
import { 
  updateStart,
  updateSuccess,
  updateFail,
  deleteUserFail,
deleteUserStart,
deleteUserSuccess ,
signOutSuccess} from "../../redux/user/userSlice";
import { useDispatch } from "react-redux";

    const DashProfile = () => {
    const {currentUser, error, loading} = useSelector((state)=>state.user);
    const [imageFile, setImageFile] = useState(null);
    const[imageFileUploading, setImageFileUploading]=useState(false);
    const [imageFileUrl, setImageFileUrl] = useState(null);
    const [imageFileUploadProgress, setImageFileUploadProgress] =useState(0);
    const [imageFileUploadError, setImageFileUploadError] =useState(null);
    const [updateUserSuccess, setUpdateUserSuccess]=useState(false);
    const [updateUserError, setUpdateUserError]=useState(null);
    const[formData, setFormData]=useState({});
    const filePickerRef = useRef();
    const dispatch = useDispatch();
    const [showModal, setShowModal]=useState(false);
    const changeHandler = (e) => {
      setFormData({...formData, [e.target.id]: e.target.value});
    };
  
    const imageChangeHandler = (e) => {
      const file = e.target.files[0];
      if(file){
        setImageFile(file);
        setImageFileUrl ( URL.createObjectURL(file));
        
      }
    };
    useEffect(() => {
      if(imageFile){
        uploadImage();
        }
    }, [imageFile]);   

    
    const uploadImage = async () => {
      // service firebase.storage {
      //   match /b/{bucket}/o {
      //     match /{allPaths=**} {
      //       allow read;
      //       allow write: if request.resource.size< 2*1024*1024 && 
      //       request.resource.contentType.matches('image/.*')
      //     }
      //   }
      // }
      setImageFileUploading(true);
      setImageFileUploadError(null);
      const storage= getStorage(app);
      const fileName= new  Date().getTime() + imageFile.name;
      const storageRef= ref(storage, fileName);
      const uploadTask= uploadBytesResumable(storageRef, imageFile)
      uploadTask.on(
        'state_changed', 
        (snapshot)=>{
          const progress=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
              setImageFileUploadProgress(progress.toFixed(0));

        },

      
            (error) =>{
        setImageFileUploadError("image could not upload , file muse be less than 2mb", error);

        setImageFile(null);
        setImageFileUploadProgress(null);
        setImageFileUrl(null);
        setImageFileUploading(false);

      }
      ,
      ()=>{

        getDownloadURL(uploadTask.snapshot.ref)
        .then((downloadURL)=>{
        setImageFileUrl(downloadURL);
        console.log('downloadURL', downloadURL);
        setFormData({...formData, profilePicture: downloadURL});
        setImageFileUploading(false);
        })
        .catch((error)=>{
          console.log("image failed ", error);
          
        })

      });

    };
    
    const handleSubmit = async (e) => {
      console.log('formData of the user', formData);
      console.log('currentUerId in the update class', currentUser._id);
      e.preventDefault();
      setUpdateUserError(null);
      setUpdateUserSuccess(null);
      if( Object.keys(formData).length === 0){
        setUpdateUserError('No changes were made');
        return;

      }

    // Wait for the image upload to complete
  if (imageFileUploading) {
    setUpdateUserError('Please wait for the image upload to complete');
    return;
  }
    
           try {
            dispatch(updateStart())
            console.log('formData of the user in the try and', formData);
            
            const res= await fetch(`/api/user/update/${currentUser._id}`,{
                method: 'PUT',
                headers:{
                  'Content-Type':'application/json',
                },
                body:JSON.stringify(formData)});
      
                if (res.ok){
                
                  const data = await res.json();
                  dispatch(updateSuccess(data));
                  setUpdateUserSuccess("User's profile updated successfully");
                }
                
                else{
                  
                  let errorMessage = 'An error occurred';
                  if (res.headers.get('Content-Type').includes('application/json')) {
                    const errorData = await res.json();
                    setUpdateUserError(errorData.message);
                    errorMessage = errorData.message;
                  }
                  dispatch(updateFail(errorMessage));
                


                }
            
              
            }

            
           
           catch (error) {
            dispatch(updateFail(error.message));
            console.log("updateFail", dispatch(updateFail(error.message))  );
           }

          
          

          
    };

    const handelDeleteUser = async () => {
      setShowModal(false);
      try {
        dispatch(deleteUserStart());
        const res= await fetch(`/api/user/delete/${currentUser._id}`,{
          method: 'DELETE',
        });  
          if (res.ok){
            const data = await res.json();
            dispatch(deleteUserSuccess(data));
          }
          else{
            let errorMessage = 'An error occurred';
            if (res.headers.get('Content-Type').includes('application/json')) {
              const errorData = await res.json();
              dispatch(deleteUserFail(errorData.message));
              errorMessage = errorData.message;
            }
            dispatch(deleteUserFail(errorMessage));
          }
      }
      catch (error) {
        dispatch(deleteUserFail(error.message));
      }

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
        }
      } catch (error) {
        console.log(error.message);
      }
    }


    


    return(
    <div className="max-w-lg mx-auto p-3 w-full"
    >
        <h1 className="text-center p-5 font-semibold md:text-[24px] text-[18px] text-fuchsia-900">Profile</h1>
      <form className="flex flex-col gap-2" 
      onSubmit={handleSubmit}>
        <input type="file"  
        accept='image/*' onChange={imageChangeHandler} 
        ref={filePickerRef}
        hidden />
        <div className=" relative w-32 h-32 self-center cursor-pointer shadow-lg
        rounded-full overflow-hidden  flex justify-center items-center border border-fuchsia-900  " 
        onClick={()=> filePickerRef.current.click()}>
           {imageFileUploadProgress &&
           (<CircularProgressbar 
          value={imageFileUploadProgress } 
          text={`${imageFileUploadProgress}%`}
          strokeWidth={4}
          
          styles= {{
                root:{
                  height:'100%',
                  width:'100%',
                  position:'absolute',
                  color:'red',
                  top:0,
                  left:0
                },
                path:{
                  stroke:`rgba(67, 150, 250, ${imageFileUploadProgress/100})`,
                  
                },
          }}
         
          />) }   
        <img 
        src={imageFileUrl || currentUser.profilePicture} alt="user"  
        className={`rounded-full     w-full h-auto  bg-slate-600 justify-center items-center
        object-cover 
        ${imageFileUploadProgress && imageFileUploadProgress < 100 && 'opacity-60 '}`} />
        
        </div>
        {imageFileUploadError &&
         <Alert Alert className="text-red-500">{imageFileUploadError}</Alert>}
        <input 
        type="text" 
        id="username" 
        defaultValue={currentUser.email} 
        className="text-fuchsia-800 placeholder-fuchsia-400 border border-fuchsia-800 focus:ring-fuchsia-800 focus:border-fuchsia-800 rounded-lg"
        placeholder="username"
        onChange={changeHandler}
        />
        <input  
        type="email"
         id="email" 
         defaultValue={currentUser.email}
         className="text-fuchsia-800 placeholder-fuchsia-400 border border-fuchsia-800 focus:ring-fuchsia-800 focus:border-fuchsia-800 rounded-lg"
          placeholder="email"
          onChange={changeHandler}
          />
        <input
        type="password" 
         placeholder="password"
         id='password'
         onChange={changeHandler}
         className="text-fuchsia-800 placeholder-fuchsia-400 border-2 border-fuchsia-800 focus:ring-fuchsia-800 focus:border-fuchsia-800 rounded-lg"
         />
        <button type='submit' outline
        className=" bg-fuchsia-800  border-2 border-fuchsia-800 text-white rounded-lg hover:bg-fuchsia-900"
        disabled={loading ||imageFileUploading}>
          <p className="text-[20px]">
            {loading?'loading...' : 'Update'}</p>

        </button>
          {currentUser.isAdmin && (
          <Link to={'/create_post'}>
          <button
          type='button'
          gradientDuoTone='purpleToPink'
          className='w-full bg-fuchsia-800  border-2 border-fuchsia-800 text-white rounded-lg hover:bg-fuchsia-900 text-[20px]'
        >
          Add task

          </button>
          
          
          
          </Link>


          )}


      </form>
      <div className="text-red-500 flex justify-between mt-5">
        <button className="cursor-pointer bg-yellow-50 border-2 border-fuchisa-800 rounded-lg">
        <span className="cursor-pointer"  
        onClick={()=>setShowModal(true)}   > Delate Account</span>
        </button>
        <button className="cursor-pointer bg-yellow-50 border-2 border-fuchisa-800 rounded-lg">
        <span className="cursor-pointer  " onClick={handelSignOut}> Sign out</span>
        </button>
      </div>
      {updateUserSuccess &&
      ( <Alert className="text-green-500 justify-center text-[16px] font-semibold">
        {updateUserSuccess}</Alert>)}
        {updateUserError &&
      ( <Alert className="text-red-500 justify-center text-[16px] font-semibold">
        {updateUserError}</Alert>)}

        {error &&
      ( <Alert className="text-red-500 justify-center text-[16px] font-semibold">
        {error}</Alert>)}
        <Modal show={showModal} onClose={()=> setShowModal(false)}  popup size='md'>
          <Modal.Header/>
          <Modal.Body>
            <div  className=" flex  flex-col justify-center items-center">
              <HiOutlineExclamationCircle className="text-red-500 text-[50px]"/>
              <p className="text-red-600"> Are you shure you want to delete your account?
                
              </p>  
              <div className="flex flex-row  mx-4  md:space-x-20 space-x-4 mt-2">
                <Button onClick={handelDeleteUser} color='failure' >yes,I'm sure</Button>
                <Button onClick={()=> setShowModal(false)} >No, cancel</Button>



              </div>

            </div>
          </Modal.Body>
            


          </Modal>


    </div>
            )
}

export default DashProfile;
