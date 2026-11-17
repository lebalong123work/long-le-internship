export interface ProvinceCity {
  name: string
  wards: readonly string[]
}

export const PROVINCE_CITIES: readonly ProvinceCity[] = [
  { name: 'Hanoi', wards: ['Ba Dinh', 'Hoan Kiem', 'Cua Nam', 'Ngoc Ha'] },
  { name: 'Ho Chi Minh City', wards: ['Sai Gon', 'Tan Dinh', 'Ben Thanh', 'Cau Ong Lanh'] },
  { name: 'Da Nang', wards: ['Hai Chau', 'Hoa Cuong', 'Thanh Khe', 'An Hai'] },
  { name: 'Can Tho', wards: ['Ninh Kieu', 'Cai Khe', 'Tan An', 'An Binh'] },
]

const NO_WARDS: readonly string[] = []

export const PROVINCE_CITY_NAMES: readonly string[] = PROVINCE_CITIES.map(({ name }) => name)

export function wardsOf(province: string): readonly string[] {
  return PROVINCE_CITIES.find(({ name }) => name === province)?.wards ?? NO_WARDS
}
