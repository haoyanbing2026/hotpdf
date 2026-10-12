import React from 'react'

import ReactDOM from 'react-dom/client'

import {

BrowserRouter

} from 'react-router-dom'


import App from './App.jsx'

import Privacy from "./pages/Privacy"


ReactDOM.createRoot(

document.getElementById('root')

).render(


<Route
path="/privacy"
element={<Privacy />}
/>


<BrowserRouter>


<App />


</BrowserRouter>


)
