import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import ProductForm from './ProductForm';
import { useActor } from '../hooks/useActor';
import type { Product } from '../backend';

const PAGE_SIZE = 10;

function imageIdToUrl(imageId: Uint8Array): string {
  try {
    const blob = new Blob([new Uint8Array(imageId.buffer as ArrayBuffer)], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  } catch {
    return '/assets/generated/product-chair.dim_800x600.png';
  }
}

export default function AdminProductsSection() {
  const { actor } = useActor();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async (reset = false) => {
    if (!actor) return;
    const currentOffset = reset ? 0 : offset;
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const result = await actor.listProducts(BigInt(currentOffset), BigInt(PAGE_SIZE));
      const fetched = result.products;
      const totalCount = Number(result.total);
      if (reset) {
        setProducts(fetched);
        setOffset(fetched.length);
      } else {
        setProducts(prev => [...prev, ...fetched]);
        setOffset(prev => prev + fetched.length);
      }
      setTotal(totalCount);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load products';
      setError(msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [actor, offset]);

  // Initial load
  useEffect(() => {
    if (actor) {
      setOffset(0);
      setProducts([]);
      setTotal(0);
      setLoading(true);
      setError(null);
      actor.listProducts(0n, BigInt(PAGE_SIZE))
        .then(result => {
          setProducts(result.products);
          setOffset(result.products.length);
          setTotal(Number(result.total));
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Failed to load products');
        })
        .finally(() => setLoading(false));
    }
  }, [actor]);

  const handleLoadMore = async () => {
    if (!actor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const result = await actor.listProducts(BigInt(offset), BigInt(PAGE_SIZE));
      setProducts(prev => [...prev, ...result.products]);
      setOffset(prev => prev + result.products.length);
      setTotal(Number(result.total));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load more products';
      setError(msg);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    if (!actor) return;
    setOffset(0);
    setProducts([]);
    setTotal(0);
    setLoading(true);
    setError(null);
    actor.listProducts(0n, BigInt(PAGE_SIZE))
      .then(result => {
        setProducts(result.products);
        setOffset(result.products.length);
        setTotal(Number(result.total));
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async () => {
    if (!actor || !deletingProduct) return;
    setIsDeleting(true);
    try {
      await actor.deleteProduct(deletingProduct.id);
      toast.success('Product deleted successfully');
      setDeletingProduct(null);
      handleRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasMore = products.length < total;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Products</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {total > 0 ? `${products.length} of ${total} products` : 'Manage your product catalog'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between">
          <p className="text-destructive text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading products...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-4">Add your first product to get started.</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => {
            const imageUrl =
              product.imageUrls && product.imageUrls.length > 0
                ? imageIdToUrl(product.imageUrls[0])
                : '/assets/generated/product-chair.dim_800x600.png';

            return (
              <div
                key={product.id}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        '/assets/generated/product-chair.dim_800x600.png';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {product.woodType}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => setDeletingProduct(product)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {!loading && hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="min-w-[160px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              `Load More (${total - products.length} remaining)`
            )}
          </Button>
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSuccess={() => {
              setShowAddDialog(false);
              handleRefresh();
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={open => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSuccess={() => {
                setEditingProduct(null);
                handleRefresh();
              }}
              onCancel={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProduct} onOpenChange={open => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
