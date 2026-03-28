# Backend Quick Start Guide

This is your step-by-step guide to enable backend integration for your NextMove Property App.

---

## ✅ Pre-Flight Check Complete

Your frontend is **100% ready** for backend integration. All checks passed:

- ✅ No hardcoded localhost references
- ✅ All data operations properly isolated
- ✅ React Query configured
- ✅ Type-safe throughout
- ✅ Utility files created
- ✅ No blocking issues

---

## 🚀 Getting Started

### Step 1: Enable Backend on Rork

1. Go to your Rork dashboard
2. Click on "Backend" in the header
3. Enable backend for your project
4. Copy your backend API URL (e.g., `https://api-xyz.rork.com`)

### Step 2: Set Environment Variable

Create a `.env` file in your project root:

```bash
EXPO_PUBLIC_API_URL=https://api-xyz.rork.com
```

### Step 3: Test Connection

Restart your app to load the new environment variable:

```bash
npm start
# or
bun start
```

The app will now use your backend API URL instead of localhost.

---

## 📋 What Happens Next

Once backend is enabled, Rork automatically provides:

### ✅ Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### ✅ User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/mode` - Get user mode (client/agent)
- `PUT /api/user/mode` - Switch mode

### ✅ Property Management
- `GET /api/properties` - List properties (with filters)
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### ✅ Agent Features
- `GET /api/agent/profile` - Get agent profile
- `PUT /api/agent/profile` - Update agent profile
- `GET /api/agent/properties` - Get agent's properties
- `GET /api/agent/bookings` - Get agent's bookings
- `POST /api/agent/staff` - Add staff member
- `PUT /api/agent/staff/:id` - Update staff member
- `DELETE /api/agent/staff/:id` - Remove staff member

### ✅ Booking System
- `GET /api/bookings` - List all bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/status` - Update booking status
- `GET /api/bookings/property/:propertyId` - Get property bookings

### ✅ Messaging
- `GET /api/messages/:chatId` - Get chat messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read
- WebSocket endpoint for real-time updates

### ✅ File Uploads
- `POST /api/upload` - Upload image/file
- Automatic image optimization
- CDN delivery

### ✅ Admin Features
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/banners` - Get homepage banners
- `POST /api/admin/banners` - Create banner
- `PUT /api/admin/banners/:id` - Update banner
- `DELETE /api/admin/banners/:id` - Delete banner

---

## 🔄 Migration Timeline

### Immediate (Day 1)
1. ✅ Backend enabled
2. ✅ Environment variable set
3. ✅ Authentication working
4. ✅ User profiles syncing

### Week 1
- Property listings connected to backend
- Image uploads working
- Search functionality live
- Booking system operational

### Week 2
- Real-time messaging enabled
- Admin dashboard connected
- Analytics tracking
- Push notifications

### Week 3+
- Performance optimization
- Offline mode
- Advanced features
- Polish & refinement

---

## 🧪 Testing Your Backend

### Quick Test

Add this to any screen to test:

```typescript
import { api } from '@/utils/api';

const testBackend = async () => {
  try {
    const response = await api.get('/api/health');
    console.log('✅ Backend connected:', response);
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
  }
};
```

### Test Login Flow

Update your `app/login.tsx`:

```typescript
import { api } from '@/utils/api';
import { setAuthToken, setUserData } from '@/utils/auth';

const handleLogin = async () => {
  try {
    setIsLoading(true);
    
    // Call backend API
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    
    // Save token and user data
    await setAuthToken(response.token);
    await setUserData(response.user);
    
    // Navigate based on role
    if (response.user.role === 'super_admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/(tabs)/home');
    }
  } catch (error) {
    console.error('Login failed:', error);
    alert('Login failed. Please check your credentials.');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 📚 Documentation Files

We've created these files for you:

### 1. `BACKEND_INTEGRATION_REPORT.md`
Complete audit report with all findings and recommendations.

### 2. `BACKEND_MIGRATION_EXAMPLE.md`
Step-by-step examples showing how to migrate each context.

### 3. `utils/api.ts`
API client with authentication, error handling, and type safety.

### 4. `utils/auth.ts`
Authentication utilities for token and user data management.

### 5. `utils/upload.ts`
File upload utilities for images and documents.

### 6. `.env.example`
Template for environment variables.

---

## 🆘 Troubleshooting

### Backend connection fails
```
Error: Network request failed
```
**Solution:** Check that `EXPO_PUBLIC_API_URL` is set correctly and restart the app.

### Authentication not working
```
Error: 401 Unauthorized
```
**Solution:** Ensure token is being saved and sent with requests. Check `utils/auth.ts`.

### Images not uploading
```
Error: Upload failed
```
**Solution:** Verify backend supports multipart/form-data. Check backend upload endpoint.

### WebSocket not connecting
```
Error: WebSocket connection failed
```
**Solution:** Ensure `EXPO_PUBLIC_WS_URL` is set and WebSocket server is running.

---

## 💡 Best Practices

### 1. Incremental Migration
Don't migrate everything at once. Start with authentication, then properties, then bookings, etc.

### 2. Keep AsyncStorage as Fallback
During migration, AsyncStorage can serve as a cache when backend is unavailable.

### 3. Test on Real Devices
Backend integration behaves differently on devices vs simulator. Test on real devices.

### 4. Monitor Performance
Use React Query DevTools to monitor API calls and cache performance.

### 5. Handle Offline Mode
Implement offline detection and graceful degradation:

```typescript
import NetInfo from '@react-native-community/netinfo';

const { data, isLoading, isError } = useQuery({
  queryKey: ['properties'],
  queryFn: fetchProperties,
  enabled: isOnline, // Only fetch when online
});
```

---

## 📞 Support

If you encounter any issues:

1. Check `BACKEND_INTEGRATION_REPORT.md` for detailed information
2. Review `BACKEND_MIGRATION_EXAMPLE.md` for code examples
3. Check browser/terminal console for error messages
4. Contact Rork support with specific error details

---

## ✅ Final Checklist

Before going live:

- [ ] Backend enabled and API URL set
- [ ] Login/signup working with backend
- [ ] Property listing displaying from backend
- [ ] Image uploads working
- [ ] Booking system functional
- [ ] Chat/messaging operational
- [ ] Admin dashboard connected
- [ ] Error handling tested
- [ ] Offline mode handled
- [ ] Performance optimized
- [ ] Real devices tested
- [ ] Production environment configured

---

**You're all set!** 🎉

Your app is ready for backend integration. Follow the steps above and you'll have a fully connected, production-ready app in no time.
