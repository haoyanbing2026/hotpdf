import { Link } from "react-router-dom"


function Navbar(){


return (

<nav className="navbar">


    {/* Logo */}

    <Link 
      to="/"
      className="brand"
    >

        <div className="logo">

            🔥 HotPDF

        </div>


        <div className="brand-sub">

            PDF Assistant

        </div>


    </Link>




    {/* Navigation */}

    <div className="nav-links">


        <Link to="/">
            Home
        </Link>



        <div className="nav-dropdown">


            <span>
                Tools ▾
            </span>


            <div className="dropdown-menu">


                <Link to="/split">

                    ✂️ Split PDF

                </Link>



                <Link to="/merge">

                    📎 Merge PDF

                </Link>



                <Link to="/convert">

                    📝 Convert PDF

                </Link>


                <Link to="/compress">

                    📦 Compress PDF

                </Link>


            </div>


        </div>




        <Link to="/study">

            Study

        </Link>



        <Link to="/work">

            Work

        </Link>



        <Link to="/about">

            About

        </Link>




        <Link 
          to="/split"
          className="nav-upload"
        >

            Upload PDF

        </Link>



    </div>


</nav>


)


}


export default Navbar
