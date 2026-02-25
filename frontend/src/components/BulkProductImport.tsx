import { useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Loader2, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { WoodType, type Product } from '../backend';
import { useAddProduct } from '../hooks/useQueries';
import { toast } from 'sonner';

// Helper to fetch an asset image and convert to Uint8Array
async function fetchImageAsBytes(path: string): Promise<Uint8Array> {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to fetch ${path}`);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    return new Uint8Array(0);
  }
}

// Pre-configured products using asset images
const BULK_PRODUCTS_CONFIG = [
  { id: 'p9_10', name: 'Mango Wood Side Table', category: 'Side Tables', woodType: WoodType.mangoWood, images: ['/assets/p9_10.png', '/assets/p9_10-1.png', '/assets/p9_10-2.png'] },
  { id: 'p10_36', name: 'Mango Wood Console', category: 'Console Tables', woodType: WoodType.mangoWood, images: ['/assets/p10_36.png', '/assets/p10_36-1.png', '/assets/p10_36-2.png'] },
  { id: 'p11_40', name: 'Mango Wood Stool', category: 'Stools', woodType: WoodType.mangoWood, images: ['/assets/p11_40.png', '/assets/p11_40-1.png', '/assets/p11_40-2.png'] },
  { id: 'p13_19', name: 'Mango Wood Bench', category: 'Benches', woodType: WoodType.mangoWood, images: ['/assets/p13_19.png', '/assets/p13_19-1.png', '/assets/p13_19-2.png'] },
  { id: 'p13_48', name: 'Mango Wood Cabinet', category: 'Cabinets', woodType: WoodType.mangoWood, images: ['/assets/p13_48.png', '/assets/p13_48-1.png'] },
  { id: 'p15_22', name: 'Mango Wood Dining Chair', category: 'Chairs', woodType: WoodType.mangoWood, images: ['/assets/p15_22.png', '/assets/p15_22-1.png', '/assets/p15_22-2.png'] },
  { id: 'p17_26', name: 'Mango Wood Armchair', category: 'Chairs', woodType: WoodType.mangoWood, images: ['/assets/p17_26.png', '/assets/p17_26-1.png', '/assets/p17_26-2.png'] },
  { id: 'p18_28', name: 'Mango Wood Coffee Table', category: 'Coffee Tables', woodType: WoodType.mangoWood, images: ['/assets/p18_28.png', '/assets/p18_28-1.png', '/assets/p18_28-2.png'] },
  { id: 'p19_30', name: 'Mango Wood Bookshelf', category: 'Shelves', woodType: WoodType.mangoWood, images: ['/assets/p19_30.png', '/assets/p19_30-1.png', '/assets/p19_30-2.png'] },
  { id: 'p20_32', name: 'Mango Wood Wardrobe', category: 'Wardrobes', woodType: WoodType.mangoWood, images: ['/assets/p20_32.png', '/assets/p20_32-1.png', '/assets/p20_32-2.png'] },
  { id: 'p21_36', name: 'Acacia Wood Dining Table', category: 'Dining Tables', woodType: WoodType.acaciaWood, images: ['/assets/p21_36.png', '/assets/p21_36-1.png', '/assets/p21_36-2.png'] },
  { id: 'p21_37', name: 'Acacia Wood Side Board', category: 'Sideboards', woodType: WoodType.acaciaWood, images: ['/assets/p21_37.png', '/assets/p21_37-1.png', '/assets/p21_37-2.png'] },
  { id: 'p21_38', name: 'Acacia Wood TV Unit', category: 'TV Units', woodType: WoodType.acaciaWood, images: ['/assets/p21_38.png', '/assets/p21_38-1.png', '/assets/p21_38-2.png'] },
  { id: 'p22_41', name: 'Acacia Wood Bed Frame', category: 'Beds', woodType: WoodType.acaciaWood, images: ['/assets/p22_41.png', '/assets/p22_41-1.png', '/assets/p22_41-2.png'] },
  { id: 'p23_43', name: 'Acacia Wood Chest of Drawers', category: 'Drawers', woodType: WoodType.acaciaWood, images: ['/assets/p23_43.png', '/assets/p23_43-1.png', '/assets/p23_43-2.png'] },
  { id: 'p25_51', name: 'Line Range Dining Set', category: 'Dining Sets', woodType: WoodType.lineRange, images: ['/assets/p25_51.png', '/assets/p25_51-1.png', '/assets/p25_51-2.png'] },
  { id: 'p25_54', name: 'Line Range Coffee Table', category: 'Coffee Tables', woodType: WoodType.lineRange, images: ['/assets/p25_54.png', '/assets/p25_54-1.png', '/assets/p25_54-2.png'] },
  { id: 'p25_89', name: 'Line Range Bookcase', category: 'Shelves', woodType: WoodType.lineRange, images: ['/assets/p25_89.png', '/assets/p25_89-1.png', '/assets/p25_89-2.png'] },
  { id: 'p26_92', name: 'Line Range Accent Chair', category: 'Chairs', woodType: WoodType.lineRange, images: ['/assets/p26_92.png', '/assets/p26_92-1.png', '/assets/p26_92-2.png'] },
  { id: 'p29_101', name: 'Line Range Storage Unit', category: 'Storage', woodType: WoodType.lineRange, images: ['/assets/p29_101.png', '/assets/p29_101-1.png', '/assets/p29_101-2.png'] },
  { id: 'p30_62', name: 'Custom Mango Sofa', category: 'Sofas', woodType: WoodType.customisedProducts, images: ['/assets/p30_62.png', '/assets/p30_62-1.png', '/assets/p30_62-2.png'] },
  { id: 'p38_78', name: 'Custom Acacia Dining Table', category: 'Dining Tables', woodType: WoodType.customisedProducts, images: ['/assets/p38_78.png', '/assets/p38_78-1.png', '/assets/p38_78-2.png'] },
  { id: 'p38_79', name: 'Custom Acacia Bench', category: 'Benches', woodType: WoodType.customisedProducts, images: ['/assets/p38_79.png', '/assets/p38_79-1.png', '/assets/p38_79-2.png'] },
  { id: 'p41_87', name: 'Custom Mango Bed', category: 'Beds', woodType: WoodType.customisedProducts, images: ['/assets/p41_87.png', '/assets/p41_87-1.png', '/assets/p41_87-2.png'] },
  { id: 'p43_90', name: 'Custom Line Range Cabinet', category: 'Cabinets', woodType: WoodType.customisedProducts, images: ['/assets/p43_90.png', '/assets/p43_90-1.png', '/assets/p43_90-2.png'] },
  { id: 'p45_95', name: 'Mango Wood Dresser', category: 'Dressers', woodType: WoodType.mangoWood, images: ['/assets/p45_95.png', '/assets/p45_95-1.png', '/assets/p45_95-2.png'] },
  { id: 'p45_96', name: 'Mango Wood Nightstand', category: 'Nightstands', woodType: WoodType.mangoWood, images: ['/assets/p45_96.png', '/assets/p45_96-1.png', '/assets/p45_96-2.png'] },
  { id: 'p45_97', name: 'Mango Wood Vanity', category: 'Vanities', woodType: WoodType.mangoWood, images: ['/assets/p45_97.png', '/assets/p45_97-1.png', '/assets/p45_97-2.png'] },
  { id: 'p47_101', name: 'Acacia Wood Lounge Chair', category: 'Chairs', woodType: WoodType.acaciaWood, images: ['/assets/p47_101.png', '/assets/p47_101-1.png', '/assets/p47_101-2.png'] },
  { id: 'p47_102', name: 'Acacia Wood Ottoman', category: 'Ottomans', woodType: WoodType.acaciaWood, images: ['/assets/p47_102.png', '/assets/p47_102-1.png', '/assets/p47_102-2.png'] },
];

export default function BulkProductImport() {
  const { mutateAsync: addProduct } = useAddProduct();
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleBulkImport = async () => {
    setIsImporting(true);
    setProgress(0);
    setErrors([]);
    setCompleted(false);

    const errorList: string[] = [];
    const total = BULK_PRODUCTS_CONFIG.length;

    for (let i = 0; i < total; i++) {
      const config = BULK_PRODUCTS_CONFIG[i];
      try {
        // Fetch images as bytes
        const imageUrls = await Promise.all(
          config.images.map((imgPath) => fetchImageAsBytes(imgPath))
        );

        const product: Product = {
          id: config.id,
          name: config.name,
          description: `Premium ${config.category.toLowerCase()} crafted from ${config.woodType === WoodType.mangoWood ? 'Mango Wood' : config.woodType === WoodType.acaciaWood ? 'Acacia Wood' : config.woodType === WoodType.lineRange ? 'Line Range' : 'custom'} with expert finishing. Handcrafted in Jodhpur, Rajasthan.`,
          woodType: config.woodType,
          category: config.category,
          imageUrls: imageUrls.filter((b) => b.length > 0),
          finishInfo: 'Natural oil finish, hand-sanded',
          isActive: true,
          whatsappMessage: undefined,
        };

        await addProduct(product);
      } catch (err: any) {
        errorList.push(`${config.name}: ${err?.message || 'Unknown error'}`);
      }

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    setErrors(errorList);
    setIsImporting(false);
    setCompleted(true);

    if (errorList.length === 0) {
      toast.success(`Successfully imported ${total} products!`);
    } else {
      toast.warning(`Imported with ${errorList.length} errors`);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Package size={24} className="text-primary" />
        <div>
          <h3 className="font-serif font-semibold text-lg text-foreground">Bulk Product Import</h3>
          <p className="text-muted-foreground text-sm">
            Import {BULK_PRODUCTS_CONFIG.length} pre-configured products with images
          </p>
        </div>
      </div>

      {isImporting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Importing products...</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {completed && (
        <div className={`flex items-center gap-2 text-sm ${errors.length === 0 ? 'text-green-600' : 'text-amber-600'}`}>
          {errors.length === 0 ? (
            <>
              <CheckCircle size={16} />
              <span>All products imported successfully!</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} />
              <span>{errors.length} products failed to import</span>
            </>
          )}
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-destructive/10 rounded-lg p-3 space-y-1 max-h-32 overflow-y-auto">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-destructive">{err}</p>
          ))}
        </div>
      )}

      <Button
        onClick={handleBulkImport}
        disabled={isImporting}
        className="w-full"
        variant="outline"
      >
        {isImporting ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Importing... {progress}%
          </>
        ) : completed ? (
          'Re-import Products'
        ) : (
          `Import ${BULK_PRODUCTS_CONFIG.length} Products`
        )}
      </Button>
    </div>
  );
}
