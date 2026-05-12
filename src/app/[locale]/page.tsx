import Hero from '@/components/home/Hero';
import PainPoints from '@/components/home/PainPoints';
import Solution from '@/components/home/Solution';
import Process from '@/components/home/Process';
import BricksPreview from '@/components/home/BricksPreview';
import PricingSummary from '@/components/home/PricingSummary';
import AboutTeaser from '@/components/home/AboutTeaser';
import FinalCTA from '@/components/home/FinalCTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <PainPoints />
      <Solution />
      <Process />
      <BricksPreview />
      <PricingSummary />
      <AboutTeaser />
      <FinalCTA />
    </>
  );
}
