import React from 'react';
import { TESTIMONIALS } from '@utils/constants';
import { Star, Quote, MapPin } from 'lucide-react';

const Testimonials: React.FC = () => {
  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Cộng Đồng Nói Gì?</h2>
          <p className="text-gray-600">Đồng hành cùng hàng ngàn người dân Việt Nam xây dựng lối sống xanh.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-brand-50 rounded-3xl p-8 relative">
              <Quote className="absolute top-8 right-8 text-brand-200 w-12 h-12" />

              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>

              <p className="text-gray-700 font-medium italic mb-6 relative z-10">"{t.content}"</p>

              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                <div>
                  <h4 className="font-bold text-gray-900">{t.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={12} />
                    <span>{t.location}</span>
                  </div>
                  <p className="text-xs text-brand-600 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;