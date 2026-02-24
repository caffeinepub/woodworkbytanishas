import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  productName?: string;
}

export default function FloatingWhatsApp({ productName }: FloatingWhatsAppProps) {
  const message = productName
    ? `Hello, I am interested in ${productName} from WoodworkbyTanishas. Please share details.`
    : 'Hello, I would like to know more about WoodworkbyTanishas furniture.';

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20BA5A] transition-all duration-300 hover:scale-110"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}
