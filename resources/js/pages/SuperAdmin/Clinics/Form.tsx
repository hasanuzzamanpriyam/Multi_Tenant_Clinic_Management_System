'use client';

import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface ClinicFormProps {
    clinic?: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
    };
}

export default function ClinicForm({ clinic }: ClinicFormProps) {
    const isEditing = !!clinic;

    const { data, setData, post, put, processing, errors } = useForm({
        name: clinic?.name || '',
        email: clinic?.email || '',
        phone: clinic?.phone || '',
        address: clinic?.address || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.clinics.update', clinic!.id));
        } else {
            post(route('admin.clinics.store'));
        }
    };

    useEffect(() => {
        if (clinic) {
            setData('name', clinic.name);
            setData('email', clinic.email);
            setData('phone', clinic.phone || '');
            setData('address', clinic.address || '');
        }
    }, [clinic]);

    return (
        <>
            <Head title={isEditing ? 'Edit Clinic' : 'Create Clinic'} />
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isEditing ? 'Edit Clinic' : 'Create New Clinic'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {isEditing
                                ? 'Update clinic information'
                                : 'Add a new clinic to the system'}
                        </p>
                    </div>
                    <Link href={route('admin.clinics.index')}>
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Clinics
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit Clinic Details' : 'Clinic Information'}</CardTitle>
                        <CardDescription>
                            Fill in the clinic details below. All fields are required unless marked optional.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Clinic Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="organization"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                    disabled={processing}
                                    placeholder="e.g., City Medical Center"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 dark:text-red-400">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                    disabled={processing}
                                    placeholder="clinic@example.com"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 dark:text-red-400">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                    disabled={processing}
                                    placeholder="+1 (555) 123-4567"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500 dark:text-red-400">{errors.phone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className={errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                    disabled={processing}
                                    placeholder="123 Main Street, City, State 12345"
                                    rows={3}
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-500 dark:text-red-400">{errors.address}</p>
                                )}
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter className="flex justify-end gap-3">
                        <Link href={route('admin.clinics.index')}>
                            <Button variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" form="clinic-form" disabled={processing}>
                            {processing ? 'Saving...' : (isEditing ? 'Update Clinic' : 'Create Clinic')}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}