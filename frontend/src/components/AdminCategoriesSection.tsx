import { useState } from 'react';
import { useGetProducts, useAddProduct } from '../hooks/useQueries';
import { Loader2, ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import type { ImageId } from '../backend';
import { WoodType } from '../backend';
import ProductForm from './ProductForm';

function imageIdToUrl(imageId: ImageId): string {
  try {
    const blob = new Blob([new Uint8Array(imageId.buffer as ArrayBuffer)], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  } catch {
    return '/assets/generated/product-dining-table.dim_800x600.png';
  }
}

const categories = [
  {
    key: WoodType.mangoWood,
    label: 'Mango Wood',
    image: '/assets/generated/category-mango-wood.dim_600x400.png',
    description: 'Warm tones and natural grain patterns',
    categoryName: 'Mango Wood',
  },
  {
    key: WoodType.acaciaWood,
    label: 'Acacia Wood',
    image: '/assets/generated/category-acacia-wood.dim_600x400.png',
    description: 'Rich, durable hardwood with unique patterns',
    categoryName: 'Acacia Wood',
  },
  {
    key: WoodType.lineRange,
    label: 'Line Range',
    image: '/assets/generated/category-line-range.dim_600x400.png',
    description: 'Clean lines and modern minimalist design',
    categoryName: 'Line Range',
  },
  {
    key: WoodType.customisedProducts,
    label: 'Customised Products',
    image: '/assets/generated/category-customised.dim_600x400.png',
    description: 'Bespoke furniture tailored to your vision',
    categoryName: 'Customised Products',
  },
];

interface CategoryDetailProps {
  woodType: WoodType;
  label: string;
  categoryName: string;
  onBack: () => void;
}

function CategoryDetail({ woodType, label, categoryName, onBack }: CategoryDetailProps) {
  const { data: products = [], isLoading, error, refetch, isFetching } = useGetProducts(woodType);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    refetch();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-muted-foreground">
          <ArrowLeft size={16} />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">{label}</h2>
          <p className="text-sm text-muted-foreground">{products.length} products in this category</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 text-muted-foreground"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus size={16} />
            Add Product
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 flex flex-col items-center gap-4 text-center max-w-md">
          <p className="text-sm font-medium text-destructive">Could not load category products. Please try again.</p>
          <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            Retry
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border/60 rounded-xl">
          <p className="mb-4">No products in this category yet.</p>
          <Button onClick={() => setShowAddDialog(true)} variant="outline" className="gap-2">
            <Plus size={16} />
            Add First Product
          </Button>
        </div>
      )}

      {!isLoading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                {product.imageUrls[0] ? (
                  <img
                    src={imageIdToUrl(product.imageUrls[0])}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        '/assets/generated/product-dining-table.dim_800x600.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground text-sm">No image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                <p className="text-xs text-muted-foreground mt-2">{product.finishInfo}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Product to {label}</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddDialog(false)}
            initialCategory={categoryName}
            categoryLocked={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminCategoriesSection() {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[0] | null>(null);

  if (selectedCategory) {
    return (
      <CategoryDetail
        woodType={selectedCategory.key}
        label={selectedCategory.label}
        categoryName={selectedCategory.categoryName}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Categories</h2>
        <p className="text-sm text-muted-foreground mt-1">Browse and manage products by wood type</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat)}
            className="group rounded-xl overflow-hidden border border-border/50 bg-card hover:shadow-lg transition-all text-left"
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-5">
              <h3 className="font-serif font-semibold text-lg text-foreground">{cat.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
              <p className="text-xs text-primary mt-3 font-medium">Click to view products →</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
