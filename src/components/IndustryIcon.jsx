import {
  IconHelmet,
  IconCar,
  IconFlame,
  IconGem,
  IconFactory,
  IconUtensils,
  IconFlask,
  IconLeaf,
  IconTruck,
  IconDroplet,
  IconIBeam,
  IconWeldingMask,
  IconChip,
  IconGear,
  IconPlane,
  IconShield,
  IconPallet,
  IconBox,
} from './Icons.jsx';

/** One mark per entry in `industryCatalog`, keyed by slug. */
const byIndustrySlug = {
  construction: IconHelmet,
  automotive: IconCar,
  'oil-gas': IconFlame,
  mining: IconGem,
  manufacturing: IconFactory,
  'food-beverage': IconUtensils,
  pharma: IconFlask,
  agriculture: IconLeaf,
  logistics: IconTruck,
  chemicals: IconDroplet,
  'construction-civil': IconIBeam,
  welding: IconWeldingMask,
  electronics: IconChip,
  'heavy-engineering': IconGear,
  aero: IconPlane,
  defence: IconShield,
  'material-handling': IconPallet,
};

/**
 * Returns the mark for an industry slug, falling back to a neutral box so a
 * newly added industry never renders an empty tile.
 */
export default function IndustryIcon({ slug, ...rest }) {
  const Mark = byIndustrySlug[slug] || IconBox;
  return <Mark {...rest} />;
}
