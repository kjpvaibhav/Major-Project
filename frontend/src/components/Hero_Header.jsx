import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import logo from '../assets/logo.png';

function Hero_Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;
            setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
            setPrevScrollPos(currentScrollPos);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [prevScrollPos, visible]);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className={`bg-black flex flex-wrap backdrop-blur-sm bg-opacity-70 items-center justify-between p-3 fixed top-0 z-40 w-screen px-10 transition-all duration-300 ${visible ? '' : '-translate-y-full'}`}>
            <div className='w-20 h-18'>
                <img src={logo} className="w-full h-full" alt="ACME Logo" style={{ borderRadius: "50%" }} />
            </div>
            <div className="flex md:hidden">
                <button id="hamburger" onClick={toggleMenu}>
                    <img className={menuOpen ? "block" : "hidden"} src="https://img.icons8.com/fluent-systems-regular/2x/close-window.png" width="40" height="40" alt="Close Menu" />
                    <img className={!menuOpen ? "block" : "hidden"} src="https://img.icons8.com/fluent-systems-regular/2x/menu-squared-2.png" width="40" height="40" alt="Open Menu" />
                </button>
            </div>
            <div className={`md:flex w-full md:w-auto ${menuOpen ? 'block' : 'hidden'}`}>
                <Link to="/" className="toggle md:mx-4 my-2.5 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-gray-800">Home</Link>
                <Link to="/features" className="toggle md:mx-4 my-2.5 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-gray-800">Features</Link>
                <Link to="/about" className="toggle md:mx-4 my-2.5 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-gray-800">About Us</Link>
                <Link to="/login" className="toggle md:mx-4 my-2.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#DAA520] hover:bg-yellow-700">Login</Link>
            </div>
        </nav>
    );
}

export default Hero_Header;
