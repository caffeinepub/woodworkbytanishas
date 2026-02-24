import Hero from '../components/Hero';
import CategoryShowcase from '../components/CategoryShowcase';
import FeaturedProducts from '../components/FeaturedProducts';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <Hero />
      <CategoryShowcase />
      <FeaturedProducts />
      
      {/* About Preview */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
              Our Story
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Since 2021, WoodworkbyTanishas has been crafting exceptional wooden furniture in the heart of Jodhpur, Rajasthan. 
              We specialize in Mango Wood, Acacia Wood, and custom furniture pieces that bring timeless elegance to your home.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center space-x-2 px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all duration-200 shadow-sm"
            >
              <span>Learn More About Us</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary text-primary-foreground rounded-2xl p-12 md:p-16 text-center shadow-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6">
              Ready to Transform Your Space?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Let us create a custom piece that perfectly fits your vision and space.
            </p>
            <Link
              to="/customize"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-primary-foreground text-primary rounded-full font-semibold text-lg hover:bg-primary-foreground/90 transition-all duration-200 shadow-lg"
            >
              <span>Start Customizing</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
