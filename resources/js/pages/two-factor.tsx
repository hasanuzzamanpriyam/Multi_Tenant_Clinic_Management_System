'use client';

import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    ShieldCheck,
    ShieldAlert,
    QrCode,
    Key,
    Copy,
    Check,
    RefreshCw,
    Trash2,
    ArrowLeft,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TwoFactorProps {
    twoFactorEnabled: boolean;
    twoFactorPending: boolean;
}

export default function TwoFactor({ twoFactorEnabled, twoFactorPending }: TwoFactorProps) {
    const [isEnabled, setIsEnabled] = useState(twoFactorEnabled);
    const [isPending, setIsPending] = useState(twoFactorPending);
    const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    const [confirmCode, setConfirmCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmError, setConfirmError] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState(false);

    // If pending or enabled, fetch setup info or recovery codes
    useEffect(() => {
        if (isPending) {
            fetchSetupData();
        } else if (isEnabled) {
            fetchRecoveryCodes();
        }
    }, [isEnabled, isPending]);

    const getCsrfToken = () => {
        return (
            (typeof document !== 'undefined'
                ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                : '') || ''
        );
    };

    const fetchSetupData = async () => {
        try {
            const qrRes = await fetch('/user/two-factor-qr-code', {
                headers: { Accept: 'application/json' },
            });
            if (qrRes.ok) {
                const qrData = await qrRes.json();
                if (qrData.svg) {
                    setQrCodeSvg(qrData.svg);
                }
            }

            const secretRes = await fetch('/user/two-factor-secret-key', {
                headers: { Accept: 'application/json' },
            });
            if (secretRes.ok) {
                const secretData = await secretRes.json();
                if (secretData.secretKey) {
                    setSecretKey(secretData.secretKey);
                }
            }
        } catch (e) {
            console.error('Failed to load 2FA setup data', e);
        }
    };

    const fetchRecoveryCodes = async () => {
        try {
            const res = await fetch('/user/two-factor-recovery-codes', {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const codes = await res.json();
                setRecoveryCodes(codes);
            }
        } catch (e) {
            console.error('Failed to load recovery codes', e);
        }
    };

    const handleEnable = async () => {
        setLoading(true);
        setConfirmError(null);
        try {
            const res = await fetch('/user/two-factor-authentication', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (res.ok) {
                setIsPending(true);
                await fetchSetupData();
            }
        } catch (e) {
            console.error('Failed to enable 2FA', e);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirmCode.trim()) return;

        setLoading(true);
        setConfirmError(null);

        try {
            const res = await fetch('/user/confirmed-two-factor-authentication', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ code: confirmCode }),
            });

            if (res.ok) {
                setIsPending(false);
                setIsEnabled(true);
                setQrCodeSvg(null);
                setSecretKey(null);
                setConfirmCode('');
                await fetchRecoveryCodes();
                setShowRecoveryCodes(true);
            } else {
                setConfirmError('Invalid verification code. Please check your authenticator app and try again.');
            }
        } catch (e) {
            setConfirmError('Failed to confirm code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!confirm('Are you sure you want to disable two-factor authentication? Your account security will be reduced.')) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/user/two-factor-authentication', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (res.ok) {
                setIsEnabled(false);
                setIsPending(false);
                setQrCodeSvg(null);
                setSecretKey(null);
                setRecoveryCodes([]);
                setShowRecoveryCodes(false);
            }
        } catch (e) {
            console.error('Failed to disable 2FA', e);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateCodes = async () => {
        setLoading(true);
        try {
            const res = await fetch('/user/two-factor-recovery-codes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (res.ok) {
                await fetchRecoveryCodes();
                setShowRecoveryCodes(true);
            }
        } catch (e) {
            console.error('Failed to regenerate recovery codes', e);
        } finally {
            setLoading(false);
        }
    };

    const copySecretKey = () => {
        if (secretKey) {
            navigator.clipboard.writeText(secretKey);
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        }
    };

    const copyAllCodes = () => {
        if (recoveryCodes.length > 0) {
            navigator.clipboard.writeText(recoveryCodes.join('\n'));
            setCopiedCodes(true);
            setTimeout(() => setCopiedCodes(false), 2000);
        }
    };

    return (
        <>
            <Head title="Two-Factor Authentication — ClinicPro" />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                            <Shield className="h-6 w-6 text-[#0080FF]" />
                            Two-Factor Authentication (2FA)
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Secure your medical practice account using Time-based One-Time Passwords (TOTP)
                        </p>
                    </div>

                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Status Card */}
                <Card className="border border-slate-200/90 dark:border-slate-800">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold">Security Status</CardTitle>
                            {isEnabled ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold gap-1">
                                    <ShieldCheck className="h-3.5 w-3.5" /> 2FA Active
                                </Badge>
                            ) : isPending ? (
                                <Badge className="bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold gap-1">
                                    <AlertCircle className="h-3.5 w-3.5" /> Confirmation Required
                                </Badge>
                            ) : (
                                <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold gap-1">
                                    <ShieldAlert className="h-3.5 w-3.5" /> 2FA Disabled
                                </Badge>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="pt-5 space-y-6">
                        {/* 1. When 2FA is Fully Active */}
                        {isEnabled && (
                            <div className="space-y-6">
                                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                                        <p className="font-bold text-sm">Two-factor authentication is active on your account.</p>
                                        <p className="text-emerald-800/80 dark:text-emerald-300/80">
                                            Whenever you sign in, you will be prompted to enter a 6-digit verification code generated by your authenticator app.
                                        </p>
                                    </div>
                                </div>

                                {/* Recovery Codes Section */}
                                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Key className="h-4 w-4 text-[#0080FF]" /> Emergency Recovery Codes
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Use these emergency codes if you lose access to your authenticator device. Each code can be used once.
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
                                                className="text-xs"
                                            >
                                                {showRecoveryCodes ? 'Hide Codes' : 'View Codes'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRegenerateCodes}
                                                disabled={loading}
                                                className="text-xs gap-1"
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                                            </Button>
                                        </div>
                                    </div>

                                    {showRecoveryCodes && recoveryCodes.length > 0 && (
                                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                    One-Time Recovery Keys
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={copyAllCodes}
                                                    className="h-7 text-xs gap-1 text-[#0080FF]"
                                                >
                                                    {copiedCodes ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                                    {copiedCodes ? 'Copied All' : 'Copy All Codes'}
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-slate-800 dark:text-slate-200">
                                                {recoveryCodes.map((code, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center tracking-wider font-semibold"
                                                    >
                                                        {code}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDisable}
                                        disabled={loading}
                                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 text-xs gap-1.5"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Disable Two-Factor Authentication
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 2. When 2FA is Pending Confirmation (Setup mode) */}
                        {!isEnabled && isPending && (
                            <div className="space-y-6">
                                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                                    <Smartphone className="h-5 w-5 text-[#0080FF] shrink-0 mt-0.5" />
                                    <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
                                        <p className="font-bold text-sm">Finish Setting Up 2FA</p>
                                        <p className="text-blue-800/80 dark:text-blue-300/80">
                                            Scan the QR code below using Google Authenticator, Microsoft Authenticator, Authy, or 1Password, then enter the 6-digit code.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
                                    {qrCodeSvg ? (
                                        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-md">
                                            <div
                                                className="w-48 h-48 flex items-center justify-center"
                                                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-48 h-48 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    )}

                                    <div className="space-y-3 max-w-sm text-center sm:text-left">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Or enter the secret key manually:
                                        </p>
                                        {secretKey ? (
                                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all">
                                                <span className="flex-1 tracking-wider">{secretKey}</span>
                                                <button
                                                    type="button"
                                                    onClick={copySecretKey}
                                                    className="p-1 text-slate-400 hover:text-[#0080FF]"
                                                >
                                                    {copiedKey ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400">Loading setup key...</p>
                                        )}
                                        <p className="text-[11px] text-slate-500">
                                            Type: Time-based (TOTP) • 6 digits • 30 seconds
                                        </p>
                                    </div>
                                </div>

                                {/* Confirmation Form */}
                                <form onSubmit={handleConfirm} className="max-w-sm mx-auto space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="space-y-1.5 text-center">
                                        <Label htmlFor="code" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Enter 6-Digit Authenticator Code
                                        </Label>
                                        <Input
                                            id="code"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            value={confirmCode}
                                            onChange={(e) => setConfirmCode(e.target.value)}
                                            placeholder="000000"
                                            className="text-center text-2xl font-bold tracking-[0.4em] h-12 focus-visible:ring-[#0080FF]"
                                            autoFocus
                                            required
                                        />
                                        {confirmError && (
                                            <p className="text-xs text-rose-500 font-medium mt-1">{confirmError}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2.5">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleDisable}
                                            disabled={loading}
                                            className="flex-1 text-xs"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={loading || confirmCode.length < 6}
                                            className="flex-1 bg-[#0080FF] hover:bg-[#0070E0] text-white font-bold text-xs"
                                        >
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                                            Confirm & Enable
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* 3. When 2FA is Disabled */}
                        {!isEnabled && !isPending && (
                            <div className="space-y-6 text-center py-6">
                                <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0080FF] flex items-center justify-center mx-auto mb-2 shadow-xs">
                                    <Shield className="h-8 w-8" />
                                </div>

                                <div className="max-w-md mx-auto space-y-2">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Protect Your Clinic Account
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Two-factor authentication adds an essential layer of security for healthcare administrators, doctors, and patients. Protect clinical records against unauthorized password access.
                                    </p>
                                </div>

                                <div>
                                    <Button
                                        onClick={handleEnable}
                                        disabled={loading}
                                        className="bg-[#0080FF] hover:bg-[#0070E0] text-white font-bold px-6 py-2.5 h-11 rounded-xl shadow-sm text-sm gap-2"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                        Enable Two-Factor Authentication
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
