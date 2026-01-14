import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../api';
import type { Invoice } from '../../types';
import { UploadInvoice } from '../UploadInvoice';
import { ShieldAlert } from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardStats } from './DashboardStats';
import { InvoiceTable } from './InvoiceTable';

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
            <DashboardHeader
                usageCount={usageCount}
                maxUsage={MAX_DAILY_USAGE}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                onExport={handleExport}
            />

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

            <DashboardStats invoices={invoices} />

            <InvoiceTable
                invoices={invoices}
                loading={loading}
                expandedRow={expandedRow}
                onToggleRow={toggleRow}
            />
        </div>
    );
}