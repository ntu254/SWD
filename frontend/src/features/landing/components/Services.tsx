import React from 'react';
import { SERVICES, FEATURES } from '@utils/constants';
import Button from '@components/Button';
import { Clock, Award } from 'lucide-react';

interface ServicesProps {
  onBookNow: () => void;
}

const Services: React.FC<ServicesProps> = ({ onBookNow }) => {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Dịch Vụ Thu Gom</h2>
          <p className="text-gray-600 text-lg">Chúng tôi hỗ trợ thu gom đa dạng các loại rác thải, giúp bạn xử lý đúng quy trình và bảo vệ môi trường.</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((service) => (
            <div key={service.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:border-brand-200 hover:shadow-2xl transition-all duration-300 group flex flex-col">
              <div className="h-48 overflow-hidden relative">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Phổ Biến
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                  <span className="text-lg font-display font-bold text-brand-600">{service.points}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock size={16} />
                  <span>Thời gian: {service.duration}</span>
                </div>

                <p className="text-gray-600 text-sm mb-6 flex-grow">{service.description}</p>

                <Button
                  onClick={onBookNow}
                  variant={service.popular ? 'primary' : 'outline'}
                  fullWidth
                  size="sm"
                >
                  Yêu Cầu Thu Gom
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;