import React from 'react';

interface CategoryGridProps {
  onSelectCategory: (cat: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  const categories = [
    {
      id: 'gaming',
      title: 'Gaming & Gear',
      desc: 'Mechanical Keyboards, Mice, Desk Mats',
      badge: 'Esports Grade',
      image: '/assets/keyboard.png',
      badgeColor: 'text-amber-400 bg-amber-400/10'
    },
    {
      id: 'electronics',
      title: 'Electronics & Gadgets',
      desc: 'Curved Monitors, ANC Headphones, Watches',
      badge: '2K & ANC Tech',
      image: '/assets/monitor.png',
      badgeColor: 'text-cyan-400 bg-cyan-400/10'
    },
    {
      id: 'fashion',
      title: 'Fashion & Apparel',
      desc: 'Tactical Bomber Jackets, Cyberpunk Hoodies',
      badge: 'Cyberpunk Style',
      image: '/assets/jacket.png',
      badgeColor: 'text-emerald-400 bg-emerald-400/10'
    },
    {
      id: 'home',
      title: 'Home & Essentials',
      desc: 'RGB Desk Lamps, Smart HEPA Air Purifiers',
      badge: 'Smart Setup',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop',
      badgeColor: 'text-purple-400 bg-purple-400/10'
    }
  ];

  return (
    <section className="py-12 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Shop By Department</span>
            <h2 className="font-black text-2xl sm:text-3xl text-white mt-0.5">Featured Shadow Categories</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">Browse our curated high-performance dark-themed gear with instant Prime delivery coverage.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="cursor-pointer group relative h-64 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl hover:border-amber-500 transition-all duration-300 transform hover:-translate-y-1"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-70 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              <div className="absolute bottom-5 left-5 right-5 text-left">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${cat.badgeColor}`}>
                  {cat.badge}
                </span>
                <h3 className="font-black text-xl text-white mt-1 group-hover:text-amber-400 transition">{cat.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-1">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
