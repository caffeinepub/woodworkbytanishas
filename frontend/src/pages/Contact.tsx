import { useState } from 'react';
import { useSubmitContactForm } from '../hooks/useQueries';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Loader2, Mail, MapPin, MessageCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const { mutateAsync: submitForm, isPending } = useSubmitContactForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Submit to backend — backend returns the WhatsApp URL
      const returnedUrl = await submitForm({
        id: `contact-${Date.now()}`,
        ...formData,
        timestamp: BigInt(Date.now() * 1000000),
      });

      // Build WhatsApp URL client-side with full details (more reliable than backend URL)
      const message = `Contact Form Submission\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
      const encodedMessage = encodeURIComponent(message);
      const waUrl = returnedUrl || `https://wa.me/919828288383?text=${encodedMessage}`;

      // Open WhatsApp in new tab
      window.open(waUrl, '_blank');

      setWhatsappUrl(waUrl);
      setShowSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      toast.success('Message sent! Opening WhatsApp...');

      setTimeout(() => {
        setShowSuccess(false);
        setWhatsappUrl(null);
      }, 8000);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send message. Please try again.');
    }
  };

  const directWhatsappUrl = 'https://wa.me/919828288383?text=Hello%2C%20I%20would%20like%20to%20get%20in%20touch%20with%20WoodworkbyTanishas.';

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question or want to discuss a project? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Location</h3>
                    <p className="text-muted-foreground">Jodhpur, Rajasthan, India</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Mail className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <a
                      href="mailto:mahadevart60@gmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      mahadevart60@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MessageCircle className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">WhatsApp</h3>
                    <a
                      href={directWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      +91 9828288383
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary text-primary-foreground rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Business Hours</h3>
              <p className="text-primary-foreground/90">Monday - Saturday: 9:00 AM - 6:00 PM</p>
              <p className="text-primary-foreground/90">Sunday: Closed</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Send us a Message</h2>

            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600 dark:text-green-400 shrink-0" size={20} />
                  <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                    Message saved! WhatsApp has been opened with your details.
                  </p>
                </div>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300 hover:underline font-medium"
                  >
                    <ExternalLink size={14} />
                    Open WhatsApp again
                  </a>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" disabled={isPending} className="w-full gap-2">
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle size={18} />
                    Send Message & Open WhatsApp
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
