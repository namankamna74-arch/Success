
import React from 'react';

interface InfoDisplayProps {
    label: string;
    value: string;
}

export const InfoDisplay: React.FC<InfoDisplayProps> = ({ label, value }) => {
    return (
        <div className="flex justify-between items-baseline bg-slate-800/50 p-2 rounded">
            <span className="text-slate-400 text-xs uppercase tracking-wider">{label}</span>
            <span className="text-sky-300 font-mono">{value}</span>
        </div>
    );
};
