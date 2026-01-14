import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../api';
import type { Invoice } from '../types';

interface Props {
    onUploadSuccess: (invoice: Invoice) => void;
}

export function UploadInvoice({ onUploadSuccess }: Props) {
    const { getToken } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("File is too large (Max 5MB)");
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = await getToken();

            if (!token) {
                setError("User is not authenticated (No token found)");
                setIsUploading(false);
                return;
            }
            const response = await api.post('/invoices', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            onUploadSuccess(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to process invoice. Please try again.");
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-gray-50 group">

                {isUploading ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                        <p className="text-gray-600 font-medium">AI Agents are analyzing your invoice...</p>
                        <p className="text-xs text-gray-400 mt-1">Extracting data • Checking Fraud • Verifying Tax</p>
                    </div>
                ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <span className="text-lg font-semibold text-gray-700">Upload Invoice</span>
                        <span className="text-sm text-gray-500 mt-1">PDF or Image (Max 5MB)</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </label>
                )}

                {error && (
                    <div className="mt-4 flex items-center justify-center text-red-600 text-sm bg-red-50 p-2 rounded">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}