import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  LogOut, 
  Table, 
  Database,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { 
  googleSignIn, 
  logoutGoogle, 
  initAuth, 
  listUserSpreadsheets, 
  createKigaliFleetSpreadsheet, 
  readSpreadsheetValues, 
  SpreadsheetSummary,
  SCOPES 
} from '../utils/googleWorkspace';
import { BookingState, DriverApplication, ClientAccount } from '../types';
import { User } from 'firebase/auth';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBooking: BookingState | null;
  pilotProfile: DriverApplication | null;
  clientProfile: ClientAccount | null;
  onNotify: (msg: string) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  activeBooking,
  pilotProfile,
  clientProfile,
  onNotify,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetSummary[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [sheetPreviewData, setSheetPreviewData] = useState<string[][]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // User confirmation dialog state for destructive/mutating operations
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
      },
      () => {
        // User logged out or needs fresh token
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch spreadsheets once token is available and modal is open
  useEffect(() => {
    if (isOpen && token) {
      loadSpreadsheets(token);
    }
  }, [isOpen, token]);

  const loadSpreadsheets = async (accessToken: string) => {
    setIsLoadingSheets(true);
    try {
      const list = await listUserSpreadsheets(accessToken);
      setSpreadsheets(list);
      if (list.length > 0 && !selectedSheetId) {
        setSelectedSheetId(list[0].id);
        loadPreview(accessToken, list[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching sheets:', err);
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const loadPreview = async (accessToken: string, sheetId: string) => {
    setIsLoadingPreview(true);
    try {
      const rows = await readSpreadsheetValues(accessToken, sheetId, 'A1:H15');
      setSheetPreviewData(rows);
    } catch (err) {
      console.warn('Could not read preview data', err);
      setSheetPreviewData([]);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        onNotify(`Connected to Google Sheets as ${res.user.displayName || res.user.email}!`);
        await loadSpreadsheets(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      onNotify('Google sign-in was cancelled or encountered an error.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setSpreadsheets([]);
    setSelectedSheetId(null);
    setSheetPreviewData([]);
    onNotify('Disconnected from Google Sheets.');
  };

  // Initiates create & sync master sheet with user confirmation dialog
  const promptCreateMasterSheet = () => {
    if (!token) return;
    setConfirmationDialog({
      isOpen: true,
      title: 'Create Master Kigali Fleet Spreadsheet?',
      description:
        'This will create a new Google Spreadsheet named "JD Smooth Rides Kigali - Master Fleet & Dispatch" in your Google Drive with tabs for Active Rides, Verified Pilots, and Client Accounts.',
      actionLabel: 'Confirm & Create Spreadsheet',
      onConfirm: async () => {
        setConfirmationDialog(null);
        await executeCreateMasterSheet();
      },
    });
  };

  const executeCreateMasterSheet = async () => {
    if (!token) return;
    setSyncStatus('Creating and populating Google Sheet...');
    try {
      const bookings: BookingState[] = activeBooking ? [activeBooking] : [];
      const pilots: DriverApplication[] = pilotProfile ? [pilotProfile] : [];
      const clients: ClientAccount[] = clientProfile ? [clientProfile] : [];

      const result = await createKigaliFleetSpreadsheet(token, bookings, pilots, clients);
      setSyncStatus(`Created successfully!`);
      onNotify('Google Sheet created and synchronized with JD Smooth Rides data!');
      await loadSpreadsheets(token);
      setSelectedSheetId(result.spreadsheetId);
      await loadPreview(token, result.spreadsheetId);
    } catch (err: any) {
      console.error('Error creating spreadsheet:', err);
      setSyncStatus('Failed to create sheet.');
      onNotify('Failed to create Google Sheet: ' + (err.message || 'Unknown error'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="google-sheets-modal-card"
        className="relative w-full max-w-4xl bg-[#121c11] border border-[#85AB8B]/40 rounded-3xl p-5 sm:p-8 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0F9D58] via-[#34A853] to-[#9ed3aa]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#243522] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0F9D58]/20 border border-[#0F9D58]/40 flex items-center justify-center text-[#34A853]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Google Sheets Hub</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F9D58]/20 text-[#68d391] border border-[#0F9D58]/40">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-[#a2b59f]">Sync Kigali moto rides, pilot registries, and passenger accounts live to Google Sheets.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1b2b19] hover:bg-[#253d23] text-[#a2b59f] hover:text-white flex items-center justify-center transition-colors"
            title="Close modal"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {!token || !user ? (
          /* Unauthenticated State: Show Sign in with Google */
          <div className="text-center py-10 px-4 sm:px-12 bg-[#172516]/60 rounded-3xl border border-[#2b4129]">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-[#0F9D58]/15 border border-[#34A853]/30 flex items-center justify-center text-[#34A853] mb-4 shadow-inner">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Connect Google Sheets to JD Smooth Rides</h4>
            <p className="text-sm text-[#b2c5af] max-w-md mx-auto mb-6 leading-relaxed">
              Connect your Google Workspace account with permission to automatically synchronize ride bookings, pilot applications, and corporate accounts directly into your Google Spreadsheets.
            </p>

            {/* Official Material Google Sign-In Button */}
            <div className="flex justify-center mb-6">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoadingAuth}
                className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoadingAuth ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-[#8da58b] bg-[#121c11] px-4 py-2 rounded-full border border-[#2b4129]">
              <Shield className="w-3.5 h-3.5 text-[#34A853]" />
              <span>Requested Scopes: Google Drive & Google Sheets API</span>
            </div>
          </div>
        ) : (
          /* Authenticated State: Google Sheets Hub */
          <div className="space-y-6">
            {/* User Profile Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#172516] border border-[#2c422a]">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Google User'} className="w-10 h-10 rounded-full border border-[#34A853]" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#34A853] text-white flex items-center justify-center font-bold">
                    {(user.displayName || user.email || 'G')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {user.displayName || 'Google Account Connected'}
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-xs text-[#9eb79c]">{user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={promptCreateMasterSheet}
                  className="px-4 py-2 bg-[#0F9D58] hover:bg-[#0c8248] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create / Sync Master Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadSpreadsheets(token)}
                  disabled={isLoadingSheets}
                  className="p-2 bg-[#20311f] hover:bg-[#2b422a] text-[#b3c7b0] hover:text-white rounded-xl border border-[#314a2f] transition-colors"
                  title="Refresh spreadsheets list"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingSheets ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-2 bg-[#2a1e1e] hover:bg-[#3d2727] text-rose-300 hover:text-rose-100 rounded-xl border border-rose-900/40 transition-colors"
                  title="Sign out of Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {syncStatus && (
              <div className="p-3 bg-[#17301c] border border-[#34A853]/40 rounded-xl text-xs text-[#a3f0be] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                <span>{syncStatus}</span>
              </div>
            )}

            {/* Split View: Spreadsheets List + Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Left Column: List of Spreadsheets */}
              <div className="md:col-span-1 space-y-3 bg-[#162315] p-4 rounded-2xl border border-[#273c25]">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-[#b5ceb2] uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#34A853]" />
                    Your Spreadsheets
                  </h5>
                  <span className="text-[10px] text-[#7d967a]">{spreadsheets.length} found</span>
                </div>

                {isLoadingSheets ? (
                  <div className="py-8 text-center text-xs text-[#8ea58b]">Loading spreadsheets...</div>
                ) : spreadsheets.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#8ea58b]">
                    No spreadsheets found. Click <strong className="text-white">Create / Sync Master Sheet</strong> to generate one.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {spreadsheets.map((sheet) => (
                      <div
                        key={sheet.id}
                        onClick={() => {
                          setSelectedSheetId(sheet.id);
                          loadPreview(token, sheet.id);
                        }}
                        className={`p-3 rounded-xl cursor-pointer border text-left transition-all ${
                          selectedSheetId === sheet.id
                            ? 'bg-[#223921] border-[#34A853] text-white shadow-md'
                            : 'bg-[#1b2b19]/60 hover:bg-[#1f331d] border-[#294027] text-[#c2d7bf]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-bold truncate">{sheet.name}</div>
                          <a
                            href={sheet.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#68d391] hover:text-white shrink-0"
                            title="Open in Google Sheets"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="text-[10px] text-[#7d967a] mt-1">
                          Updated: {new Date(sheet.modifiedTime).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Sheet Table Preview */}
              <div className="md:col-span-2 space-y-3 bg-[#162315] p-4 rounded-2xl border border-[#273c25]">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-[#b5ceb2] uppercase tracking-wider flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-[#34A853]" />
                    Live Sheet Preview
                  </h5>
                  {selectedSheetId && (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${selectedSheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#68d391] hover:underline flex items-center gap-1"
                    >
                      <span>Open in Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {isLoadingPreview ? (
                  <div className="py-16 text-center text-xs text-[#8ea58b]">Loading preview...</div>
                ) : sheetPreviewData.length === 0 ? (
                  <div className="py-16 text-center text-xs text-[#8ea58b]">
                    No preview data available or empty spreadsheet.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-72 rounded-xl border border-[#273d25] bg-[#0f170e]">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#1c2d1b] border-b border-[#2b4429] text-[#9ed3aa]">
                          {sheetPreviewData[0]?.map((header, idx) => (
                            <th key={idx} className="p-2.5 font-bold whitespace-nowrap">
                              {header || `Col ${idx + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sheetPreviewData.slice(1).map((row, rowIdx) => (
                          <tr
                            key={rowIdx}
                            className="border-b border-[#1b2b1a] hover:bg-[#162315]/80 transition-colors"
                          >
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="p-2.5 text-[#c5dac2] whitespace-nowrap">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="p-4 rounded-2xl bg-[#172516] border border-[#2c422a] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#9ebd9b]">
                <Layers className="w-4 h-4 text-[#34A853]" />
                <span>Automatic 2-way sync enabled for active ride dispatch and driver verification records.</span>
              </div>
              <button
                type="button"
                onClick={promptCreateMasterSheet}
                className="px-4 py-2 bg-[#253f23] hover:bg-[#31532f] text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Export Current App State to Sheets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Mutating / Destructive Operations (MANDATORY per Workspace skill) */}
        {confirmationDialog?.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md bg-[#182617] border border-[#34A853]/60 rounded-3xl p-6 shadow-2xl text-[#d9e6d2]">
              <div className="w-12 h-12 rounded-2xl bg-[#0F9D58]/20 border border-[#34A853]/50 flex items-center justify-center text-[#34A853] mb-4">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{confirmationDialog.title}</h4>
              <p className="text-xs text-[#a9c2a6] leading-relaxed mb-6">{confirmationDialog.description}</p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmationDialog(null)}
                  className="px-4 py-2.5 bg-[#253623] hover:bg-[#30452d] text-[#b6cdb3] rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmationDialog.onConfirm}
                  className="px-4 py-2.5 bg-[#0F9D58] hover:bg-[#0c8248] text-white rounded-xl text-xs font-bold shadow-lg transition-all"
                >
                  {confirmationDialog.actionLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
