'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

interface Summary {
    id: string;
    videoTitle: string;
    summary: string;
    createdAt: string;
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSummarySelect: (summary: Summary) => void;
}

export default function Sidebar({ isOpen, onClose, onSummarySelect }: SidebarProps) {
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const { userId } = useAuth();

    useEffect(() => {
        if (userId) {
            fetchSummaries();
        }
    }, [userId]);

    const fetchSummaries = async () => {
        try {
            const response = await fetch('/dashboard/api/history');
            if (response.ok) {
                const data = await response.json();
                setSummaries(data.summaries);
            }
        } catch (error) {
            console.error('Error fetching summaries:', error);
        }
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl text-gray-900  font-semibold">History</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md hover:bg-gray-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto h-[calc(100%-4rem)]">
                    {summaries.length > 0 ? (
                        <div className="divide-y">
                            {summaries.map((summary) => (
                                <div
                                    key={summary.id}
                                    className="p-4 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onSummarySelect(summary)}
                                >
                                    <h3 className="font-medium text-gray-900 truncate">
                                        {summary.videoTitle}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(summary.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            No summaries yet
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}