import type { Img, NavLink, Social } from './types'

export const site = {
  name: 'Elian Kent',
  logoLines: ['EliaN', 'Kent'],
  seo: {
    title: 'Elian Kent',
    description:
      'I create digital experiences that feel effortless to use and powerful in impact—FRAMER sites that help modern brands grow with clarity and confidence',
  },
  nav: [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/#about' },
    { label: 'Works', to: '/works' },
    { label: 'Blogs', to: '/blogs' },
    { label: 'Contact', to: '/#contact' },
  ] satisfies NavLink[],
  bookCall: { label: 'Book a Call', href: 'https://calendly.com/frontendzaid/30min' },
  socials: [
    { label: 'Twitter(X)', href: 'https://x.com/zaidkhan3419' },
    { label: 'Instagram', href: 'https://www.instagram.com/frontendzaid/' },
    { label: 'Framer', href: 'https://www.framer.com/@zaid-khan/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/zaidkhan3419/' },
    { label: 'Dribble', href: 'https://dribbble.com/zaidkhan3419' },
  ] satisfies Social[],
  profile: {
    name: 'Elian Kent',
    role: 'Framer Pro Expert',
    avatar: { src: '/images/about-2.png', alt: 'Elian Kent', width: 2400, height: 1600 } satisfies Img,
  },
  footer: {
    tagline: '~Crafting thoughtful digital experiences built on~ clarity, purpose, and precision.',
    followLabel: 'Follow on',
    note: 'Creating experiences that balance aesthetics, usability, and intent.',
    createdBy: {
      label: 'Created by',
      name: 'Zaid Khan',
      href: 'https://www.framer.com/@zaid-khan/',
      avatar: { src: '/images/creator.jpg', alt: 'Template owner', width: 1080, height: 1350 } satisfies Img,
    },
    wordmark: 'Elian Kent',
  },
}
