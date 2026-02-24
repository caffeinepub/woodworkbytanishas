import { useParams } from '@tanstack/react-router';
import { useGetProductById } from '../hooks/useQueries';
import ImageGallery from '../components/ImageGallery';
import { Loader2, MessageCircle } from 'lucide-react';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

export default function ProductDetail() {
  const { id } = useParams({ from: '/product/$id' });
  const { data: product, isLoading } = useGetProductById(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
        <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  const whatsappMessage = `Hello, I am interested in ${product.name} from WoodworkbyTanishas. Please share details.`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const woodTypeLabels: Record<string, string> = {
    mangoWood: 'Mango Wood',
    acaciaWood: 'Acacia Wood',
    lineRange: 'Line Range',
    customisedProducts: 'Customised Products',
  };

  return (
    <>
      <div className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <ImageGallery images={product.imageUrls} productName={product.name} />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
                  {product.name}
                </h1>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {woodTypeLabels[product.woodType] || product.woodType}
                  </span>
                  <span className="px-4 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <h2 className="text-xl font-semibold text-foreground mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {product.finishInfo && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Finish</h2>
                  <p className="text-muted-foreground">{product.finishInfo}</p>
                </div>
              )}

              <div className="pt-6 border-t border-border">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-[#25D366] text-white rounded-full font-semibold text-lg hover:bg-[#20BA5A] transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <MessageCircle size={24} />
                  <span>Enquire on WhatsApp</span>
                </a>
                <p className="text-sm text-muted-foreground mt-4">
                  Contact us for pricing and availability details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FloatingWhatsApp productName={product.name} />
    </>
  );
}
