import { Zap, Settings, FileText } from 'lucide-react';

interface DashboardHeaderProps {
    usageCount: number;
    maxUsage: number;
    selectedModel: string;
    onModelChange: (model: string) => void;
    onExport: () => void;
}

export function DashboardHeader({
    usageCount,
    maxUsage,
    selectedModel,
    onModelChange,
    onExport
}: DashboardHeaderProps) {
    const isLimitReached = usageCount >= maxUsage;

    return (
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
                    <span>Limit: {usageCount} / {maxUsage}</span>
                </div>

                <div className="relative group w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-700 hover:border-blue-400 transition cursor-pointer shadow-sm">
                        <Settings size={16} className="text-gray-400" />
                        <select
                            value={selectedModel}
                            onChange={(e) => onModelChange(e.target.value)}
                            className="bg-transparent outline-none cursor-pointer appearance-none pr-6 font-medium w-full sm:w-auto"
                        >
                            <option value="standard">Gemini 2.5 Flash</option>
                            <option value="lite">Gemini 2.5 Lite</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={onExport}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm font-medium w-full sm:w-auto justify-center"
                >
                    <FileText size={18} />
                    Export
                </button>
            </div>
        </div>
    );
}