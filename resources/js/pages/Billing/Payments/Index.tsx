import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { DollarSign, CreditCard, FileText, AlertTriangle, TrendingUp, Users, Clock, FileQuestion, Download, ArrowRight, ExternalLink, Search, Filter, Plus, Eye, Edit, Trash2, Mail, Download as DownloadIcon, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PaymentsIndex() {
    const { t } = useTranslation();
    const { auth, payments, filters } = usePage().props;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-800',
            partially_refunded: 'bg-yellow-100 text-yellow-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>{t(`billing.${status}`)}</span>;
    };

    const getMethodBadge = (method: string) => {
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">{method}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{t('billing.payments')}</h1>
                    <p className="text-muted-foreground">{t('billing.manage_payments')}</p>
                </div>
                <a href={route('billing.payments.create')} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('billing.record_payment')}
                </a>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="card-body p-4">
                    <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="flex-1">
                            <label className="label">
                                <span className="label-text">{t('common.search')}</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder={t('billing.search_placeholder')}
                                defaultValue={filters.search}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <label className="label">
                                <span className="label-text">{t('billing.status')}</span>
                            </label>
                            <select className="select select-bordered w-full" defaultValue={filters.status}>
                                <option value="">{t('billing.all_statuses')}</option>
                                <option value="pending">{t('billing.pending')}</option>
                                <option value="completed">{t('billing.completed')}</option>
                                <option value="failed">{t('billing.failed')}</option>
                                <option value="refunded">{t('billing.refunded')}</option>
                                <option value="partially_refunded">{t('billing.partially_refunded')}</option>
                            </select>
                        </div>
                        <div className="w-full md:w-48">
                            <label className="label">
                                <span className="label-text">{t('billing.payment_method')}</span>
                            </label>
                            <select className="select select-bordered w-full" defaultValue={filters.payment_method}>
                                <option value="">{t('billing.all_methods')}</option>
                                <option value="stripe">{t('billing.stripe')}</option>
                                <option value="paypal">{t('billing.paypal')}</option>
                                <option value="cash">{t('billing.cash')}</option>
                                <option value="card">{t('billing.card')}</option>
                                <option value="insurance">{t('billing.insurance')}</option>
                                <option value="bank_transfer">{t('billing.bank_transfer')}</option>
                            </select>
                        </div>
                    </form>
                </div>
            </div>

            {/* Payments Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.date')}</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.patient')}</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.invoice')}</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.method')}</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">{t('billing.amount')}</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.status')}</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.data.map((payment: any) => (
                                <tr key={payment.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4">{formatDate(payment.paid_at)}</td>
                                    <td className="p-4">{payment.patient?.name}</td>
                                    <td className="p-4">{payment.invoice?.invoice_number}</td>
                                    <td className="p-4">{getMethodBadge(payment.payment_method)}</td>
                                    <td className="text-right p-4 font-medium">{formatCurrency(payment.amount)}</td>
                                    <td className="p-4">{getStatusBadge(payment.status)}</td>
                                    <td className="text-right p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {payment.status === 'completed' && (
                                                <button className="btn btn-ghost btn-sm" title={t('billing.refund')}>
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {payments.last_page > 1 && (
                    <div className="card-body p-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {t('billing.showing')} {payments.from} {t('billing.to')} {payments.to} {t('billing.of')} {payments.total} {t('billing.results')}
                        </p>
                        <div className="flex gap-2">
                            {payments.current_page > 1 && (
                                <a
                                    href={`${window.location.pathname}?page=${payments.current_page - 1}`}
                                    className="btn btn-ghost btn-sm"
                                >
                                    {t('billing.previous')}
                                </a>
                            )}
                            {payments.current_page < payments.last_page && (
                                <a
                                    href={`${window.location.pathname}?page=${payments.current_page + 1}`}
                                    className="btn btn-primary btn-sm"
                                >
                                    {t('billing.next')}
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}