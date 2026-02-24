import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Upload, MessageCircle, CheckCircle } from 'lucide-react';
import { WoodType } from '../backend';

export default function Customize() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    productType: '',
    woodType: WoodType.mangoWood,
    dimensions: '',
    message: '',
  });
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReferenceImage(e.target.files[0]);
    }
  };

  const getWoodTypeLabel = (woodType: WoodType): string => {
    switch (woodType) {
      case WoodType.mangoWood:
        return 'Mango Wood';
      case WoodType.acaciaWood:
        return 'Acacia Wood';
      case WoodType.lineRange:
        return 'Line Range';
      case WoodType.customisedProducts:
        return 'Customised Products';
      default:
        return woodType;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.phone || !formData.email || !formData.productType || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    // Construct WhatsApp message
    const woodTypeLabel = getWoodTypeLabel(formData.woodType);
    const imageNote = referenceImage ? '\n\nNote: A reference image has been provided.' : '';
    
    const message = `Hello, I'm interested in a customized product.

Customer Details:
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}

Product Specifications:
Product Type: ${formData.productType}
Wood Type: ${woodTypeLabel}
Dimensions: ${formData.dimensions || 'Not specified'}

Additional Details:
${formData.message}${imageNote}`;

    // URL encode the message
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/919828288383?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    // Show success message
    setShowSuccess(true);
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      productType: '',
      woodType: WoodType.mangoWood,
      dimensions: '',
      message: '',
    });
    setReferenceImage(null);

    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4">
            Customize Your Furniture
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your vision with us, and we'll craft a bespoke piece tailored to your exact specifications.
          </p>
        </div>

        {showSuccess && (
          <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-3">
            <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
            <p className="text-green-800 dark:text-green-200 font-medium">
              Opening WhatsApp with your customization details. We'll get back to you soon!
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              <Label htmlFor="productType">Product Type *</Label>
              <Input
                id="productType"
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                placeholder="e.g., Dining Table, Bed, Cabinet"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="woodType">Wood Type *</Label>
              <Select
                value={formData.woodType}
                onValueChange={(value) => setFormData({ ...formData, woodType: value as WoodType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WoodType.mangoWood}>Mango Wood</SelectItem>
                  <SelectItem value={WoodType.acaciaWood}>Acacia Wood</SelectItem>
                  <SelectItem value={WoodType.lineRange}>Line Range</SelectItem>
                  <SelectItem value={WoodType.customisedProducts}>Customised Products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., 6ft x 3ft x 2.5ft"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              placeholder="Tell us about your requirements, preferred style, and any specific details..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceImage">Reference Image (Optional)</Label>
            <div className="flex items-center space-x-4">
              <label
                htmlFor="referenceImage"
                className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md cursor-pointer hover:bg-secondary/80 transition-colors"
              >
                <Upload size={18} />
                <span>Upload Image</span>
              </label>
              <input
                id="referenceImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {referenceImage && (
                <span className="text-sm text-muted-foreground">{referenceImage.name}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Note: The image will be kept locally. Please mention it in your WhatsApp message and share it there.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="submit" className="flex-1 flex items-center justify-center space-x-2">
              <MessageCircle size={18} />
              <span>Send via WhatsApp</span>
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              For customized products, details will be shared directly via WhatsApp: +91 9828288383
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
