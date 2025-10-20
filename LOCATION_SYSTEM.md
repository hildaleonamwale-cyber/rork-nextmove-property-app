# Zimbabwe Location System

## Overview
This app uses a structured location system specifically designed for Zimbabwe, with hardcoded provinces and cities for accurate filtering, and custom area/suburb input for flexibility.

## Structure

### Provinces (Hardcoded)
1. Bulawayo
2. Harare
3. Manicaland
4. Mashonaland Central
5. Mashonaland East
6. Mashonaland West
7. Masvingo
8. Matabeleland North
9. Matabeleland South
10. Midlands

### Cities by Province (Hardcoded)

#### Harare Province
- Harare (capital)
- Chitungwiza
- Epworth

#### Bulawayo Province
- Bulawayo

#### Manicaland
- Mutare
- Nyanga
- Rusape
- Chipinge
- Chimanimani

#### Mashonaland Central
- Bindura
- Muzvezve
- Mount Darwin
- Guruve
- Shamva

#### Mashonaland East
- Marondera
- Ruwa
- Macheke
- Murehwa

#### Mashonaland West
- Chinhoyi
- Kariba
- Kadoma
- Chegutu
- Karoi
- Mhangura

#### Masvingo
- Masvingo
- Chiredzi
- Gutu
- Zvishavane

#### Matabeleland North
- Lupane
- Hwange
- Victoria Falls
- Binga

#### Matabeleland South
- Gwanda
- Beitbridge
- Plumtree

#### Midlands
- Gweru
- Kwekwe
- Zvishavane
- Redcliff
- Shurugwi
- Gokwe

### Areas/Suburbs (Custom Input)
Users can enter custom area/suburb names when adding properties. Examples:
- Borrowdale
- Mount Pleasant
- Avondale
- Highlands
- Etc.

## Implementation

### Property Type Structure
```typescript
location: {
  address: string;        // Optional street address
  area: string;          // Custom area/suburb (e.g., "Borrowdale")
  city: string;          // Selected from hardcoded list
  province: string;      // Selected from hardcoded list
  country: string;       // "Zimbabwe"
  coordinates: {
    latitude: number;
    longitude: number;
  };
}
```

### Constants File
Location: `constants/locations.ts`

Exports:
- `PROVINCES`: Array of all provinces
- `CITIES`: Array of city objects with province mapping
- `getCitiesByProvince(province)`: Helper function to get cities for a province
- `getAllCityNames()`: Helper function to get all city names

### Usage in Forms

**Add Property Form** (`app/agent/add-property.tsx`):
1. Province dropdown (select from PROVINCES)
2. City dropdown (dynamically filtered by selected province)
3. Area/Suburb text input (custom user input)
4. Address text input (optional street address)

**Advanced Search** (`app/advanced-search.tsx`):
1. Province dropdown (select from PROVINCES)
2. City dropdown (dynamically filtered by selected province)
3. Other filters (price, bedrooms, etc.)

### Filtering Logic

When filtering properties:
1. **Province**: Exact match on hardcoded province
2. **City**: Exact match on hardcoded city
3. **Area/Suburb**: Fuzzy search on custom area field (allows "Borrowdale" to match even with typos)
4. **Combined**: Users can filter by province → city → area for precise results

### Benefits

1. **Accurate Filtering**: Hardcoded provinces and cities ensure consistent filtering
2. **Flexibility**: Custom area input allows for all suburbs without maintaining a massive list
3. **User-Friendly**: Dropdowns for major locations, free text for specific areas
4. **Scalable**: Easy to add new cities to provinces as needed
5. **Search-Friendly**: Can search by broad (province) or specific (area) locations

## Future Enhancements

Potential improvements:
1. Add GPS coordinates for major cities
2. Implement area autocomplete based on popular entries
3. Add map view with location pins
4. Store popular areas per city for suggestions
