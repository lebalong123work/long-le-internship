import { describe, expect, it } from 'vitest'
import { CATEGORIES } from './categories'
import { FOOTER_CATEGORY_LINKS, FOOTER_LINK_GROUPS, SOCIAL_LINKS } from './footer'

const PUBLIC_ICONS = new Set(
  Object.keys(import.meta.glob('../../public/icons/*')).map((file) =>
    file.replace('../../public', '')
  )
)

function groupById(id: string) {
  const group = FOOTER_LINK_GROUPS.find((item) => item.id === id)
  if (group === undefined) throw new Error(`Missing footer group ${id}`)
  return group
}

describe('footer link groups', () => {
  it('Shop group labels equal CATEGORIES names in order', () => {
    expect(groupById('shop').items.map((item) => item.label)).toEqual(
      CATEGORIES.map((category) => category.name)
    )
  })

  it('no group has an empty heading or link label', () => {
    for (const group of FOOTER_LINK_GROUPS) {
      expect(group.heading.trim()).not.toBe('')
      for (const item of group.items) expect(item.label.trim()).not.toBe('')
    }
  })
})

describe('footer stable ids', () => {
  it('Categories group ids are men, children, women in that order', () => {
    expect(FOOTER_CATEGORY_LINKS.map((item) => item.id)).toEqual(['men', 'children', 'women'])
    expect(groupById('categories').items).toBe(FOOTER_CATEGORY_LINKS)
  })

  it('footer item ids are unique within each group and never equal to a label', () => {
    for (const group of FOOTER_LINK_GROUPS) {
      const ids = group.items.map((item) => item.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const item of group.items) expect(item.id).not.toBe(item.label)
    }
  })
})

describe('social links', () => {
  it('social icons are owner files that exist in public/icons', () => {
    for (const link of SOCIAL_LINKS) expect(PUBLIC_ICONS.has(link.iconSrc)).toBe(true)
  })

  it('social labels are unique', () => {
    const labels = SOCIAL_LINKS.map((link) => link.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('every social href is null or an https URL', () => {
    for (const { href } of SOCIAL_LINKS) {
      if (href !== null) expect(new URL(href).protocol).toBe('https:')
    }
  })

  it("no social href is '#', empty or non-https", () => {
    for (const { href } of SOCIAL_LINKS) {
      expect(href).not.toBe('#')
      expect(href).not.toBe('')
      if (href !== null) expect(href.startsWith('https://')).toBe(true)
    }
  })
})
