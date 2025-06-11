'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import Sidebar from '@/components/sidebar';

interface Summary {
    id: string;
    videoTitle: string;
    summary: string;
    createdAt: string;
}

export default function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [credits, setCredits] = useState<number>(0);
    const [isUpgrading] = useState(false);
    const { userId } = useAuth();

    useEffect(() => {
        if (userId) {
            fetchCredits();
        }
    }, [userId]);

    const fetchCredits = async () => {
        try {
            const response = await fetch('/dashboard/api/credits');
            const data = await response.json();
            if (response.ok) {
                setCredits(data.credits);
            }
        } catch (error) {
            console.error('Error fetching credits:', error);
        }
    };

    const validateInput = (url: string) => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        return youtubeRegex.test(url);
    };

    const handleSubmit = async () => {
        if (!userId) {
            setError('Please sign in to continue');
            return;
        }

        if (!url.trim()) {
            setError('Please enter a URL');
            return;
        }

        if (!validateInput(url)) {
            setError('Please enter a valid YouTube URL');
            return;
        }

        setIsLoading(true);
        setError('');
        setSelectedSummary(null);

        try {
            const response = await fetch('/dashboard/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();
            console.log("got response data: ", data);

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setSelectedSummary({
                id: data.id,
                videoTitle: data.videoTitle,
                summary: data.summary,
                createdAt: new Date().toISOString()
            });
            
            // Refresh credits after successful submission
            const creditsResponse = await fetch('/dashboard/api/credits');
            const creditsData = await creditsResponse.json();
            if (creditsResponse.ok) {
                setCredits(creditsData.credits);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSummarySelect = (summary: Summary) => {
        setSelectedSummary(summary);
        setIsSidebarOpen(false);
    };

    const handleUpgrade = async () => {
        console.log("implementation")
        // try {
        //     setIsUpgrading(true);
        //     const response = await fetch('/dashboard/api/upgrade', {
        //         method: 'POST',
        //     });

        //     const data = await response.json();
            
        //     if (!response.ok) {
        //         throw new Error(data.message || 'Failed to create checkout session');
        //     }

        //     // Redirect to Paddle checkout
        //     window.location.href = data.url;
        // } catch (error) {
        //     console.error('Error creating checkout session:', error);
        //     setError(error instanceof Error ? error.message : 'Failed to create checkout session');
        // } finally {
        //     setIsUpgrading(false);
        // }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with menu button */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">YouTube Summarizer</h1>
                        <div className="flex items-center gap-4">
                            {userId && (
                                <p className="text-sm text-gray-600">
                                    Credits: {credits}
                                </p>
                            )}
                            <button
                                onClick={handleUpgrade}
                                disabled={isUpgrading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpgrading ? 'Processing...' : 'Upgrade Premium'}
                            </button>
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 rounded-md hover:bg-gray-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="w-full flex flex-col gap-3">
                        <input 
                            type="text" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                            placeholder="Enter YouTube URL here..."
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : 'Generate Summary'}
                        </button>
                    </div>
                </div>

                {selectedSummary && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">{selectedSummary.videoTitle}</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedSummary.summary}</p>
                    </div>
                )}
            </main>

            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)}
                onSummarySelect={handleSummarySelect}
            />
        </div>
    );
}