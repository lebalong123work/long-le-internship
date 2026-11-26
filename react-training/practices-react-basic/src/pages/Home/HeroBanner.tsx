import { useId } from 'react'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { FOCUS_RING_ON_BRAND } from '@/components/ui/interactionClasses'
import { HERO_SLIDES, HERO_TEXT } from '@/constants/hero'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'
import { HeroCarousel } from './HeroCarousel'

const BANNER_CLASSES = {
  section: 'rounded-5 bg-brand',
  layout:
    'container flex flex-col gap-10 px-4 py-10 md:px-6 xl:h-[700px] xl:flex-row xl:items-start xl:justify-between xl:gap-0 xl:px-0 xl:py-0',
  text: 'flex flex-col items-start xl:w-[508px] xl:pt-[174px]',
  title: 'font-heading text-h2 font-bold text-white md:text-display xl:max-w-[426px]',
  description:
    'mt-6 self-stretch rounded-5 bg-black/50 px-4 py-2 font-body text-body-lg text-light-medium xl:-mx-4 xl:mt-4',
  shopNow: 'mt-10 w-[180px] xl:mt-8',
  photo: 'w-full xl:mr-[92px] xl:mt-20 xl:w-[400px] xl:shrink-0',
}

export function HeroBanner(): JSX.Element {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className={BANNER_CLASSES.section}>
      <div className={BANNER_CLASSES.layout}>
        <div className={BANNER_CLASSES.text}>
          <h1 id={titleId} className={BANNER_CLASSES.title}>
            {HERO_TEXT.title}
          </h1>
          <p className={BANNER_CLASSES.description}>{HERO_TEXT.description}</p>
          <ButtonLink
            to={ROUTES.SHOP}
            variant="light"
            className={cn(BANNER_CLASSES.shopNow, FOCUS_RING_ON_BRAND)}
          >
            {HERO_TEXT.shopNow}
          </ButtonLink>
        </div>
        <div className={BANNER_CLASSES.photo}>
          <HeroCarousel slides={HERO_SLIDES} />
        </div>
      </div>
    </section>
  )
}
