import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../api';
import type { Invoice } from '../types';
import { UploadInvoice } from './UploadInvoice';
import { ShieldAlert, Check, FileText, ChevronDown, ChevronUp, Zap, Settings } from 'lucide-react';

export default function Dashboard() {
    const { getToken } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState('standard'); 
    const [usageCount, setUsageCount] = useState(0);
    const MAX_DAILY_USAGE = 20;

    const fetchUsage = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await api.get('/usage', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsageCount(res.data.count);
        } catch (err) {
            console.error("Failed to fetch usage stats", err);
        }
    }, [getToken]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = await getToken();
                const invRes = await api.get('/invoices', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInvoices(invRes.data);
                
                await fetchUsage();
                
            } catch (err) {
                console.error("Error loading dashboard", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [getToken, fetchUsage]);

    const handleNewInvoice = (newInvoice: Invoice) => {
        setInvoices([newInvoice, ...invoices]);
        fetchUsage(); 
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

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const isLimitReached = usageCount >= MAX_DAILY_USAGE;
    
    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">My Invoices</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage and analyze your financial documents</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">
                    
                    <div 
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition
                        ${isLimitReached 
                            ? 'bg-red-50 border-red-200 text-red-700' 
                            : 'bg-white border-gray-200 text-gray-600'}`}
                        title="Daily AI Request Limit"
                    >
                        <Zap size={16} className={isLimitReached ? "fill-red-500 text-red-500" : "fill-yellow-400 text-yellow-400"} />
                        <span>Limit: {usageCount} / {MAX_DAILY_USAGE}</span>
                    </div>

                    <div className="relative group w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-700 hover:border-blue-400 transition cursor-pointer shadow-sm">
                            <Settings size={16} className="text-gray-400" />
                            <select 
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="bg-transparent outline-none cursor-pointer appearance-none pr-6 font-medium w-full sm:w-auto"
                            >
                                <option value="standard">Gemini 2.5 Flash</option>
                                <option value="lite">Gemini 2.5 Lite</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm font-medium w-full sm:w-auto justify-center"
                    >
                        <FileText size={18} />
                        Export
                    </button>
                </div>
            </div>

            {isLimitReached ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl text-center mb-8 animate-in fade-in zoom-in duration-300">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="text-red-600" size={32} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">Daily Limit Reached</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                        The shared demo server has hit its daily capacity of 20 requests. 
                        Please try again tomorrow (UTC Midnight) or check back later.
                    </p>
                </div>
            ) : (
                <UploadInvoice 
                    onUploadSuccess={handleNewInvoice} 
                    selectedModel={selectedModel} 
                />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
                        {invoices.filter(i => (i.analysis?.fraud?.score ?? 0) > 70).length}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                    Loading invoices...
                </div>
            ) : invoices.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                    No invoices yet. Upload one above!
                </div>
            ) : (
                <>
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
                                        <>
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
                                                        onClick={() => toggleRow(inv._id)}
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
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

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
                                        onClick={() => toggleRow(inv._id)}
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
            )}
        </div>
    );
}