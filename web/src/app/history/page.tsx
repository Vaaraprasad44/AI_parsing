'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface HistoryEntry {
    id: number;
    timestamp: string;
    input_text: string;
    personal_info: {
        name?: string | null;
        street?: string | null;
        city?: string | null;
        state?: string | null;
        country?: string | null;
        zip_code?: string | null;
        phone_number?: string | null;
        email?: string | null;
    };
    confidence: number;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Load history from localStorage
        const storedHistory = localStorage.getItem('personalInfoHistory');
        if (storedHistory) {
            const parsed = JSON.parse(storedHistory);
            setHistory(parsed.reverse()); // Show newest first
        }
    }, []);

    const clearHistory = () => {
        localStorage.removeItem('personalInfoHistory');
        setHistory([]);
        setSelectedEntry(null);
    };

    const deleteEntry = (id: number) => {
        const updatedHistory = history.filter(entry => entry.id !== id);
        setHistory(updatedHistory);
        localStorage.setItem('personalInfoHistory', JSON.stringify(updatedHistory.reverse()));
        if (selectedEntry?.id === id) {
            setSelectedEntry(null);
        }
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString();
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Personal Information History</h1>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.push('/')}>
                        ← Back to Parser
                    </Button>
                    {history.length > 0 && (
                        <Button variant="destructive" onClick={clearHistory}>
                            Clear All History
                        </Button>
                    )}
                </div>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">No personal information has been parsed yet.</div>
                    <Button onClick={() => router.push('/')}>
                        Start Parsing Information
                    </Button>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* History List */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-semibold">Parsed Entries ({history.length})</h2>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {history.map((entry) => (
                                <div
                                    key={entry.id}
                                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                                        selectedEntry?.id === entry.id ? 'bg-blue-50 border-blue-200' : ''
                                    }`}
                                    onClick={() => setSelectedEntry(entry)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-sm text-gray-500">
                                            {formatDate(entry.timestamp)}
                                        </div>
                                        <div className="text-sm font-medium text-green-600">
                                            {(entry.confidence * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-800 line-clamp-2">
                                        {entry.input_text}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        {entry.personal_info.name && `Name: ${entry.personal_info.name}`}
                                        {entry.personal_info.name && entry.personal_info.phone_number && " • "}
                                        {entry.personal_info.phone_number && `Phone: ${entry.personal_info.phone_number}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected Entry Details */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-semibold">
                                {selectedEntry ? 'Entry Details' : 'Select an Entry'}
                            </h2>
                        </div>
                        
                        {selectedEntry ? (
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-sm text-gray-500">
                                        {formatDate(selectedEntry.timestamp)}
                                    </div>
                                    <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        onClick={() => deleteEntry(selectedEntry.id)}
                                    >
                                        Delete Entry
                                    </Button>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-700 mb-2">Original Input:</h3>
                                    <div className="p-3 bg-gray-50 rounded text-sm">
                                        {selectedEntry.input_text}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-medium text-gray-700">Extracted Information:</h3>
                                        <span className="text-sm text-green-600 font-medium">
                                            Confidence: {(selectedEntry.confidence * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    
                                    <div className="grid gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-600 mb-2">Personal Details:</h4>
                                            <div className="space-y-1 text-sm">
                                                <div><span className="font-medium">Name:</span> {selectedEntry.personal_info.name || "Not provided"}</div>
                                                <div><span className="font-medium">Email:</span> {selectedEntry.personal_info.email || "Not provided"}</div>
                                                <div><span className="font-medium">Phone:</span> {selectedEntry.personal_info.phone_number || "Not provided"}</div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h4 className="font-medium text-gray-600 mb-2">Address:</h4>
                                            <div className="space-y-1 text-sm">
                                                <div><span className="font-medium">Street:</span> {selectedEntry.personal_info.street || "Not provided"}</div>
                                                <div><span className="font-medium">City:</span> {selectedEntry.personal_info.city || "Not provided"}</div>
                                                <div><span className="font-medium">State:</span> {selectedEntry.personal_info.state || "Not provided"}</div>
                                                <div><span className="font-medium">Country:</span> {selectedEntry.personal_info.country || "Not provided"}</div>
                                                <div><span className="font-medium">ZIP Code:</span> {selectedEntry.personal_info.zip_code || "Not provided"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                Click on an entry from the left to view its details
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}