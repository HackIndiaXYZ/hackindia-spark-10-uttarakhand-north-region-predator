import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center overflow-hidden pb-10">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css?family=Arvo');
        .font-arvo { font-family: 'Arvo', serif; }
        .four_zero_four_bg {
          background-image: url('/Animated%20404%20Page%20not%20found/bg.gif');
          height: 500px;
          background-position: center;
          background-repeat: no-repeat;
        }
      `}} />
      <section className="w-full font-arvo">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="four_zero_four_bg flex justify-center items-start">
            <h1 className="text-[80px] font-bold mt-10">404</h1>
          </div>
          <div className="mt-[-50px]">
            <h3 className="text-4xl sm:text-[80px] font-bold mb-4 sm:mb-8 leading-tight">Look like you're lost</h3>
            <p className="text-gray-600 mb-6 text-lg sm:text-xl">the page you are looking for is not available!</p>
            <Link to="/" className="inline-block px-6 py-3 bg-[#39ac31] text-white font-semibold rounded hover:bg-[#2e8a27] transition-colors shadow-sm">
              Go to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
