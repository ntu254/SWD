import Footer from '@components/Footer';
import Navbar from '@components/Navbar';
import AiAssistant from '@features/ai-assistant/components/AiAssistant';
import LeaderboardSection from '@features/gamification/components/LeaderboardSection';
import AiSection from '@features/landing/components/AiSection';
import CTASection from '@features/landing/components/CTASection';
import Gallery from '@features/landing/components/Gallery';
import Hero from '@features/landing/components/Hero';
import Testimonials from '@features/landing/components/Testimonials';
import React from 'react';

const HomePage: React.FC = () => {
  const openReport = () => (window.location.href = '/auth');

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 animate-in fade-in">
      <Navbar onBookNow={openReport} />

      <main>
        <Hero onBookNow={openReport} />
        <AiSection />
        <LeaderboardSection />
        <Gallery />
        <Testimonials />
        <CTASection onAction={openReport} />
      </main>

      <Footer />

      {/* Interactive Elements */}
      <AiAssistant />
    </div>
  );
};

export default HomePage;
