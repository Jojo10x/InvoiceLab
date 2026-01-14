import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../api';
import type { Invoice } from '../types';
import { UploadInvoice } from './UploadInvoice';
import { ShieldAlert, Check, FileText } from 'lucide-react';

export default function Dashboard() {
    const { getToken } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const token = await getToken();
                const res = await api.get('/invoices', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInvoices(res.data);
            } catch (err) {
                console.error("Error fetching invoices", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, [getToken]);

    const handleNewInvoice = (newInvoice: Invoice) => {
        setInvoices([newInvoice, ...invoices]);
    };

    const handleExport = async () => {
        try {
            const token = await getToken();
            const response = await api.get('/export', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'my_invoices.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to download CSV");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Invoices</h2>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm font-medium"
                >
                    <FileText size={18} />
                    Export CSV
                </button>
            </div>

            <UploadInvoice onUploadSuccess={handleNewInvoice} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Total Processed</p>
                    <p className="text-2xl font-bold">{invoices.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Total Spend</p>
                    <p className="text-2xl font-bold text-green-600">
                        ${invoices.reduce((acc, inv) => acc + (inv.extractedData?.amount || 0), 0).toFixed(2)}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">High Risk Flags</p>
                    <p className="text-2xl font-bold text-red-500">
                        {invoices.filter(i => i.analysis?.fraud?.score > 70).length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading invoices...</div>
                ) : invoices.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No invoices yet. Upload one above!</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Vendor</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Risk Score</th>
                                    <th className="p-4">AI Summary</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {invoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            {inv.analysis?.compliance?.status === 'flagged' ? (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex w-fit items-center gap-1">
                                                    <ShieldAlert size={12} /> Review
                                                </span>
                                            ) : (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex w-fit items-center gap-1">
                                                    <Check size={12} /> Valid
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 font-medium text-gray-900">{inv.extractedData?.vendor || "Unknown"}</td>
                                        <td className="p-4 text-gray-500">{inv.extractedData?.date || "-"}</td>
                                        <td className="p-4 font-mono font-medium">
                                            {inv.extractedData?.currency} {inv.extractedData?.amount?.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${inv.analysis?.fraud?.score > 50 ? 'bg-red-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${inv.analysis?.fraud?.score}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500">{inv.analysis?.fraud?.score}/100</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500 truncate max-w-xs" title={inv.analysis?.summary}>
                                            {inv.analysis?.summary}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}