import { Link } from '@tanstack/react-router';
import type { Product, ImageId } from '../backend';

interface ProductCardProps {
  product: Product;
}

function imageIdToUrl(imageId: ImageId): string {
  try {
    const blob = new Blob([new Uint8Array(imageId)], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  } catch {
    return '/assets/generated/product-dining-table.dim_800x600.png';
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrls[0]
    ? imageIdToUrl(product.imageUrls[0])
    : '/assets/generated/product-dining-table.dim_800x600.png';

  return (
    <Link
      to="/product/$productId"
      params={{ productId: product.id }}
      className="group block bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/generated/product-dining-table.dim_800x600.png';
          }}
        />
      </div>
      <div className="p-5">
        <h3 className="font-serif font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            {product.category}
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            Enquire →
          </span>
        </div>
      </div>
    </Link>
  );
}
