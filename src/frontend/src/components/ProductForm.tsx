import { useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import type { Product } from '../backend';
import { ExternalBlob, WoodType } from '../backend';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Product) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    id: product?.id || '',
    name: product?.name || '',
    description: product?.description || '',
    woodType: product?.woodType || WoodType.mangoWood,
    category: product?.category || '',
    finishInfo: product?.finishInfo || '',
    isActive: product?.isActive ?? true,
    imageUrls: product?.imageUrls || [],
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrls = formData.imageUrls || [];

      if (imageFiles.length > 0) {
        const newImages = await Promise.all(
          imageFiles.map(async (file, index) => {
            const bytes = new Uint8Array(await file.arrayBuffer());
            return ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
              setUploadProgress((prev) => {
                const newProgress = [...prev];
                newProgress[index] = percentage;
                return newProgress;
              });
            });
          })
        );
        imageUrls = [...imageUrls, ...newImages];
      }

      const productData: Product = {
        id: formData.id || `product-${Date.now()}`,
        name: formData.name || '',
        description: formData.description || '',
        woodType: formData.woodType as WoodType,
        category: formData.category || '',
        imageUrls,
        finishInfo: formData.finishInfo || '',
        isActive: formData.isActive ?? true,
      };

      await onSubmit(productData);
    } catch (error) {
      console.error('Error submitting product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Tables, Chairs, Beds"
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
          <Label htmlFor="finishInfo">Finish Info</Label>
          <Input
            id="finishInfo"
            value={formData.finishInfo}
            onChange={(e) => setFormData({ ...formData, finishInfo: e.target.value })}
            placeholder="e.g., Natural oil finish"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Product Images</Label>
        <div className="flex items-center space-x-4">
          <label
            htmlFor="images"
            className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md cursor-pointer hover:bg-secondary/80 transition-colors"
          >
            <Upload size={18} />
            <span>Upload Images</span>
          </label>
          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        {imageFiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {imageFiles.map((file, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90"
                >
                  <X size={16} />
                </button>
                {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">{uploadProgress[index]}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Active Product</Label>
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} />
              Saving...
            </>
          ) : (
            'Save Product'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
