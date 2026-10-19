import { useEffect } from "react"

import {
  Routes,
  Route,
  useLocation
} from "react-router-dom"

import SEO from "./components/SEO"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

import Home from "./pages/Home"
import Split from "./pages/Split"
import EditPDF from "./pages/Edit"
import Merge from "./pages/Merge"
import Convert from "./pages/Convert"
import Compress from "./pages/Compress"
import Privacy from "./pages/Privacy"
import About from "./pages/About"
import Terms from "./pages/Terms"
import Feedback from "./pages/Feedback"
import FeedbackAdmin from "./pages/FeedbackAdmin"

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
import "./styles/company.css"

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant"
    })
  }, [pathname])

  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <SEO />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/split" element={<Split />} />
        <Route path="/edit" element={<EditPDF />} />
        <Route path="/merge" element={<Merge />} />
        <Route path="/convert" element={<Convert />} />
        <Route path="/compress" element={<Compress />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/author/feedback" element={<FeedbackAdmin />} />
      </Routes>

      <Footer />
    </>
  )
}

export default App
