import { useEffect, useRef, useState } from 'react';

import { useSeo } from '../components/Chrome.jsx';
import { Hero, NAME_SEEN } from '../components/home/Hero.jsx';
import { BeforeYouOrder, LatestPost, Letter, Pieces, Quotes, SizesLine, SlowWords } from '../components/home/Sections.jsx';
import { Strand } from '../components/home/Strand.jsx';
import { WristInBeads } from '../components/home/WristInBeads.jsx';
import { afterFirstPaint } from '../motion/gsap.js';

/* A plain first load paints the opening screen alone, then the long page beneath it.
   A reload or a trip back needs the whole page at once to return to the same place. */
const opensInTwoSteps = () => document.readyState !== 'complete'
  && performance.getEntriesByType('navigation')[0]?.type === 'navigate'
  && !window.location.hash;

export default function Home() {
  useSeo();
  const ringRef = useRef(null);
  const [firstVisit] = useState(() => !sessionStorage.getItem(NAME_SEEN));
  const [whole, setWhole] = useState(() => !opensInTwoSteps());

  useEffect(() => {
    if (whole) return undefined;
    return afterFirstPaint(() => setWhole(true));
  }, [whole]);

  return (
    <>
      <Hero firstVisit={firstVisit} />
      {whole ? (
        <>
          <Pieces />
          <WristInBeads ringRef={ringRef} />
          <SizesLine />
          <Letter />
          <SlowWords />
          <Quotes />
          <BeforeYouOrder />
          <LatestPost />
          <Strand ringRef={ringRef} firstVisit={firstVisit} />
        </>
      ) : <div className="home__rest" />}
    </>
  );
}
