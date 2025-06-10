import  { BrowserRouter as Router,Route, Routes} from 'react-router-dom'
import Signin from './Pages/SignIn/SignIn.jsx'
import SignUp from './Pages/SignUp/SignUp.jsx'
import Dashboard from './Pages/SidebarElements/Dashboard.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import AdminPrivateRoute from './components/adminPrivateRoute.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import ResetPassword from './Pages/ResetPassword'
// import Orders from './Pages/Orders'
// import NewOrder from './Pages/NewOrder'
// import OrderDetail from './components/OrderDetail'

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
{/* <Route path="/orders" element={<Orders/>} />
<Route path="/orders/new" element={<NewOrder/>} />
<Route path="/orders/:orderId" element={<OrderDetail/>} /> */}
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
