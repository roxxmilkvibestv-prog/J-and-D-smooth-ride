import { BookingState } from '../types';

export interface SmsDispatchResponse {
  success: boolean;
  configured?: boolean;
  messageId?: string;
  error?: string;
  to?: string;
  from?: string;
}

// Memory guard to prevent duplicate SMS dispatch for the same booking session
const dispatchedBookingIds = new Set<string>();

/**
 * Dispatches an automated booking alert to the dispatch admin's phone
 * via the httpSMS backend gateway (/api/sms/notify-admin).
 */
export async function dispatchBookingSms(booking: BookingState): Promise<SmsDispatchResponse> {
  if (booking.id && dispatchedBookingIds.has(booking.id)) {
    return { success: true, configured: true, messageId: 'already_dispatched' };
  }
  if (booking.id) {
    dispatchedBookingIds.add(booking.id);
  }

  try {
    const isDelivery = booking.type === 'delivery';
    const typeLabel = isDelivery 
      ? `EXPRESS COURIER (${booking.deliveryCategory || 'Parcel'})` 
      : `SMOOTH RIDE (${booking.tier?.toUpperCase() || 'STANDARD'})`;

    const clientName = booking.passengerName || 'Valued Customer';
    const clientPhone = booking.phone || booking.momoNumber || 'N/A';
    const pickup = booking.pickup;
    const dropoff = booking.dropoff;
    const fare = `${booking.fareRwf?.toLocaleString()} RWF`;
    const payment = `MoMo (${booking.momoNetwork || 'MTN'} - ${booking.momoNumber || clientPhone})`;
    const bookingId = booking.id;
    const rider = booking.driver 
      ? `${booking.driver.name} (Plate: ${booking.driver.plateNumber})` 
      : 'Auto-Assigning Nearest Rider';

    const formattedContent = 
`[J&D Smooth Ride - ${typeLabel}]
Booking ID: ${bookingId}
Client: ${clientName} (${clientPhone})
Pickup: ${pickup}
Dropoff: ${dropoff}
Fare: ${fare} via ${payment}
Distance: ~${booking.distanceKm} km
Rider: ${rider}
${booking.packageDetails ? `Details: ${booking.packageDetails}\n` : ''}${booking.recipientPhone ? `Recipient: ${booking.recipientName || 'Recipient'} (${booking.recipientPhone})\n` : ''}Time: ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const response = await fetch('/api/sms/notify-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: formattedContent,
        booking: {
          id: booking.id,
          type: booking.type,
          passengerName: clientName,
          phone: clientPhone,
          pickup,
          dropoff,
          fareRwf: booking.fareRwf,
          momoNetwork: booking.momoNetwork,
          momoNumber: booking.momoNumber,
          driver: booking.driver,
          packageDetails: booking.packageDetails,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        configured: errorData.configured !== false,
        error: errorData.error || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: data.success,
      configured: data.configured,
      messageId: data.data?.id || data.messageId,
      to: data.to,
      from: data.from,
    };
  } catch (error: any) {
    console.warn('[SMS Dispatch Notice] Unable to reach SMS gateway endpoint:', error?.message || error);
    return {
      success: false,
      error: error?.message || 'Network error reaching SMS gateway',
    };
  }
}

/**
 * Checks the gateway status from the backend
 */
export async function checkSmsGatewayStatus(): Promise<{
  configured: boolean;
  adminPhone: string;
  senderPhone: string;
}> {
  try {
    const res = await fetch('/api/sms/status');
    if (!res.ok) return { configured: false, adminPhone: '+250796569416', senderPhone: '+250796569416' };
    return await res.json();
  } catch {
    return { configured: false, adminPhone: '+250796569416', senderPhone: '+250796569416' };
  }
}
