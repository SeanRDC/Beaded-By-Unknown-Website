export default function SizeGuide() {
  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#3E2F1C] pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-8 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>Size Guide</h1>
        <p className="text-center text-[#8B7D6B] mb-16 max-w-xl mx-auto leading-relaxed">
          For the perfect fit, measure your wrist tightly with a flexible measuring tape and add 0.5 inches for comfort. All our bracelets are strung on durable, stretchable cord.
        </p>

        <div className="bg-white border border-[#E8DFD3] rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#FAF6F1]">
              <tr className="text-xs uppercase tracking-widest text-[#8B7D6B]">
                <th className="p-6 font-medium border-b border-[#E8DFD3]">Size</th>
                <th className="p-6 font-medium border-b border-[#E8DFD3]">Wrist Measurement</th>
                <th className="p-6 font-medium border-b border-[#E8DFD3]">Fit Style</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFD3]">
              <tr>
                <td className="p-6 font-bold">Small (S)</td>
                <td className="p-6 text-[#8B7D6B]">5.5" - 6.0"</td>
                <td className="p-6 text-[#8B7D6B]">Snug fit, best for petite wrists.</td>
              </tr>
              <tr>
                <td className="p-6 font-bold">Medium (M)</td>
                <td className="p-6 text-[#8B7D6B]">6.5" - 7.0"</td>
                <td className="p-6 text-[#8B7D6B]">Standard fit, our most popular size.</td>
              </tr>
              <tr>
                <td className="p-6 font-bold">Large (L)</td>
                <td className="p-6 text-[#8B7D6B]">7.5" - 8.0"</td>
                <td className="p-6 text-[#8B7D6B]">Loose, relaxed fit.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}