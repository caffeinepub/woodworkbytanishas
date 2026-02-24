export default function About() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4">
            About Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Crafting excellence in wood since 2021
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-16 shadow-xl">
          <img
            src="/assets/generated/about-workshop.dim_1200x600.png"
            alt="WoodworkbyTanishas workshop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Story */}
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-6">
              Founded in 2021 in the historic city of Jodhpur, Rajasthan, WoodworkbyTanishas emerged from a passion 
              for creating timeless wooden furniture that blends traditional craftsmanship with contemporary design. 
              Our journey began with a simple belief: that every piece of furniture should tell a story and bring 
              warmth to the spaces it inhabits.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg mb-6">
              Nestled in the heart of Rajasthan, our workshop is where skilled artisans breathe life into raw wood, 
              transforming it into elegant pieces that stand the test of time. Each creation is a testament to our 
              commitment to quality, sustainability, and the timeless beauty of natural wood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card rounded-lg shadow-md">
              <h3 className="text-2xl font-serif font-bold text-foreground mb-3">Mango Wood</h3>
              <p className="text-muted-foreground">
                Rich, warm tones with distinctive grain patterns that add character to every piece.
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-md">
              <h3 className="text-2xl font-serif font-bold text-foreground mb-3">Acacia Wood</h3>
              <p className="text-muted-foreground">
                Durable and resilient, perfect for furniture that combines beauty with longevity.
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-md">
              <h3 className="text-2xl font-serif font-bold text-foreground mb-3">Custom Designs</h3>
              <p className="text-muted-foreground">
                Bespoke creations tailored to your unique vision and space requirements.
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Our Commitment</h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-6">
              At WoodworkbyTanishas, we believe in sustainable practices and ethical sourcing. Every piece of wood 
              we use is carefully selected, ensuring that our craft contributes to a better tomorrow. Our artisans 
              bring decades of experience, combining traditional techniques with modern design sensibilities to 
              create furniture that is both functional and beautiful.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Whether you're looking for a statement piece or a complete furniture collection, we work closely with 
              you to understand your needs and bring your vision to life. From concept to creation, every step is 
              guided by our dedication to excellence and your satisfaction.
            </p>
          </div>

          {/* Contact Info */}
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-serif font-bold mb-6">Get in Touch</h2>
            <div className="space-y-3 text-lg">
              <p>📍 Jodhpur, Rajasthan, India</p>
              <p>
                📧{' '}
                <a href="mailto:mahadevart60@gmail.com" className="underline hover:text-primary-foreground/80">
                  mahadevart60@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
