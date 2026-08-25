import type { Award, Client, Faq, FormField, Img, Metric, Rich, Service, Step, Testimonial } from './types'

const img = (src: string, alt: string, width: number, height: number): Img => ({ src, alt, width, height })

export const home = {
  hero: {
    name: ['EliaN', 'Kent'] as const,
    intro: [
      { text: 'I create digital experiences that feel', muted: true },
      { text: ' effortless to use and powerful in impact—FRAMER sites' },
      { text: ' that help modern brands grow', muted: true },
      { text: ' with clarity and confidence' },
    ] as Rich,
    badge: 'Building the future of email at Resend.',
    image: img('/images/hero.png', 'Elian Kent', 2400, 1412),
  },

  bio: [
    { label: 'Location', value: 'London, UK' },
    { label: 'Field', value: 'Design & Development' },
    { label: 'Approach', value: 'Less but Better' },
    { label: 'Clients', value: 'Startups & Creative Brands' },
  ],

  about: {
    tag: 'About',
    paragraphs: [
      'I’m a FRAMER designer from London, working with brands and founders to create websites that feel clear, confident, and easy to use. I enjoy taking ideas that feel messy or complicated and turning them into something simple and structured.',
      'The process so everything feels aligned and intentional. My goal is always the same: to create work that feels good, works well, and lasts.',
    ],
    image1: img('/images/about-1.png', 'Elian Kent', 1800, 2400),
    caption: [
      { text: 'I build websites that feel' },
      { text: ' as good as they look. Clean, intentional,', muted: true },
      { text: ' and made to leave an impression.' },
    ] as Rich,
    image2: img('/images/about-2.png', 'Elian Kent', 2400, 1600),
    resultTag: 'Driven Result',
    resultHeading: [
      { text: 'The work doesn’t just look good — it performs.', muted: true },
      { text: ' Here’s the impact behind the design.' },
    ] as Rich,
  },

  metrics: [
    { end: 62, suffix: '+', label: 'Projects', text: 'Websites designed & built for startups, agencies, and brands worldwide.', dots: 1 },
    { end: 3, suffix: '+', label: 'Years Experience', text: 'Refining process, clarity, and performance-driven design.', dots: 2 },
    { end: 98, suffix: '%', label: 'Client Satisfaction', text: 'Long-term relationships, strong communication, and clear delivery.', dots: 3 },
    { end: 5, suffix: '+', label: 'Avg Rating', text: 'Trusted by founders, creatives & teams across different industries.', dots: 4 },
  ] as Metric[],

  reel: { words: ['Show', 'Case'] as const, video: '/videos/showcase.mp4' },

  works: {
    tag: 'Selected works(05)',
    heading: [{ text: 'A collection', muted: true }, { br: true }, { text: 'of ', muted: true }, { text: 'refined digital experiences' }] as Rich,
    text: [
      { text: 'Every project here was shaped with intention —', muted: true },
      { text: ' from layout and typography to interaction and tone.' },
    ] as Rich,
    outro: [
      { text: 'These selected projects reflect ', muted: true },
      { text: 'my approach to clarity, usability and design.' },
      { text: ' You can explore additional case studies and ', muted: true },
      { text: 'work examples.' },
    ] as Rich,
    cta: 'Explore all works',
  },

  services: {
    tag: 'Services(04)',
    heading: [{ text: 'Design', muted: true }, { br: true }, { text: 'that speaks for you' }] as Rich,
    text: 'I help brands and startups create digital experiences that feel clear, modern, and effortless to use.',
    images: [img('/images/services-1.png', 'Aesthetic Pc setup', 1808, 2400), img('/images/services-2.png', 'Motion blur flowers', 2400, 1200)],
    rows: [
      {
        title: 'Brand Identity & Visual Systems',
        text: 'I shape the core visuals of a brand, from logotypes and typography to palettes and systems — ensuring the brand feels memorable, and unmistakably.',
        tags: ['Category', 'Lifestyle', 'Creative Studios', 'Fashion'],
        image: img('/images/services/brand-identity.webp', 'Brand Identity & Visual Systems', 1504, 1128),
      },
      {
        title: 'Website Design & Development',
        text: 'I design and develop responsive, high-performing websites focused on clarity, usability, and seamless interaction. Built to look refined and work beautifully across all devices.',
        tags: ['Figma', 'Framer', 'React', 'Nextjs', 'Node.js', 'HTML', 'Tailwind', 'SCSS'],
        image: img('/images/services/web-design.webp', 'Website Design & Development', 1504, 1128),
      },
      {
        title: 'Creative Direction & Content Aesthetic',
        text: 'I guide visual storytelling through photography, video mood, and brand expression — ensuring every piece of content feels consistent & intentional',
        tags: ['Hotels & Resorts', 'Product Brands', 'Editorial', 'Travel'],
        image: img('/images/services/creative-direction.png', 'Creative Direction & Content Aesthetic', 640, 448),
      },
      {
        title: 'UX/UI for Digital Products',
        text: 'I design interfaces that feel intuitive and visually clear — balancing aesthetics with usability to create experiences that are smooth, functional, and scalable.',
        tags: ['Startups', 'Apps', 'Platforms', 'Dashboards'],
        image: img('/images/services/ux-ui.webp', 'UX/UI for Digital Products', 1504, 1128),
      },
    ] as Service[],
  },

  testimonials: {
    tag: 'Testimonials(04)',
    heading: [{ text: 'Words That', muted: true }, { br: true }, { text: 'Carry Weight' }] as Rich,
    prev: 'Prev',
    next: 'Next',
    items: [
      {
        quote: '"Elian understood the direction instantly. The final result felt refined, balanced, and aligned with exactly how we wanted to present ourselves."',
        name: 'Olivia Bennett',
        role: 'Director, Aestha Studio',
        avatar: img('/images/testimonials/team-1.png', 'Olivia Bennett', 100, 83),
      },
      {
        quote: '“There’s a clarity in Aiden’s work that’s hard to find. The site feels modern and intentional, and it performs just as well as it looks.”',
        name: 'Marcus Lee',
        role: 'Founder, Nova Labs',
        avatar: img('/images/testimonials/team-2.png', 'Marcus Lee', 100, 83),
      },
      {
        quote: '“Aiden transformed our brand presence. The visual language, structure, and storytelling now feel cohesive and elevated — it finally feels like us.”',
        name: 'Emma Clarke',
        role: 'Marketing Lead, Solis Agency',
        avatar: img('/images/testimonials/team-3.png', 'Emma Clarke', 100, 83),
      },
      {
        quote: '“Aiden brings calm, precision, and direction to the process. The collaboration felt seamless, and the result speaks for itself — polished and purposeful.”',
        name: 'Daniel Ruiz',
        role: 'Product Manager, Orbit Systems',
        avatar: img('/images/testimonials/team-4.png', 'Daniel Ruiz', 100, 83),
      },
    ] as Testimonial[],
  },

  clients: {
    tag: 'Clients(08)',
    heading: [{ text: 'Brands', muted: true }, { br: true }, { text: 'I’ve Worked With' }] as Rich,
    text: [
      { text: 'I collaborate with ', muted: true },
      { text: 'companies who care about thoughtful digital presence' },
      { text: '. Each project is shaped through ', muted: true },
      { text: 'understanding, refinement, and attention to detail.' },
    ] as Rich,
    sentence: [
      { text: 'The goal is always the same: ', muted: true },
      { text: 'design that communicates clearly and leaves a lasting impression.' },
    ] as Rich,
    cta: 'Book a call',
    list: [
      { name: 'Lunaris Studio', year: '2025', image: img('/images/clients/lunaris-studio.webp', 'Lunaris Studio', 1504, 1128) },
      { name: 'Verden Health', year: '2025', image: img('/images/clients/verden-health.png', 'Verden Health', 427, 640) },
      { name: 'Altrove Labs', year: '2024', image: img('/images/clients/altrove-labs.png', 'Altrove Labs', 482, 640) },
      { name: 'Haven & Co.', year: '2024', image: img('/images/clients/haven-and-co.png', 'Haven & Co.', 640, 640) },
      { name: 'Solvra Systems', year: '2023', image: img('/images/clients/solvra-systems.png', 'Solvra Systems', 480, 640) },
      { name: 'Northmere Capital', year: '2022', image: img('/images/clients/northmere-capital.png', 'Northmere Capital', 512, 640) },
      { name: 'Echion Media', year: '2021', image: img('/images/clients/echion-media.png', 'Echion Media', 640, 359) },
      { name: 'Arden Supply House', year: '2020', image: img('/images/clients/arden-supply-house.png', 'Arden Supply House', 554, 640) },
    ] as Client[],
  },

  approach: {
    tag: 'Approach(04)',
    heading: [{ text: 'Creative', muted: true }, { br: true }, { text: 'Approach' }] as Rich,
    text: 'Every project is different, but the path to great work stays the same — a balance of research, clarity, creativity, and refinement.',
    image: img('/images/approach.png', 'Minimal laptop with coffee', 2400, 1800),
    steps: [
      { title: 'Discovery & Insight', text: 'I start by understanding your world — your audience, your goals, and the challenges behind them.', dots: 1 },
      { title: 'Structure & Strategy', text: 'Uuser flows, content direction, and the overall framework. This is where ideas take shape.', dots: 2 },
      { title: 'Design & Build', text: 'I explore visuals and layouts that elevate your brand while staying aligned with your goals.', dots: 3 },
      { title: 'Refine & Finalize', text: 'This final phase ensures your project feels cohesive, intuitive, and ready for real-world use.', dots: 4 },
    ] as Step[],
  },

  awards: {
    tag: 'Awards & Recognitions',
    heading: [{ text: 'Awards', muted: true }, { br: true }, { text: 'that define the craft' }] as Rich,
    sentence: [
      { text: 'Over the years, my work in ', muted: true },
      { text: 'development, design, and modern web development' },
      { text: ' has been recognized for its ', muted: true },
      { text: 'clarity, creativity, and technical precision.' },
    ] as Rich,
    list: [
      { name: 'Awwwards (3×)', text: 'Recognized on the Awwwards platform a milestone that celebrates both direction and technical execution.' },
      { name: 'CSSDA (9×)', text: 'Featured on CSS Design Awards with Best Innovation, Best Creativity, Best Animation, and multiple Developer Awards.' },
      { name: 'Framer Gallery (8×)', text: 'I earned a spot in the Framer Gallery twice and received the Framer Expert badge, showcasing high-quality execution.' },
      { name: 'Behance (3×)', text: 'Awarded across Behance with badges in Figma, Adobe Illustrator, UI/UX, and multiple Case Study features.' },
    ] as Award[],
  },

  blogsPreview: {
    tag: 'Blogs(03)',
    heading: [{ text: 'Stories', muted: true }, { br: true }, { text: 'behind the work' }] as Rich,
    cta: 'Read more blogs',
    profileText: [
      { text: 'I write to unpack the thinking behind ', muted: true },
      { text: 'the work — the choices, the reasoning, and the quiet decisions that shape how a project feels and performs' },
    ] as Rich,
  },

  faq: {
    tag: 'FAQ’S(08)',
    heading: [{ text: 'Frequently', muted: true }, { br: true }, { text: 'Asked Questions' }] as Rich,
    items: [
      { q: 'How does the project typically start?', a: 'We begin with a short call or message to understand your goals, audience, and brand direction. From there, I create a clear project outline before any design work begins.' },
      { q: 'How long does a project usually take?', a: 'Timelines vary based on scope, but most full website projects take 2–4 weeks. I’ll share a schedule before we start and keep you updated throughout the process.' },
      { q: 'What if I don’t have branding yet?', a: 'Not a problem. I can create or refine your brand direction — including color palette, typography, and visual tone — before the website design begins.' },
      { q: 'Do you offer ongoing support after the project?', a: 'Yes. I offer ongoing maintenance and improvements if needed. You can reach out anytime for updates or future expansions.' },
      { q: 'Will the website be responsive for all devices?', a: 'Absolutely. Every design is created to work seamlessly across desktop, tablet, and mobile.' },
      { q: 'Can you work with content I already have?', a: 'Yes — I can either work with what you provide or help refine/improve the content to make sure it communicates clearly and effectively.' },
      { q: 'What about SEO?', a: 'I implement clean structure, metadata, and performance optimization as part of the build. If you want deeper SEO strategy or campaigns, we can discuss next steps.' },
      { q: 'What’s your pricing structure?', a: 'Pricing is based on scope, complexity, and timeline. Once I understand your requirements, I’ll send a clear, transparent quote — no hidden fees.' },
    ] as Faq[],
    outroHeading: [{ text: 'Didn’t find' }, { br: true }, { text: 'your answer?' }] as Rich,
    outroText: 'No worries — just reach out. I’m always happy to clarify or walk you through anything.',
    outroCta: 'Send me a message',
  },

  contact: {
    tag: 'Contact',
    heading: [{ text: 'Have a', muted: true }, { br: true }, { text: 'Project in Mind?' }] as Rich,
    sentence: [{ text: 'I’m always open to ', muted: true }, { text: 'collaborations and creative challenges.' }] as Rich,
    connectLabel: "Lets' Connect",
    fields: [
      { name: 'Name', placeholder: 'Jane Smith', type: 'text' },
      { name: 'Email', placeholder: 'your@email.com', type: 'email' },
      { name: 'Phone', placeholder: '+00 0123456789', type: 'tel' },
      { name: 'Budget', placeholder: '$2000 - $5000', type: 'text' },
      { name: 'Message', placeholder: 'My message is...', type: 'textarea' },
    ] as FormField[],
    replyNote: [{ text: 'I usually reply within ', muted: true }, { text: '24 hours.' }] as Rich,
    submit: 'Send Request',
    submitting: 'Sending…',
    sent: 'Request sent',
    failed: 'Try again',
  },
}

export const pages = {
  notFound: {
    heading: '404',
    text: 'It seems you’ve reached a page that doesn’t exist. Head back to the homepage or use the navigation above to continue exploring.',
    cta: 'Back to Home',
  },
  works: {
    tag: 'Case Studies',
    heading: [{ text: 'Built to', muted: true }, { br: true }, { text: 'Stand Out' }] as Rich,
    text: 'A set of projects that showcase clean thinking, strong execution, and design that actually works.',
  },
  blogs: {
    tag: 'Blogs',
    heading: [{ text: 'From', muted: true }, { br: true }, { text: 'My Desk' }] as Rich,
    text: 'Simple thoughts on design, development, and creativity.',
  },
  workLabels: {
    overview: 'Overview',
    date: 'Date:',
    client: 'Client:',
    industry: 'Industry:',
    services: 'Services:',
    live: 'Live Project:',
    next: 'Next Project',
    cta: 'Explore all works',
  },
  blogLabels: { next: 'Next Blogs', cta: 'Explore all blogs' },
}
