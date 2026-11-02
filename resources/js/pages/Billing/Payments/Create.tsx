import { usePage, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Plus, Minus, X, CreditCard, FileText, AlertTriangle, Calendar, User, DollarSign, Save, ArrowLeft, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PaymentsCreate() {
    const { t } = useTranslation();
    const { auth, invoices, patients, appointments, paymentMethods } = usePage().props;

    const { data, setData, errors, post, processing } = useForm({
        invoice_id: '',
        patient_id: '',
        appointment_id: '',
        amount: 0,
        currency: 'USD',
        payment_method: 'cash',
        transaction_id: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('billing.payments.store'));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{t('billing.record_payment')}</h1>
                    <p className="text-muted-foreground">{t('billing.record_payment_desc')}</p>
                </div>
                <a href={route('billing.payments.index')} className="btn-secondary">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common.back')}
                </a>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">{t('billing.payment_details')}</h3>
                    </div>
                    <div className="card-content space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                            {inv.invoice_number} - {inv.patient?.name} - {formatCurrency(inv.balance)}
                                        </option>
                                    ))}
                                </select>
                                {errors.invoice_id && <p className="text-sm text-red-500">{errors.invoice_id}</p>}
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">{t('billing.patient')}</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={data.patient_id}
                                    onChange={(e) => setData('patient_id', e.target.value)}
                                    required
                                >
                                    <option value="">{t('billing.select_patient')}</option>
                                    {patients?.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.patient_id && <p className="text-sm text-red-500">{errors.patient_id}</p>}
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">{t('billing.appointment')}</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={data.appointment_id}
                                    onChange={(e) => setData('appointment_id', e.target.value)}
                                >
                                    <option value="">{t('billing.select_appointment_optional')}</option>
                                    {appointments?.map((a: any) => (
                                        <option key={a.id} value={a.id}>
                                            #{a.id} - {new Date(a.appointment_date).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">{t('billing.amount')}</span>
                                </label>
                                <input
                                    type="number"
                                    className="input input-bordered w-full"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', parseFloat(e.target.value) || 0)}
                                    min={0.01}
                                    step={0.01}
                                    required
                                />
                                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">{t('billing.currency')}</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value)}
                                    maxLength={3}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">{t('billing.payment_method')}</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                    required
                                >
                                    {paymentMethods?.map((m: string) => (
                                        <option key={m} value={m}>{t(`billing.${m}`)}</option>
                                    ))}
                                </select>
                                {errors.payment_method && <p className="text-sm text-red-500">{errors.payment_method}</p>}
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">{t('billing.transaction_id')}</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={data.transaction_id}
                                    onChange={(e) => setData('transaction_id', e.target.value)}
                                    placeholder={t('billing.transaction_id_placeholder')}
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">{t('billing.notes')}</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                rows={3}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder={t('billing.notes_placeholder')}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4">
                    <a href={route('billing.payments.index')} className="btn-secondary">
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