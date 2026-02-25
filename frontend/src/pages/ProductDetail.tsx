import { useParams } from '@tanstack/react-router';
import { useGetProductById } from '../hooks/useQueries';
import ImageGallery from '../components/ImageGallery';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { WoodType } from '../backend';

const woodTypeLabels: Record<WoodType, string> = {
  [WoodType.mangoWood]: 'Mango Wood',
  [WoodType.acaciaWood]: 'Acacia Wood',
  [WoodType.lineRange]: 'Line Range',
  [WoodType.customisedProducts]: 'Customised Products',
};

export default function ProductDetail() {
  const { productId } = useParams({ from: '/product/$productId' });
  const { data: product, isLoading, error } = useGetProductById(productId);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-destructive font-medium text-lg mb-2">Product not found</p>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/collection" className="text-primary hover:underline font-medium">
          ← Back to Collection
        </Link>
      </div>
    );
  }

  const whatsappMessage = product.whatsappMessage
    || `Hello, I'm interested in the ${product.name}. Could you please provide more details?`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Back Link */}
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Gallery */}
          <div>
            <ImageGallery images={product.imageUrls} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {woodTypeLabels[product.woodType] || product.woodType}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                {product.name}
              </h1>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            {product.finishInfo && (
              <div className="bg-muted/50 rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-1 text-sm uppercase tracking-wide">
                  Finish & Material
                </h3>
                <p className="text-muted-foreground text-sm">{product.finishInfo}</p>
              </div>
            )}

            {/* WhatsApp CTA */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="font-serif font-semibold text-xl text-foreground mb-1">
                  Interested in this piece?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Contact us on WhatsApp for pricing, customization options, and delivery details.
                </p>
              </div>
              <a
                href={`https://wa.me/919828288383?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20b858] text-white font-semibold py-4 px-6 rounded-xl transition-colors text-lg"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enquire on WhatsApp
              </a>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Handcrafted', sub: 'In Jodhpur' },
                { label: 'Premium', sub: 'Quality Wood' },
                { label: 'Custom', sub: 'Made to Order' },
              ].map((badge) => (
                <div key={badge.label} className="text-center bg-muted/50 rounded-xl p-3">
                  <p className="font-semibold text-foreground text-sm">{badge.label}</p>
                  <p className="text-muted-foreground text-xs">{badge.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FloatingWhatsApp productName={product.name} />
    </div>
  );
}
