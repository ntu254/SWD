import React from 'react';
import { Camera } from 'lucide-react';

const Gallery: React.FC = () => {
  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 text-center">
         <div className="inline-flex items-center gap-2 text-brand-500 bg-brand-50 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider mb-4">
          <Camera size={16} />
          Hình Ảnh Hoạt Động
        </div>
        <h2 className="font-display text-4xl font-bold text-gray-900 mb-12">Hành Trình Xanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "1532996122724-e3c354a0b15b", 
            "1611288870280-4a331d977497", 
            "1528323273322-d81458248d40", 
            "1604187351573-21c5636df41b", 
            "1605600659908-0ef719419d41", 
            "1516937941348-200e03f70630",
            "1550989460-0adf9ea622e2",
            "1542601906990-b4d3fb778b09"
          ].map((id, index) => (
            <div key={id} className={`rounded-3xl overflow-hidden shadow-md h-64 ${index % 3 === 0 ? 'md:col-span-2' : ''} group relative`}>
               <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                  <span className="text-white font-bold text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">Chi Tiết</span>
               </div>
              <img 
                src={`https://images.unsplash.com/photo-${id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80`} 
                alt="Green Activity" 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;