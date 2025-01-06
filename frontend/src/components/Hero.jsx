import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Hero = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to the Home page when the button is clicked
    navigate('/home');
  };

  return (
    <section className="text-gray-500 body-font h-screen flex bg-black bg-svg-constellation-gray-100 relative">
      <div className="container mx-auto flex px-5 py-12 items-center justify-center flex-col">
        <div className="lg:w-2/3 w-full animate-fade-in-down">
          <h1 className="md:text-6xl text-3xl mb-2 font-bold text-white tracking-tight leading-tight">
          Welcome to Veda:
          </h1>
          <h1 className="md:text-4xl text-3xl mb-4 font-bold text-white tracking-tight leading-tight">
          your personalized college companion! 
            
          </h1>
          <p className="mt-8 mb-16 md:leading-relaxed leading-normal text-white tracking-tight text-xl">
          Navigate through your academic journey effortlessly with our intuitive chatbot and interactive features. Get ready to experience seamless assistance tailored just for you.
          </p>
          <button 
            className="mt-8 inline-block rounded-xl bg-[#aa0505] py-3 px-6 font-dm text-base font-medium text-white transition-transform duration-200 ease-in-out hover:scale-[1.02]"
            onClick={handleClick} // Call handleClick function when button is clicked
          >
            Chat
          </button>
        </div>
      </div>
    </section>
  );
};
