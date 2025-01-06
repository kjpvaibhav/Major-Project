import React from 'react';
import { Link } from 'react-router-dom';

const AboutUsPage = () => {
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>
        <p className="text-lg mb-4">
          We are a team of passionate individuals dedicated to creating innovative solutions
          that empower people and businesses.
        </p>
        <p className="text-lg mb-4">
          Our mission is to leverage technology to make the world a better place by
          simplifying complex processes and enhancing user experiences.
        </p>
        <p className="text-lg mb-8">
          Whether it's developing cutting-edge software or providing top-notch services,
          we strive for excellence in everything we do.
        </p>
        <Link
          to="/contact"
          className="bg-white text-black font-bold py-2 px-6 rounded-full inline-block transition duration-300 ease-in-out"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
};

export default AboutUsPage;
