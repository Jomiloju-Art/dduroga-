/**
 * Nigeria with Lagos as the stock location and delivery routes out to the
 * major cities: a picture of what the site already says, "stocked in Lagos,
 * delivered nationwide". The cities are there to show the country's spread,
 * not a list of past deliveries; no counts or figures are claimed. When the
 * client sends the states and cities they deliver to, put those in CITIES.
 *
 * Outline: Natural Earth 1:50m admin-0 (public domain), projected to a
 * 400-unit-wide box and simplified (scripts are not kept; the path is static).
 */
import Reveal from './Reveal.jsx';

const OUTLINE = 'M154.6 320.7L151.3 321.8L149.2 321.5L152.1 317.0L155.5 318.4L154.6 320.7ZM365.8 5.7L381.1 26.9L385.6 50.5L392.9 51.9L396.4 53.4L399.8 58.4L399.0 69.3L397.8 72.7L398.3 79.4L397.7 80.8L395.6 82.3L385.8 88.4L378.4 90.3L375.4 92.7L368.9 101.8L363.4 110.9L359.4 125.6L354.5 130.1L352.2 146.2L343.1 150.8L341.3 155.0L339.0 169.1L336.5 173.9L331.5 178.0L325.5 179.0L319.8 189.6L317.2 201.2L312.8 208.5L312.5 213.1L304.2 223.9L307.4 229.2L297.9 236.9L297.0 243.4L292.0 249.0L286.4 251.8L283.6 252.2L282.1 251.5L278.8 242.0L269.7 233.5L265.3 231.0L263.6 231.9L262.4 235.5L261.2 236.8L258.8 237.3L251.9 236.8L249.8 233.3L240.8 239.8L237.6 241.3L233.6 249.0L224.0 256.2L213.5 266.8L209.3 274.5L204.8 294.3L196.6 309.3L195.3 310.3L192.5 309.6L191.2 307.3L189.5 306.9L186.5 303.6L185.8 304.1L189.0 312.7L187.8 316.0L166.1 317.1L163.5 315.9L162.3 312.7L161.6 314.7L159.9 316.1L154.0 316.3L149.3 311.7L147.1 310.6L150.0 314.0L149.7 317.5L145.0 321.4L141.9 321.7L140.1 319.9L138.6 313.0L137.4 310.3L136.7 310.3L137.6 319.0L139.8 322.2L132.2 323.4L130.4 318.8L129.6 323.3L119.8 324.4L120.1 320.3L118.2 321.8L117.9 325.0L116.8 325.5L113.6 325.1L110.0 323.4L104.3 319.4L97.2 313.0L90.4 296.6L92.7 296.7L93.5 295.8L90.5 295.1L89.7 292.2L89.8 289.5L94.3 288.1L95.9 284.9L90.4 287.4L85.3 284.6L84.2 282.9L84.7 281.6L90.7 281.5L92.8 280.2L89.2 279.8L88.4 279.0L88.5 277.0L86.8 279.2L83.3 280.5L81.3 279.2L80.6 275.0L78.9 273.9L72.9 266.2L65.2 259.7L58.5 255.2L48.2 253.1L26.8 253.2L25.6 252.6L35.7 247.3L34.5 246.8L24.9 249.3L21.8 253.6L0.7 254.5L1.7 246.9L3.0 242.9L1.2 233.8L2.4 230.8L2.2 219.7L3.3 217.0L1.1 212.2L0.7 205.1L0.0 203.5L1.6 172.7L3.0 163.7L12.0 162.5L14.2 158.9L15.5 154.4L15.1 150.0L21.6 142.7L21.4 138.9L22.4 137.7L26.5 136.4L29.2 134.5L30.7 131.2L32.2 125.9L29.8 122.3L30.8 119.5L33.3 116.9L35.9 117.4L36.8 116.6L38.3 109.2L35.9 105.3L34.5 94.8L26.9 84.0L26.9 80.5L29.1 76.0L32.8 71.6L31.2 69.4L31.0 67.4L32.0 64.5L32.2 45.6L42.3 37.2L45.3 31.8L46.9 27.7L49.0 14.1L52.1 12.6L58.1 7.6L66.3 4.7L71.6 3.8L80.9 4.4L85.6 3.9L89.6 1.2L94.0 0.0L117.2 7.1L121.1 7.3L130.8 15.7L138.0 26.0L142.4 29.3L146.4 29.6L150.3 26.7L156.5 26.0L170.9 18.1L172.3 18.0L181.2 19.7L193.3 27.6L203.1 32.7L218.3 35.7L232.1 36.0L242.6 25.0L246.5 22.6L251.2 20.4L260.9 18.4L277.1 17.0L292.3 17.6L301.7 19.5L311.7 23.1L315.9 26.5L322.7 27.1L327.5 26.4L329.1 23.0L333.9 18.5L341.2 14.4L347.1 11.5L352.0 10.2L356.3 6.9L359.8 5.8L365.8 5.7Z';

/** [x, y] in the outline's 400 x 326 box. */
const LAGOS = [23.2, 249.3];
const CITIES = [
  { name: 'Abuja', at: [157.9, 162.7], label: true },
  { name: 'Kano', at: [197.8, 63.5], label: true },
  { name: 'Port Harcourt', at: [146.2, 307.2], label: true },
  { name: 'Ibadan', at: [42.2, 220.3] },
  { name: 'Benin City', at: [97.7, 255.7] },
  { name: 'Warri', at: [102.6, 283.5] },
  { name: 'Enugu', at: [162.8, 251.5] },
  { name: 'Kaduna', at: [158.5, 114.1] },
  { name: 'Jos', at: [206.8, 134.9] },
  { name: 'Sokoto', at: [85.3, 29.4] },
  { name: 'Maiduguri', at: [350.6, 69.3] },
];

/** A gentle arc from Lagos to a city. */
const arc = ([x2, y2]) => {
  const [x1, y1] = LAGOS;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.18;
  return `M${x1} ${y1}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2} ${y2}`;
};

export default function NigeriaMap({ className = '' }) {
  return (
    // Reveal adds .reveal-visible on scroll-in, which starts the routes drawing.
    <Reveal as="figure" className={`ng-map ${className}`.trim()}>
      <svg viewBox="-12 -14 430 352" role="img" aria-labelledby="ng-map-title">
        <title id="ng-map-title">Map of Nigeria: stock held in Lagos, delivered nationwide</title>
        <path className="ng-map__land" d={OUTLINE} />
        {CITIES.map((c, i) => (
          <path key={c.name} className="ng-map__route" d={arc(c.at)} style={{ '--i': i }} pathLength="1" />
        ))}
        {CITIES.map((c) => (
          <g key={c.name} className="ng-map__city">
            <circle cx={c.at[0]} cy={c.at[1]} r="3.2" />
            {c.label && <text x={c.at[0] + 7} y={c.at[1] + 4}>{c.name}</text>}
          </g>
        ))}
        <g className="ng-map__hub">
          <circle className="ng-map__pulse" cx={LAGOS[0]} cy={LAGOS[1]} r="7" />
          <circle cx={LAGOS[0]} cy={LAGOS[1]} r="6" />
          <text x={LAGOS[0] - 14} y={LAGOS[1] + 26}>Lagos · stock</text>
        </g>
      </svg>
      <figcaption>Stocked in Lagos, delivered nationwide.</figcaption>
    </Reveal>
  );
}
