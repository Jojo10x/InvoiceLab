import type { Invoice } from '../../types';
import { ShieldAlert, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Fragment } from 'react';

interface InvoiceTableProps {
    invoices: Invoice[];
    loading: boolean;
    expandedRow: string | null;
    onToggleRow: (id: string) => void;
}

export function InvoiceTable({ invoices, loading, expandedRow, onToggleRow }: InvoiceTableProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                Loading invoices...
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                No invoices yet. Upload one above!
            </div>
        );
    }

    return (
        <>
            {/* Desktop View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {invoices.map((inv) => (
                                <Fragment key={inv._id}>
                                    <tr className="hover:bg-gray-50 transition">
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
                                                        className={`h-full ${(inv.analysis?.fraud?.score ?? 0) > 50 ? 'bg-red-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${inv.analysis?.fraud?.score ?? 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500">{inv.analysis?.fraud?.score ?? 0}/100</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 max-w-md">
                                            <div className={expandedRow === inv._id ? '' : 'line-clamp-2'}>
                                                {inv.analysis?.summary}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => onToggleRow(inv._id)}
                                                className="text-blue-600 hover:text-blue-700 transition"
                                            >
                                                {expandedRow === inv._id ? (
                                                    <ChevronUp size={18} />
                                                ) : (
                                                    <ChevronDown size={18} />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRow === inv._id && (
                                        <tr className="bg-blue-50">
                                            <td colSpan={7} className="p-6">
                                                <h4 className="font-semibold text-gray-900 mb-2">Full AI Summary</h4>
                                                <p className="text-gray-700 leading-relaxed">{inv.analysis?.summary}</p>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden space-y-4">
                {invoices.map((inv) => (
                    <div key={inv._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-semibold text-gray-900">{inv.extractedData?.vendor || "Unknown"}</h3>
                                <p className="text-sm text-gray-500">{inv.extractedData?.date || "-"}</p>
                            </div>
                            {inv.analysis?.compliance?.status === 'flagged' ? (
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                    <ShieldAlert size={12} /> Review
                                </span>
                            ) : (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                    <Check size={12} /> Valid
                                </span>
                            )}
                        </div>

                        <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-mono font-bold text-gray-900">
                                {inv.extractedData?.currency} {inv.extractedData?.amount?.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${(inv.analysis?.fraud?.score ?? 0) > 50 ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: `${inv.analysis?.fraud?.score ?? 0}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500">{inv.analysis?.fraud?.score ?? 0}/100</span>
                            </div>
                        </div>

                        <div className="border-t pt-3">
                            <p className={`text-sm text-gray-600 ${expandedRow === inv._id ? '' : 'line-clamp-2'}`}>
                                {inv.analysis?.summary}
                            </p>
                            <button
                                onClick={() => onToggleRow(inv._id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 flex items-center gap-1"
                            >
                                {expandedRow === inv._id ? (
                                    <>Show less <ChevronUp size={16} /></>
                                ) : (
                                    <>Read more <ChevronDown size={16} /></>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}