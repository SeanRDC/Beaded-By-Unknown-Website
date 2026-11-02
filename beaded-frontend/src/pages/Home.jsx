import { useRef, useState } from 'react';

import { useSeo } from '../components/Chrome.jsx';
import { Hero, NAME_SEEN } from '../components/home/Hero.jsx';
import { BeforeYouOrder, LatestPost, Letter, Pieces, Quotes, SizesLine, SlowWords } from '../components/home/Sections.jsx';
import { Strand } from '../components/home/Strand.jsx';
import { WristInBeads } from '../components/home/WristInBeads.jsx';

export default function Home() {
  useSeo();
  const ringRef = useRef(null);
  const [firstVisit] = useState(() => !sessionStorage.getItem(NAME_SEEN));

  return (
    <>
      <Hero firstVisit={firstVisit} />
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
  );
}
