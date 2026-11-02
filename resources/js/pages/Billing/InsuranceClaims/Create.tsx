import { usePage, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Plus, Minus, X, CreditCard, FileText, AlertTriangle, Calendar, User, DollarSign, Save, ArrowLeft, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InsuranceClaimsCreate() {
    const { t } = useTranslation();
    const { auth, invoices } = usePage().props;

    const { data, setData, errors, post, processing } = useForm({
        invoice_id: '',
        insurance_provider: '',
        policy_number: '',
        diagnosis_code: '',
        procedure_code: '',
        amount_claimed: 0,
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('billing.insurance-claims.store'));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{t('billing.submit_claim')}</h1>
                    <p className="text-muted-foreground">{t('billing.submit_claim_desc')}</p>
                </div>
                <a href={route('billing.insurance-claims.index')} className="btn-secondary">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common.back')}
                </a>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">{t('billing.claim_details')}</h3>
                    </div>
                    <div className="card-content space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">{t('billing.invoice')}</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={data.invoice_id}
                                onChange={(e) => setData('invoice_id', e.target.value)}
                                required
                            >
                                <option value="">{t('billing.select_invoice')}</option>
                                {invoices?.map((inv: any) => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.invoice_number} - {inv.patient?.name} - {formatCurrency(inv.total)}
                                    </option>
                                ))}
                            </select>
                            {errors.invoice_id && <p className="text-sm text-red-500">{errors.invoice_id}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">{t('billing.insurance_provider')}</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={data.insurance_provider}
                                    onChange={(e) => setData('insurance_provider', e.target.value)}
                                    required
                                />
                                {errors.insurance_provider && <p className="text-sm text-red-500">{errors.insurance_provider}</p>}
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">{t('billing.policy_number')}</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={data.policy_number}
                                    onChange={(e) => setData('policy_number', e.target.value)}
                                    required
                                />
                                {errors.policy_number && <p className="text-sm text-red-500">{errors.policy_number}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">{t('billing.diagnosis_code')}</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={data.diagnosis_code}
                                    onChange={(e) => setData('diagnosis_code', e.target.value)}
                                    placeholder={t('billing.icd10_placeholder')}
                                    maxLength={20}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">{t('billing.procedure_code')}</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={data.procedure_code}
                                    onChange={(e) => setData('procedure_code', e.target.value)}
                                    placeholder={t('billing.cpt_placeholder')}
                                    maxLength={20}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">{t('billing.amount_claimed')}</span>
                                </label>
                                <input
                                    type="number"
                                    className="input input-bordered w-full"
                                    value={data.amount_claimed}
                                    onChange={(e) => setData('amount_claimed', parseFloat(e.target.value) || 0)}
                                    min={0.01}
                                    step={0.01}
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">{t('billing.notes')}</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                rows={4}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder={t('billing.notes_placeholder')}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4">
                    <a href={route('billing.insurance-claims.index')} className="btn-secondary">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('common.cancel')}
                    </a>
                    <button type="submit" className="btn-primary" disabled={processing}>
                        {processing ? t('common.saving') : t('common.save')}
                    </button>
                </div>
            </form>
        </div>
    );
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}