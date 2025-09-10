import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AnimatedBackground from './components/AnimatedBackground';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';

const Home = React.lazy(() => import('./pages/Home'));
const Works = React.lazy(() => import('./pages/Works'));
const Skills = React.lazy(() => import('./pages/Skills'));
const About = React.lazy(() => import('./pages/About'));
const Certification = React.lazy(() => import('./pages/Certification'));
const Rating = React.lazy(() => import('./pages/Rating'));
const Talk = React.lazy(() => import('./pages/Talk'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Login = React.lazy(() => import('./pages/Login'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

export default function AppRoutes() {
  const [isLoading, setIsLoading] = useState(true);
  const handleLoadingComplete = () => setIsLoading(false);
  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      <Navbar />
      <AnimatedBackground />
      <React.Suspense fallback={<div className="px-6 py-28 text-white/70">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/works" element={<Works />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/about" element={<About />} />
          <Route path="/certification" element={<Certification />} />
          <Route path="/rating" element={<Rating />} />
          <Route path="/talk" element={<Talk />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </div>
  );
}

