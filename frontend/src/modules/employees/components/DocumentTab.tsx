import type { ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { Badge } from '../../../shared/components/ui/Badge';
import { employeeApi } from '../services/employee.api';
import { FileText, Download, Trash2, Upload, File } from 'lucide-react';

interface DocumentTabProps {
    employeeId: string;
}

export function DocumentTab({ employeeId }: DocumentTabProps) {
    const queryClient = useQueryClient();
    const { data: documents, isLoading } = useQuery({
        queryKey: ['employees', 'documents', employeeId],
        queryFn: () => employeeApi.getDocuments(employeeId),
    });

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            // Basic implementation: upload as 'OTHER' category
            // In a full implementation, we'd have a dropdown for category
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'other');
            formData.append('employeeId', employeeId);
            formData.append('description', `Upload for employee ${employeeId}`);

            // We use fetch directly here because uploadApi might need adjustment for the new fields
            const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees', 'documents', employeeId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => fetch(`${import.meta.env.VITE_API_URL}/upload/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees', 'documents', employeeId] });
        },
    });

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            uploadMutation.mutate(e.target.files[0]);
        }
    };

    if (isLoading) return <Spinner />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Security & Identity Documents</h3>
                <div className="relative">
                    <input
                        type="file"
                        id="doc-upload"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploadMutation.isPending}
                    />
                    <Button
                        variant="primary"
                        className="flex items-center gap-2"
                        onClick={() => document.getElementById('doc-upload')?.click()}
                        isLoading={uploadMutation.isPending}
                    >
                        <Upload size={16} />
                        Provision New Asset
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents?.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                        <File className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No documents in digital vault</p>
                    </div>
                ) : (
                    documents?.map((doc: any) => (
                        <Card key={doc.id} className="group hover:border-slate-900 transition-all duration-500 overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-slate-50 text-slate-900 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors duration-500">
                                        <FileText size={24} />
                                    </div>
                                    <Badge variant="default" className="text-[8px] font-black uppercase tracking-widest">
                                        {doc.category}
                                    </Badge>
                                </div>

                                <div>
                                    <h4 className="font-black text-slate-900 truncate tracking-tight">{doc.originalName}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                        {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 rounded-xl h-10"
                                        onClick={() => window.open(doc.url, '_blank')}
                                    >
                                        <Download size={14} className="mr-2" />
                                        Access
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-10 h-10 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to purge this document?')) {
                                                deleteMutation.mutate(doc.id);
                                            }
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
