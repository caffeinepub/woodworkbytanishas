import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2, Upload } from 'lucide-react';
import { useAddProduct } from '../hooks/useQueries';
import { WoodType } from '../backend';
import { ExternalBlob } from '../backend';

const MANGO_WOOD_PRODUCTS = [
  {
    id: 'mw-001',
    name: 'Sculptural Pedestal Side Table',
    description: 'A striking side table featuring a sculptural pedestal base in rich mango wood. The organic curves of the base create visual interest while providing stable support for the smooth rectangular top. Perfect for modern interiors seeking a statement piece.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p45_97.png'],
    finishInfo: 'Natural mango wood with matte black lacquer finish on base, clear protective coating on top',
  },
  {
    id: 'mw-002',
    name: 'Four-Door Storage Cabinet',
    description: 'Elegant storage solution crafted from premium mango wood with four paneled doors. Features clean lines and a sophisticated black finish that complements any decor. Ample interior storage space for organizing essentials while maintaining a sleek exterior.',
    category: 'Cabinets',
    imageUrls: ['/assets/generated/p25_54.png'],
    finishInfo: 'Matte black stain with protective lacquer finish',
  },
  {
    id: 'mw-003',
    name: 'Organic Pedestal Accent Table',
    description: 'Contemporary accent table showcasing the natural beauty of mango wood through its sculptural organic base. The flowing curves create an artistic focal point while the clean white top provides practical surface area. A perfect blend of form and function.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p45_95.png'],
    finishInfo: 'Black stained base with white lacquered top surface',
  },
  {
    id: 'mw-004',
    name: 'Cylindrical Pedestal Coffee Table',
    description: 'Modern coffee table featuring three cylindrical legs supporting a circular tray-style top. Crafted from solid mango wood with a rich dark finish that highlights the natural grain. The raised edge design adds both style and functionality.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p52_114.png'],
    finishInfo: 'Dark walnut stain with satin protective finish',
  },
  {
    id: 'mw-005',
    name: 'Classic Bedside Cabinet',
    description: 'Timeless bedside storage cabinet in mango wood featuring one drawer and one cabinet door. Traditional design with modern proportions, finished in a sophisticated black that works with any bedroom style. Solid construction ensures lasting durability.',
    category: 'Cabinets',
    imageUrls: ['/assets/generated/p21_37.png'],
    finishInfo: 'Matte black paint with smooth lacquer topcoat',
  },
  {
    id: 'mw-006',
    name: 'Industrial C-Frame Side Table',
    description: 'Space-saving C-shaped side table combining mango wood top with sleek metal frame. The cantilever design slides under sofas or beds, bringing surfaces closer. Dark wood finish contrasts beautifully with the black metal structure.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p17_26.png'],
    finishInfo: 'Dark stained mango wood top with powder-coated black metal frame',
  },
  {
    id: 'mw-007',
    name: 'Minimalist C-Frame Accent Table',
    description: 'Clean-lined C-shaped accent table featuring a white marble-look top on a black metal frame. The compact design is perfect for small spaces while the contrasting materials create visual interest. Versatile piece for living rooms or bedrooms.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p20_32.png'],
    finishInfo: 'White painted mango wood top with matte black metal frame',
  },
  {
    id: 'mw-008',
    name: 'Two-Tier Coffee Table',
    description: 'Practical coffee table with two-tier storage design in solid mango wood. The lower shelf provides additional display or storage space while maintaining an open, airy feel. Classic proportions with a contemporary black finish.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p22_41.png'],
    finishInfo: 'Matte black stain with protective clear coat',
  },
  {
    id: 'mw-009',
    name: 'Paneled Storage Cabinet',
    description: 'Sophisticated storage cabinet featuring paneled door and drawer fronts in mango wood. The traditional detailing is updated with a modern black finish. Versatile piece suitable for bedroom, living room, or entryway storage needs.',
    category: 'Cabinets',
    imageUrls: ['/assets/generated/p21_38.png'],
    finishInfo: 'Satin black finish with subtle wood grain visible',
  },
  {
    id: 'mw-010',
    name: 'Contemporary Pedestal Side Table',
    description: 'Modern side table with distinctive sculptural base and clean white top. The organic curves of the mango wood base create a striking silhouette while providing stable support. Perfect accent piece for contemporary interiors.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p45_96.png'],
    finishInfo: 'Black stained base with glossy white lacquer top',
  },
  {
    id: 'mw-011',
    name: 'Natural Wood Grain Detail',
    description: 'Close-up showcase of premium mango wood grain patterns. This detail shot highlights the rich, warm tones and distinctive grain patterns that make each piece unique. Perfect for understanding the natural beauty of our mango wood furniture.',
    category: 'Decor',
    imageUrls: ['/assets/generated/p47_102.png'],
    finishInfo: 'Natural oil finish to enhance grain visibility',
  },
  {
    id: 'mw-012',
    name: 'Round Pedestal Coffee Table',
    description: 'Elegant round coffee table with three cylindrical legs and tray-style top. Crafted from solid mango wood with a sophisticated grey-brown finish. The raised edge detail adds character while keeping items secure on the surface.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p52_115.png'],
    finishInfo: 'Grey-brown stain with matte protective finish',
  },
  {
    id: 'mw-013',
    name: 'Live Edge Bench with X-Legs',
    description: 'Stunning bench featuring natural live edge mango wood top on bold black X-shaped legs. The organic edge celebrates the tree\'s natural form while the geometric base provides modern contrast. Perfect for dining or entryway seating.',
    category: 'Benches',
    imageUrls: ['/assets/generated/p57_126.png'],
    finishInfo: 'Natural finish on top with clear protective coating, matte black painted legs',
  },
  {
    id: 'mw-014',
    name: 'Industrial C-Table Natural Wood',
    description: 'Versatile C-shaped side table with natural mango wood top and industrial black metal frame. The warm wood tones add organic warmth while the metal frame keeps the look contemporary. Slides easily under furniture for convenient use.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p19_30.png'],
    finishInfo: 'Natural mango wood with clear satin finish, powder-coated metal frame',
  },
  {
    id: 'mw-015',
    name: 'Live Edge Dining Table with X-Legs',
    description: 'Impressive dining table showcasing natural live edge mango wood top on dramatic black X-shaped legs. The substantial top displays beautiful grain patterns while the bold base makes a strong design statement. Seats 6-8 comfortably.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p56_124.png'],
    finishInfo: 'Natural finish with protective clear coat, matte black painted metal legs',
  },
  {
    id: 'mw-016',
    name: 'Modern Console Table with Angled Legs',
    description: 'Sleek console table featuring clean lines and angled black legs. The light-toned mango wood top contrasts beautifully with the dark base. Perfect for entryways or behind sofas, offering both style and functionality.',
    category: 'Consoles',
    imageUrls: ['/assets/generated/p67_150.png'],
    finishInfo: 'Light natural finish on top with matte black painted legs',
  },
  {
    id: 'mw-017',
    name: 'Panel Leg Dining Table',
    description: 'Contemporary dining table with distinctive panel-style legs in mango wood. The grey-toned finish creates a sophisticated look while the solid construction ensures durability. Generous proportions accommodate family gatherings.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p61_138.png'],
    finishInfo: 'Grey-brown stain with satin protective finish',
  },
  {
    id: 'mw-018',
    name: 'Live Edge Bench with Panel Legs',
    description: 'Rustic-modern bench combining natural live edge top with bold black panel legs. The organic edge showcases the wood\'s natural character while the geometric legs provide contemporary contrast. Versatile seating for dining or entryway.',
    category: 'Benches',
    imageUrls: ['/assets/generated/p69_154.png'],
    finishInfo: 'Natural finish with clear protective coating, matte black painted legs',
  },
  {
    id: 'mw-019',
    name: 'Two-Drawer Console Table',
    description: 'Elegant console table in light mango wood featuring two drawers with traditional detailing. The natural wood tones and classic proportions create a timeless piece perfect for entryways or hallways. Ample surface and storage space.',
    category: 'Consoles',
    imageUrls: ['/assets/generated/p23_43.png'],
    finishInfo: 'Light natural finish with clear protective coating',
  },
  {
    id: 'mw-020',
    name: 'Round Nesting Tables Detail',
    description: 'Close-up of round nesting tables showcasing the beautiful natural grain of mango wood. The warm honey tones and distinctive patterns highlight the quality of the material. Perfect for understanding the craftsmanship in our pieces.',
    category: 'Decor',
    imageUrls: ['/assets/generated/p48_105.png'],
    finishInfo: 'Natural oil finish to enhance wood character',
  },
  {
    id: 'mw-021',
    name: 'Live Edge Dining Table with X-Base',
    description: 'Substantial dining table featuring natural live edge mango wood top on bold black X-shaped base. The organic edge and rich grain patterns create a stunning focal point. Perfect for those who appreciate natural wood beauty.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p60_135.png'],
    finishInfo: 'Natural finish with protective clear coat, matte black painted base',
  },
  {
    id: 'mw-022',
    name: 'Sculptural Wood Detail',
    description: 'Artistic close-up highlighting the sculptural qualities of mango wood. The smooth curves and natural grain patterns demonstrate the material\'s versatility and beauty. Shows the attention to detail in our craftsmanship.',
    category: 'Decor',
    imageUrls: ['/assets/generated/p49_108.png'],
    finishInfo: 'Natural oil finish',
  },
  {
    id: 'mw-023',
    name: 'Round Side Table with Wire Base',
    description: 'Contemporary side table featuring dark mango wood top on sleek black wire base. The contrast between the solid wood and airy metal creates visual interest. Compact size perfect for small spaces or as accent pieces.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p11_40.png'],
    finishInfo: 'Dark walnut stain with matte finish, powder-coated wire base',
  },
  {
    id: 'mw-024',
    name: 'Industrial C-Table Reclaimed Look',
    description: 'Rustic C-shaped side table with reclaimed-look mango wood top and black metal frame. The weathered finish adds character and warmth. Perfect for industrial or farmhouse-style interiors.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p18_28.png'],
    finishInfo: 'Distressed finish with protective clear coat, matte black metal frame',
  },
  {
    id: 'mw-025',
    name: 'Star Base Dining Table',
    description: 'Dramatic dining table featuring natural mango wood top on striking black star-shaped base. The bold geometric base creates a stunning focal point while providing excellent stability. Perfect for modern dining spaces.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p72_161.png'],
    finishInfo: 'Natural finish with protective coating, matte black painted metal base',
  },
  {
    id: 'mw-026',
    name: 'Modern Dining Table with Trapezoid Legs',
    description: 'Contemporary dining table with grey-toned mango wood top and distinctive black trapezoid legs. The clean lines and modern proportions create a sophisticated look. Durable construction for everyday family use.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p62_139.png'],
    finishInfo: 'Grey-brown stain with satin finish, matte black painted legs',
  },
  {
    id: 'mw-027',
    name: 'Round Nesting Tables Set',
    description: 'Versatile set of two round nesting tables in natural mango wood with black metal legs. The tables nest together for space-saving storage or separate for flexible use. Warm wood tones add organic beauty to any room.',
    category: 'Tables',
    imageUrls: ['/assets/generated/p48_104.png'],
    finishInfo: 'Natural finish with clear protective coating, matte black metal legs',
  },
  {
    id: 'mw-028',
    name: 'X-Leg Bench Natural Wood',
    description: 'Substantial bench featuring thick natural mango wood top on bold black X-shaped legs. The generous proportions and sturdy construction make it perfect for dining seating. Natural finish showcases the wood\'s beautiful grain.',
    category: 'Benches',
    imageUrls: ['/assets/generated/p57_125.png'],
    finishInfo: 'Natural finish with protective clear coat, matte black painted legs',
  },
  {
    id: 'mw-029',
    name: 'Fluted Front Storage Cabinet',
    description: 'Unique storage cabinet featuring distinctive vertical fluted detailing on the door fronts. Crafted from natural mango wood with black legs, this piece combines traditional craftsmanship with modern design. Ample storage with artistic appeal.',
    category: 'Cabinets',
    imageUrls: ['/assets/generated/p9_10.png'],
    finishInfo: 'Natural finish with clear protective coating, matte black painted legs',
  },
  {
    id: 'mw-030',
    name: 'Organic Wood Sculpture Detail',
    description: 'Artistic detail shot showcasing the sculptural beauty of mango wood. The flowing curves and rich warm tones demonstrate the material\'s natural elegance. Represents the quality and craftsmanship in all our pieces.',
    category: 'Decor',
    imageUrls: ['/assets/generated/p55_122.png'],
    finishInfo: 'Natural oil finish to enhance grain and color',
  },
];

export default function BulkProductImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const { mutateAsync: addProduct } = useAddProduct();

  const handleBulkImport = async () => {
    setIsImporting(true);
    setImportStatus('Starting import...');

    try {
      for (let i = 0; i < MANGO_WOOD_PRODUCTS.length; i++) {
        const productData = MANGO_WOOD_PRODUCTS[i];
        setImportStatus(`Importing ${i + 1} of ${MANGO_WOOD_PRODUCTS.length}: ${productData.name}`);

        const product = {
          id: productData.id,
          name: productData.name,
          description: productData.description,
          woodType: WoodType.mangoWood,
          category: productData.category,
          imageUrls: productData.imageUrls.map((url) => ExternalBlob.fromURL(url)),
          finishInfo: productData.finishInfo,
          isActive: true,
        };

        await addProduct(product);
        
        // Small delay to avoid overwhelming the backend
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setImportStatus(`✓ Successfully imported all ${MANGO_WOOD_PRODUCTS.length} products!`);
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus(`✗ Error during import: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-serif font-bold text-foreground mb-4">Bulk Import Mango Wood Products</h3>
      <p className="text-muted-foreground mb-4">
        Import 30 pre-configured Mango Wood products with images and descriptions. This is a one-time operation.
      </p>
      
      {importStatus && (
        <div className="bg-muted rounded p-4 mb-4">
          <p className="text-sm font-mono">{importStatus}</p>
        </div>
      )}

      <Button
        onClick={handleBulkImport}
        disabled={isImporting}
        className="flex items-center space-x-2"
      >
        {isImporting ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Importing...</span>
          </>
        ) : (
          <>
            <Upload size={20} />
            <span>Import {MANGO_WOOD_PRODUCTS.length} Products</span>
          </>
        )}
      </Button>
    </div>
  );
}
