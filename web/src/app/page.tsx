'use client'

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParsePersonalInfoMutation, useParsePersonalInfoFromImageMutation } from "@/store/api/enhanced/personal-info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonalInfoResponse } from "@/store/api/generated/personal-info";
import { Upload, FileText, Image, Loader2 } from "lucide-react";

export default function PersonalInfoPage() {
    const [inputText, setInputText] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
    const [imageUploading, setImageUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [parsePersonalInfo, { isLoading: textLoading, error: textError }] = useParsePersonalInfoMutation();
    const [parseImageInfo, { isLoading: imageLoading, error: imageError }] = useParsePersonalInfoFromImageMutation();
    const [result, setResult] = useState<PersonalInfoResponse | null>(null);
    const router = useRouter();
    
    const isLoading = textLoading || imageLoading || imageUploading;
    const error = textError || imageError;

    const handleParseInfo = async () => {
        if (activeTab === 'text' && inputText.trim()) {
            try {
                const response = await parsePersonalInfo({ 
                    personalInfoRequest: { input_text: inputText } 
                }).unwrap();
                
                setResult(response);
                saveToHistory(response);
                
            } catch (err) {
                console.error('Failed to parse personal info:', err);
            }
        } else if (activeTab === 'image' && selectedFile) {
            setImageUploading(true);
            try {
                console.log('Sending file:', selectedFile);
                console.log('File details:', {
                    name: selectedFile.name,
                    size: selectedFile.size,
                    type: selectedFile.type
                });
                
                // Create FormData manually and use fetch directly since RTK Query doesn't handle File objects well
                const formData = new FormData();
                formData.append('file', selectedFile);
                
                const response = await fetch('http://localhost:8000/api/personal-info/parse-image', {
                    method: 'POST',
                    body: formData,
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json() as PersonalInfoResponse;
                
                setResult(result);
                saveToHistory(result);
                
            } catch (err) {
                console.error('Failed to parse image:', err);
                console.error('Error details:', JSON.stringify(err, null, 2));
                if (err && typeof err === 'object' && 'data' in err) {
                    console.error('API Error data:', err.data);
                }
                if (err && typeof err === 'object' && 'status' in err) {
                    console.error('HTTP status:', err.status);
                }
            } finally {
                setImageUploading(false);
            }
        }
    };
    
    const saveToHistory = (response: PersonalInfoResponse) => {
        const existingHistory = JSON.parse(localStorage.getItem('personalInfoHistory') || '[]');
        const newEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...response
        };
        existingHistory.push(newEntry);
        localStorage.setItem('personalInfoHistory', JSON.stringify(existingHistory));
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };
    
    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading && activeTab === 'text') {
            handleParseInfo();
        }
    };
    
    const canParse = (activeTab === 'text' && inputText.trim()) || (activeTab === 'image' && selectedFile);

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Personal Information Parser</h1>
                <p className="text-gray-600">Extract personal information from text or ID card images using AI</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                {/* Tab Navigation */}
                <div className="flex mb-6 border-b">
                    <button
                        onClick={() => setActiveTab('text')}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                            activeTab === 'text'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FileText size={20} />
                        Text Input
                    </button>
                    <button
                        onClick={() => setActiveTab('image')}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                            activeTab === 'image'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Image size={20} />
                        ID Card Upload
                    </button>
                </div>

                {/* Text Input Tab */}
                {activeTab === 'text' && (
                    <div className="mb-4">
                        <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">
                            Enter your personal information:
                        </label>
                        <Input
                            id="input-text"
                            type="text"
                            placeholder="Example: My name is John Doe, I live at 123 Main St, New York, NY, USA, 10001. My phone is 555-123-4567 and email is john@example.com"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="text-base p-3 h-auto"
                        />
                    </div>
                )}

                {/* Image Upload Tab */}
                {activeTab === 'image' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload ID Card or Identification Document:
                        </label>
                        <div 
                            onClick={handleFileUploadClick}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            {selectedFile ? (
                                <div className="space-y-2">
                                    <div className="text-green-600">
                                        <Upload size={48} className="mx-auto mb-2" />
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleFileUploadClick}>
                                        Choose Different File
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    <Upload size={48} className="mx-auto mb-4" />
                                    <p className="text-lg font-medium mb-2">Click to upload ID card image</p>
                                    <p className="text-sm">Supports JPEG and PNG files (max 20MB)</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="flex gap-3">
                    <Button 
                        onClick={handleParseInfo} 
                        disabled={isLoading || !canParse}
                        className={`flex-1 ${activeTab === 'image' && imageUploading ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    >
                        {activeTab === 'image' && imageUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing ID Card...
                            </>
                        ) : textLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Parsing Text...
                            </>
                        ) : (
                            `Parse ${activeTab === 'text' ? 'Text' : 'ID Card'}`
                        )}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => router.push('/history')}
                    >
                        View History
                    </Button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                        Error: Failed to parse {activeTab === 'text' ? 'text' : 'image'}. Please try again.
                    </div>
                )}
            </div>

            {result && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Extracted Information</h2>
                        <span className="text-sm text-gray-500">
                            Confidence: {(result.confidence * 100).toFixed(1)}%
                        </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">Personal Details:</h3>
                            <div className="space-y-2 text-sm">
                                <div><span className="font-medium">Name:</span> {result.personal_info.name || "Not provided"}</div>
                                <div><span className="font-medium">Email:</span> {result.personal_info.email || "Not provided"}</div>
                                <div><span className="font-medium">Phone:</span> {result.personal_info.phone_number || "Not provided"}</div>
                                {result.personal_info.date_of_birth && (
                                    <div><span className="font-medium">Date of Birth:</span> {result.personal_info.date_of_birth}</div>
                                )}
                                {result.personal_info.gender && (
                                    <div><span className="font-medium">Gender:</span> {result.personal_info.gender}</div>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">Address & ID:</h3>
                            <div className="space-y-2 text-sm">
                                <div><span className="font-medium">Street:</span> {result.personal_info.street || "Not provided"}</div>
                                <div><span className="font-medium">City:</span> {result.personal_info.city || "Not provided"}</div>
                                <div><span className="font-medium">State:</span> {result.personal_info.state || "Not provided"}</div>
                                <div><span className="font-medium">Country:</span> {result.personal_info.country || "Not provided"}</div>
                                <div><span className="font-medium">ZIP Code:</span> {result.personal_info.zip_code || "Not provided"}</div>
                                {result.personal_info.id_number && (
                                    <div><span className="font-medium">ID Number:</span> {result.personal_info.id_number}</div>
                                )}
                                {result.personal_info.expiration_date && (
                                    <div><span className="font-medium">ID Expires:</span> {result.personal_info.expiration_date}</div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                        <div className="flex justify-between items-center">
                            <span>
                                <span className="font-medium">Source:</span> {result.source_type === 'image' ? 'ID Card Image' : 'Text Input'}
                            </span>
                            <span className="text-xs text-gray-500">
                                {result.source_type === 'image' ? result.input_text : `"${result.input_text}"`}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}