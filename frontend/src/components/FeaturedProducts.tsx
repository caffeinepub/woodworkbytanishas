import { Link } from '@tanstack/react-router';
import { useGetFeaturedProducts } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  const { data: products, isLoading } = useGetFeaturedProducts();

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        </div>
      </section>
    );
  }

  const displayProducts = products?.slice(0, 6) || [];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked pieces that showcase our craftsmanship and attention to detail.
          </p>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No featured products available at the moment.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/collection"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all duration-200 shadow-sm"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
