import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { DollarSign, CreditCard, FileText, AlertTriangle, TrendingUp, Users, Clock, FileQuestion, Download, ArrowRight, ExternalLink, Search, Filter, Plus, Eye, Edit, Trash2, Mail, Download as DownloadIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InvoicesIndex() {
    const { t } = useTranslation();
    const { auth, invoices, filters, patients } = usePage().props;

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
            draft: 'bg-gray-100 text-gray-800',
            sent: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800',
            partially_paid: 'bg-yellow-100 text-yellow-800',
            overdue: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>{t(`billing.${status}`)}</span>;
    };

    const handleSend = (invoice: any) => {
        if (confirm(t('billing.confirm_send'))) {
            window.location.href = route('billing.invoices.send', invoice.id);
        }
    };

    const handleDownload = (invoice: any) => {
        window.location.href = route('billing.invoices.pdf', invoice.id);
    };

    const handleDelete = (invoice: any) => {
        if (confirm(t('billing.confirm_delete'))) {
            window.location.href = route('billing.invoices.destroy', invoice.id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{t('billing.invoices')}</h1>
                    <p className="text-muted-foreground">{t('billing.manage_invoices')}</p>
                </div>
                <a href={route('billing.invoices.create')} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('billing.create_invoice')}
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
                                <option value="draft">{t('billing.draft')}</option>
                                <option value="sent">{t('billing.sent')}</option>
                                <option value="paid">{t('billing.paid')}</option>
                                <option value="partially_paid">{t('billing.partially_paid')}</option>
                                <option value="overdue">{t('billing.overdue')}</option>
                                <option value="cancelled">{t('billing.cancelled')}</option>
                            </select>
                        </div>
                        <div className="w-full md:w-48">
                            <label className="label">
                                <span className="label-text">{t('billing.patient')}</span>
                            </label>
                            <select className="select select-bordered w-full" defaultValue={filters.patient_id}>
                                <option value="">{t('billing.all_patients')}</option>
                                {patients?.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </form>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.invoice_number')}</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.patient')}</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.appointment')}</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.due_date')}</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">{t('billing.amount')}</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.status')}</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.data.map((invoice: any) => (
                                <tr key={invoice.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4 font-medium">{invoice.invoice_number}</td>
                                    <td className="p-4">{invoice.patient?.name}</td>
                                    <td className="p-4">
                                        {invoice.appointment ? (
                                            <span className="text-sm text-muted-foreground">
                                                #{invoice.appointment.id} - {new Date(invoice.appointment.appointment_date).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">{invoice.due_date ? formatDate(invoice.due_date) : '-'}</td>
                                    <td className="text-right p-4 font-medium">{formatCurrency(invoice.total)}</td>
                                    <td className="p-4">{getStatusBadge(invoice.status)}</td>
                                    <td className="text-right p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={route('billing.invoices.show', invoice.id)}
                                                className="btn btn-ghost btn-sm"
                                                title={t('common.view')}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            {invoice.status === 'draft' && (
                                                <a
                                                    href={route('billing.invoices.edit', invoice.id)}
                                                    className="btn btn-ghost btn-sm"
                                                    title={t('common.edit')}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleDownload(invoice)}
                                                className="btn btn-ghost btn-sm"
                                                title={t('billing.download_pdf')}
                                            >
                                                <DownloadIcon className="w-4 h-4" />
                                            </button>
                                            {invoice.status === 'draft' && (
                                                <button
                                                    onClick={() => handleSend(invoice)}
                                                    className="btn btn-ghost btn-sm"
                                                    title={t('billing.send_invoice')}
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                            )}
                                            {invoice.status === 'draft' && (
                                                <button
                                                    onClick={() => handleDelete(invoice)}
                                                    className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                                                    title={t('common.delete')}
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
                {invoices.last_page > 1 && (
                    <div className="card-body p-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {t('billing.showing')} {invoices.from} {t('billing.to')} {invoices.to} {t('billing.of')} {invoices.total} {t('billing.results')}
                        </p>
                        <div className="flex gap-2">
                            {invoices.current_page > 1 && (
                                <a
                                    href={`${window.location.pathname}?page=${invoices.current_page - 1}`}
                                    className="btn btn-ghost btn-sm"
                                >
                                    {t('billing.previous')}
                                </a>
                            )}
                            {invoices.current_page < invoices.last_page && (
                                <a
                                    href={`${window.location.pathname}?page=${invoices.current_page + 1}`}
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