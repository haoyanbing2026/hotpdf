import { useEffect } from "react"

import {

Routes,

Route,

useLocation

} from "react-router-dom"



import Navbar from "./components/Navbar"

import Footer from "./components/Footer"



import Home from "./pages/Home"

import Split from "./pages/Split"

import Merge from "./pages/Merge"

import Convert from "./pages/Convert"

import Compress from "./pages/Compress"

import Privacy from "./pages/Privacy"



import "./styles/global.css"

import "./styles/navbar.css"

import "./styles/home.css"

import "./styles/tools.css"

import "./styles/upload.css"

import "./styles/preview.css"

import "./styles/result.css"

import "./styles/merge.css"

import "./styles/footer.css"

import "./styles/responsive.css"








function ScrollToTop(){



const { pathname } = useLocation()





useEffect(()=>{


window.scrollTo({

top:0,

behavior:"instant"

})


},[pathname])





return null


}









function App(){



return (


<>


<ScrollToTop />



<Navbar />



<Routes>


<Route

path="/"

element={<Home />}

/>



<Route

path="/split"

element={<Split />}

/>



<Route

path="/merge"

element={<Merge />}

/>



<Route

path="/convert"

element={<Convert />}

/>



<Route

path="/compress"

element={<Compress />}

/>



<Route

path="/privacy"

element={<Privacy />}

/>


</Routes>



<Footer />


</>


)


}





export default App