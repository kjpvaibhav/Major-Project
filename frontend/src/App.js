import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/Login'; 
import Hero_Home from './pages/Hero_Home';
import Home from './pages/Home';
import FeaturesPage from './components/Features';
import AboutUsPage from './components/About';
import NavigationPage from './components/Navigation';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Hero_Home />} /> {/* Render Hero component for the root path */}
        <Route path='/login' element={<LoginPage />} />
        <Route path='/home' element={<Home />} /> {/* Render Home component for the '/home' path */}
        <Route path='/features' element={<FeaturesPage />} />
        <Route path='/about' element={<AboutUsPage />} />
        <Route path='/Navigation' element={<NavigationPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
