import React, { useState, useEffect, useCallback } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Loader2, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '../components/ProductCard';
import { useActor } from '../hooks/useActor';
import type { Product } from '../backend';

const PAGE_SIZE = 10;

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Products',
  mangoWood: 'Mango Wood',
  acaciaWood: 'Acacia Wood',
  lineRange: 'Line Range',
  customisedProducts: 'Customised Products',
};

export default function Collection() {
  const { actor } = useActor();
  const search = useSearch({ from: '/collection' }) as { category?: string };
  const navigate = useNavigate();
  const selectedCategory = search.category || 'all';

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(() => {
    if (!actor) return;
    setLoading(true);
    setError(null);
    setAllProducts([]);
    setOffset(0);
    setTotal(0);
    actor.listProducts(0n, BigInt(PAGE_SIZE))
      .then(result => {
        setAllProducts(result.products);
        setOffset(result.products.length);
        setTotal(Number(result.total));
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      })
      .finally(() => setLoading(false));
  }, [actor]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleLoadMore = async () => {
    if (!actor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const result = await actor.listProducts(BigInt(offset), BigInt(PAGE_SIZE));
      setAllProducts(prev => [...prev, ...result.products]);
      setOffset(prev => prev + result.products.length);
      setTotal(Number(result.total));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load more products');
    } finally {
      setLoadingMore(false);
    }
  };

  // Client-side filtering by category
  const filteredProducts = selectedCategory === 'all'
    ? allProducts.filter(p => p.isActive)
    : allProducts.filter(p => p.isActive && p.woodType === selectedCategory);

  const hasMore = allProducts.length < total;

  const handleCategoryChange = (cat: string) => {
    navigate({ to: '/collection', search: cat === 'all' ? {} : { category: cat } });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="bg-secondary/30 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Our Collection</h1>
          <p className="text-muted-foreground text-lg">
            Handcrafted wooden furniture made with love and precision
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Filter className="h-5 w-5 text-muted-foreground self-center mr-1" />
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                selectedCategory === key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:bg-secondary/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between mb-6">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={loadInitial}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground text-lg">Loading products...</span>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <>
            {filteredProducts.length === 0 && !error ? (
              <div className="text-center py-24">
                <p className="text-muted-foreground text-lg mb-2">No products found</p>
                {selectedCategory !== 'all' && (
                  <p className="text-muted-foreground text-sm mb-4">
                    Try selecting a different category
                  </p>
                )}
                <Button variant="outline" onClick={() => handleCategoryChange('all')}>
                  View All Products
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted-foreground text-sm">
                    Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                    {selectedCategory !== 'all' && (
                      <span> in <Badge variant="outline">{CATEGORY_LABELS[selectedCategory]}</Badge></span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="min-w-[200px]"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading more...
                        </>
                      ) : (
                        `Load More (${total - allProducts.length} remaining)`
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
