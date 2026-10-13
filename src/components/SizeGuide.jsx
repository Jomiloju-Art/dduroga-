import { useRef, useState } from 'react';
import { useScrollLock } from '../lib/scrollLock.js';
import { Link } from 'react-router-dom';

/**
 * Size guide for gloves, footwear and garments, opened from the product page's
 * size picker. A native <dialog>, so focus, Escape and the backdrop come for
 * free. `kind` comes from data/sizes.js.
 *
 * Gloves: the hand-size table of EN ISO 21420 (formerly EN 420), which every
 * EN-certified glove is sized to. Footwear: EU sizes, as offered, with the
 * usual UK equivalent. Garments: typical chest and waist measurements. The
 * footwear and garment tables are labelled approximate because fit differs
 * between ranges.
 */
const GLOVES = [
  [6, 152, 160], [7, 178, 171], [8, 203, 182], [9, 229, 192], [10, 254, 204], [11, 279, 215],
];
const SHOES = [
  ['38', '5'], ['39', '6'], ['40', '6.5'], ['41', '7'], ['42', '8'], ['43', '9'],
  ['44', '9.5'], ['45', '10.5'], ['46', '11'], ['47', '12'], ['48', '13'],
];
const GARMENTS = [
  ['S', '88–96', '76–84'], ['M', '96–104', '84–92'], ['L', '104–112', '92–100'],
  ['XL', '112–120', '100–108'], ['XXL', '120–128', '108–116'], ['XXXL', '128–136', '116–124'],
];
const TITLES = { glove: 'Glove size guide', footwear: 'Footwear size guide', garment: 'Garment size guide' };

export default function SizeGuide({ kind }) {
  const ref = useRef(null);
  // A modal <dialog> blocks clicks behind it but not scrolling, so lock it.
  const [isOpen, setIsOpen] = useState(false);
  useScrollLock(isOpen);
  if (!TITLES[kind]) return null;
  const close = () => ref.current?.close();

  return (
    <>
      <button type="button" className="size-guide__open" onClick={() => { ref.current?.showModal(); setIsOpen(true); }}>
        Size guide
      </button>
      <dialog ref={ref} className="size-guide" aria-labelledby="size-guide-title" onClose={() => setIsOpen(false)} onClick={(e) => { if (e.target === ref.current) close(); }}>
        <div className="size-guide__inner">
          <header className="size-guide__head">
            <h2 id="size-guide-title">{TITLES[kind]}</h2>
            <button type="button" className="size-guide__close" onClick={close} aria-label="Close size guide">×</button>
          </header>

          {kind === 'glove' && (
            <>
              <p>Measure your working hand. Circumference: round the palm at the knuckles, thumb excluded. Length: from the wrist crease to the tip of the middle finger.</p>
              <table>
                <thead><tr><th scope="col">Size</th><th scope="col">Hand circumference</th><th scope="col">Hand length</th></tr></thead>
                <tbody>
                  {GLOVES.map(([size, circ, len]) => (
                    <tr key={size}><th scope="row">{size}</th><td>{circ} mm</td><td>{len} mm</td></tr>
                  ))}
                </tbody>
              </table>
              <p className="size-guide__note">Hand sizes as defined by EN ISO 21420, the general standard for protective gloves. Between sizes, choose the larger for gloves worn over liners.</p>
            </>
          )}

          {kind === 'footwear' && (
            <>
              <p>Our footwear is offered in EU sizes 38 to 48. Measure your foot standing, heel against a wall, and allow about 1 cm in front of the longest toe.</p>
              <table>
                <thead><tr><th scope="col">EU</th><th scope="col">UK (approx.)</th></tr></thead>
                <tbody>
                  {SHOES.map(([eu, uk]) => (
                    <tr key={eu}><th scope="row">{eu}</th><td>{uk}</td></tr>
                  ))}
                </tbody>
              </table>
              <p className="size-guide__note">Approximate conversion: fit varies between ranges. For a bulk order, <Link to="/contact" onClick={close}>ask us</Link> about fitting samples.</p>
            </>
          )}

          {kind === 'garment' && (
            <>
              <p>Measure over light clothing. Chest: round the fullest part, under the arms. Waist: round your natural waistline.</p>
              <table>
                <thead><tr><th scope="col">Size</th><th scope="col">Chest</th><th scope="col">Waist</th></tr></thead>
                <tbody>
                  {GARMENTS.map(([sz, chest, waist]) => (
                    <tr key={sz}><th scope="row">{sz}</th><td>{chest} cm</td><td>{waist} cm</td></tr>
                  ))}
                </tbody>
              </table>
              <p className="size-guide__note">Typical body measurements; cut differs between garments. Between sizes, choose the larger for layering. For a bulk order, <Link to="/contact" onClick={close}>ask us</Link> about fitting samples.</p>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
