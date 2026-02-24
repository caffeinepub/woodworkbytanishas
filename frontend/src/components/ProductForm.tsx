import { useState, useEffect } from 'react';
import { Loader2, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import type { Product } from '../backend';
import { ExternalBlob, WoodType } from '../backend';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Product) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { actor, isFetching: actorFetching } = useActor();
  
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
  const [error, setError] = useState<string | null>(null);
  const [authWarning, setAuthWarning] = useState<string | null>(null);

  const isActorReady = !!actor && !actorFetching;

  // Check authentication and authorization status
  useEffect(() => {
    console.log('🔍 [ProductForm] Auth check:', {
      hasIdentity: !!identity,
      principal: identity?.getPrincipal().toString(),
      isAdmin,
      adminLoading,
      isActorReady,
    });

    if (!identity) {
      setAuthWarning('⚠️ You are not logged in. Please log in to add products.');
    } else if (actorFetching) {
      setAuthWarning('⚠️ Initializing admin access... Please wait.');
    } else if (!adminLoading && !isAdmin) {
      setAuthWarning(`⚠️ You do not have admin privileges. Only admins can add products.`);
    } else {
      setAuthWarning(null);
    }
  }, [identity, isAdmin, adminLoading, actorFetching, isActorReady]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
      setError(null);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    console.log('🔍 [ProductForm] Form submission started');
    console.log('🔍 [ProductForm] Authentication state:', {
      hasIdentity: !!identity,
      principal: identity?.getPrincipal().toString(),
      isAdmin,
      isActorReady,
    });

    // Pre-submission validation
    if (!identity) {
      const errorMsg = 'You must be logged in to add products. Please log in and try again.';
      console.error('❌ [ProductForm] Not authenticated');
      setError(errorMsg);
      return;
    }

    if (!isActorReady) {
      const errorMsg = 'Admin access is still being initialized. Please wait a moment and try again.';
      console.error('❌ [ProductForm] Actor not ready');
      setError(errorMsg);
      return;
    }

    if (!isAdmin) {
      const errorMsg = `You do not have admin privileges. Only administrators can add products. Please log out and log back in, or contact the administrator.`;
      console.error('❌ [ProductForm] Not authorized - admin status:', isAdmin);
      setError(errorMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrls = formData.imageUrls || [];

      if (imageFiles.length > 0) {
        console.log('🔍 [ProductForm] Uploading images:', imageFiles.length);
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
        console.log('✅ [ProductForm] Images uploaded successfully');
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

      console.log('🔍 [ProductForm] Submitting product:', {
        id: productData.id,
        name: productData.name,
        category: productData.category,
        imageCount: productData.imageUrls.length,
      });

      await onSubmit(productData);
      console.log('✅ [ProductForm] Product submitted successfully');
    } catch (error: any) {
      console.error('❌ [ProductForm] Submission error:', error);
      console.error('❌ [ProductForm] Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      });

      // Display user-friendly error message
      let errorMessage = 'Failed to save product. Please try again.';
      
      if (error?.message) {
        if (error.message.includes('not authenticated') || error.message.includes('log in')) {
          errorMessage = '🔐 Authentication Error: Please log out and log in again, then try adding the product.';
        } else if (error.message.includes('admin') || error.message.includes('Unauthorized') || error.message.includes('Authorization')) {
          errorMessage = `🚫 Authorization Error: ${error.message}\n\nTry these steps:\n1. Log out completely\n2. Log back in\n3. Wait for admin access to initialize\n4. Try adding the product again\n\nIf the issue persists, contact the administrator.`;
        } else if (error.message.includes('Actor not available')) {
          errorMessage = '🔌 Connection Error: Please refresh the page and try again.';
        } else if (error.message.includes('not initialized')) {
          errorMessage = '⏳ Initialization Error: Admin access is still being set up. Please wait a few seconds and try again.';
        } else {
          errorMessage = `❌ Error: ${error.message}`;
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || !identity || !isActorReady || !isAdmin;
  const canSubmit = identity && isActorReady && isAdmin && !isSubmitting;

  // Wood type options with proper labels
  const woodTypeOptions = [
    { value: WoodType.mangoWood, label: 'Mango Wood' },
    { value: WoodType.acaciaWood, label: 'Acacia Wood' },
    { value: WoodType.lineRange, label: 'Line Range' },
    { value: WoodType.customisedProducts, label: 'Customized Products' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg shadow-md">
      {/* Authentication Status */}
      {identity && isActorReady && isAdmin && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">Admin Access Verified</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            You have full admin privileges. You can add, edit, and manage products.
          </AlertDescription>
        </Alert>
      )}

      {/* Authentication Warning */}
      {authWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>{authWarning}</AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter product name"
            required
            disabled={isFormDisabled}
          />
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter product description"
            rows={4}
            required
            disabled={isFormDisabled}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="woodType">Wood Type *</Label>
            <Select
              value={formData.woodType}
              onValueChange={(value) => setFormData({ ...formData, woodType: value as WoodType })}
              disabled={isFormDisabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select wood type" />
              </SelectTrigger>
              <SelectContent>
                {woodTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Tables, Chairs, Cabinets"
              required
              disabled={isFormDisabled}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="finishInfo">Finish Information</Label>
          <Input
            id="finishInfo"
            value={formData.finishInfo}
            onChange={(e) => setFormData({ ...formData, finishInfo: e.target.value })}
            placeholder="e.g., Natural oil finish, Matte lacquer"
            disabled={isFormDisabled}
          />
        </div>

        <div>
          <Label htmlFor="images">Product Images</Label>
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            disabled={isFormDisabled}
          />
          {imageFiles.length > 0 && (
            <div className="mt-2 space-y-2">
              {imageFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span className="text-sm truncate">{file.name}</span>
                  {uploadProgress[index] !== undefined && (
                    <span className="text-sm text-muted-foreground">{uploadProgress[index]}%</span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                    disabled={isFormDisabled}
                  >
                    <X size={16} />
                  </Button>
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
            disabled={isFormDisabled}
          />
          <Label htmlFor="isActive">Active (visible to customers)</Label>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={!canSubmit} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              {product ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>{product ? 'Update Product' : 'Add Product'}</>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
