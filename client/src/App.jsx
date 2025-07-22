import  { BrowserRouter as Router,Route, Routes} from 'react-router-dom'
import Signin from './Pages/SignIn/SignIn.jsx'
import SignUp from './Pages/SignUp/SignUp.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import AdminPrivateRoute from './components/adminPrivateRoute.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import ResetPassword from './Pages/ResetPassword'
import Dashboard from './Pages/SidebarElements/Dashboard'
import PlayGame from './Pages/Game/Cartela'
import  Game from './Pages/Game/Game.jsx'

function App() {
  

  return (
    
<Router>
  <ScrollToTop/>
  {/* <Navbar/> */}
<Routes>
<Route path="/"element={<Signin/>} />
<Route path="/signin" element={<Signin/>}/>
<Route path="/signup" element={<SignUp/>} />
<Route element={<PrivateRoute/>} >
 <Route path="/dashboard" element={<Dashboard/>} />
 <Route path="/game" element={<Game/>} />
<Route path="/play" element={<PlayGame/>} />
  </Route>
<Route element={<AdminPrivateRoute/>} >
{/*  */}
  </Route>
<Route path="/reset-password/:token" element={<ResetPassword />} />




 

  </Routes> 
  







    </Router>      
  )
}

export default App
