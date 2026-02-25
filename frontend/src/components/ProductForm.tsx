import React, { useState } from 'react';
import { Loader2, X, Upload, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAddProduct, useUpdateProduct } from '../hooks/useQueries';
import type { Product } from '../backend';
import { WoodType } from '../backend';
import { compressImage } from '../utils/imageCompression';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
  initialCategory?: string;
  categoryLocked?: boolean;
}

function generateId(): string {
  return `product_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function ProductForm({
  product,
  onSuccess,
  onCancel,
  initialCategory,
  categoryLocked,
}: ProductFormProps) {
  const isEditing = !!product;
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [category, setCategory] = useState(product?.category ?? initialCategory ?? '');
  const [woodType, setWoodType] = useState<WoodType>(product?.woodType ?? WoodType.mangoWood);
  const [finishInfo, setFinishInfo] = useState(product?.finishInfo ?? '');
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [whatsappMessage, setWhatsappMessage] = useState(product?.whatsappMessage ?? '');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Uint8Array[]>(
    product?.imageUrls ? [...product.imageUrls] : []
  );
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!category.trim()) {
      toast.error('Category is required');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Compress and convert new images to Uint8Array
      const newImageArrays: Uint8Array[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const compressed = await compressImage(file);
        newImageArrays.push(compressed);
        setUploadProgress(Math.round(((i + 1) / imageFiles.length) * 100));
      }

      const allImages = [...existingImages, ...newImageArrays];

      const productData: Product = {
        id: product?.id ?? generateId(),
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        woodType,
        finishInfo: finishInfo.trim(),
        isActive,
        imageUrls: allImages,
        whatsappMessage: whatsappMessage.trim() || undefined,
      };

      if (isEditing) {
        await updateProduct.mutateAsync({ productId: product!.id, product: productData });
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync(productData);
        toast.success('Product added successfully');
      }

      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Mango Wood Dining Table"
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the product..."
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {/* Category & Wood Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category">
            Category *
            {categoryLocked && <Lock className="inline h-3 w-3 ml-1 text-muted-foreground" />}
          </Label>
          {categoryLocked ? (
            <Input
              id="category"
              value={category}
              readOnly
              className="bg-muted cursor-not-allowed"
              disabled={isSubmitting}
            />
          ) : (
            <Input
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Tables"
              disabled={isSubmitting}
              required
            />
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Wood Type</Label>
          <Select
            value={woodType}
            onValueChange={val => setWoodType(val as WoodType)}
            disabled={isSubmitting}
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
      </div>

      {/* Finish Info */}
      <div className="space-y-1.5">
        <Label htmlFor="finishInfo">Finish Information</Label>
        <Input
          id="finishInfo"
          value={finishInfo}
          onChange={e => setFinishInfo(e.target.value)}
          placeholder="e.g. Natural oil finish, hand-rubbed"
          disabled={isSubmitting}
        />
      </div>

      {/* WhatsApp Message */}
      <div className="space-y-1.5">
        <Label htmlFor="whatsappMessage">WhatsApp Message (optional)</Label>
        <Textarea
          id="whatsappMessage"
          value={whatsappMessage}
          onChange={e => setWhatsappMessage(e.target.value)}
          placeholder="Custom message for WhatsApp enquiry..."
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
          disabled={isSubmitting}
        />
        <Label htmlFor="isActive">Active (visible to customers)</Label>
      </div>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-1.5">
          <Label>Current Images</Label>
          <div className="flex flex-wrap gap-2">
            {existingImages.map((img, i) => {
              const url = URL.createObjectURL(
                new Blob([new Uint8Array(img.buffer as ArrayBuffer)], { type: 'image/jpeg' })
              );
              return (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-border"
                >
                  <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    disabled={isSubmitting}
                    className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Images */}
      <div className="space-y-1.5">
        <Label>Add Images</Label>
        <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-border rounded-lg p-4 hover:bg-secondary/30 transition-colors">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Click to upload images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
            disabled={isSubmitting}
          />
        </label>
        {imageFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {imageFiles.map((file, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-border"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  disabled={isSubmitting}
                  className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isSubmitting && imageFiles.length > 0 && uploadProgress > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Processing images...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEditing ? 'Updating...' : 'Adding...'}
            </>
          ) : isEditing ? (
            'Update Product'
          ) : (
            'Add Product'
          )}
        </Button>
      </div>
    </form>
  );
}
