import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { DollarSign, CreditCard, FileText, AlertTriangle, TrendingUp, Users, Clock, FileQuestion, Download, ArrowRight, ExternalLink, Search, Filter, Plus, Eye, Edit, Trash2, Mail, Download as DownloadIcon, RotateCcw, Shield, CreditCard as CreditCardIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PaymentMethodsIndex() {
    const { t } = useTranslation();
    const { auth, methods, stripePublishableKey } = usePage().props;

    const addStripeMethod = async () => {
        if (!stripePublishableKey) {
            alert('Stripe not configured');
            return;
        }

        const stripe = window.Stripe(stripePublishableKey);
        const response = await fetch(route('billing.payment-methods.store'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });
        // In a real implementation, you'd use Stripe Elements to collect card details
        alert('Stripe Elements integration needed for card collection');
    };

    const setDefault = (method: any) => {
        fetch(route('billing.payment-methods.default', method.id), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        }).then(() => window.location.reload());
    };

    const deleteMethod = (method: any) => {
        if (confirm('Are you sure you want to delete this payment method?')) {
            fetch(route('billing.payment-methods.destroy', method.id), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            }).then(() => window.location.reload());
        }
    };

    const getBrandIcon = (brand: string) => {
        switch (brand?.toLowerCase()) {
            case 'visa': return <CreditCardIcon className="w-5 h-5 text-blue-600" />;
            case 'mastercard': return <CreditCardIcon className="w-5 h-5 text-red-600" />;
            case 'amex': return <CreditCardIcon className="w-5 h-5 text-green-600" />;
            default: return <CreditCardIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{t('billing.payment_methods')}</h1>
                    <p className="text-muted-foreground">{t('billing.manage_payment_methods')}</p>
                </div>
                <button onClick={addStripeMethod} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('billing.add_card')}
                </button>
            </div>

            {methods.length === 0 ? (
                <div className="card">
                    <div className="card-body p-12 text-center">
                        <CreditCardIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">{t('billing.no_payment_methods')}</h3>
                        <p className="text-muted-foreground mt-1">{t('billing.add_first_method')}</p>
                        <button onClick={addStripeMethod} className="btn-primary mt-4">
                            <Plus className="w-4 h-4 mr-2" />
                            {t('billing.add_card')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {methods.map((method: any) => (
                        <div key={method.id} className="card p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        {getBrandIcon(method.brand)}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {method.brand?.toUpperCase()} ending in {method.last4}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Expires {method.exp_month}/{method.exp_year}
                                        </p>
                                    </div>
                                </div>
                                {method.is_default && (
                                    <span className="badge badge-primary">{t('billing.default')}</span>
                                )}
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                                {!method.is_default && (
                                    <button
                                        onClick={() => setDefault(method)}
                                        className="btn btn-ghost btn-sm"
                                    >
                                        {t('billing.set_default')}
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteMethod(method)}
                                    className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}