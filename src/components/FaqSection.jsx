import { useEffect, useState } from 'react';
import { ChevronDownIcon, WhatsAppIcon } from './icons';
import { whatsappLink } from '../utils/contact';

// Questions and answers shown on the home page. Each answer is a list of paragraphs; **text** is shown in
// bold. Edit freely.
const FAQS = [
  { q: 'Where do you rent cars?', a: ['We currently operate only in Bengaluru. Most cars are located in and around Whitefield.'] },
  { q: 'Can I take the car outside Bengaluru?', a: ['Yes. You can take the car anywhere in India.'] },
  { q: 'How do I book a car?', a: ['Select your dates, choose a car and tap **Book Now**. You can complete the booking through WhatsApp.'] },
  { q: 'What documents do I need?', a: ['You need a valid driving licence, Aadhaar card and a selfie.'] },
  { q: 'Is there a security deposit?', a: ['No. RoamWheels has **zero security deposit**.'] },
  { q: 'Do I need to pay in advance?', a: ['Yes, a small advance may be required to confirm your booking.'] },
  { q: 'Is there a kilometre limit?', a: ['No. There is **no kilometre limit**.'] },
  { q: 'Is fuel included?', a: ['No. Fuel is paid by the customer.'] },
  { q: 'Who pays toll and FASTag charges?', a: ['Toll and FASTag charges during the trip are paid by the customer.'] },
  {
    q: 'Are pets allowed?',
    a: [
      'Absolutely. **Pets are most welcome at RoamWheels.** 🐾',
      'We know your pets are family, and no road trip feels complete without them. Bring your furry travel buddy along and enjoy the journey together.',
      'We only ask that you keep the car reasonably clean and take care of the interiors.',
    ],
  },
  {
    q: 'Can I get a car for any use-case?',
    a: [
      'RoamWheels cars are for personal and leisure use only.',
      'Commercial use, taxi services, ride sharing and heavy cargo transport are not allowed.',
    ],
  },
  {
    q: 'How is the price calculated?',
    a: [
      'Pricing depends on the car, booking duration, demand, weekends, holidays and peak seasons.',
      'Longer bookings may get discounted pricing. A convenience fee, trip protection fee and optional services such as doorstep delivery may also be added.',
    ],
  },
  {
    q: 'What is the minimum booking duration?',
    a: [
      'The minimum booking duration is usually **4 hours**.',
      'For some cars, weekends, holidays or peak seasons, the minimum duration may be higher.',
    ],
  },
  { q: 'Can I extend my booking?', a: ['Yes, subject to the car being available.'] },
  { q: 'Can I change my booking dates?', a: ['Yes, subject to availability.'] },
  {
    q: 'What happens if I return the car late?',
    a: [
      'We understand Bengaluru traffic, so you get **2 extra hours at no additional cost**.',
      'After that, additional hours will be charged as per the applicable hourly rate.',
    ],
  },
  { q: 'What is the cancellation policy?', a: ['Cancellation charges may apply depending on when the booking is cancelled.'] },
  { q: 'What if the car breaks down?', a: ['Contact us immediately and we’ll help you with the next steps.'] },
  { q: 'What should I do in case of an accident?', a: ['Contact us immediately and avoid arranging repairs on your own.'] },
  { q: 'Do you have coupons or offers?', a: ['Yes. Current offers and coupons are shown on our website.'] },
];

// "Pets are **most welcome**" -> text with the starred parts in bold.
function RichText({ text }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? (
      <strong key={i} className="font-bold text-slate-900">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

const plain = (paragraphs) => paragraphs.map((t) => t.replace(/\*\*/g, '')).join(' ');

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
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
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
          <p className="mt-3 text-sm text-slate-500">Everything about booking, pricing and your trip. Can&apos;t find your answer?</p>
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
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={!isOpen} className="flex flex-col gap-2 px-5 pb-5 text-sm leading-relaxed text-slate-600">
                  {f.a.map((t) => (
                    <p key={t}>
                      <RichText text={t} />
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
