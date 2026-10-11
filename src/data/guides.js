/**
 * Learning centre guides — real, factual PPE content.
 *
 * Every guide is about a standard or selection decision that our customers
 * actually face, and the figures (EN 388 A–F levels, EN ISO 20345 S-classes,
 * EN 397, EN 166 marking codes, EN ISO 20471 classes, EN 374 types) are the
 * published standard values, not marketing copy. Summaries are one screen;
 * the full body lives behind the /learning/:slug route.
 */

export const guides = [
  {
    slug: 'cut-resistance-en388-ansi',
    tag: 'Hand safety',
    zone: 'hand',
    date: 'Jan 2026',
    readMinutes: 6,
    title: 'Cut resistance explained: EN 388 vs ANSI/ISEA 105',
    summary: 'The two rating systems behind cut-resistant gloves, what the A–F and Coup 1–5 levels actually measure, and how to pick a level for your site.',
    sections: [
      {
        h: 'What EN 388 measures',
        p: 'EN 388 is the European standard for gloves protecting against mechanical risks: abrasion, blade cut, tear and puncture, with impact added in 2016. Each glove carries a pictogram with performance levels (1–5 for abrasion, tear and puncture) alongside the cut rating.',
      },
      {
        h: 'The Coup test and why it tops out',
        p: 'The original cut test (the Coup test) drags a rotating circular blade across the sample until it cuts through, scoring 1–5. It is reliable only up to about level 3: on modern high-cut fibres such as steel or glass filament, the blade dulls before cutting, so the result is not meaningful.',
      },
      {
        h: 'The TDM / ISO 13997 test',
        p: 'For materials that dull the Coup blade, EN 388:2016 adds the ISO 13997 straight-blade test, scored A–F. This measures the force in newtons needed to cut the sample in a single pass, so it stays meaningful for the highest-performing gloves.',
      },
      {
        h: 'ANSI/ISEA 105 and the A-levels',
        p: 'The American standard ANSI/ISEA 105 (2016) also uses ISO 13997 and reports A1–A9 levels, making it broadly comparable to EN 388 A–F. A4 is roughly 1,500+ grams of cutting force, A6 about 3,000+, and A9 6,000+ grams.',
      },
      {
        h: 'How to choose a level',
        p: 'Match the level to the hazard, not the highest number on the shelf: light assembly and general handling suits A2–A3, sheet metal and glass handling A4–A6, and high-risk work such as meat processing or heavy steel handling A7–A9. Grip and abrasion resistance matter as much as cut rating — a high-cut glove with poor grip is dangerous on sheet.',
      },
    ],
    keyFacts: [
      'EN 388: Coup cut test scored 1–5, unreliable above level 3',
      'EN 388:2016 adds ISO 13997 cut levels A–F',
      'ANSI/ISEA 105 uses A1–A9 (ISO 13997)',
      'A4 ≈ 1,500 g, A6 ≈ 3,000 g, A9 ≈ 6,000 g cutting force',
    ],
  },
  {
    slug: 'safety-footwear-s1p-vs-s3',
    tag: 'Footwear',
    zone: 'feet',
    date: 'Nov 2025',
    readMinutes: 5,
    title: 'Safety shoe classes: S1P vs S3 and when each is required',
    summary: 'The EN ISO 20345 protection classes decoded — what SB, S1, S1P, S2 and S3 each add, and which class fits a dry indoor site versus a wet outdoor one.',
    sections: [
      {
        h: 'The baseline',
        p: 'EN ISO 20345 defines safety footwear with a protective toe cap tested to 200 J of impact and 15 kN of compression. SB is the baseline: a toe cap and nothing more.',
      },
      {
        h: 'S1 and S1P',
        p: 'S1 adds a closed seat (heel) area, antistatic properties and energy absorption in the heel. S1P adds a penetration-resistant midsole rated to resist a 1,100 N puncture, protecting the sole from nails and sharps underfoot.',
      },
      {
        h: 'S2 and S3',
        p: 'S2 takes S1 and adds resistance to water penetration and absorption, making it suitable for damp environments. S3 is S2 plus the penetration-resistant midsole and a cleated, studded outsole for rough or uneven terrain.',
      },
      {
        h: 'Which class for which site',
        p: 'Dry indoor sites with smooth floors suit S1 or S1P; wet, muddy or outdoor sites need S3 for the water resistance and the cleated sole; light dry indoor work can use S1. Slip resistance is a separate marking — SRA (ceramic tile), SRB (steel), or SRC (both).',
      },
    ],
    keyFacts: [
      'Toe cap: 200 J impact, 15 kN compression (all classes)',
      'S1P = S1 + penetration-resistant midsole (1,100 N)',
      'S3 = S2 + penetration-resistant midsole + cleated outsole',
      'S1P for dry indoor, S3 for wet/outdoor/rough terrain',
    ],
  },
  {
    slug: 'safety-helmets-en397-is2925',
    tag: 'Head safety',
    zone: 'head',
    date: 'Sep 2025',
    readMinutes: 5,
    title: 'Helmet standards: IS 2925, EN 397 and how to choose',
    summary: 'What the industrial helmet standards require, how IS 2925 and EN 397 line up, the optional markings to look for, and when a helmet must be retired.',
    sections: [
      {
        h: 'What the standard tests',
        p: 'EN 397 is the European standard for industrial safety helmets. It requires shock absorption, resistance to penetration, and flame resistance, plus a test that the chin strap or anchorage releases correctly under load.',
      },
      {
        h: 'IS 2925 and other regional equivalents',
        p: 'IS 2925 is the Indian (BIS) standard for industrial safety helmets and is broadly aligned with EN 397. In the US, ANSI/ISEA Z89.1 is the equivalent, with Type I (top impact) and Type II (lateral impact) classifications.',
      },
      {
        h: 'Optional markings worth knowing',
        p: 'Beyond the base test, helmets can be marked for electrical insulation (440 V AC), very low temperature (-20 °C or -30 °C), or molten metal splash (MM). These are additional and optional — a helmet without them has not been tested for those hazards.',
      },
      {
        h: 'Fit and lifespan',
        p: 'The suspension harness should be adjusted so the shell sits roughly 25–50 mm clear of the skull. A helmet that has taken an impact must be replaced even if it looks intact, and most manufacturers give a working life of about 2–5 years from the manufacture date — the date stamp is moulded into the shell.',
      },
    ],
    keyFacts: [
      'EN 397: shock absorption, penetration, flame, strap anchorage',
      'IS 2925 (India) aligns with EN 397; ANSI Z89.1 (US)',
      'Optional marks: 440 V insulation, -20/-30 °C, MM molten metal',
      'Replace after impact, or ~2–5 years from manufacture date',
    ],
  },
  {
    slug: 'eye-protection-en166',
    tag: 'Eye & face',
    zone: 'head',
    date: 'Aug 2025',
    readMinutes: 4,
    title: 'Eye protection markings: how to read EN 166',
    summary: 'The marking code on every pair of safety spectacles and goggles — optical class, impact grade, and the field-of-use numbers that tell you what it protects against.',
    sections: [
      {
        h: 'The marking format',
        p: 'EN 166 is the European standard for personal eye protection — spectacles, goggles and faceshields. Each item carries a marking that combines the optical class, the mechanical (impact) strength symbol, and one or more field-of-use codes.',
      },
      {
        h: 'Impact grade',
        p: 'The mechanical strength symbol is the letter after the optical class: F is low-energy impact (a 6 mm, 0.86 g ball at 45 m/s), B is medium-energy (120 m/s), and A is high-energy (190 m/s). Most industrial spectacles are F or B; A is for high-risk tasks.',
      },
      {
        h: 'Field-of-use codes',
        p: 'The single-digit codes describe the environment: 3 for liquids (drops or splashes), 4 for coarse dust, 5 for gas and fine dust, 8 for short-circuit electric arc, and 9 for molten metal and hot solids. Welding requires separate shade filters rated under EN 169 / EN 175 / EN 379.',
      },
      {
        h: 'Spectacles vs goggles vs faceshields',
        p: 'Sealed goggles protect against dust and splash where spectacles would let particles in around the edges. A faceshield alone does not provide impact protection to the eyes — it must be worn over spectacles unless it is itself certified as full eye protection.',
      },
    ],
    keyFacts: [
      'EN 166 impact: F = 45 m/s, B = 120 m/s, A = 190 m/s',
      'Field codes: 3 liquids, 4 dust, 5 gas, 8 arc, 9 molten metal',
      'Sealed goggles for dust/splash; spectacles are open-sided',
      'A faceshield alone does not protect the eyes from impact',
    ],
  },
  {
    slug: 'high-visibility-en-iso-20471',
    tag: 'Visibility',
    zone: 'body',
    date: 'Jul 2025',
    readMinutes: 4,
    title: 'High-visibility clothing: EN ISO 20471 classes',
    summary: 'What separates Class 1, 2 and 3 hi-vis garments, why fluorescent and retroreflective material do different jobs, and how to read the pictogram.',
    sections: [
      {
        h: 'Three classes',
        p: 'EN ISO 20471 classifies high-visibility garments into three classes, where Class 3 offers the greatest conspicuity. The class is set by the total area of background fluorescent material and the area of retroreflective banding.',
      },
      {
        h: 'Fluorescent vs retroreflective',
        p: 'Fluorescent fabric works in daylight by converting UV into visible light, so it is what makes the wearer stand out in the day. Retroreflective tape returns light toward its source, which is what makes the garment visible at night under vehicle headlamps. Both are needed for around-the-clock visibility.',
      },
      {
        h: 'Choosing a class',
        p: 'Class 1 is the minimum for lower-risk, lower-speed environments; Class 2 is common for road-edge and warehouse work; Class 3 is required where traffic speeds are higher or the worker must be seen at the greatest distance, such as motorway maintenance.',
      },
      {
        h: 'Reading the garment',
        p: 'A compliant garment carries a pictogram showing the standard number and the class. If the tape or fabric has worn, faded or is no longer reflective, the garment no longer meets the class it is labelled with and should be replaced.',
      },
    ],
    keyFacts: [
      'Class 3 offers the highest conspicuity',
      'Fluorescent = daylight, retroreflective = night/headlamps',
      'Class set by area of background + retroreflective material',
      'Worn or faded garments no longer meet their labelled class',
    ],
  },
  {
    slug: 'chemical-gloves-en374',
    tag: 'Hand safety',
    zone: 'hand',
    date: 'Jun 2025',
    readMinutes: 5,
    title: 'Chemical-resistant gloves: EN 374 types A, B and C',
    summary: 'How chemical glove protection is rated, what Type A, B and C mean, and why no single glove is "chemical resistant" to everything.',
    sections: [
      {
        h: 'What EN 374 covers',
        p: 'EN 374 is the European standard for gloves that protect against dangerous chemicals and micro-organisms. It separates products into three types by how many test chemicals they withstand and for how long.',
      },
      {
        h: 'Type A, B and C',
        p: 'Type A gloves resist at least six test chemicals with a breakthrough time of 30 minutes or more each. Type B resists at least three, and Type C resists one test chemical for at least 10 minutes. The higher the type, the broader the protection.',
      },
      {
        h: 'Three different measurements',
        p: 'Chemical gloves are judged on three things: penetration (liquid passing through pinholes or seams), permeation (chemical diffusing through the material at molecular level, measured as breakthrough time), and degradation (the material physically breaking down). A glove can pass penetration yet have a short permeation time for a given chemical.',
      },
      {
        h: 'Matching polymer to chemical',
        p: 'There is no universal chemical glove. Nitrile suits oils, greases and many solvents; neoprene handles a range of acids and bases; butyl is used for ketones and esters; PVC suits acids and bases but not solvents; and Viton/fluoroelastomer handles chlorinated and aromatic solvents. Match the polymer to the specific chemical and concentration.',
      },
    ],
    keyFacts: [
      'Type A: ≥6 chemicals, ≥30 min breakthrough',
      'Type B: ≥3 chemicals · Type C: 1 chemical, ≥10 min',
      'Penetration (holes) ≠ permeation (diffusion) ≠ degradation',
      'No universal chemical glove — match polymer to chemical',
    ],
  },
];

/** Lookup by slug. */
export const guideBySlug = (slug) => guides.find((g) => g.slug === slug);
