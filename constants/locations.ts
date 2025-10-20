export interface City {
  name: string;
  province: string;
}

export const PROVINCES = [
  'Bulawayo',
  'Harare',
  'Manicaland',
  'Mashonaland Central',
  'Mashonaland East',
  'Mashonaland West',
  'Masvingo',
  'Matabeleland North',
  'Matabeleland South',
  'Midlands',
] as const;

export type Province = typeof PROVINCES[number];

export const CITIES: City[] = [
  { name: 'Harare', province: 'Harare' },
  { name: 'Chitungwiza', province: 'Harare' },
  { name: 'Epworth', province: 'Harare' },
  
  { name: 'Bulawayo', province: 'Bulawayo' },
  
  { name: 'Mutare', province: 'Manicaland' },
  { name: 'Nyanga', province: 'Manicaland' },
  { name: 'Rusape', province: 'Manicaland' },
  { name: 'Chipinge', province: 'Manicaland' },
  { name: 'Chimanimani', province: 'Manicaland' },
  
  { name: 'Bindura', province: 'Mashonaland Central' },
  { name: 'Muzvezve', province: 'Mashonaland Central' },
  { name: 'Mount Darwin', province: 'Mashonaland Central' },
  { name: 'Guruve', province: 'Mashonaland Central' },
  { name: 'Shamva', province: 'Mashonaland Central' },
  
  { name: 'Marondera', province: 'Mashonaland East' },
  { name: 'Ruwa', province: 'Mashonaland East' },
  { name: 'Macheke', province: 'Mashonaland East' },
  { name: 'Murehwa', province: 'Mashonaland East' },
  
  { name: 'Chinhoyi', province: 'Mashonaland West' },
  { name: 'Kariba', province: 'Mashonaland West' },
  { name: 'Kadoma', province: 'Mashonaland West' },
  { name: 'Chegutu', province: 'Mashonaland West' },
  { name: 'Karoi', province: 'Mashonaland West' },
  { name: 'Mhangura', province: 'Mashonaland West' },
  
  { name: 'Masvingo', province: 'Masvingo' },
  { name: 'Chiredzi', province: 'Masvingo' },
  { name: 'Gutu', province: 'Masvingo' },
  { name: 'Zvishavane', province: 'Masvingo' },
  
  { name: 'Lupane', province: 'Matabeleland North' },
  { name: 'Hwange', province: 'Matabeleland North' },
  { name: 'Victoria Falls', province: 'Matabeleland North' },
  { name: 'Binga', province: 'Matabeleland North' },
  
  { name: 'Gwanda', province: 'Matabeleland South' },
  { name: 'Beitbridge', province: 'Matabeleland South' },
  { name: 'Plumtree', province: 'Matabeleland South' },
  
  { name: 'Gweru', province: 'Midlands' },
  { name: 'Kwekwe', province: 'Midlands' },
  { name: 'Zvishavane', province: 'Midlands' },
  { name: 'Redcliff', province: 'Midlands' },
  { name: 'Shurugwi', province: 'Midlands' },
  { name: 'Gokwe', province: 'Midlands' },
];

export const getCitiesByProvince = (province: Province): string[] => {
  return CITIES.filter(city => city.province === province).map(city => city.name);
};

export const getAllCityNames = (): string[] => {
  return CITIES.map(city => city.name);
};
