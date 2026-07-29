// @ts-nocheck
import './site-os-home.css';
import DittoMotion from './ditto/DittoMotion';
import Navbar from './sections/navbar';
import HeroSection from './sections/hero-section';
import S8kbDefaultTrackerSection from './sections/s8kb-default-tracker-section';
import ProductGridSection from './sections/product-grid-section';
import SeeWhenVisitorsSection from './sections/see-when-visitors-section';
import EverythingYouNeedSection from './sections/everything-you-need-section';
import LogoCloudSection from './sections/logo-cloud-section';
import SeeWhereVisitorsSection from './sections/see-where-visitors-section';
import GalleryShowcaseSection from './sections/gallery-showcase-section';
import LogoCloudSection2 from './sections/logo-cloud-section2';
import LogoCloudSection3 from './sections/logo-cloud-section3';
import ProductGridSection2 from './sections/product-grid-section2';
import FaqSection from './sections/faq-section';
import Footer from './sections/footer';

export function SiteOsLanding() {
  return (
    <div className="site-os-home min-h-dvh">
      <Navbar />
      <main
        className="block isolate min-w-0 grow w-320 h-[14745.3px] max-md:w-[23.4375rem] max-md:h-[1307.5rem] md:max-lg:w-192 md:max-lg:h-[1006.1875rem] 2xl:w-480 2xl:h-[15625.3px]"
        data-cid="n23"
      >
        <HeroSection />
        <S8kbDefaultTrackerSection />
        <ProductGridSection />
        <SeeWhenVisitorsSection />
        <EverythingYouNeedSection />
        <LogoCloudSection />
        <SeeWhereVisitorsSection />
        <GalleryShowcaseSection />
        <LogoCloudSection2 />
        <LogoCloudSection3 />
        <ProductGridSection2 />
        <FaqSection />
      </main>
      <Footer />
      <span
        className="w-3.5 h-4 block absolute -top-5000 min-w-0 text-[0.6875rem] leading-[1rem] whitespace-pre text-nowrap max-md:w-[0.6875rem]"
        data-cid="n2604"
        aria-hidden="true"
        id="recharts_measurement_span"
      >
        30
      </span>
      <DittoMotion
        spec={{
          waapi: [],
          rotators: [],
          reveals: [
            {
              cid: 'n658',
              opacity: '0.0455991',
              transform: 'matrix(0.824291, 0, 0, 0.824291, 0, 0)',
              transition: 'transform 0.28s, opacity 0.28s',
            },
            {
              cid: 'n659',
              opacity: '0.00173026',
              transform: 'matrix(0.781681, 0, 0, 0.781681, 0, 0)',
              transition: 'transform 0.28s, opacity 0.28s',
            },
            {
              cid: 'n660',
              opacity: '0',
              transform: 'matrix(0.78, 0, 0, 0.78, 0, 0)',
              transition: 'transform 0.28s, opacity 0.28s',
            },
            {
              cid: 'n661',
              opacity: '0',
              transform: 'matrix(0.78, 0, 0, 0.78, 0, 0)',
              transition: 'transform 0.28s, opacity 0.28s',
            },
            {
              cid: 'n662',
              opacity: '0',
              transform: 'matrix(0.78, 0, 0, 0.78, 0, 0)',
              transition: 'transform 0.28s, opacity 0.28s',
            },
            {
              cid: 'n663',
              opacity: '0',
              transform: 'matrix(0.78, 0, 0, 0.78, 0, 0)',
              transition: 'transform 0.28s, opacity 0.28s',
            },
            {
              cid: 'n664',
              opacity: '0',
              transform: 'matrix(0.78, 0, 0, 0.78, 0, 0)',
              transition: 'transform 0.28s, opacity 0.28s',
            },
            {
              cid: 'n665',
              opacity: '0',
              transform: 'matrix(0.78, 0, 0, 0.78, 0, 0)',
              transition: 'transform 0.28s, opacity 0.28s',
            },
            {
              cid: 'n666',
              opacity: '0',
              transform: 'matrix(0.78, 0, 0, 0.78, 0, 0)',
              transition: 'transform 0.28s, opacity 0.28s',
            },
          ],
          marquees: [],
        }}
      />
    </div>
  );
}
