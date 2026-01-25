import React, { useState } from 'react';
import Navbar from '@components/Navbar';
import Hero from '@features/landing/components/Hero';
import RoleFeatures from '@features/landing/components/RoleFeatures';
import Services from '@features/landing/components/Services';
import Testimonials from '@features/landing/components/Testimonials';
import Gallery from '@features/landing/components/Gallery';
import Footer from '@components/Footer';
import LeaderboardSection from '@features/gamification/components/LeaderboardSection';
import AiAssistant from '@features/ai-assistant/components/AiAssistant';
import SmartReportModal from '@features/waste-report/components/SmartReportModal';

const HomePage: React.FC = () => {
    const [isReportOpen, setIsReportOpen] = useState(false);

    const openReport = () => setIsReportOpen(true);
    const closeReport = () => setIsReportOpen(false);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 animate-in fade-in">
            <Navbar onBookNow={openReport} />

            <main>
                <Hero onBookNow={openReport} />
                <RoleFeatures />
                <Services onBookNow={openReport} />
                <LeaderboardSection />
                <Gallery />
                <Testimonials />
            </main>

            <Footer />

            {/* Interactive Elements */}
            <AiAssistant />
            <SmartReportModal isOpen={isReportOpen} onClose={closeReport} />
        </div>
    );
};

export default HomePage;