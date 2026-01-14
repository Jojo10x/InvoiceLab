import { useState, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../api';
import { Upload, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { AxiosError } from 'axios';
import type { Invoice } from '../types';

interface UploadProps {
    onUploadSuccess: (invoice: Invoice) => void;
    selectedModel: string;
}

export function UploadInvoice({ onUploadSuccess, selectedModel }: UploadProps) {
    const { getToken } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isQuotaError, setIsQuotaError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setIsUploading(true);
        setError(null);
        setIsQuotaError(false);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', selectedModel);

        try {
            const token = await getToken();
            const res = await api.post('/invoices', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            onUploadSuccess(res.data);
        } catch (error) {
            console.error("Upload failed", error);

            const axiosError = error as AxiosError<{ error: string }>;

            if (axiosError.response?.status === 429) {
                setIsQuotaError(true);

                setError(axiosError.response.data?.error || "Daily Limit Reached.");
            } else {
                setError("Failed to process invoice. Please try again.");
            }
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="mb-8">
            <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`
          border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer relative overflow-hidden
          ${isUploading ? 'bg-gray-50 border-gray-300 cursor-wait' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,application/pdf"
                    disabled={isUploading}
                />

                <div className="flex flex-col items-center justify-center gap-3">
                    {isUploading ? (
                        <>
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                            <p className="text-gray-600 font-medium animate-pulse">
                                AI is analyzing using {selectedModel === 'standard' ? 'Gemini Flash' : 'Gemini Lite'}...
                            </p>
                        </>
                    ) : error ? (
                        <>
                            <AlertCircle className="text-red-500" size={32} />
                            <h3 className="text-red-700 font-bold text-lg">Upload Failed</h3>
                            <p className="text-red-600 font-medium">{error}</p>

                            {isQuotaError && (
                                <div className="mt-2 text-sm text-red-500 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                                    Try switching to <b>Gemini Lite</b> in the top right menu!
                                </div>
                            )}

                            <p className="text-xs text-red-400 mt-4 flex items-center gap-1">
                                <RefreshCw size={12} /> Click to try again
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                <Upload size={24} />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">Click to upload Invoice</p>
                                <p className="text-gray-500 text-sm mt-1">Supports JPG, PNG, PDF (Max 5MB)</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}