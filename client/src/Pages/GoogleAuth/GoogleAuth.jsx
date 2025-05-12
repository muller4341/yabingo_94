
//import Google from "../../assets/google.png";
import { GoogleAuthProvider } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import {signInSuccess} from "../../redux/user/userSlice";
import { app} from "../../firebase";
import { useNavigate } from "react-router-dom";



const GoogleAuth = () => {
    const dispatch = useDispatch();
    const auth = getAuth(app);
    const navigate = useNavigate();


    const provider= new GoogleAuthProvider();
    //console.log('provider', provider);
    
    const handleOnClick = async (event) => {
        event.preventDefault();
        
        provider.setCustomParameters({prompt: 'select_account'});
        console.log('provider', provider);

        try {
            const resultFromGoogle = await signInWithPopup (auth, provider);
            const res= await fetch('/api/auth/google', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    name: resultFromGoogle.user.displayName,
                    email: resultFromGoogle.user.email,
                    photoURL: resultFromGoogle.user.photoURL,

                }),
            })
            const data = await res.json();
            if (res.ok)
                   {
                   dispatch(signInSuccess(data));
                     navigate('/');

                   }
        }
        catch (error) {
            console.error('Error during fetch:', error);
        }
    }
    




    return (
        <div>
        <button className=" w-full bg-fuchsia-800
             hover:bg-fuchsia-900
          text-white font-bold md:text-[24px] py-2 px-4 rounded-lg"
         type="button " 
        
         onClick={(event)=>handleOnClick(event)} >

            
            continue with google
        </button>
        </div>
    )
}

export default GoogleAuth;