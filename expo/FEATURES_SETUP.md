# Chat, Bookings & Notifications Setup Guide

This document covers the implementation of chat/messaging, bookings, and notifications features with backend integration.

## Overview

Step 6 adds real-time communication, property viewing bookings, and notification systems to your application.

## Features Implemented

### 1. Bookings System
- Create property viewing bookings
- List bookings (client and agent views)
- Update booking status (confirm/cancel)
- Get individual booking details
- Email notifications for booking updates

### 2. Chat/Messaging System
- Send messages between users
- Get conversation history between two users
- List all user conversations with unread counts
- Mark messages as read
- Support for text and images

### 3. Notifications System
- Create notifications for users
- List user notifications with filtering
- Mark notifications as read (individual or all)
- Delete notifications
- Track unread notification counts

### 4. Email Templates
- Booking confirmation emails
- Booking cancellation emails
- New message notifications
- Welcome emails for new users

## Database Schema

All necessary tables are already defined in `backend/db/schema.ts`:

### Bookings Table
```typescript
bookings: {
  id: string (primary key)
  propertyId: string (foreign key to properties)
  clientId: string (foreign key to users)
  agentId: string (foreign key to users)
  date: timestamp
  time: string
  clientName: string
  clientEmail: string
  clientPhone: string
  notes: string (optional)
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Messages Table
```typescript
messages: {
  id: string (primary key)
  senderId: string (foreign key to users)
  receiverId: string (foreign key to users)
  content: string
  images: string (JSON array)
  read: boolean
  timestamp: timestamp
}
```

### Notifications Table
```typescript
notifications: {
  id: string (primary key)
  userId: string (foreign key to users)
  title: string
  message: string
  type: 'booking' | 'message' | 'update' | 'system' | 'alert'
  read: boolean
  data: string (optional JSON)
  timestamp: timestamp
}
```

## API Endpoints

### Bookings Endpoints

#### Create Booking
```typescript
// POST /api/trpc/bookings.create
const result = await trpc.bookings.create.mutate({
  propertyId: "property_123",
  date: "2025-10-25",
  time: "14:00",
  clientName: "John Doe",
  clientEmail: "john@example.com",
  clientPhone: "+1234567890",
  notes: "Looking forward to viewing"
});
```

#### List Bookings
```typescript
// GET /api/trpc/bookings.list
const result = await trpc.bookings.list.query({
  role: "client", // or "agent"
  status: "pending" // optional: filter by status
});
```

#### Update Booking Status
```typescript
// POST /api/trpc/bookings.updateStatus
const result = await trpc.bookings.updateStatus.mutate({
  bookingId: "booking_123",
  status: "confirmed" // or "cancelled"
});
```

#### Get Booking
```typescript
// GET /api/trpc/bookings.get
const result = await trpc.bookings.get.query({
  bookingId: "booking_123"
});
```

### Messages Endpoints

#### Send Message
```typescript
// POST /api/trpc/messages.send
const result = await trpc.messages.send.mutate({
  receiverId: "user_456",
  content: "Hello! Interested in your property.",
  images: ["https://example.com/image1.jpg"] // optional
});
```

#### Get Conversation
```typescript
// GET /api/trpc/messages.getConversation
const result = await trpc.messages.getConversation.query({
  otherUserId: "user_456",
  limit: 50 // optional, default 50
});
```

#### List Conversations
```typescript
// GET /api/trpc/messages.listConversations
const result = await trpc.messages.listConversations.query();
// Returns all conversations with last message and unread count
```

#### Mark Messages as Read
```typescript
// POST /api/trpc/messages.markAsRead
const result = await trpc.messages.markAsRead.mutate({
  senderId: "user_456"
});
```

### Notifications Endpoints

#### Create Notification
```typescript
// POST /api/trpc/notifications.create
const result = await trpc.notifications.create.mutate({
  userId: "user_123",
  title: "New Booking",
  message: "You have a new booking request",
  type: "booking",
  data: JSON.stringify({ bookingId: "booking_123" }) // optional
});
```

#### List Notifications
```typescript
// GET /api/trpc/notifications.list
const result = await trpc.notifications.list.query({
  limit: 50, // optional, default 50
  unreadOnly: false // optional, default false
});
```

#### Mark Notifications as Read
```typescript
// POST /api/trpc/notifications.markAsRead

// Mark specific notification as read
const result = await trpc.notifications.markAsRead.mutate({
  notificationId: "notif_123"
});

// Mark all notifications as read
const result = await trpc.notifications.markAsRead.mutate({
  markAll: true
});
```

#### Delete Notification
```typescript
// POST /api/trpc/notifications.delete
const result = await trpc.notifications.delete.mutate({
  notificationId: "notif_123"
});
```

## Email Utilities

Email utility functions are available in `backend/utils/email.ts`:

### Send Email
```typescript
import { sendEmail } from "../utils/email";

await sendEmail({
  to: "user@example.com",
  subject: "Your Booking Confirmation",
  html: "<h1>Booking Confirmed</h1>",
  from: "noreply@example.com" // optional
});
```

### Email Templates

#### Booking Confirmation
```typescript
import { getBookingConfirmationEmail } from "../utils/email";

const emailHtml = getBookingConfirmationEmail({
  clientName: "John Doe",
  propertyTitle: "Luxury Apartment",
  date: "October 25, 2025",
  time: "2:00 PM",
  agentName: "Jane Smith",
  agentPhone: "+1234567890",
  agentEmail: "jane@example.com"
});

await sendEmail({
  to: clientEmail,
  subject: "Booking Confirmed",
  html: emailHtml
});
```

#### Booking Cancellation
```typescript
import { getBookingCancellationEmail } from "../utils/email";

const emailHtml = getBookingCancellationEmail({
  clientName: "John Doe",
  propertyTitle: "Luxury Apartment",
  date: "October 25, 2025",
  time: "2:00 PM"
});
```

#### New Message
```typescript
import { getNewMessageEmail } from "../utils/email";

const emailHtml = getNewMessageEmail({
  recipientName: "Jane Smith",
  senderName: "John Doe",
  messagePreview: "Hi, I'm interested in your property..."
});
```

#### Welcome Email
```typescript
import { getWelcomeEmail } from "../utils/email";

const emailHtml = getWelcomeEmail({
  userName: "John Doe",
  userEmail: "john@example.com"
});
```

## Integration Examples

### Example: Create Booking with Notification

```typescript
// In your booking creation endpoint
const booking = await trpc.bookings.create.mutate({
  propertyId: propertyId,
  date: "2025-10-25",
  time: "14:00",
  clientName: "John Doe",
  clientEmail: "john@example.com",
  clientPhone: "+1234567890"
});

// Send notification to agent
await trpc.notifications.create.mutate({
  userId: agentId,
  title: "New Booking Request",
  message: `${booking.clientName} requested a viewing`,
  type: "booking",
  data: JSON.stringify({ bookingId: booking.id })
});

// Send email to client
const emailHtml = getBookingConfirmationEmail({...});
await sendEmail({
  to: booking.clientEmail,
  subject: "Booking Request Received",
  html: emailHtml
});
```

### Example: Send Message with Notification

```typescript
// Send message
const message = await trpc.messages.send.mutate({
  receiverId: agentId,
  content: "Hello! I'm interested in your property."
});

// Send notification to receiver
await trpc.notifications.create.mutate({
  userId: agentId,
  title: "New Message",
  message: `You have a new message from ${senderName}`,
  type: "message",
  data: JSON.stringify({ 
    senderId: senderId,
    messageId: message.id 
  })
});

// Optional: Send email notification
const emailHtml = getNewMessageEmail({
  recipientName: receiverName,
  senderName: senderName,
  messagePreview: message.content
});
await sendEmail({
  to: receiverEmail,
  subject: "New Message",
  html: emailHtml
});
```

## Frontend Integration

### Using tRPC Queries (React Components)

```typescript
import { trpc } from '@/lib/trpc';

// In your component
function BookingsList() {
  const { data, isLoading } = trpc.bookings.list.useQuery({
    role: "client"
  });

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View>
      {data?.bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </View>
  );
}
```

### Using tRPC Mutations

```typescript
import { trpc } from '@/lib/trpc';

function CreateBookingForm() {
  const createBooking = trpc.bookings.create.useMutation();

  const handleSubmit = async () => {
    try {
      const result = await createBooking.mutateAsync({
        propertyId: propertyId,
        date: selectedDate,
        time: selectedTime,
        clientName: name,
        clientEmail: email,
        clientPhone: phone
      });
      
      console.log('Booking created:', result);
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleSubmit}>
      <Text>Create Booking</Text>
    </TouchableOpacity>
  );
}
```

### Using tRPC Client (Non-React)

```typescript
import { trpcClient } from '@/lib/trpc';

// In a utility function or async context
async function loadUserNotifications() {
  const result = await trpcClient.notifications.list.query({
    limit: 20,
    unreadOnly: false
  });
  
  return result.notifications;
}
```

## Email Configuration

The current implementation logs emails to the console. To send real emails:

### Option 1: Using Resend (Recommended)
```bash
npm install resend
```

```typescript
// backend/utils/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await resend.emails.send({
      from: options.from || 'noreply@yourdomain.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('[Email Error]', error);
    return false;
  }
}
```

### Option 2: Using Nodemailer
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: options.from || process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('[Email Error]', error);
    return false;
  }
}
```

Add to `.env`:
```
RESEND_API_KEY=your_api_key_here
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com
```

## Security Considerations

1. **Authorization**: All endpoints check if the user is authenticated and authorized to access the data
2. **Data Validation**: Zod schemas validate all input data
3. **Rate Limiting**: Consider adding rate limiting for message sending
4. **Spam Prevention**: Implement message frequency limits
5. **Email Verification**: Verify email addresses before sending notifications

## Testing

Test each endpoint using your preferred API client or frontend:

```typescript
// Example test for creating a booking
const testBooking = async () => {
  try {
    const result = await trpcClient.bookings.create.mutate({
      propertyId: "test_property_123",
      date: "2025-11-01",
      time: "10:00",
      clientName: "Test User",
      clientEmail: "test@example.com",
      clientPhone: "+1234567890",
      notes: "Test booking"
    });
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Next Steps

1. **Real-time Updates**: Integrate WebSocket or Server-Sent Events for real-time notifications
2. **Push Notifications**: Add Expo push notifications for mobile alerts
3. **Email Service**: Configure a production email service (Resend, SendGrid, etc.)
4. **Message Search**: Add search functionality for messages
5. **Message Attachments**: Expand image support and add file attachments
6. **Read Receipts**: Add more detailed read status tracking
7. **Typing Indicators**: Implement typing indicators in chat
8. **Booking Calendar**: Create calendar view for agent bookings

## Troubleshooting

### Messages not appearing
- Check that both sender and receiver IDs are valid
- Verify the conversation query is using correct user IDs
- Check database for stored messages

### Notifications not showing
- Ensure notifications are created with correct userId
- Check that the list query is using authenticated user's ID
- Verify notification data is properly formatted

### Emails not sending
- Check email utility configuration
- Verify SMTP credentials or API keys
- Check console logs for email errors
- Test with a simple email first

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify database schema matches expected structure
3. Test endpoints individually using API client
4. Review authentication and authorization setup

---

**Status**: ✅ Step 6 Complete - Chat, Bookings & Notifications implemented with full backend integration
