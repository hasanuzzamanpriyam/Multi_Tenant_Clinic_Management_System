import { usePage, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Plus, Minus, X, CreditCard, FileText, AlertTriangle, Calendar, User, DollarSign, Save, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InvoicesCreate() {
    const { t } = useTranslation();
    const { auth, patients, appointments } = usePage().props;

    const { data, setData, errors, post, processing } = useForm({
        patient_id: '',
        appointment_id: '',
        due_date: '',
        notes: '',
        items: [
            { description: '', quantity: 1, unit_price: 0, taxable: true },
        ],
    });

    const addItem = () => {
        setData('items', [...data.items, { description: '', quantity: 1, unit_price: 0, taxable: true }]);
    };

    const removeItem = (index: number) => {
        if (data.items.length > 1) {
            const newItems = data.items.filter((_, i) => i !== index);
            setData('items', newItems);
        }
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
            const qty = field === 'quantity' ? value : newItems[index].quantity;
            const price = field === 'unit_price' ? value : newItems[index].unit_price;
            newItems[index].total = qty * price;
        }
        setData('items', newItems);
    };

    const getSubtotal = () => {
        return data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const getTaxAmount = () => {
        return data.items
            .filter(item => item.taxable)
            .reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) * 0.1;
    };

    const getTotal = () => {
        return getSubtotal() + getTaxAmount();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('billing.invoices.store'));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{t('billing.create_invoice')}</h1>
                    <p className="text-muted-foreground">{t('billing.create_invoice_desc')}</p>
                </div>
                <a href={route('billing.invoices.index')} className="btn-secondary">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common.back')}
                </a>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient & Appointment Selection */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">{t('billing.invoice_details')}</h3>
                    </div>
                    <div className="card-content space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                            #{a.id} - {a.patient?.name} - {new Date(a.appointment_date).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">{t('billing.due_date')}</span>
                                </label>
                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={data.due_date}
                                    onChange={(e) => setData('due_date', e.target.value)}
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

                {/* Invoice Items */}
                <div className="card">
                    <div className="card-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h3 className="card-title">{t('billing.items')}</h3>
                        <button type="button" onClick={addItem} className="btn-primary btn-sm">
                            <Plus className="w-4 h-4 mr-2" />
                            {t('billing.add_item')}
                        </button>
                    </div>
                    <div className="card-content">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium text-muted-foreground w-1/2">{t('billing.description')}</th>
                                        <th className="text-right p-4 font-medium text-muted-foreground w-1/6">{t('billing.quantity')}</th>
                                        <th className="text-right p-4 font-medium text-muted-foreground w-1/6">{t('billing.unit_price')}</th>
                                        <th className="text-right p-4 font-medium text-muted-foreground w-1/6">{t('billing.total')}</th>
                                        <th className="text-center p-4 font-medium text-muted-foreground w-1/12">{t('billing.taxable')}</th>
                                        <th className="text-right p-4 font-medium text-muted-foreground">{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((item: any, index: number) => (
                                        <tr key={index} className="border-b last:border-0">
                                            <td className="p-4">
                                                <input
                                                    type="text"
                                                    className="input input-bordered w-full"
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                    placeholder={t('billing.item_description_placeholder')}
                                                    required
                                                />
                                            </td>
                                            <td className="p-4 text-right">
                                                <input
                                                    type="number"
                                                    className="input input-bordered w-24"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    min={1}
                                                    step={1}
                                                />
                                            </td>
                                            <td className="p-4 text-right">
                                                <input
                                                    type="number"
                                                    className="input input-bordered w-24"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    min={0}
                                                    step={0.01}
                                                />
                                            </td>
                                            <td className="p-4 text-right font-medium">
                                                {formatCurrency(item.quantity * item.unit_price)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-primary"
                                                    checked={item.taxable}
                                                    onChange={(e) => updateItem(index, 'taxable', e.target.checked)}
                                                />
                                            </td>
                                            <td className="p-4 text-right">
                                                {data.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="mt-6 flex justify-end">
                            <div className="w-full md:w-80 space-y-2">
                                <div className="flex justify-between text-right">
                                    <span>{t('billing.subtotal')}</span>
                                    <span className="font-medium">{formatCurrency(getSubtotal())}</span>
                                </div>
                                <div className="flex justify-between text-right">
                                    <span>{t('billing.tax')} (10%)</span>
                                    <span className="font-medium">{formatCurrency(getTaxAmount())}</span>
                                </div>
                                <div className="flex justify-between text-right border-t pt-2">
                                    <span className="font-medium">{t('billing.total')}</span>
                                    <span className="font-bold text-lg">{formatCurrency(getTotal())}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4">
                    <a href={route('billing.invoices.index')} className="btn-secondary">
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