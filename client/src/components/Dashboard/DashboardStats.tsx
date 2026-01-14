import type { Invoice } from '../../types';

interface DashboardStatsProps {
    invoices: Invoice[];
}

export function DashboardStats({ invoices }: DashboardStatsProps) {
    const totalProcessed = invoices.length;
    const totalSpend = invoices.reduce((acc, inv) => acc + (inv.extractedData?.amount || 0), 0);
    const highRiskCount = invoices.filter(i => (i.analysis?.fraud?.score ?? 0) > 70).length;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">Total Processed</p>
                <p className="text-2xl font-bold">{totalProcessed}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">Total Spend</p>
                <p className="text-2xl font-bold text-green-600">
                    ${totalSpend.toFixed(2)}
                </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">High Risk Flags</p>
                <p className="text-2xl font-bold text-red-500">
                    {highRiskCount}
                </p>
            </div>
        </div>
    );
}