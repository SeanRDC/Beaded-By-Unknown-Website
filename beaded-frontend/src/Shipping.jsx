export default function Shipping() {
  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#3E2F1C] pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-12 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>Shipping & Returns</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-sm font-bold tracking-widest uppercase mb-4 text-[#8B7D6B]">Processing Time</h2>
            <p className="leading-relaxed">
              Every beaded bracelet is handcrafted to order. Please allow 2-4 business days for us to create, inspect, and package your items before they are shipped. Custom orders may require an additional 2 days of processing.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold tracking-widest uppercase mb-4 text-[#8B7D6B]">Domestic Shipping</h2>
            <ul className="space-y-4 border-l-2 border-[#E8DFD3] pl-6">
              <li>
                <strong className="block mb-1">Standard Delivery (3-5 Business Days)</strong>
                <span className="text-[#8B7D6B]">₱150 flat rate. Free on orders over ₱50.</span>
              </li>
              <li>
                <strong className="block mb-1">Express Delivery (1-2 Business Days)</strong>
                <span className="text-[#8B7D6B]">₱300 flat rate.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold tracking-widest uppercase mb-4 text-[#8B7D6B]">Returns & Exchanges</h2>
            <p className="leading-relaxed">
              We want you to love your piece. If you are not completely satisfied, we accept returns within 14 days of delivery. Items must be unworn and in their original packaging. Please note that customized items are final sale and cannot be returned or exchanged.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}