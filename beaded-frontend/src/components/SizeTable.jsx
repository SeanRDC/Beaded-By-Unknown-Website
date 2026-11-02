const ROWS = [
  ['Small', '14 to 15 cm', 'Snug, best for petite wrists'],
  ['Medium', '16.5 to 18 cm', 'Standard, the most popular size'],
  ['Large', '19 to 20.5 cm', 'Loose and relaxed']
];

export function SizeTable() {
  return (
    <table className="table">
      <thead>
        <tr><th scope="col">Size</th><th scope="col">Wrist</th><th scope="col">Fit</th></tr>
      </thead>
      <tbody>
        {ROWS.map(([size, wrist, feel]) => <tr key={size}><th scope="row">{size}</th><td>{wrist}</td><td>{feel}</td></tr>)}
      </tbody>
    </table>
  );
}
