# monk-api-bindings-ts

TypeScript bindings for the Monk API, providing type-safe access to Auth, Data, Find, File, and Aggregate API endpoints.

## Installation

```bash
npm install monk-api-bindings-ts
```

## Quick Start

```typescript
import { MonkAPI } from 'monk-api-bindings-ts';

const monk = new MonkAPI({
  baseUrl: 'http://localhost:9001',
});

const loginResponse = await monk.auth.login({
  tenant: 'my-tenant',
  username: 'user@example.com',
  password: 'password123',
});

if (loginResponse.success) {
  console.log('Logged in successfully');
}
```

## Auth API

### Login

```typescript
const response = await monk.auth.login({
  tenant: 'my-tenant',
  username: 'user@example.com',
  password: 'password123',
});
```

### Register

```typescript
const response = await monk.auth.register({
  tenant: 'my-tenant',
  username: 'john_doe',
  email: 'john@example.com',
  password: 'securepassword',
});
```

### Refresh Token

```typescript
const response = await monk.auth.refresh({
  refresh_token: 'your-refresh-token',
});
```

### Get Tenants

```typescript
const response = await monk.auth.tenants();
```

### Who Am I

```typescript
const response = await monk.auth.whoami();
if (response.success) {
  console.log('User:', response.data?.user);
  console.log('Tenant:', response.data?.tenant);
  console.log('Permissions:', response.data?.permissions);
}
```

### Sudo (Escalate Privileges)

```typescript
const response = await monk.auth.sudo({
  reason: 'Administrative task',
});

if (response.success && response.data?.root_token) {
  monk.setToken(response.data.root_token);
}
```

### Logout

```typescript
monk.auth.logout();
```

## Data API

The Data API follows the **All/One/Any** naming pattern from the monk-api database layer:

- **`selectAny()`** - Select records matching filter criteria (returns array)
- **`selectOne()`** - Select a single record by ID (returns object)
- **`createOne()`** - Create a single record (object input)
- **`createAll()`** - Create multiple records (array input)
- **`updateOne()`** - Update a single record by ID
- **`updateAll()`** - Update multiple records (array input with IDs)
- **`deleteOne()`** - Delete a single record by ID
- **`deleteAll()`** - Delete multiple records by IDs

### Select Records (Collection)

```typescript
const response = await monk.data.selectAny('users', {
  limit: 10,
  offset: 0,
  order: 'created_at desc',
  include_trashed: false,
});

if (response.success) {
  console.log('Users:', response.data);
}
```

### Select Single Record

```typescript
const response = await monk.data.selectOne('users', 'user-id-123');
```

### Create Single Record

```typescript
const response = await monk.data.createOne('users', {
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
});
```

### Create Multiple Records

```typescript
const response = await monk.data.createAll('users', [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
]);
```

### Update Single Record

```typescript
const response = await monk.data.updateOne('users', 'user-id-123', {
  name: 'Alice Updated',
  age: 31,
});
```

### Update Multiple Records

```typescript
const response = await monk.data.updateAll('users', [
  { id: 'user-id-123', name: 'Alice Updated' },
  { id: 'user-id-456', name: 'Bob Updated' },
]);
```

### Delete Single Record

```typescript
const response = await monk.data.deleteOne('users', 'user-id-123');
```

### Delete Multiple Records

```typescript
const response = await monk.data.deleteAll('users', [
  'user-id-123',
  'user-id-456',
]);
```

## Relationship Operations

Relationship operations follow the same **All/One** pattern with "Related" suffix:

### Select Related Records

```typescript
const response = await monk.data.selectAnyRelated(
  'users',
  'user-id-123',
  'posts',
  {
    limit: 10,
    order: 'created_at desc',
  }
);
```

### Select Single Related Record

```typescript
const response = await monk.data.selectOneRelated(
  'users',
  'user-id-123',
  'posts',
  'post-id-456'
);
```

### Create Related Record

```typescript
const response = await monk.data.createOneRelated(
  'users',
  'user-id-123',
  'posts',
  {
    title: 'My New Post',
    content: 'Post content here',
  }
);
```

### Update Related Record

```typescript
const response = await monk.data.updateOneRelated(
  'users',
  'user-id-123',
  'posts',
  'post-id-456',
  {
    title: 'Updated Title',
  }
);
```

### Delete Single Related Record

```typescript
const response = await monk.data.deleteOneRelated(
  'users',
  'user-id-123',
  'posts',
  'post-id-456'
);
```

### Delete All Related Records

```typescript
const response = await monk.data.deleteAllRelated(
  'users',
  'user-id-123',
  'posts'
);
```

## Find API

The Find API provides advanced search and filtering with 25+ operators.

### Basic Find Query

```typescript
const response = await monk.find.find('users', {
  where: {
    status: 'active',
    age: { $gte: 18 }
  },
  limit: 10,
  order: 'created_at desc'
});
```

### Find One Record

```typescript
const response = await monk.find.findOne('users', {
  where: {
    email: 'user@example.com'
  }
});
```

### Complex Filtering

```typescript
const response = await monk.find.find('users', {
  where: {
    $and: [
      { status: 'active' },
      { $or: [
        { age: { $gte: 18, $lte: 65 } },
        { role: 'admin' }
      ]},
      { name: { $like: 'John%' } }
    ]
  },
  limit: 20,
  order: ['priority desc', 'created_at asc']
});
```

### Supported Operators

**Comparison**: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`
**Arrays**: `$in`, `$nin`, `$any`, `$all`, `$size`
**Pattern**: `$like`, `$ilike`, `$regex`
**Logical**: `$and`, `$or`, `$not`, `$nand`, `$nor`
**Text**: `$text`, `$search`
**Range**: `$between`
**Existence**: `$exists`, `$null`

### Count Records

```typescript
const response = await monk.find.count('users', {
  where: { status: 'active' }
});

if (response.success) {
  console.log('Active users:', response.data);
}
```

## File API

The File API provides filesystem-style access to Monk data and schema definitions.

### List Directory

```typescript
const response = await monk.file.list('/data/users', {
  long_format: true,
  sort_by: 'name',
  sort_order: 'asc'
});

if (response.success) {
  response.data?.entries.forEach(entry => {
    console.log(entry.name, entry.file_type, entry.file_size);
  });
}
```

### Recursive Listing

```typescript
const response = await monk.file.list('/describe/users', {
  recursive: true,
  flat: true,
  max_depth: -1
});
```

### Retrieve File Content

```typescript
const response = await monk.file.retrieve('/data/users/user-1/email');

if (response.success) {
  console.log('Email:', response.data?.content);
}
```

### Store File Content

```typescript
const response = await monk.file.store(
  '/data/users/user-2/name',
  'Alice Smith',
  {
    overwrite: true,
    validate_schema: true
  }
);
```

### File Metadata

```typescript
const response = await monk.file.stat('/data/users/user-1/email');

if (response.success) {
  console.log('Size:', response.data?.file_metadata.size);
  console.log('Modified:', response.data?.file_metadata.modified_time);
}
```

### File Size

```typescript
const response = await monk.file.size('/data/users/user-1/email');

if (response.success) {
  console.log('Bytes:', response.data?.size);
}
```

### Delete File or Record

```typescript
const response = await monk.file.delete('/data/users/user-2');
```

## Aggregate API

The Aggregate API provides data aggregation and analytics with COUNT, SUM, AVG, MIN, MAX functions.

### Basic Aggregation

```typescript
const response = await monk.aggregate.aggregate('orders', {
  aggregate: {
    total_orders: { $count: '*' },
    total_revenue: { $sum: 'amount' }
  }
});

if (response.success) {
  console.log('Total Orders:', response.data?.[0]?.total_orders);
  console.log('Total Revenue:', response.data?.[0]?.total_revenue);
}
```

### Group By Single Column

```typescript
const response = await monk.aggregate.aggregate('orders', {
  aggregate: {
    order_count: { $count: '*' },
    total_revenue: { $sum: 'amount' }
  },
  groupBy: 'status'
});

// Returns one row per status
// { status: 'completed', order_count: 1247, total_revenue: 98750.25 }
// { status: 'pending', order_count: 183, total_revenue: 14230.50 }
```

### Group By Multiple Columns

```typescript
const response = await monk.aggregate.aggregate('orders', {
  aggregate: {
    orders: { $count: '*' },
    revenue: { $sum: 'amount' },
    avg_order: { $avg: 'amount' }
  },
  groupBy: ['country', 'status']
});
```

### Aggregation with Filtering

```typescript
const response = await monk.aggregate.aggregate('orders', {
  where: {
    status: 'completed',
    created_at: { $gte: '2024-01-01' }
  },
  aggregate: {
    total_orders: { $count: '*' },
    total_revenue: { $sum: 'amount' },
    avg_order_value: { $avg: 'amount' },
    largest_order: { $max: 'amount' },
    smallest_order: { $min: 'amount' }
  }
});
```

### Distinct Count

```typescript
const response = await monk.aggregate.aggregate('orders', {
  aggregate: {
    unique_customers: { $distinct: 'customer_id' },
    unique_products: { $distinct: 'product_id' }
  }
});
```

### Available Aggregate Functions

- **$count** - Count records (`{ $count: '*' }` or `{ $count: 'field' }`)
- **$sum** - Sum numeric values (`{ $sum: 'amount' }`)
- **$avg** - Average values (`{ $avg: 'price' }`)
- **$min** - Minimum value (`{ $min: 'score' }`)
- **$max** - Maximum value (`{ $max: 'created_at' }`)
- **$distinct** - Count unique values (`{ $distinct: 'user_id' }`)

## Type Safety

All methods are fully typed with TypeScript:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

const response = await monk.data.get<User>('users', 'user-id-123');

if (response.success && response.data) {
  console.log(response.data.name);
  console.log(response.data.email);
}
```

## Error Handling

All API responses follow the same structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  error_code?: string;
}
```

Example error handling:

```typescript
const response = await monk.data.get('users', 'invalid-id');

if (!response.success) {
  console.error('Error:', response.error);
  console.error('Error Code:', response.error_code);
}
```

## Manual Token Management

You can manually set, get, or clear tokens:

```typescript
monk.setToken('your-jwt-token');

const token = monk.getToken();

monk.clearToken();
```

## License

MIT
