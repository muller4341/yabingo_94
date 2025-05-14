import  { BrowserRouter as Router,Route, Routes} from 'react-router-dom'
import Signin from './Pages/SignIn/SignIn.jsx'
import SignUp from './Pages/SignUp/SignUp.jsx'
import EmailVerification from './Pages/SignUp/EmailVerification.jsx'
import Sucess  from './Pages/SignUp/Success.jsx'
import Home from './Pages/Home/Home.jsx'
import Dashboard from './Pages/Dashboard/Dashboard.jsx'
import Projects from './Pages/Projects/Projects.jsx'
import About from './Pages/About/About.jsx'
import Navbar from './Pages/Navbar/Navbar.jsx'
import Footer from './Pages/footer/footer.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import CreatePost from './Pages/createPost/createPost.jsx'
import AdminPrivateRoute from './components/adminPrivateRoute.jsx'
import UpdatePost from './Pages/UpdatePost/UpdatePost.jsx'
import PostPages from './Pages/PostPages/PostPages.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Search from './Pages/Search/Search.jsx'
import Client from './Pages/client/client.jsx'
import Tasks from './Pages/client/Tasks.jsx'
 
function App() {
  

  return (
    
<Router>
  <ScrollToTop/>
  {/* <Navbar/> */}
<Routes>
  <Route path="/post/:postSlug" element={<PostPages/>} />
<Route path="/home" element={<Home/>} />
<Route path="/"element={<Signin/>} />
<Route path="/signin" element={<Signin/>}/>
<Route path="/signup" element={<SignUp/>} />
<Route path="/client" element={<Client/>} />
<Route path="/task/:postSlug" element={<Tasks />} />
<Route path="/verifyemail" element={<EmailVerification/>} />
<Route path="/success" element={<Sucess/>} />
<Route path="/create_post" element={<CreatePost/>} />
<Route path="/search" element={<Search/>} />
<Route path="/projects" element={<Projects/>} />r
<Route path="/about" element={<About/>} />
<Route element={<PrivateRoute/>} >
<Route path="/dashboard" element={<Dashboard/>} />
  </Route>
<Route element={<AdminPrivateRoute/>} >
<Route path="/create_post" element={<CreatePost/>}/>
<Route path="/update-post/:postId" element={<UpdatePost/>}/>
  </Route>




 

  </Routes> 
  
  <Footer/>






    </Router>      
  )
}

export default App
