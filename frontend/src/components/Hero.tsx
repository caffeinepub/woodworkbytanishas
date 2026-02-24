import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-[600px] md:h-[700px] lg:h-[800px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/assets/generated/hero-banner.dim_1920x800.png"
          alt="Premium wooden furniture"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            Crafting Timeless Wooden Elegance
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
            Discover handcrafted furniture that brings warmth and sophistication to your space.
          </p>
          <Link
            to="/collection"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span>Explore Collection</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
