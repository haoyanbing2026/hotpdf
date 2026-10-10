import {

Routes,

Route

} from "react-router-dom"



import Navbar from "./components/Navbar"



import Home from "./pages/Home"

import Split from "./pages/Split"

import Merge from "./pages/Merge"

import Convert from "./pages/Convert"



import "./App.css"





function App(){



return (

<>


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



</Routes>



</>

)


}



export default App
