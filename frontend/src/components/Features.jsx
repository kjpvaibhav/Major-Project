import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

const FeaturesPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const features = [
    {
      title: 'Chatbot',
      description: 'Voice Enabled Digital Assistant.',
      link: '/home',
      video: require('../assets/Comp_1_1.mp4'), // Example path to the image file
    },
    {
      title: 'Navigation',
      description: 'navigate throughout the college',
      link: '/navigation',
      image: require('../assets/navigation.webp'), // Example path to the image file
    },
  ];

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="flex flex-wrap justify-center">
        {features.map((feature, index) => (
          <Link key={index} to={feature.link} className="m-4">
            <div
              className={`w-96 h-128 rounded-lg shadow-md flex flex-col justify-between items-center text-center relative overflow-hidden ${index === 0 ? 'bg-red-500 text-black' : 'bg-blue-500 text-white'}`}
              style={{ width: '24rem', height: '32rem' }}
            >
              {index === 0 && ( // Check if it's the first box
                <>
                  <video className="w-full h-full absolute inset-0 object-cover z-0" ref={videoRef}>
                    <source src={feature.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <button
                    className="absolute top-0 right-0 m-4 text-black z-10"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePlayPause();
                    }}
                  >
                    {isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
                  </button>
                </>
              )}
              {index !== 0 && (
                <div className="w-full h-full absolute inset-0 overflow-hidden">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-105" />
                </div>
              )}
              <h2 className={`text-3xl font-bold absolute top-0 left-0 m-4 z-10 ${index === 0 ? 'text-black' : 'text-black'}`}>{feature.title}</h2>
              <p className={`text-gray-300 absolute bottom-0 left-0 m-4 z-10 ${index === 0 ? 'text-green-600' : 'text-[#fff]'}`}>{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeaturesPage;
