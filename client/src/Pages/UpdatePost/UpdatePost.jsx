import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { app } from "../../firebase";
import { useNavigate , useParams} from "react-router-dom";
import { CircularProgressbar } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import { set } from "mongoose";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { log } from "../../assets";

const UpdatePost=()=> {
   // const [content, setContent] = useState('');
   const currentUser = useSelector((state) => state.user.currentUser);
    const navigate = useNavigate();
   const[publishError, setPublishError]= useState(null);
   const [file , setFile ]= useState(null);
   const [imageUploadProgress, setImageUploadProgress] = useState(null);
   const [imageUploadError, setImageUploadError]= useState(null);
   const [formData, setFormData] = useState({});
    const {postId} = useParams();
    console.log("postId", postId);
    console.log('formData:', formData);
    console.log('currentUser:', currentUser);

    useEffect(() => {

        try
        {
            const fetchPost = async () => {
                const res = await fetch(`/api/post/getposts?postId=${postId}`);
                const data = await res.json();
                if (!res.ok) {                    
            
                    console.log(data.message);
                    setPublishError(data.message);
                    return;
                }
                if (res.ok) {
                    setPublishError(null);
                    setFormData(data.posts[0]);
                    console.log(data);
                }


            };
            fetchPost();
        }

        catch (error) {
            console.log(error);

        }
    },
    [postId]
    );

   const handleUploadImage = async () => {
    try {
        if (!file) {  
            setImageUploadError('Please select an image');
             return;
        }
        setImageUploadError(null);
        const storage = getStorage(app);
        const filename = new Date().getTime() + '-' + file.name;
        const storageRef = ref(storage,filename);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setImageUploadProgress(progress.toFixed(0));
                console.log('Upload is ' + progress + '% done');
                
            },
            (error) => {
                setImageUploadError('An error occurred while uploading the image'); 
                setImageUploadProgress(null);
                console.log(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setImageUploadProgress(null);
                    setImageUploadError(null);
                    setFormData({ ...formData, image: downloadURL });
                    console.log('File available at', downloadURL);
                });
            }
        );
    } catch (error) {
        setImageUploadError('image upload failed');
        setImageUploadProgress(null);
        console.log(error);
        
    }
};
const handleSubmit = async (e) => {
    e.preventDefault();
   
    try {
        const res = await fetch(`/api/post/updatepost/${formData._id || postId}/${currentUser?._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        const data = await res.json();
       if(!res.ok){
           setPublishError(data.message);
           return;
       }
       if (res.ok){
           setPublishError(null);
              navigate(`/post/${data.slug}`);
           console.log(data);
       }
        
    } catch (error) {
        
        setPublishError(error.message);

    }
}

return (
<div  className="p-3 mx-auto min-h-screen md:py-12 py-24 flex flex-col gap-4  justify-center "
style={{
    backgroundImage: `url(${log})`, // Path to the image
    backgroundSize: 'cover', // Makes the image cover the entire element
    backgroundPosition: 'center', // Centers the image
    height: '100vh', // Make the container take up the full height of the screen
    width: '100%', // Full width of the screen
  }}>
    <h1 className="text-center my-7 font-bold text-[26px] bg-clip-text text-fuchsia-800 ">Update Task</h1>
    <form className=" flex flex-col gap-4" onSubmit= {handleSubmit}>
        {/* <div className="flex md:flex-row flex-col  justify-between gap-4 ">
            <TextInput 
             type="text"      
            placeholder="title" 
            required 
            id="title" 
            className="flex-1"
            onChange={(e)=>setFormData({...formData, title: e.target.value})} 
            value={formData.title}
            /> 
            

    
           
            
            
             </div> */}
             <select
             className="text-fuchsia-800 border  rounded p-2 font-bold border-fuchsia-800"
            onChange={(e)=>setFormData({...formData, category: e.target.value})}
            
            value={formData.category}
            >
                 <option value="uncategorized">Select a Task number </option>
                <option   value="Task 1"> Task 1 </option>
                <option   value="Task 2">  Task 2  </option>
                <option   value="Task 3">Task 3</option>
                <option   value="Task 4">  Task 4 </option>
                <option   value="Task 5">  Task 5  </option>
                <option   value="Task 6">  Task 6  </option>
                <option   value="Task 7">  Task 7  </option>
                <option   value="Task 8">  Task 8 </option>
                <option   value="Task 9">  Task 9 </option>
                <option   value="Task 10">  Task 10  </option>

            </select>
             {/* <div  className="flex items-center  justify-between gap-4 p-3
             border-red-400 border-dotted border-4"> 
             <FileInput
              type='file' 
              accept='image/*'onChange={(e)=>setFile(e.target.files[0])}/>
             <Button type="button" 
             size='sm'  outline
             onClick={handleUploadImage} 
             disabled={imageUploadProgress}>
                {imageUploadProgress ? (
                    <div className="flex items-center gap-2">
                        <CircularProgressbar value={imageUploadProgress} text={`${imageUploadProgress ||0}%`} />
                        <p>Uploading...</p>
                    </div>
                ) : (
                  'Upload Image'
                )}
                  
                  </Button>
             </div>
             {imageUploadError && (
                <Alert color="failure"> {imageUploadError} </Alert>
                )}  
                
                {formData.image && (
                    <img src={formData.image} alt="uploaded"
                     className="w-120 h-120  mx-auto" />
                )} */}


             <ReactQuill 
             theme="snow" 
             value={formData.content}
             placeholder="write something..."
              className="h-72 m-4 text-fuchsia-800 border border-fuchsia-800 rounded"
              required
              onChange={(value)=>setFormData({...formData, content: value})}

                />
             <button className="m-4 border border-fuchsia-800 bg-fuchsia-800 hover:bg-fuchsia-900 rounded-lg  " type="submit" size="lg" outline>
                <p className=" text-[20px]  text-white">
                    Update Post  </p>

                </button>
                {publishError && (
                    <Alert color="failure"> {publishError} </Alert>
                )}
        </form>   

</div>


);

   }





export default UpdatePost ; 

