'use client';

import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  User,
  Mail,
  Phone,
  Lock,
  Key,
  Shield,
  QrCode,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Settings,
  Building2,
  X,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    age: number | null;
    gender: string | null;
    role: string;
    tenant_id: number;
    two_factor_confirmed_at: string | null;
    tenant: {
        name: string;
    } | null;
}

interface ProfilePageProps {
    user: User;
    canManageTwoFactor: boolean;
}

export default function ProfileEdit({ user, canManageTwoFactor }: ProfilePageProps) {
    // Active tab state
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | '2fa'>('profile');

    // Profile Information Form
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        age: user.age?.toString() || '',
        gender: user.gender || '',
    });

    // Password Form
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // 2FA State
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [confirmCode, setConfirmCode] = useState('');

    // Fetch QR code when 2FA is enabled
    useEffect(() => {
        if (user.two_factor_confirmed_at) {
            fetchQrCode();
        }
    }, [user.two_factor_confirmed_at]);

    const fetchQrCode = async () => {
        try {
            const response = await fetch('/user/two-factor-qr-code');
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setQrCode(url);
            }
        } catch (error) {
            console.error('Failed to fetch QR code:', error);
        }
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put(route('user-profile-information.update'), {
            onSuccess: () => {},
            onError: (errors) => console.log('Profile update errors:', errors),
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put(route('user-password.update'), {
            onSuccess: () => {
                passwordForm.reset('current_password', 'password', 'password_confirmation');
            },
        });
    };

    const handleEnable2FA = async () => {
        try {
            const response = await fetch(route('two-factor.enable'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.svg) {
                    setQrCode(`data:image/svg+xml;base64,${btoa(data.svg)}`);
                }
            } else {
                console.error('Failed to enable 2FA');
            }
        } catch (error) {
            console.error('Failed to enable 2FA:', error);
        }
    };

    const handleConfirm2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            const response = await fetch(route('two-factor.confirm'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            if (response.ok) {
                window.location.reload();
            } else {
                console.error('Failed to confirm 2FA');
            }
        } catch (error) {
            console.error('Failed to confirm 2FA:', error);
        }
    };

    const handleDisable2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to disable two-factor authentication?')) {
            return;
        }

        try {
            const response = await fetch(route('two-factor.disable'), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                window.location.reload();
            } else {
                console.error('Failed to disable 2FA');
            }
        } catch (error) {
            console.error('Failed to disable 2FA:', error);
        }
    };

    const handleRegenerateRecoveryCodes = async () => {
        try {
            const response = await fetch(route('two-factor.regenerate-recovery-codes'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setRecoveryCodes(data.recovery_codes);
                setShowRecoveryCodes(true);
            } else {
                console.error('Failed to regenerate recovery codes');
            }
        } catch (error) {
            console.error('Failed to regenerate recovery codes:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(text);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const formatRole = (role: string) => {
        return role
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const genderOptions = [
        { value: '', label: 'Select Gender' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ];

    const tabButtons = [
        { id: 'profile', label: 'Profile', icon: User, disabled: false },
        { id: 'password', label: 'Password', icon: Lock, disabled: false },
        { id: '2fa', label: '2FA', icon: Shield, disabled: !canManageTwoFactor },
    ];

    return (
        <>
            <Head title="Profile Settings" />
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings, password, and security preferences</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {tabButtons.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => !tab.disabled && setActiveTab(tab.id as 'profile' | 'password' | '2fa')}
                            disabled={tab.disabled}
                            className={cn(
                                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                                activeTab === tab.id
                                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600',
                                tab.disabled && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Profile Information Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Profile Information
                                </CardTitle>
                                <CardDescription>Update your personal information and contact details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={profileForm.data.name}
                                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                                className={cn(profileForm.errors.name && 'border-red-500 focus-visible:ring-red-500')}
                                                required
                                            />
                                            {profileForm.errors.name && (
                                                <p className="text-sm text-red-500">{profileForm.errors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileForm.data.email}
                                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                                className={cn(profileForm.errors.email && 'border-red-500 focus-visible:ring-red-500')}
                                                required
                                            />
                                            {profileForm.errors.email && (
                                                <p className="text-sm text-red-500">{profileForm.errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={profileForm.data.phone}
                                                onChange={(e) => profileForm.setData('phone', e.target.value)}
                                                placeholder="+1 (555) 000-0000"
                                                className={cn(profileForm.errors.phone && 'border-red-500 focus-visible:ring-red-500')}
                                            />
                                            {profileForm.errors.phone && (
                                                <p className="text-sm text-red-500">{profileForm.errors.phone}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="age">Age</Label>
                                            <Input
                                                id="age"
                                                type="number"
                                                value={profileForm.data.age}
                                                onChange={(e) => profileForm.setData('age', e.target.value)}
                                                min="0"
                                                max="150"
                                                placeholder="30"
                                                className={cn(profileForm.errors.age && 'border-red-500 focus-visible:ring-red-500')}
                                            />
                                            {profileForm.errors.age && (
                                                <p className="text-sm text-red-500">{profileForm.errors.age}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Gender</Label>
                                        <Select value={profileForm.data.gender} onValueChange={(v) => profileForm.setData('gender', v)}>
                                            <SelectTrigger className={cn(profileForm.errors.gender && 'border-red-500 focus-visible:ring-red-500')}>
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {genderOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {profileForm.errors.gender && (
                                            <p className="text-sm text-red-500">{profileForm.errors.gender}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <Button type="submit" disabled={profileForm.processing}>
                                            {profileForm.processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Clinic Info Card */}
                        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Clinic Information
                                </CardTitle>
                                <CardDescription>Your assigned clinic (managed by administrators)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{user.tenant?.name || 'No clinic assigned'}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Role: {formatRole(user.role)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    Update Password
                                </CardTitle>
                                <CardDescription>Ensure your account is using a strong, unique password</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="current_password"
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={passwordForm.data.current_password}
                                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                className={cn('pr-10', passwordForm.errors.current_password && 'border-red-500 focus-visible:ring-red-500')}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {passwordForm.errors.current_password && (
                                            <p className="text-sm text-red-500">{passwordForm.errors.current_password}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={passwordForm.data.password}
                                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                className={cn('pr-10', passwordForm.errors.password && 'border-red-500 focus-visible:ring-red-500')}
                                                required
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {passwordForm.errors.password && (
                                            <p className="text-sm text-red-500">{passwordForm.errors.password}</p>
                                        )}
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Must be at least 8 characters.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={passwordForm.data.password_confirmation}
                                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                className={cn('pr-10', passwordForm.errors.password_confirmation && 'border-red-500 focus-visible:ring-red-500')}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {passwordForm.errors.password_confirmation && (
                                            <p className="text-sm text-red-500">{passwordForm.errors.password_confirmation}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <Button type="submit" disabled={passwordForm.processing}>
                                            {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Security Tip */}
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-800 dark:text-amber-200">Security Tip</p>
                                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                        Use a unique, strong password. Consider using a password manager to generate and store secure passwords.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Two-Factor Authentication Tab */}
                {activeTab === '2fa' && (
                    <div className="space-y-6">
                        {canManageTwoFactor ? (
                            <>
                                {!user.two_factor_confirmed_at ? (
                                    // 2FA Not Enabled
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                Two-Factor Authentication
                                            </CardTitle>
                                            <CardDescription>Add an extra layer of security to your account</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium text-amber-800 dark:text-amber-200">Two-factor authentication is not enabled</p>
                                                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                                            Enable it to protect your account with a time-based one-time password (TOTP).
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center space-y-4">
                                                <div className="max-w-md mx-auto p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Enable 2FA</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                        Scan the QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.) and enter the 6-digit code to confirm.
                                                    </p>
                                                    <Button
                                                        onClick={handleEnable2FA}
                                                        disabled={profileForm.processing || passwordForm.processing}
                                                        className="w-full"
                                                    >
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        Enable Two-Factor Authentication
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* 2FA Confirmation Form (shown after enabling) */}
                                            {qrCode && (
                                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Setup</h3>
                                                    <div className="flex items-center justify-center gap-6 flex-wrap">
                                                        <div className="text-center">
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Scan QR Code</p>
                                                            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                                <img
                                                                    src={qrCode}
                                                                    alt="Two-factor authentication QR code"
                                                                    className="w-48 h-48"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Or Enter Secret Key</p>
                                                            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-lg text-gray-900 dark:text-white">
                                                                {secretKey || 'Loading...'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <form onSubmit={handleConfirm2FA} className="space-y-4 max-w-md mx-auto">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="code">6-Digit Code</Label>
                                                            <Input
                                                                id="code"
                                                                type="text"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                maxLength={6}
                                                                value={confirmCode}
                                                                onChange={(e) => setConfirmCode(e.target.value)}
                                                                placeholder="000000"
                                                                autoComplete="one-time-code"
                                                                className="text-center text-2xl tracking-widest"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="flex justify-center">
                                                            <Button type="submit" disabled={passwordForm.processing}>
                                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                Confirm & Enable
                                                            </Button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ) : (
                                    // 2FA Enabled
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                Two-Factor Authentication
                                            </CardTitle>
                                            <CardDescription>Two-factor authentication is enabled</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                        <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">2FA Enabled</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Enabled on {new Date(user.two_factor_confirmed_at!).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <hr className="border-gray-200 dark:border-gray-700" />

                                            {/* Recovery Codes */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recovery Codes</h3>
                                                    <Button variant="outline" size="sm" onClick={handleRegenerateRecoveryCodes} disabled={passwordForm.processing}>
                                                        <Key className="h-4 w-4 mr-2" />
                                                        Regenerate Codes
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Save these codes in a secure place. Each code can be used once to access your account if you lose access to your authenticator app.
                                                </p>

                                                {showRecoveryCodes && recoveryCodes.length > 0 && (
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                            {recoveryCodes.map((code, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                                >
                                                                    <code className="font-mono text-sm text-gray-900 dark:text-white bg-transparent px-2 py-1">
                                                                        {code}
                                                                    </code>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => copyToClipboard(code)}
                                                                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                                        aria-label="Copy recovery code"
                                                                    >
                                                                        {copiedCode === code ? (
                                                                            <Check className="h-4 w-4 text-green-500" />
                                                                        ) : (
                                                                            <Copy className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Button variant="ghost" size="sm" onClick={() => setShowRecoveryCodes(false)}>
                                                            <ChevronUp className="h-4 w-4 mr-2" />
                                                            Hide Codes
                                                        </Button>
                                                    </div>
                                                )}

                                                {!showRecoveryCodes && (
                                                    <Button variant="outline" onClick={() => setShowRecoveryCodes(true)}>
                                                        <ChevronDown className="h-4 w-4 mr-2" />
                                                        Show Recovery Codes
                                                    </Button>
                                                )}
                                            </div>

                                            <hr className="border-gray-200 dark:border-gray-700" />

                                            {/* Disable 2FA */}
                                            <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-red-800 dark:text-red-200">Danger Zone</h4>
                                                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                                            Disabling two-factor authentication will make your account less secure. You will no longer need to enter a 6-digit code when signing in.
                                                        </p>
                                                    </div>
                                                </div>
                                                <form onSubmit={handleDisable2FA}>
                                                    <Button variant="destructive" disabled={passwordForm.processing}>
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Disable Two-Factor Authentication
                                                    </Button>
                                                </form>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Two-Factor Authentication
                                    </CardTitle>
                                    <CardDescription>Two-factor authentication management is not available</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-gray-200">Two-Factor Authentication Unavailable</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Two-factor authentication is not configured for this application. Contact your administrator for more information.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}