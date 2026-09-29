import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { BookingState, DriverApplication, ClientAccount } from '../types';

// Scopes required for Google Drive & Google Sheets
export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
];

// Initialize Firebase App safely (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account'
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// Cache the access token in memory (never localStorage per security rules)
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might need re-fetching through interactive sign-in
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Interactive Sign In with Google
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google OAuth access token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// -------------------------------------------------------------
// Google Drive & Sheets API Operations
// -------------------------------------------------------------

export interface SpreadsheetSummary {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
}

// List user spreadsheets from Google Drive
export const listUserSpreadsheets = async (accessToken: string): Promise<SpreadsheetSummary[]> => {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=15`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list spreadsheets: ${errorText}`);
  }

  const data = await res.json();
  return (data.files || []).map((file: any) => ({
    id: file.id,
    name: file.name,
    modifiedTime: file.modifiedTime,
    webViewLink: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
  }));
};

// Fetch sheet values
export const readSpreadsheetValues = async (
  accessToken: string,
  spreadsheetId: string,
  range: string = 'A1:Z50'
): Promise<string[][]> => {
  const encodedRange = encodeURIComponent(range);
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to read sheet data: ${errorText}`);
  }

  const data = await res.json();
  return data.values || [];
};

// Fetch spreadsheet details (tabs/sheet names)
export const getSpreadsheetMetadata = async (accessToken: string, spreadsheetId: string) => {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to read spreadsheet metadata: ${errorText}`);
  }

  return await res.json();
};

// Create the Master "JD Smooth Rides Kigali - Fleet & Dispatch" Spreadsheet
export const createKigaliFleetSpreadsheet = async (
  accessToken: string,
  initialBookings: BookingState[] = [],
  pilots: DriverApplication[] = [],
  clients: ClientAccount[] = []
): Promise<{ spreadsheetId: string; url: string }> => {
  const dateStr = new Date().toISOString().split('T')[0];
  const title = `JD Smooth Rides Kigali - Master Fleet & Dispatch (${dateStr})`;

  // 1. Create spreadsheet with 3 tabs
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Active Rides & Dispatches',
            gridProperties: { rowCount: 100, columnCount: 12 },
          },
        },
        {
          properties: {
            title: 'Verified Pilots Registry',
            gridProperties: { rowCount: 50, columnCount: 10 },
          },
        },
        {
          properties: {
            title: 'Passenger & Corporate Accounts',
            gridProperties: { rowCount: 50, columnCount: 8 },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create spreadsheet: ${errorText}`);
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;

  // 2. Populate Header & Data for all tabs via batchUpdate
  const rideRows: (string | number)[][] = [
    [
      'Trip ID',
      'Type',
      'Passenger Name',
      'Passenger Phone',
      'Pickup Location',
      'Dropoff Location',
      'Distance (km)',
      'Agreed Fare (RWF)',
      'Assigned Pilot',
      'Plate Number',
      'Trip Status',
      'Timestamp (UTC)'
    ],
    ...initialBookings.map((b) => [
      b.id,
      b.type.toUpperCase(),
      b.passengerName,
      b.phone,
      b.pickup,
      b.dropoff,
      b.distanceKm,
      b.fareRwf,
      b.driver?.name || 'Assigned Pilot',
      b.driver?.plateNumber || 'RAC 412B',
      b.status,
      b.createdAt || new Date().toISOString()
    ])
  ];

  const pilotRows: (string | number)[][] = [
    [
      'Full Name',
      'Phone Number',
      'MoMo Payout Number',
      'National ID',
      'Class A License',
      'Bike Plate',
      'Bike Model',
      'Experience (Years)',
      'Preferred Zone',
      'Verification Status'
    ],
    ...pilots.map((p) => [
      p.fullName,
      p.phone,
      p.momoNumber,
      p.nationalId,
      p.drivingLicenseClassA,
      p.bikePlate,
      p.bikeModel,
      p.experienceYears,
      p.preferredZone,
      'VERIFIED & ACTIVE'
    ])
  ];

  const clientRows: (string | number)[][] = [
    [
      'Account Name',
      'Account Type',
      'Phone / WhatsApp',
      'Email',
      'MoMo Number',
      'Preferred Zone',
      'Total Trips',
      'Status'
    ],
    ...clients.map((c) => [
      c.fullName,
      c.accountType.toUpperCase(),
      c.phone,
      c.email || 'N/A',
      c.momoNumber,
      c.preferredSector || 'Kigali Central',
      c.totalTrips || 0,
      'ACTIVE'
    ])
  ];

  // Batch update values
  const batchData = [
    {
      range: "'Active Rides & Dispatches'!A1:L" + (rideRows.length + 1),
      values: rideRows,
    },
    {
      range: "'Verified Pilots Registry'!A1:J" + (pilotRows.length + 1),
      values: pilotRows,
    },
    {
      range: "'Passenger & Corporate Accounts'!A1:H" + (clientRows.length + 1),
      values: clientRows,
    },
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      }),
    }
  );

  if (!updateRes.ok) {
    console.warn('Batch data insertion partial response:', await updateRes.text());
  }

  return {
    spreadsheetId,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
};

// Append a single ride booking to an existing spreadsheet
export const appendBookingToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  booking: BookingState,
  tabName: string = 'Active Rides & Dispatches'
) => {
  const row = [
    booking.id,
    booking.type.toUpperCase(),
    booking.passengerName,
    booking.phone,
    booking.pickup,
    booking.dropoff,
    booking.distanceKm,
    booking.fareRwf,
    booking.driver?.name || 'Pilot',
    booking.driver?.plateNumber || 'RAC 412B',
    booking.status,
    booking.createdAt || new Date().toISOString()
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tabName)}!A:L:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to append to sheet: ${errorText}`);
  }

  return await res.json();
};
