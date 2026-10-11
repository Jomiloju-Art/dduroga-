/**
 * Promo carousel slides - our own copy. Banner images are generated into
 * /public/promo by tools/make-promo.mjs (dark brand gradient + product tile).
 */
export const promoSlides = [
  {
    id: 'head',
    title: 'Specify head protection with confidence',
    text: 'Certified hard hats and helmets for construction, utilities and heavy industry.',
    cta: 'View head protection',
    href: '/products?cat=head',
    img: '/promo/head.jpg',
    imgMobile: '/promo/head-m.jpg',
  },
  {
    id: 'hand',
    title: 'Cut-resistant gloves built for the shift',
    text: 'Match the right cut level and coating to the hazards on your site.',
    cta: 'View hand protection',
    href: '/products?cat=hand',
    img: '/promo/hand.jpg',
    imgMobile: '/promo/hand-m.jpg',
  },
  {
    id: 'feet',
    title: 'Safety footwear for every worksite',
    text: 'S1P to S3 protection with all-day comfort, with bulk pricing available.',
    cta: 'View foot protection',
    href: '/products?cat=feet',
    img: '/promo/feet.jpg',
    imgMobile: '/promo/feet-m.jpg',
  },
  {
    id: 'body',
    title: 'Kit out a whole crew from one supplier',
    text: 'Body and workwear protection, supplied with the certification your auditors ask for.',
    cta: 'View body protection',
    href: '/products?cat=body',
    img: '/promo/body.jpg',
    imgMobile: '/promo/body-m.jpg',
  },
];
