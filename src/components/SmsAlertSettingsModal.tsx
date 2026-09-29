import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  X, 
  Check, 
  AlertCircle, 
  Zap, 
  Sliders, 
  ShieldCheck, 
  TrendingDown, 
  Layers, 
  Settings2, 
  Send, 
  Loader2, 
  Info, 
  PhoneCall, 
  Bell, 
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { SmsAlertSettings } from '../types';

interface SmsAlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

const DEFAULT_SETTINGS: SmsAlertSettings = {
  adminAlerts: true,
  driverUpdateAlerts: true,
  clientDeliverySms: true,
};

export const SmsAlertSettingsModal: React.FC<SmsAlertSettingsModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [settings, setSettings] = useState<SmsAlertSettings>(() => {
    try {
      const saved = localStorage.getItem('jd_sms_alert_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; timestamp?: string } | null>(null);
  const [gatewayInfo, setGatewayInfo] = useState<{
    configured: boolean;
    adminPhone: string;
    senderPhone: string;
  }>({
    configured: true,
    adminPhone: '+250796569416',
    senderPhone: '+250796569416',
  });

  // Fetch current settings & status from backend
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    fetch('/api/sms/settings')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.settings) {
          setSettings(data.settings);
          try {
            localStorage.setItem('jd_sms_alert_settings', JSON.stringify(data.settings));
          } catch {}
        }
        if (data.adminPhone || data.senderPhone) {
          setGatewayInfo({
            configured: data.configured !== false,
            adminPhone: data.adminPhone || '+250796569416',
            senderPhone: data.senderPhone || '+250796569416',
          });
        }
      })
      .catch((err) => {
        console.warn('[SMS Settings Fetch Warning]', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof SmsAlertSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/sms/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        try {
          localStorage.setItem('jd_sms_alert_settings', JSON.stringify(settings));
        } catch {}
        if (onNotify) {
          onNotify('SMS alert preferences updated! API usage adjusted.');
        }
        setTimeout(() => onClose(), 450);
      } else {
        if (onNotify) onNotify(data.error || 'Failed saving settings');
      }
    } catch (err: any) {
      if (onNotify) onNotify(err.message || 'Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestSms = async () => {
    setTestSending(true);
    setTestResult(null);
    try {
      const timeStr = new Date().toLocaleTimeString('en-US', { timeZone: 'Africa/Kigali', hour: 'numeric', minute: '2-digit' });
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: gatewayInfo.adminPhone,
          content: `[J&D Test Alert] Live gateway test from SMS Settings at ${timeStr}. Active toggles: Admin (${settings.adminAlerts ? 'ON' : 'OFF'}), Drivers (${settings.driverUpdateAlerts ? 'ON' : 'OFF'}), Client (${settings.clientDeliverySms ? 'ON' : 'OFF'}).`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: `Test SMS dispatched successfully to ${gatewayInfo.adminPhone}! (ID: ${data.messageId || 'ok'})`,
          timestamp: timeStr,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to dispatch test SMS. Verify your SMS_API_KEY.',
          timestamp: timeStr,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error reaching SMS gateway.',
      });
    } finally {
      setTestSending(false);
    }
  };

  // Calculate API consumption metrics
  const activeCount = [settings.adminAlerts, settings.driverUpdateAlerts, settings.clientDeliverySms].filter(Boolean).length;
  const estimatedSmsPer100 = activeCount * 100;
  const savingsPercent = Math.round(((3 - activeCount) / 3) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-[#0f170e] border border-[#2d472c] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#243523] bg-[#142013] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  SMS Alert Settings &amp; API Controls
                </h2>
                <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 font-semibold">
                  httpSMS
                </span>
              </div>
              <p className="text-xs text-[#9eb59b]">
                Toggle individual SMS alerts to conserve your API balance and free-tier credits.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#85AB8B] hover:text-white hover:bg-[#20311e] transition-colors cursor-pointer"
            title="Close (Esc)"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Active Gateway Information Card */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#142113] border border-[#2c3f2b] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#20311f] border border-[#3b533a] flex items-center justify-center text-amber-300">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs sm:text-sm">Connected Phone Gateway</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-300 font-mono">Active</span>
                </div>
                <div className="text-xs text-[#8da68b] font-mono flex items-center gap-2 mt-0.5">
                  <span>Number: <strong className="text-white">{gatewayInfo.adminPhone}</strong></span>
                  <span>•</span>
                  <span>SIM1: <strong className="text-[#9ed3aa]">MTN / Airtel RW</strong></span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#8fa78d] block">API Consumption Mode</span>
              <span className="text-xs font-bold text-amber-300 font-mono">
                {activeCount === 3 ? 'Full Alerts (300/100)' : `${savingsPercent}% Quota Saved`}
              </span>
            </div>
          </div>

          {/* Individual Alert Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#85AB8B] flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                Selectable Alert Categories
              </span>
              <span className="text-[11px] text-[#9eb59b] font-medium">
                {activeCount} of 3 alerts enabled
              </span>
            </div>

            {/* Toggle 1: Admin Alerts */}
            <div className={`p-4 rounded-xl border transition-all ${
              settings.adminAlerts 
                ? 'bg-[#152314] border-[#3e603b] shadow-sm' 
                : 'bg-[#111910] border-[#253323] opacity-80'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">1. Admin Alerts (Dispatch Desk)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      settings.adminAlerts ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {settings.adminAlerts ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-[#b8ccb6] leading-relaxed">
                    Sends an instantaneous SMS to your admin phone (<strong className="text-white">{gatewayInfo.adminPhone}</strong>) whenever a client books a new ride, requests an express parcel delivery, or sends an inquiry to customer support.
                  </p>
                  <div className="text-[11px] text-[#7d9b7a] flex items-center gap-1.5 pt-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Consumption impact: ~1 SMS credit per client booking or support inquiry.</span>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => handleToggle('adminAlerts')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.adminAlerts ? 'bg-emerald-500' : 'bg-gray-700'
                  }`}
                  aria-label="Toggle Admin Alerts"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.adminAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Toggle 2: Driver Update Alerts */}
            <div className={`p-4 rounded-xl border transition-all ${
              settings.driverUpdateAlerts 
                ? 'bg-[#152314] border-[#3e603b] shadow-sm' 
                : 'bg-[#111910] border-[#253323] opacity-80'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">2. Driver Update Alerts</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      settings.driverUpdateAlerts ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {settings.driverUpdateAlerts ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-[#b8ccb6] leading-relaxed">
                    Sends SMS notifications to drivers when new pickups are assigned, dispatch routes update, or when a passenger sends location notes.
                  </p>
                  <div className="text-[11px] text-[#7d9b7a] flex items-center gap-1.5 pt-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Consumption impact: ~1 SMS credit per driver trip dispatch.</span>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => handleToggle('driverUpdateAlerts')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.driverUpdateAlerts ? 'bg-emerald-500' : 'bg-gray-700'
                  }`}
                  aria-label="Toggle Driver Update Alerts"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.driverUpdateAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Toggle 3: Client Delivery SMS */}
            <div className={`p-4 rounded-xl border transition-all ${
              settings.clientDeliverySms 
                ? 'bg-[#152314] border-[#3e603b] shadow-sm' 
                : 'bg-[#111910] border-[#253323] opacity-80'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">3. Client Delivery &amp; Confirmation SMS</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      settings.clientDeliverySms ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {settings.clientDeliverySms ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-[#b8ccb6] leading-relaxed">
                    Dispatches outbound confirmation SMS directly to the passenger or parcel recipient mobile phone (<strong className="text-white">078... / 079...</strong>) containing booking ID, rider phone, and estimated delivery time.
                  </p>
                  <div className="text-[11px] text-[#7d9b7a] flex items-center gap-1.5 pt-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Consumption impact: ~1 SMS credit per passenger trip confirmation.</span>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => handleToggle('clientDeliverySms')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.clientDeliverySms ? 'bg-emerald-500' : 'bg-gray-700'
                  }`}
                  aria-label="Toggle Client Delivery SMS"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.clientDeliverySms ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* API Consumption Savings Meter */}
          <div className="p-4 rounded-xl bg-radial from-[#182a17] to-[#121c11] border border-[#2d472c] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                API Consumption &amp; Quota Optimization
              </span>
              <span className="text-xs font-bold font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
                {savingsPercent}% Savings
              </span>
            </div>

            {/* Savings Progress Bar */}
            <div className="w-full bg-[#1b2a1a] rounded-full h-2.5 overflow-hidden border border-[#2d472c]">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full transition-all duration-300"
                style={{ width: `${Math.max(10, 100 - savingsPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#a4bca2] font-mono">
              <span>Estimated API Usage: <strong className="text-white">{estimatedSmsPer100} SMS</strong> / 100 trips</span>
              <span>Credits Saved: <strong className="text-emerald-300">{(3 - activeCount) * 100} SMS</strong></span>
            </div>

            <p className="text-[11px] text-[#86a184] leading-relaxed pt-1">
              💡 <em>Email notifications to <strong className="text-white">corneliustch@gmail.com</strong> are always free and will never consume your SMS quota, even if all SMS alerts are turned off.</em>
            </p>
          </div>

          {/* Live Test Dispatch */}
          <div className="p-3.5 rounded-xl bg-[#121c11] border border-[#253524] space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-[#c1c9bf]">
                Want to verify your SMS API gateway right now?
              </div>
              <button
                type="button"
                onClick={handleSendTestSms}
                disabled={testSending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#20341e] hover:bg-[#2b4428] text-amber-300 text-xs font-bold rounded-lg border border-amber-400/40 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {testSending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test SMS Now</span>
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div className={`p-2.5 rounded-lg text-xs flex items-start gap-2 animate-fadeIn ${
                testResult.success 
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200' 
                  : 'bg-red-950/70 border border-red-500/40 text-red-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block">{testResult.message}</span>
                  {testResult.timestamp && (
                    <span className="text-[10px] opacity-75 font-mono">Dispatched at {testResult.timestamp} Kigali Time</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#243523] bg-[#142013] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSettings(DEFAULT_SETTINGS)}
            className="flex items-center gap-1.5 text-xs text-[#85AB8B] hover:text-white transition-colors cursor-pointer"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#c1c9bf] hover:text-white hover:bg-[#20311e] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Preferences...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Alert Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
