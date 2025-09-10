import React from 'react';
import { useState, useEffect } from 'react';
import { Mail, MessageCircle, MessageCircleMore, PhoneCall, MessageSquare } from 'lucide-react';
import AnimatedBackground from './components/AnimatedBackground';
import GradientText from './components/GradientText';
import NeonButton from './components/NeonButton';
import ProfileImage from './components/ProfileImage';
import TypingText from './components/TypingText';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleContactEmail = () => {
    window.location.href = 'mailto:eleanoretefo1@gmail.com';
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/201227866673', '_blank');
  };

  const handleLoadingComplete = () => setIsLoading(false);

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Main Content: two-column responsive layout */}
      <div className="relative z-10 min-h-screen px-6 py-12 pt-28 md:pt-32">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text and CTAs */}
          <div className="order-2 lg:order-1 text-left space-y-8">
            <div className="space-y-4">
              <GradientText className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <h1>Mohamed Atef</h1>
              </GradientText>
              <GradientText className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <h2>Abdelsattar</h2>
              </GradientText>
            </div>
            <GradientText className="text-lg md:text-2xl lg:text-3xl font-bold">
              <TypingText
                text="A Full Stack Developer and Web Solutions Expert with hands-on experience in building responsive websites, modern web applications, and delivering high-quality digital products tailored to client needs."
                speedMs={20}
              />
            </GradientText>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-start items-center pt-2">
              <NeonButton icon={Mail} onClick={handleContactEmail} variant="primary">
                Contact Me
              </NeonButton>
              <NeonButton icon={MessageCircle} onClick={handleWhatsApp} variant="secondary">
                WhatsApp
              </NeonButton>
            </div>
            {/* Contact info removed as requested */}
          </div>

          {/* Right: Profile image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <ProfileImage />
          </div>
        </div>

        {/* Decorative floating elements */}
        <div className="absolute top-20 left-10 w-6 h-6 bg-green-400 rounded-full animate-bounce opacity-80 shadow-lg shadow-green-400/50 blur-sm" />
        <div className="absolute top-40 right-20 w-5 h-5 bg-blue-400 rounded-full animate-bounce opacity-80 shadow-lg shadow-blue-400/50 blur-sm" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-20 w-7 h-7 bg-pink-400 rounded-full animate-bounce opacity-80 shadow-lg shadow-pink-400/50 blur-sm" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-10 w-4 h-4 bg-purple-400 rounded-full animate-bounce opacity-80 shadow-lg shadow-purple-400/50 blur-sm" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-60" />
        <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '1.5s' }} />
      </div>
    </div>
  );
}

export default App;