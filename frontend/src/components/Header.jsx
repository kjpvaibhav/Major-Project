import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Assuming you have the logo file in your project

const Header = () => {
  return (
    <div className="flex justify-between items-center bg-black px-4 py-2">
      <div className="flex items-center">
        <img src={logo} alt="Logo" className="h-8 mr-2" /> {/* Adjust the size as needed */}
        <h1 className="text-white text-4xl font-extrabold">VEDA</h1>
      </div>
      <nav className="flex items-center">
        <Link to="/" className="text-white mr-6">Home</Link> {/* Increased margin */}
        <Link to="/navigation" className="text-white mr-6">Navigation</Link> {/* Increased margin */}
        <Link to="/chatbot" className="text-white">Chatbot</Link>
      </nav>
    </div>
  );
};


export default Header;
