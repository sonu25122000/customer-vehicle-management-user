import { useEffect, useState } from 'react';
import { ChevronDownIcon, WhatsAppIcon } from './icons';
import { whatsappLink } from '../utils/contact';

// Questions and answers shown on the home page. Edit freely — the answers describe how booking, document
// verification and trip OTPs work on this site; anything that's a business policy (deposit, fuel,
// distance) points the customer to the team rather than stating figures.
const FAQS = [
  {
    q: 'Which cities do you rent cars in?',
    a: 'Only Bengaluru (Bangalore). Our cars are parked in and around Whitefield — each car’s page shows its parking location on the map. Pick-up and drop-off are in Bengaluru — ask our team about trips outside the city.',
  },
  {
    q: 'How do I book a car?',
    a: 'Pick your pick-up and return dates, choose a car, and tap “Book Now” — WhatsApp opens with your dates and the car filled into the message. Our team confirms availability and the price, and books the trip for you. You can also call us.',
  },
  {
    q: 'What documents do I need?',
    a: 'A valid driving licence, your Aadhaar card and a selfie. Create an account, then upload them under Documents — our team reviews each one. Your profile has to be verified before you can start a trip.',
  },
  {
    q: 'How do I start and end my trip?',
    a: 'Every trip has two one-time codes: a start OTP and an end OTP. When you pick up the car, our team shares the start OTP — enter it under My Trips to start the trip. When you return the car, they share the end OTP to finish it.',
  },
  {
    q: 'Do I need to pay anything in advance?',
    a: 'An advance and a refundable security deposit may apply depending on the car and the trip length. Our team will tell you the exact amounts when they confirm your booking on WhatsApp.',
  },
  {
    q: 'Can I change or extend my booking?',
    a: 'Yes — message us on WhatsApp with your trip ID (you’ll find it under My Trips) and we’ll reschedule or extend it, subject to the car being free.',
  },
  {
    q: 'What about fuel, distance limits and tolls?',
    a: 'These depend on the car and the plan you choose, so please check with our team when you enquire. Any toll charges for your trip are shown on your trip.',
  },
  {
    q: 'Do you have coupons or offers?',
    a: 'Live offers appear on the home page and the Our Cars page. Mention the code when you book with us.',
  },
  {
    q: 'How do I rate my trip?',
    a: 'Once your trip is completed, open My Trips and tap “Rate your trip”. Your rating and review appear on the car’s page to help other customers.',
  },
];

// FAQ accordion (one answer open at a time) with FAQPage structured data, so search engines can show
// the questions directly in results.
export default function FaqSection() {
  const [open, setOpen] = useState(0);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <section id="faq" className="scroll-mt-20 bg-slate-50 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-600">FAQs</p>
          <h2 className="mt-2 text-2xl font-extrabold text-primary sm:text-3xl">
            Frequently Asked <span className="text-accent-600">Questions</span>
          </h2>
          <p className="mt-3 text-sm text-slate-500">Everything about booking, documents and your trip. Can&apos;t find your answer?</p>
          <a
            href={whatsappLink('Hi Roam Wheels! I have a question.')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary-dark"
          >
            <WhatsAppIcon className="h-4 w-4" /> Ask us on WhatsApp
          </a>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className={`rounded-2xl bg-white ring-1 transition-shadow ${isOpen ? 'shadow-md ring-accent-200' : 'ring-slate-200'}`}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-slate-900 sm:text-base"
                  >
                    {f.q}
                    <ChevronDownIcon className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-accent-600' : ''}`} />
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={!isOpen} className="px-5 pb-5 text-sm leading-relaxed text-slate-600">
                  {f.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
