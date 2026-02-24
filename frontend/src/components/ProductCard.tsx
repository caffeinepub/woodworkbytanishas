import { Link } from '@tanstack/react-router';
import { MessageCircle } from 'lucide-react';
import type { Product } from '../backend';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrls[0]?.getDirectURL() || '/assets/generated/product-dining-table.dim_800x600.png';
  
  const whatsappMessage = `Hello, I am interested in ${product.name} from WoodworkbyTanishas. Please share details.`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="group bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <Link to="/product/$productId" params={{ productId: product.id }} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>
      
      <div className="p-6">
        <Link to="/product/$productId" params={{ productId: product.id }}>
          <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
        
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#25D366] text-white rounded-full font-medium hover:bg-[#20BA5A] transition-all duration-200"
        >
          <MessageCircle size={18} />
          <span>Enquire on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
