import { Link } from '@tanstack/react-router';

const categories = [
  {
    name: 'Mango Wood',
    image: '/assets/generated/category-mango-wood.dim_600x400.png',
    description: 'Rich, warm tones with natural grain',
  },
  {
    name: 'Acacia Wood',
    image: '/assets/generated/category-acacia-wood.dim_600x400.png',
    description: 'Durable and distinctive character',
  },
  {
    name: 'Line Range',
    image: '/assets/generated/category-line-range.dim_600x400.png',
    description: 'Modern minimalist designs',
  },
  {
    name: 'Customised Products',
    image: '/assets/generated/category-customised.dim_600x400.png',
    description: 'Bespoke pieces tailored to you',
  },
];

export default function CategoryShowcase() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Our Collections
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our carefully curated wood collections, each with its unique character and beauty.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              to="/collection"
              search={{ category: category.name }}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-serif font-bold text-white mb-2">{category.name}</h3>
                <p className="text-white/90 text-sm">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
