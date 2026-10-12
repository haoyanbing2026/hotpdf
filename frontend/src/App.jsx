import {

Routes,

Route

} from "react-router-dom"



import Navbar from "./components/Navbar"


import Footer from "./components/Footer"


import Home from "./pages/Home"

import Split from "./pages/Split"

import Merge from "./pages/Merge"

import Convert from "./pages/Convert"

import Compress from "./pages/Compress"

import Privacy from "./pages/Privacy"

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
