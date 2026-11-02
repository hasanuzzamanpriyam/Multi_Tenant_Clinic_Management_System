import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { DollarSign, CreditCard, FileText, AlertTriangle, TrendingUp, Users, Clock, FileQuestion, Download, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BillingDashboard() {
    const { t } = useTranslation();
    const { auth, revenueSummary, paymentReport, agingReport, insuranceSummary, period } = usePage().props;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getAgingColor = (bucket: string) => {
        if (bucket === 'current') return 'bg-green-50 text-green-700';
        if (bucket === '1-30') return 'bg-yellow-50 text-yellow-700';
        if (bucket === '31-60') return 'bg-orange-50 text-orange-700';
        if (bucket === '61-90') return 'bg-orange-50 text-orange-700';
        if (bucket === '91-120') return 'bg-red-50 text-red-700';
        return 'bg-red-50 text-red-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{t('billing.dashboard')}</h1>
                    <p className="text-muted-foreground">
                        {t('billing.overview')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="select select-bordered w-auto"
                        defaultValue={period}
                        onChange={(e) => window.location.href = `/billing?period=${e.target.value}`}
                    >
                        <option value="month">{t('billing.this_month')}</option>
                        <option value="quarter">{t('billing.this_quarter')}</option>
                        <option value="year">{t('billing.this_year')}</option>
                    </select>
                    <a href="/billing/invoices/create" className="btn-primary">
                        <FileText className="w-4 h-4 mr-2" />
                        {t('billing.create_invoice')}
                    </a>
                </div>
            </div>

            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('billing.total_invoiced')}</p>
                                <p className="text-2xl font-bold">{formatCurrency(revenueSummary.total_invoiced)}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('billing.total_paid')}</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(revenueSummary.total_paid)}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('billing.total_pending')}</p>
                                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(revenueSummary.total_pending)}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('billing.total_overdue')}</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(revenueSummary.total_overdue)}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods & Insurance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">{t('billing.payment_methods_breakdown')}</h3>
                    </div>
                    <div className="card-body">
                        <div className="space-y-3">
                            {Object.entries(paymentReport.by_method || {}).map(([method, data]) => (
                                <div key={method} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                                        <span className="capitalize">{method}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{data.count} {t('billing.transactions')}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(data.total)}</p>
                                    </div>
                                </div>
                            ))}
                            {Object.keys(paymentReport.by_method || {}).length === 0 && (
                                <p className="text-center text-muted-foreground py-4">
                                    {t('billing.no_payments_found')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">{t('billing.insurance_claims_summary')}</h3>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{insuranceSummary.total_claims}</p>
                                <p className="text-sm text-muted-foreground">{t('billing.total_claims')}</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(insuranceSummary.total_paid)}</p>
                                <p className="text-sm text-muted-foreground">{t('billing.total_paid')}</p>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                <p className="text-2xl font-bold text-yellow-600">{insuranceSummary.pending_claims}</p>
                                <p className="text-sm text-muted-foreground">{t('billing.pending')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aging Report */}
            <div className="card">
                <div className="card-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h3 className="card-title">{t('billing.aging_report')}</h3>
                    <a href="/billing/aging-report" className="btn-secondary btn-sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t('billing.view_full_report')}
                    </a>
                </div>
                <div className="card-body p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.aging_bucket')}</th>
                                    <th className="text-right p-4 font-medium text-muted-foreground">{t('billing.total')}</th>
                                    <th className="text-right p-4 font-medium text-muted-foreground">{t('billing.count')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(agingReport).map(([bucket, data]) => (
                                    <tr key={bucket} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-4">
                                            <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getAgingColor(bucket))}>
                                                {bucket === 'current' ? t('billing.current') : bucket + ' ' + t('billing.days')}
                                            </span>
                                        </td>
                                        <td className="text-right p-4 font-medium">{formatCurrency(data.total)}</td>
                                        <td className="text-right p-4 text-muted-foreground">{data.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">{t('billing.quick_actions')}</h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a href="/billing/invoices/create" className="card border-2 hover:border-primary hover:bg-primary-50 transition-colors cursor-pointer p-6 text-center">
                            <FileText className="w-10 h-10 mx-auto text-primary mb-3" />
                            <h4 className="font-medium">{t('billing.create_invoice')}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{t('billing.create_invoice_desc')}</p>
                        </a>
                        <a href="/billing/payments/create" className="card border-2 hover:border-primary hover:bg-primary-50 transition-colors cursor-pointer p-6 text-center">
                            <CreditCard className="w-10 h-10 mx-auto text-primary mb-3" />
                            <h4 className="font-medium">{t('billing.record_payment')}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{t('billing.record_payment_desc')}</p>
                        </a>
                        <a href="/billing/insurance-claims/create" className="card border-2 hover:border-primary hover:bg-primary-50 transition-colors cursor-pointer p-6 text-center">
                            <FileQuestion className="w-10 h-10 mx-auto text-primary mb-3" />
                            <h4 className="font-medium">{t('billing.submit_claim')}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{t('billing.submit_claim_desc')}</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

function getAgingColor(bucket: string): string {
    if (bucket === 'current') return 'bg-green-100 text-green-800';
    if (bucket === '1-30') return 'bg-yellow-100 text-yellow-800';
    if (bucket === '31-60') return 'bg-orange-100 text-orange-800';
    if (bucket === '61-90') return 'bg-orange-100 text-orange-800';
    if (bucket === '91-120') return 'bg-red-100 text-red-800';
    return 'bg-red-100 text-red-800';
}