# Property Endpoints Setup

Step 4: Property endpoints (CRUD operations) ✅

## Overview
Property CRUD endpoints have been created with comprehensive functionality for managing real estate listings.

## Available Endpoints

### 1. Create Property
**Route:** `properties.create`  
**Type:** Mutation  
**Auth:** Protected (Agent, Agency, Admin only)

Creates a new property listing.

**Input Schema:**
```typescript
{
  title: string;
  description: string;
  price: number;
  priceType: 'monthly' | 'sale';
  location: {
    address: string;
    area: string;
    city: string;
    province: string;
    country: string;
    coordinates?: { latitude: number; longitude: number; };
  };
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  propertyType?: string;
  listingCategory?: 'property' | 'stand' | 'room' | 'commercial';
  status: 'For Rent' | 'For Sale' | 'Internal Management';
  amenities?: string[];
  features?: string[];
  tourLink?: string;
  lister?: {
    type: 'company' | 'private';
    companyName?: string;
    companyLogo?: string;
  };
  floors?: number;
  parkingSpaces?: number;
  titleDeeds?: boolean;
  serviced?: boolean;
  developerSession?: string;
  furnished?: boolean;
  yearBuilt?: number;
  zoning?: string;
}
```

**Example Usage:**
```typescript
const result = await trpc.properties.create.mutate({
  title: "Modern 2BR Apartment",
  description: "Beautiful apartment in the heart of the city",
  price: 1500,
  priceType: "monthly",
  location: {
    address: "123 Main St",
    area: "Downtown",
    city: "Harare",
    province: "Harare",
    country: "Zimbabwe"
  },
  images: ["https://example.com/image1.jpg"],
  bedrooms: 2,
  bathrooms: 2,
  area: 85,
  status: "For Rent",
  amenities: ["Pool", "Gym", "Parking"],
  listingCategory: "property"
});
```

---

### 2. Get Property by ID
**Route:** `properties.get`  
**Type:** Query  
**Auth:** Public

Retrieves a single property by ID.

**Input:**
```typescript
{ id: string }
```

**Example Usage:**
```typescript
const property = await trpc.properties.get.useQuery({ 
  id: "property-id-123" 
});
```

---

### 3. List Properties
**Route:** `properties.list`  
**Type:** Query  
**Auth:** Public

Lists properties with filtering and pagination.

**Input Schema:**
```typescript
{
  listingCategory?: 'property' | 'stand' | 'room' | 'commercial';
  status?: ('For Rent' | 'For Sale' | 'Internal Management')[];
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  verifiedOnly?: boolean;
  featured?: boolean;
  agentId?: string;
  limit?: number; // Default: 20, Max: 100
  offset?: number; // Default: 0
}
```

**Returns:**
```typescript
{
  properties: Property[];
  total: number;
  limit: number;
  offset: number;
}
```

**Example Usage:**
```typescript
const result = await trpc.properties.list.useQuery({
  listingCategory: "property",
  status: ["For Rent"],
  bedrooms: 2,
  priceMin: 1000,
  priceMax: 2000,
  verifiedOnly: true,
  limit: 10,
  offset: 0
});
```

---

### 4. Update Property
**Route:** `properties.update`  
**Type:** Mutation  
**Auth:** Protected (Property owner or Admin)

Updates an existing property. All fields are optional except `id`.

**Input:**
```typescript
{
  id: string;
  // Any fields from create property schema (all optional)
}
```

**Example Usage:**
```typescript
const result = await trpc.properties.update.mutate({
  id: "property-id-123",
  price: 1600,
  description: "Updated description",
  amenities: ["Pool", "Gym", "Parking", "Security"]
});
```

---

### 5. Delete Property
**Route:** `properties.delete`  
**Type:** Mutation  
**Auth:** Protected (Property owner or Admin)

Deletes a property permanently.

**Input:**
```typescript
{ id: string }
```

**Example Usage:**
```typescript
const result = await trpc.properties.delete.mutate({ 
  id: "property-id-123" 
});
```

---

### 6. Increment Views
**Route:** `properties.incrementViews`  
**Type:** Mutation  
**Auth:** Public

Increments the view count for a property.

**Input:**
```typescript
{ id: string }
```

**Example Usage:**
```typescript
await trpc.properties.incrementViews.mutate({ 
  id: "property-id-123" 
});
```

---

### 7. Increment Inquiries
**Route:** `properties.incrementInquiries`  
**Type:** Mutation  
**Auth:** Protected

Increments the inquiry count for a property.

**Input:**
```typescript
{ id: string }
```

**Example Usage:**
```typescript
await trpc.properties.incrementInquiries.mutate({ 
  id: "property-id-123" 
});
```

---

## Data Transformations

All property endpoints automatically handle the following transformations:

**Database → API Response:**
- `location` (JSON string) → `location` (object)
- `images` (JSON string) → `images` (array)
- `amenities` (JSON string) → `amenities` (array)
- `features` (JSON string) → `features` (array)
- `lister` (JSON string) → `lister` (object)
- Boolean fields (stored as 0/1) → Boolean values

**API Request → Database:**
- Objects and arrays are automatically stringified
- Boolean values are converted to 0/1

---

## Permission Rules

1. **Create Property**: Agent, Agency, or Admin role required
2. **Get Property**: Public access
3. **List Properties**: Public access (flagged properties are hidden)
4. **Update Property**: Must be property owner or Admin
5. **Delete Property**: Must be property owner or Admin
6. **Increment Views**: Public access
7. **Increment Inquiries**: Authenticated users only

---

## Integration Example

Here's how to use the property endpoints in your React Native components:

```typescript
import { trpc } from "@/lib/trpc";

function PropertyList() {
  const { data, isLoading } = trpc.properties.list.useQuery({
    listingCategory: "property",
    status: ["For Rent"],
    limit: 20
  });

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View>
      {data?.properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </View>
  );
}

function PropertyDetail({ propertyId }: { propertyId: string }) {
  const { data: property } = trpc.properties.get.useQuery({ id: propertyId });
  const incrementViews = trpc.properties.incrementViews.useMutation();

  useEffect(() => {
    incrementViews.mutate({ id: propertyId });
  }, [propertyId]);

  return <View>{/* Render property details */}</View>;
}

function CreateProperty() {
  const createProperty = trpc.properties.create.useMutation();

  const handleSubmit = async (formData) => {
    const result = await createProperty.mutateAsync(formData);
    console.log("Property created:", result.property);
  };

  return <Form onSubmit={handleSubmit} />;
}
```

---

## Database Schema Reference

Properties are stored in the `properties` table with the following key fields:

- `id`: Primary key (UUID)
- `title`, `description`: Property details
- `price`, `priceType`: Pricing information
- `location`: JSON string with address details
- `images`: JSON array of image URLs
- `bedrooms`, `bathrooms`, `area`: Property specs
- `propertyType`, `listingCategory`: Classification
- `status`: Rental/sale status
- `verified`, `featured`: Boolean flags
- `agentId`: Foreign key to users table
- `views`, `bookings`, `inquiries`: Analytics counters
- `amenities`, `features`: JSON arrays
- `flagged`: Moderation flag
- `createdAt`, `updatedAt`: Timestamps

---

## Next Steps

✅ Property CRUD endpoints completed

**Remaining backend setup:**
5. Booking endpoints
6. Messaging endpoints
7. Wishlist endpoints
8. Notification endpoints
9. Admin moderation endpoints
10. Analytics and statistics endpoints

Ready to proceed with Step 5: Booking endpoints?
