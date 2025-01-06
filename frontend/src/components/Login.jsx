import React, { useState } from 'react';

// Define your image source
import imageSrc from "../assets/loginimg.jpeg";

const LoginPage = () => {
  // State to store form input values
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        // Handle success (e.g., redirect user to another page)
        console.log('User registered successfully');
      } else {
        // Handle error response
        console.error('Registration failed');
      }
    } catch (error) {
      // Handle network error
      console.error('Error occurred:', error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
  <div className="lg:w-1/2 h-60 lg:h-auto bg-cover" style={{backgroundImage: `url(${imageSrc})`}}></div>
  <div className="lg:w-1/2 flex items-center justify-center bg-black">
    <div className="w-11/12 lg:w-3/4 bg-black shadow-md rounded-md p-8 style={{backgroundImage: `url(${imageSrc})`, filter: 'blur(5px)', opacity: '0.8'}}">
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-white text-2xl font-bold mb-4">Sign In</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-[#E0641A] font-semibold mb-1">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            className="w-full border border-[#3D3D3D] rounded-md px-4 py-2" 
            value={formData.email} 
            onChange={handleInputChange} 
          />
        </div>
        <div className="mb-4">
          <label htmlFor="username" className="block text-[#E0641A] font-semibold mb-1">Username</label>
          <input 
            type="text" 
            id="username" 
            name="username" 
            className="w-full border border-[#3D3D3D] rounded-md px-4 py-2" 
            value={formData.username} 
            onChange={handleInputChange} 
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-[#E0641A] font-semibold mb-1">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            className="w-full border border-[#3D3D3D] rounded-md px-4 py-2" 
            value={formData.password} 
            onChange={handleInputChange} 
          />
        </div>
        <button type="submit" className="w-full bg-[#E0641A] text-white font-semibold rounded-md py-2 hover:bg-[#E0641A] transition duration-300">Sign in</button>
      </form>
    </div>
  </div>
</div>

  );
};

export default LoginPage;
