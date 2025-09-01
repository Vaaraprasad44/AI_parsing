'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParsePersonalInfoMutation } from "@/store/api/enhanced/personal-info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonalInfoResponse } from "@/store/api/generated/personal-info";

export default function PersonalInfoPage() {
    const [inputText, setInputText] = useState("");
    const [parsePersonalInfo, { isLoading, error }] = useParsePersonalInfoMutation();
    const [result, setResult] = useState<PersonalInfoResponse | null>(null);
    const router = useRouter();

    const handleParseInfo = async () => {
        if (inputText.trim()) {
            try {
                const response = await parsePersonalInfo({ 
                    personalInfoRequest: { input_text: inputText } 
                }).unwrap();
                
                setResult(response);
                
                // Store in localStorage for history
                const existingHistory = JSON.parse(localStorage.getItem('personalInfoHistory') || '[]');
                const newEntry = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...response
                };
                existingHistory.push(newEntry);
                localStorage.setItem('personalInfoHistory', JSON.stringify(existingHistory));
                
            } catch (err) {
                console.error('Failed to parse personal info:', err);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleParseInfo();
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Personal Information Parser</h1>
                <p className="text-gray-600">Enter your personal information in a sentence and let AI extract the structured data</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
                
                <div className="flex gap-3">
                    <Button 
                        onClick={handleParseInfo} 
                        disabled={isLoading || !inputText.trim()}
                        className="flex-1"
                    >
                        {isLoading ? "Parsing..." : "Parse Information"}
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
                        Error: Failed to parse personal information. Please try again.
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
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">Address:</h3>
                            <div className="space-y-2 text-sm">
                                <div><span className="font-medium">Street:</span> {result.personal_info.street || "Not provided"}</div>
                                <div><span className="font-medium">City:</span> {result.personal_info.city || "Not provided"}</div>
                                <div><span className="font-medium">State:</span> {result.personal_info.state || "Not provided"}</div>
                                <div><span className="font-medium">Country:</span> {result.personal_info.country || "Not provided"}</div>
                                <div><span className="font-medium">ZIP Code:</span> {result.personal_info.zip_code || "Not provided"}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                        <span className="font-medium">Original input:</span> {result.input_text}
                    </div>
                </div>
            )}
        </div>
    );
}