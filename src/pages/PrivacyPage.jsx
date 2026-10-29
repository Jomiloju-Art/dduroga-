import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { brand } from '../data/brand.js';
import { usePageMeta } from '../lib/seo.js';
import { pageMeta } from '../data/pageMeta.js';

/**
 * /privacy — what the site collects and who handles it. Written to match
 * what the code does (api/enquiry.js, api/event.js, src/lib/track.js,
 * src/quote/QuoteContext.jsx, src/lib/recent.js): update it when those change.
 *
 * Not yet confirmed by the client: the registered company name / RC number
 * and how long enquiry emails are kept, so neither is stated.
 */
const UPDATED = '29 October 2026';

export default function PrivacyPage() {
  usePageMeta(pageMeta['/privacy']);

  return (
    <>
      <PageHero
        eyebrow="Your data"
        title="Privacy policy"
        crumb="Privacy"
        lead="What we collect when you use this website, why, and who handles it for us. In short: only what you send us, only to answer you."
      />

      <section className="section">
        <div className="container privacy">
          <p className="privacy__updated">Last updated {UPDATED}</p>

          <h2>Who we are</h2>
          <p>
            This website is run by {brand.legalName}, {brand.address}. For anything about your
            details, email <a href={brand.emailHref}>{brand.email}</a> or call{' '}
            <a href={brand.phoneHref}>{brand.phone}</a>.
          </p>

          <h2>What we collect</h2>
          <p>
            Only what you type into the <Link to="/contact">contact form</Link> or the{' '}
            <Link to="/quote">quote request</Link>: your name, company, email address, phone number,
            message, and the products and sizes on your quote list.
          </p>
          <p>
            We do not ask for or keep payment details. You do not need an account to use the site.
          </p>

          <h2>Why we use it</h2>
          <p>
            To answer your enquiry, prepare your quotation and arrange supply. We use your details only
            for that. We do not add you to a mailing list, and we never sell or share your details with
            anyone for their own marketing.
          </p>
          <p>We keep your enquiry only as long as we need it to handle it and to keep normal business records.</p>

          <h2>Who handles it for us</h2>
          <p>A few services run parts of the website for us and only process data to do that job:</p>
          <ul>
            <li><b>Vercel</b> hosts the website.</li>
            <li><b>Cloudflare Turnstile</b> checks that a form is sent by a person, not a spam robot.</li>
            <li><b>Resend</b> delivers your form to our inbox as an email.</li>
            <li><b>Upstash</b> keeps your connection’s IP address for about an hour, only to stop floods of spam.</li>
            <li><b>Microsoft 365</b> holds our email inbox, where your enquiry arrives.</li>
          </ul>

          <h2>Cookies and visitor statistics</h2>
          <p>
            We do not use advertising or tracking cookies. Visitor numbers (which pages are viewed and how
            visitors found us) are counted by Vercel Web Analytics, which works without cookies and does not
            follow you across other websites. We also count taps on our WhatsApp, phone and email links,
            catalogue downloads and product views as monthly totals, with nothing about who you are.
          </p>
          <p>
            Your quote list and “recently viewed” products are saved in your own browser so they are still
            there when you come back. They stay on your device and are only sent to us if you submit a quote
            request. Clearing your browser’s site data removes them.
          </p>

          <h2>Your rights</h2>
          <p>
            Under the Nigeria Data Protection Act 2023 you can ask us to show you the details we hold about you,
            correct them, or delete them. Email <a href={brand.emailHref}>{brand.email}</a> and we will reply.
            If you are not happy with how we handled your request, you can complain to the Nigeria Data
            Protection Commission.
          </p>

          <h2>Changes</h2>
          <p>If we change how we use your details, we will update this page and the date at the top.</p>
        </div>
      </section>
    </>
  );
}
