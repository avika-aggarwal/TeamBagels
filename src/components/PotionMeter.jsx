// Hazard gauge drawn as a row of potion vials: more full vials = more dangerous.
// The liquid shifts from green to red through the --hue variable.
export default function PotionMeter({ value, max = 5 }) {
  return (
    <span className="potion-meter" role="img" aria-label={`Hazard ${value} of ${max}`} style={{ '--hue': 140 - value * 28 }}>
      {Array.from({ length: max }, (_, index) => (
        <i key={index} className={`vial ${index < value ? 'full' : ''}`} style={{ '--i': index }} />
      ))}
    </span>
  );
}
