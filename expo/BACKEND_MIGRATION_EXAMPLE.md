# Backend Migration Example

This document shows how to migrate from AsyncStorage to Backend API using React Query.

## Example: UserModeContext Migration

### Before (AsyncStorage only)

```typescript
// contexts/UserModeContext.tsx
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

const USER_MODE_KEY = '@user_mode';

export const [UserModeProvider, useUserMode] = createContextHook(() => {
  const [mode, setMode] = useState<UserMode>('client');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMode();
  }, []);

  const loadMode = async () => {
    try {
      const storedMode = await AsyncStorage.getItem(USER_MODE_KEY);
      if (storedMode === 'client' || storedMode === 'agent') {
        setMode(storedMode);
      }
    } catch (error) {
      console.error('Failed to load user mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = async (newMode: UserMode) => {
    try {
      await AsyncStorage.setItem(USER_MODE_KEY, newMode);
      setMode(newMode);
    } catch (error) {
      console.error('Failed to switch mode:', error);
    }
  };

  return { mode, switchMode, isLoading };
});
```

### After (With Backend)

```typescript
// contexts/UserModeContext.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { api } from '@/utils/api';

type UserMode = 'client' | 'agent';

interface UserModeResponse {
  mode: UserMode;
}

export const [UserModeProvider, useUserMode] = createContextHook(() => {
  const queryClient = useQueryClient();

  // Fetch current mode from backend
  const { data, isLoading, error } = useQuery({
    queryKey: ['userMode'],
    queryFn: async () => {
      const response = await api.get<UserModeResponse>('/api/user/mode');
      return response.mode;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update mode on backend
  const switchModeMutation = useMutation({
    mutationFn: async (newMode: UserMode) => {
      return api.put<UserModeResponse>('/api/user/mode', { mode: newMode });
    },
    onSuccess: (response) => {
      // Update cache immediately
      queryClient.setQueryData(['userMode'], response.mode);
      console.log('Mode switched to:', response.mode);
    },
    onError: (error) => {
      console.error('Failed to switch mode:', error);
    },
  });

  const mode = data || 'client';
  const isClient = mode === 'client';
  const isAgent = mode === 'agent';

  return {
    mode,
    isClient,
    isAgent,
    switchMode: switchModeMutation.mutate,
    isLoading,
    error,
  };
});
```

---

## Example: AgentProfileContext Migration

### Key Changes

**Before:**
```typescript
const updateProfile = async (updates: Partial<AgentProfile>) => {
  const updatedProfile = { ...profile, ...updates };
  await AsyncStorage.setItem(AGENT_PROFILE_KEY, JSON.stringify(updatedProfile));
  setProfile(updatedProfile);
};
```

**After:**
```typescript
const updateProfileMutation = useMutation({
  mutationFn: async (updates: Partial<AgentProfile>) => {
    return api.put<AgentProfile>('/api/agent/profile', updates);
  },
  onSuccess: (updatedProfile) => {
    // Automatically updates the cache
    queryClient.setQueryData(['agentProfile'], updatedProfile);
  },
});

// Usage:
updateProfileMutation.mutate({ bio: 'New bio' });
```

---

## Example: Add Property with Image Upload

### Before (Local only)

```typescript
const addPropertyDraft = async (draft: PropertyDraft) => {
  const updated = [...propertyDrafts, draft];
  await AsyncStorage.setItem(PROPERTY_DRAFTS_KEY, JSON.stringify(updated));
  setPropertyDrafts(updated);
};
```

### After (With Backend & Image Upload)

```typescript
const addPropertyMutation = useMutation({
  mutationFn: async (draft: PropertyDraft) => {
    // Step 1: Upload images first
    const uploadedImageUrls = await uploadMultipleImages(draft.images);
    
    // Step 2: Create property with uploaded image URLs
    const propertyData = {
      ...draft,
      images: uploadedImageUrls,
    };
    
    return api.post<Property>('/api/properties', propertyData);
  },
  onSuccess: (newProperty) => {
    // Update properties list in cache
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    console.log('Property created:', newProperty.id);
  },
  onError: (error) => {
    console.error('Failed to create property:', error);
  },
});

// Usage in component:
const handleSave = async () => {
  try {
    await addPropertyMutation.mutateAsync(formData);
    router.back();
  } catch (error) {
    alert('Failed to save property');
  }
};
```

---

## Example: Real-time Chat Integration

### Setup WebSocket Connection

```typescript
// utils/websocket.ts
import { getAuthToken } from './auth';

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  async connect() {
    const token = await getAuthToken();
    const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000';
    
    this.ws = new WebSocket(`${wsUrl}/chat?token=${token}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };
  }

  private reconnect() {
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  sendMessage(chatId: string, message: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        chatId,
        message,
      }));
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.ws?.close();
  }

  private handleMessage(data: any) {
    // Handle incoming messages
    // This should trigger a React Query cache update
  }
}
```

### Updated Chat Context

```typescript
// contexts/ChatContext.tsx (NEW)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { api } from '@/utils/api';
import { ChatWebSocket } from '@/utils/websocket';

export const [ChatProvider, useChat] = createContextHook(() => {
  const queryClient = useQueryClient();
  const ws = new ChatWebSocket();

  useEffect(() => {
    ws.connect();
    return () => ws.disconnect();
  }, []);

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      return api.get(`/api/messages/${chatId}`);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return api.post('/api/messages', {
        chatId,
        message,
      });
    },
    onMutate: async (newMessage) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['messages', chatId] });
      
      const previousMessages = queryClient.getQueryData(['messages', chatId]);
      
      queryClient.setQueryData(['messages', chatId], (old: any[]) => [
        ...old,
        { id: 'temp', message: newMessage, sender: 'user', timestamp: new Date() },
      ]);
      
      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // Rollback on error
      queryClient.setQueryData(['messages', chatId], context.previousMessages);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    },
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessageMutation.mutate,
  };
});
```

---

## Example: Booking Flow with Backend

### Updated BookingContext

```typescript
// contexts/BookingContext.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { api } from '@/utils/api';
import { BookingCardData, BookingStatus } from '@/components/BookingCard';

export const [BookingProvider, useBookings] = createContextHook(() => {
  const queryClient = useQueryClient();

  // Fetch all bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      return api.get<BookingCardData[]>('/api/bookings');
    },
  });

  // Create booking
  const addBookingMutation = useMutation({
    mutationFn: async (booking: Omit<BookingCardData, 'id' | 'status'>) => {
      return api.post<BookingCardData>('/api/bookings', booking);
    },
    onSuccess: (newBooking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      console.log('Booking created:', newBooking.id);
    },
  });

  // Update booking status
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: BookingStatus }) => {
      return api.put<BookingCardData>(`/api/bookings/${bookingId}/status`, { status });
    },
    onSuccess: (updatedBooking) => {
      // Update specific booking in cache
      queryClient.setQueryData<BookingCardData[]>(['bookings'], (old = []) =>
        old.map(b => b.id === updatedBooking.id ? updatedBooking : b)
      );
    },
  });

  const getBookingsByProperty = (propertyId: string) => {
    return bookings.filter(b => b.propertyId === propertyId);
  };

  return {
    bookings,
    isLoading,
    addBooking: addBookingMutation.mutate,
    updateBookingStatus: (bookingId: string, status: BookingStatus) =>
      updateBookingStatusMutation.mutate({ bookingId, status }),
    getBookingsByProperty,
  };
});
```

---

## Error Handling Best Practices

### Global Error Boundary

```typescript
// components/ErrorBoundary.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 12,
    color: Colors.text.primary,
  },
  message: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
```

### React Query Error Handling

```typescript
// app/_layout.tsx - Update QueryClient config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Query error:', error);
      },
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
        // You could show a global toast/alert here
      },
    },
  },
});
```

---

## Testing Backend Integration

### Create a test page to verify backend connectivity:

```typescript
// app/backend-test.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { api } from '@/utils/api';
import { getAuthToken } from '@/utils/auth';
import Colors from '@/constants/colors';

export default function BackendTestScreen() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${result}`]);
  };

  const testConnection = async () => {
    try {
      addResult('Testing connection...');
      const response = await api.get('/api/health');
      addResult('✅ Connection successful!');
      console.log(response);
    } catch (error) {
      addResult(`❌ Connection failed: ${error}`);
    }
  };

  const testAuth = async () => {
    try {
      addResult('Checking auth token...');
      const token = await getAuthToken();
      if (token) {
        addResult(`✅ Token found: ${token.substring(0, 20)}...`);
      } else {
        addResult('⚠️ No token found');
      }
    } catch (error) {
      addResult(`❌ Auth check failed: ${error}`);
    }
  };

  const testUserData = async () => {
    try {
      addResult('Fetching user data...');
      const response = await api.get('/api/user/me');
      addResult('✅ User data fetched successfully!');
      console.log(response);
    } catch (error) {
      addResult(`❌ User data fetch failed: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Integration Test</Text>
      
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={testConnection}>
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testAuth}>
          <Text style={styles.buttonText}>Test Auth</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testUserData}>
          <Text style={styles.buttonText}>Test User Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={() => setResults([])}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 20,
    color: Colors.text.primary,
  },
  buttonGroup: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  clearButton: {
    backgroundColor: Colors.error,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 13,
    fontFamily: 'monospace' as const,
    marginBottom: 8,
    color: Colors.text.primary,
  },
});
```

---

## Summary

This migration approach ensures:

1. **Zero Downtime**: AsyncStorage continues to work during migration
2. **Incremental Migration**: Migrate one context at a time
3. **Optimistic Updates**: UI updates immediately, syncs in background
4. **Error Handling**: Graceful fallbacks for network issues
5. **Type Safety**: Full TypeScript support throughout
6. **Testing**: Easy to test each endpoint independently

Start with the simplest context (UserMode) and progressively migrate to more complex ones (AgentProfile, Bookings, etc.).
