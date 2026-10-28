/**
 * Learning centre guides — real, factual PPE content.
 *
 * Every guide is about a standard or selection decision that our customers
 * actually face, and the figures (EN 388 A–F levels, EN ISO 20345 S-classes,
 * EN 397, EN 166 marking codes, EN ISO 20471 classes, EN 374 types) are the
 * published standard values, not marketing copy. Summaries are one screen;
 * the full body lives behind the /learning/:slug route.
 *
 * `tests` holds the test methods Mallcom lists for its products, one block per
 * standard (ids match standardTests.js). Product pages link to them as
 * /learning/<slug>#tests-<id> instead of repeating the text on every product.
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
    tests: [
      {
        id: 'en-388',
        title: "Tests conducted: EN 388",
        items: [
          { name: "Abrasion", text: "Based on the number of cycles required to abrade through the sample glove (abrasion by sandpaper under a stipulated pressure). The protection factor is then indicated on a scale from 1 to 4 depending on how many revolutions are required to make a hole in the material. The higher the number, the better the glove." },
          { name: "Blade cut", text: "Based on the number of cycles required to cut through the sample at a constant speed. The protection factor is then indicated on a scale from 1 to 5." },
          { name: "Tear", text: "Based on the amount of force required to tear the sample. The protection factor is then indicated on a scale from 1 to 4." },
          { name: "Puncture", text: "Based on the amount of force required to pierce the sample with a standardly sized point. The protection factor is then indicated on a scale from 1 to 4." },
          { name: "TDM blade cut", text: "The glove sample is placed on a conductive strip and loaded onto the TDM-100. When the metal blade touches the metal strip, the test is terminated. A straight blade is loaded into the machine. Weight is added to serve as a force. The blade moves across the fabric. The blade is replaced with a new one to ensure accuracy. The sample is cut five times, each with three different loads. The distance travelled to cause cut through at various forces is recorded. The data is used to determine the load required to cut through the sample." },
          { name: "Impact", text: "In this test, gloves are cut, opened out flat, so that the area of impact protection can be tested independently, and secured over a domed anvil. The test area is impacted with a 2.5kg flat face striker from a sufficient height to provide impact energy of 5J. The peak force – detected by a load cell or sensor mounted beneath the anvil – is recorded." },
        ],
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
    tests: [
      {
        id: 'en-iso-20345',
        title: "Tests conducted: EN ISO 20345",
        items: [
          { name: "Impact resistance", text: "Items of safety footwear are fitted with toecaps designed to give protection against impact when tested at an energy level of at least 200 J and against compression when tested at a compression load of at least 15 kN. This test is incorporating a steel striker of mass 20 kg ± 0.2 kg adapted to fall freely on vertical guides from a predetermined height to give the required impact energy of (200 ± 4) J for safety footwear or (100 ± 2) J for protective footwear." },
          { name: "Nail penetration resistance", text: "When footwear is tested in accordance with the force required to penetrate the sole unit shall be not less than 1100 N. The test includes the tests: placing the test piece on the base plate in such a way that the steel nail can penetrate it through the bottom, the nail against the sole unit at a speed of (10 ± 3) mm/min until the point has penetrated completely and measure the maximum force, carrying out the test at four different points on the sole unit (at least one in the heel region) with a minimum distance of 30 mm between any two penetration points and a minimum distance of 10 mm from the edge of the insole. For cleated soles, carry out the test between cleats. Two of the four measurements shall be made at a distance of 10 mm to 15 mm from the line represented by the feather edge of the last. Report the minimum value of the individual measurements as the test result." },
          { name: "Sole abrasion", text: "When outsoles other than those from all-rubber or all-polymeric footwear are tested in accordance with the relative volume loss shall be not greater than 250 cu.mm for materials with a density of 0.9 g/cu.cm or less, and not greater than 150 cu.mm for materials with a density greater than 0.9 g/cu.cm. The test includes the steps: Placing the sole on the drilling machine such that the wearing surface of the sole faces the hollow drill. Slowly drill into the sample to procure a cylindrical test piece with a uniform diameter of 16+/-0.02 mm throughout the thickness, avoiding any tapering while sampling preparation. The cutting edge may be wetted with water containing wetting agent (detergent) to obtain the test piece." },
          { name: "Flexing", text: "When outsoles are tested in accordance with the cut growth shall be not greater than 4mm before 30000 flexes. The test includes: marking the longitudinal axis or flexing line of the footwear and removing the perpendicular line of one 1/3rd of its (flexing line) length, bottom of the footwear with the insole removing the complete upper is used as a test piece, after removal of the upper ensures that the entire surface of the bottom of the footwear is uniform along the edges. To avoid any stresses at raised positions, slight buffing may be done to ensure complete smoothness all along the margin, marking the center of flexing line and find two adjacent cleats that are as close as possible to the center of flexing line. Mark the sole midway between these cleats, bring the Bennewart flexor at the neutral flex position and clamp the test piece in such a manner that the flexing line is parallel with the central roller. Bring the machine to maximum stretched state by hand and make an incision at the point marked with the piercing tool, measuring the initial length of the cut using vernier calipers and magnifying glass, carrying out 30,000 flexes. After completion of 30,000 flexes measure the length of the cut in the same manner. On completion of the test, the testing device should not be left at the fully flexed position. Cut growth = Final cut length (mm) - Initial cut length (mm)." },
          { name: "Upper/outsole and sole interlayer bond strength", text: "This test measures the force required to separate the upper (10 mm length range) from the outsole or to separate adjacent layers (10 mm length range) of the outsole or to cause tear failure of the upper or the sole by inserting a hot knife into the adhesive layer is measured in the tensile machine to record load/deformation graph at a jaw separation speed of (100 ± 20) mm/min." },
          { name: "Hydrolysis", text: "When polyurethane outsoles and soles with an outer layer composed of polyurethane are tested in accordance with the cut growth shall be not greater than 6 mm before 150,000 flex cycles. Cut the test piece from the sole. If the thickness is more than 3 mm, reduce the thickness to 3+/-0.2 mm. Keep the sample in a desiccator containing water and place the test piece on a perforated plate. The test pieces should not come in contact with water directly at any point in time. Close the desiccator lid and keep the desiccator in the oven at 70°C for 7 days. After 7 days, take out the test piece and condition at 23°C for 24 hours. After 24 hours, perform the ross flex test maintaining the temperature at -5°C and measuring an initial length of the cut and then performing 1500 cycles and again measuring the final cut length. Cut growth = Final cut length (mm) – Initial cut length (mm)." },
          { name: "Electrical insulation", text: "The steps include: Cleaning the surface of the sole with ethanol, wash with distilled water on dry basis whereas followed by applying conductive lacquer on wet basis and dried at room temperature without buff or abrade the surface, conditioning at 20+/2°C and 30%+/-5% RH for 7 days in the climate chamber, filling with 4 kg of steel balls. If the height of the upper is not sufficient to hold 4kg balls, place the knee boot insulating upper in the shoe to extend the height of the upper, placing the filled specimen on the copper plate. Apply a test voltage of 100V (±2) for 1 minute and record the resistance." },
          { name: "Anti-static", text: "In a dry atmosphere, the electrical resistance shall be above 100 Kohm and less than or equal to 1000 Mohm. In a wet atmosphere, the electrical resistance shall be above 100 Kohm and less than or equal to 1000 Mohm." },
        ],
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
    tests: [
      {
        id: 'is-2925',
        title: "Tests conducted: IS 2925",
        items: [
          { name: "Shock absorption", text: "The helmet shall be mounted on a wooden head form of appropriate size. The wooden striker weighing 3 kgs and having a horizontal striking face of 180 mm X 180 mm, shall be raised to a clear height of 1.5 m above the point of contact with the helmet and allowed to fall freely. A record of the force transmitted during impact shall be made." },
          { name: "Penetration resistance", text: "Mount helmet on an appropriate headform. Drop freely a plumb bob of 500 gms mass with a conical steel point having an included angle of 36 degrees and a spherical point radius of not more than 0.5 mm from a clear height of 3.0 m with the pointed end downwards on to the top of the crown of the helmet. Examine the helmet for piercing or denting, failure of any integral parts etc." },
          { name: "Flammability resistance", text: "With the helmet upside down and the burner angled at 45 degrees to the vertical, the end of the flame shall be applied to the outside of the shell at any suitable point between 50 & 100 mm from the crown for a period of 10 seconds. The plane tangential to the test point shall be horizontal. The shell shall be examined for flaming 5 seconds after removal of the flame." },
          { name: "Electrical resistance", text: "Invert the helmet and place it on a frame in a suitable container. With a solution of 6g/l of water, fill the container and the helmet to within 12mm of the junction of the brim and the dome, or if the helmet is provided with holes to a depth of 12 mm below the holes. Allow the helmet to remain in the solution for a period of 18 to 24 hours and maintain the temperature of 25 degrees to 35 degrees Centigrade during this period. Then apply an alternating voltage of 2000 V at 50Hz for 1 minute between electrodes placed in the solution inside and outside the helmet respectively. If no electrical breakdown occurs, disconnect the high voltage supply and connect a milliammeter in the circuit on each side of the electrode. Raise the test voltage slowly observing the ammeter reading, until the applied voltage is 2000V." },
          { name: "Water absorption", text: "The sample used for shock absorption is used for carrying out this test. Weigh the sample (full shell). Immerse for 24 hours in water at a temperature of 25 to 35 degrees centigrade. Remove from water, dry the surfaces by wiping them and weigh again. Report the average gain in mass as a percentage." },
          { name: "Heat resistance", text: "Place the shell in an oven maintained at a temperature of 93 degrees centigrade. The shell shall be shielded from direct radiation during the test. Remove the shell from the oven and examine for separation, distortion or softening." },
        ],
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
    tests: [
      {
        id: 'en-166',
        title: "Tests conducted: EN 166",
        items: [
          { name: "Optical tests (EN 167)", text: "The optical tests detailed in EN 167 ensure that no form of protective eyewear will unacceptably distort or restrict the wearer’s vision, and include checking for spherical, astigmatic and prismatic refractive powers. Other test methods include assessment of light diffusion and variations in luminance transmittance." },
          { name: "Non-optical tests (EN 168)", text: "Non-optical tests covered in EN 168 include a field of vision to ensure that frames do not unacceptably impede peripheral vision." },
          { name: "Physical properties", text: "Physical property tests ensure that the eyewear provides the mechanical protection claimed and remains fit for use after normal wear and tear." },
          { name: "Robustness", text: "As an absolute minimum for robustness, oculars must withstand a force of 100N (approximately 10kg) applied via a 122mm diameter steel ball, without breakage or excessive deflection. Where increased robustness is needed, the steel ball is projected to impact the defined points on the frame and oculars under high and low-temperature conditions (55ºC +/- 2ºC and -5ºC +/- 2ºC)." },
          { name: "Ignition resistance", text: "Safety eyewear is tested for resistance to ignition using a heated probe at 650ºC. A steel rod is heated to the required temperature and the heated end face is pressed onto all parts of the test sample except elastic headbands and textile edgings." },
          { name: "Corrosion resistance", text: "Corrosion resistance tests involve immersing the sample in a solution of sodium chloride (salt) at both boiling point and room temperature. The sample is then dried off and checked visually 24 hours later for any corrosion. Other tests include assessing the usability of the eye protector after exposure to ultraviolet light originating from strong sunlight or welding arcs." },
          { name: "Light transmittance", text: "A transmittance of light is an important parameter. Measurements have shown that ordinary reading glasses with no protective properties may reduce the light reaching the eye by around 10 percent and lightly tinted reading glasses can reduce light by 40 percent. Protective eyewear can similarly reduce vision in low light conditions. The measuring equipment used provides a highly controlled beam of light that is collected by a detector. The detector is calibrated for 100 percent transmittance with no ocular (the transparent glass or plastic component) in position. The ocular is then placed in front of the detector to interrupt the light beam and the reduced light collected is measured." },
        ],
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
    tests: [
      {
        id: 'en-374',
        title: "Tests conducted: EN 374",
        items: [
          { name: "Micro-organisms (EN 374-2)", text: "The standard EN 374-2 specifies a test method for the penetration resistance of gloves protecting against chemical products and/or microorganism when the gloves resist penetration, they are tested according to this part of EN374-2, and they provide an effective barrier against microbiological risks" },
          { name: "Chemicals (EN 374-3)", text: "The standard EN374-3 involves the determination of the resistance of the materials making up the gloves to permeation by non-gaseous chemical product which are potentially hazardous in case of continued contact. Emphasis is therefore placed on the fact that this does not take into account conditions which are likely to be encountered actual working conditions. It is therefore recommended to only use the test results, which have basically relative values, to compare the materials on the basis of the major categories of passage of time." },
        ],
      },
    ],
    keyFacts: [
      'Type A: ≥6 chemicals, ≥30 min breakthrough',
      'Type B: ≥3 chemicals · Type C: 1 chemical, ≥10 min',
      'Penetration (holes) ≠ permeation (diffusion) ≠ degradation',
      'No universal chemical glove — match polymer to chemical',
    ],
  },
  {
    slug: 'heat-cold-gloves-en407-en511',
    tag: 'Hand safety',
    zone: 'hand',
    date: 'Oct 2026',
    readMinutes: 4,
    title: 'Heat and cold gloves: EN 407 and EN 511',
    summary: 'What the six EN 407 heat digits and the three EN 511 cold digits on a glove mean, and how each one is tested.',
    sections: [
      {
        h: 'EN 407: thermal risks',
        p: 'EN 407 covers gloves that protect against heat and fire. The marking carries six digits, one per test: burning behaviour (flammability), contact heat, convective heat, radiant heat, small splashes of molten metal and large splashes of molten metal. Each is scored from 1 to 4, with 4 the best; an X means that test was not done.',
      },
      {
        h: 'EN 511: cold',
        p: 'EN 511 covers gloves that protect against cold. The marking carries three digits: convective cold and contact cold, each scored from 0 to 4, and water penetration, scored 0 (fail) or 1 (pass). An X means the test was not done.',
      },
      {
        h: 'Reading the marking',
        p: 'The digits sit under the pictogram, in the order above. Read the digit for the hazard on your site rather than the highest number: a foundry needs the molten-metal digits, someone handling hot parts needs contact heat, and cold-store work needs contact cold.',
      },
    ],
    tests: [
      {
        id: 'en-407',
        title: "Tests conducted: EN 407",
        items: [
          { name: "Flammability", text: "The glove’s material is stretched and lit with a gas flame. The flame is held against the material for 15 seconds. After the gas flame is distinguished, the length of time is measured for how long the material either glows or burns." },
          { name: "Contact heat", text: "The glove’s material is exposed to temperatures between +100°C and +500°C. The length of time is then measured for how long it takes the material on the inside of the glove to increase by 10°C from the starting temperature (approx. 25°C). 15 seconds is the minimum accepted length of time for approval. For example: to be marked with class 2, the glove’s inside material must manage 250°C heat for 15 seconds before the material exceeds 35°C." },
          { name: "Convective heat", text: "The amount of time is measured for the heat from a gas flame (80Kw/kvm) to increase the temperature of the glove’s inside material by 24°C." },
          { name: "Radiant heat", text: "The glove’s material is stretched in front of a heat source with an effect of 20-40 kw/kvm. The average time is measured for heat penetration of 2.5 kw/kvm." },
          { name: "Small splashes of molten metal", text: "The test is based on the total number of drops of molten metal required to increase the temperature by 40°C between the inside of the glove and the skin." },
          { name: "Large splashes of molten metal", text: "Molten metal is then poured over the glove material. The total number of grams is measured by how much molten metal is required to damage the simulated skin." },
        ],
      },
      {
        id: 'en-511',
        title: "Tests conducted: EN 511",
        items: [
          { name: "Convective cold", text: "This is measured based on the transfer of cold through the glove via convection. A model hand heated to body temperature is subjected to a cold room; the resistance to the room’s climatic temperature and also the energy required by the hand to maintain a constant temperature are both measured to arrive at a final score." },
          { name: "Contact cold", text: "This measures how protective the gloves is when it put into direct contact with a cold object or source. The sample is placed between a warm plate and a cold plate before an extractor fan is used to cool both plates further, the results are then compared to a reference standard and a final level decided." },
          { name: "Water permeability", text: "These tests ensure that your hands will be completely safe from water seeping in and is simply a pass or fail - if the glove cannot withstand water permeating its fabric after 30 minutes of exposure it will fail. Receiving a Level 0 on this test does not necessarily mean these gloves do not perform highly in the other two areas and can still earn them accreditation. All gloves that achieve this standard must also pass at least level 1 of the EN 388 abrasion tests, so you can be sure your hands are in good gloves." },
        ],
      },
    ],
    keyFacts: [
      'EN 407: six digits, each 1–4 (X = not tested)',
      'Order: flammability, contact, convective, radiant, small splash, large splash',
      'EN 511: convective cold 0–4, contact cold 0–4, water 0/1',
      'Pick by the hazard on site, not the highest number',
    ],
  },
];

/** Lookup by slug. */
export const guideBySlug = (slug) => guides.find((g) => g.slug === slug);
