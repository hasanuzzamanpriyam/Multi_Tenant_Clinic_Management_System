import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { DollarSign, CreditCard, FileText, AlertTriangle, TrendingUp, Users, Clock, FileQuestion, Download, ArrowRight, ExternalLink, Search, Filter, Plus, Eye, Edit, Trash2, Mail, Download as DownloadIcon, RotateCcw, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InsuranceClaimsIndex() {
    const { t } = useTranslation();
    const { auth, claims, filters, statusCounts } = usePage().props;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return date ? new Date(date).toLocaleDateString() : '-';
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-blue-100 text-blue-800',
            under_review: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            denied: 'bg-red-100 text-red-800',
            paid: 'bg-green-100 text-green-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>{t(`billing.${status}`)}</span>;
    };

    const handleSubmit = (claim: any) => {
        if (confirm(t('billing.confirm_submit_claim'))) {
            window.location.href = route('billing.insurance-claims.submit', claim.id);
        }
    };

    const handleUpdateStatus = (claim: any, status: string) => {
        // In a real app, this would open a modal with status options
        const newStatus = prompt(t('billing.update_status_prompt'), claim.status);
        if (newStatus && newStatus !== claim.status) {
            fetch(route('billing.insurance-claims.status', claim.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            }).then(() => window.location.reload());
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{t('billing.insurance_claims')}</h1>
                    <p className="text-muted-foreground">{t('billing.manage_insurance_claims')}</p>
                </div>
                <a href={route('billing.insurance-claims.create')} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('billing.submit_claim')}
                </a>
            </div>

            {/* Status Counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                <div className="card p-4 text-center">
                    <p className="text-2xl font-bold text-gray-600">{statusCounts?.draft || 0}</p>
                    <p className="text-sm text-muted-foreground">{t('billing.draft')}</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{statusCounts?.submitted || 0}</p>
                    <p className="text-sm text-muted-foreground">{t('billing.submitted')}</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{statusCounts?.under_review || 0}</p>
                    <p className="text-sm text-muted-foreground">{t('billing.under_review')}</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{statusCounts?.approved || 0}</p>
                    <p className="text-sm text-muted-foreground">{t('billing.approved')}</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{statusCounts?.denied || 0}</p>
                    <p className="text-sm text-muted-foreground">{t('billing.denied')}</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{statusCounts?.paid || 0}</p>
                    <p className="text-sm text-muted-foreground">{t('billing.paid')}</p>
                </div>
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
                                <option value="submitted">{t('billing.submitted')}</option>
                                <option value="under_review">{t('billing.under_review')}</option>
                                <option value="approved">{t('billing.approved')}</option>
                                <option value="denied">{t('billing.denied')}</option>
                                <option value="paid">{t('billing.paid')}</option>
                            </select>
                        </div>
                    </form>
                </div>
            </div>

            {/* Claims Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.claim_number')}</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.patient')}</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.insurance_provider')}</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.submitted_date')}</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">{t('billing.amount_claimed')}</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">{t('billing.status')}</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claims.data.map((claim: any) => (
                                <tr key={claim.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4 font-medium">{claim.claim_number}</td>
                                    <td className="p-4">{claim.patient?.name}</td>
                                    <td className="p-4">{claim.insurance_provider}</td>
                                    <td className="p-4">{claim.submitted_at ? formatDate(claim.submitted_at) : t('billing.not_submitted')}</td>
                                    <td className="text-right p-4 font-medium">{formatCurrency(claim.amount_claimed)}</td>
                                    <td className="p-4">{getStatusBadge(claim.status)}</td>
                                    <td className="text-right p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={route('billing.insurance-claims.show', claim.id)}
                                                className="btn btn-ghost btn-sm"
                                                title={t('common.view')}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            {claim.status === 'draft' && (
                                                <button
                                                    onClick={() => handleSubmit(claim)}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    <Shield className="w-4 h-4 mr-1" />
                                                    {t('billing.submit')}
                                                </button>
                                            )}
                                            {claim.status !== 'draft' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(claim, claim.status)}
                                                    className="btn btn-ghost btn-sm"
                                                    title={t('billing.update_status')}
                                                >
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
                {claims.last_page > 1 && (
                    <div className="card-body p-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {t('billing.showing')} {claims.from} {t('billing.to')} {claims.to} {t('billing.of')} {claims.total} {t('billing.results')}
                        </p>
                        <div className="flex gap-2">
                            {claims.current_page > 1 && (
                                <a
                                    href={`${window.location.pathname}?page=${claims.current_page - 1}`}
                                    className="btn btn-ghost btn-sm"
                                >
                                    {t('billing.previous')}
                                </a>
                            )}
                            {claims.current_page < claims.last_page && (
                                <a
                                    href={`${window.location.pathname}?page=${claims.current_page + 1}`}
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