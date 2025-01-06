import React from 'react'
import { Hero } from '../components/Hero';
import Hero_Header from '../components/Hero_Header';
import FeaturesPage from '../components/Features';
import About from '../components/About';

const Hero_Home = () => {
    return (
        <>
          <Hero_Header />
          <Hero /> 
          <FeaturesPage />
          <About />
        </>
      )
}

export default Hero_Home 