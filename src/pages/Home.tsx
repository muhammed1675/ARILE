import React from 'react';
import { Hero } from '../components/home/Hero';
import { CategoryStrip } from '../components/home/CategoryStrip';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { StorySection } from '../components/home/StorySection';
import { BespokeBanner } from '../components/home/BespokeBanner';
import { Testimonials } from '../components/home/Testimonials';
import { usePageMeta } from '../hooks/usePageMeta';
import { SITE } from '../data/site';

export function Home() {
  usePageMeta(`${SITE.name} — ${SITE.motto}`, SITE.description);

  return (
    <>
      <Hero />
      <CategoryStrip />
      <FeaturedProducts />
      <StorySection />
      <BespokeBanner />
      <Testimonials />
    </>);

}