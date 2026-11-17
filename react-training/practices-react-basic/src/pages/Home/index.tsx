import { BestSellerSection } from './BestSellerSection'
import { HeroBanner } from './HeroBanner'

export default function Home(): JSX.Element {
  return (
    <div className="flex flex-col gap-10 pb-10 xl:gap-[50px] xl:pb-16">
      <HeroBanner />
      <BestSellerSection />
    </div>
  )
}
