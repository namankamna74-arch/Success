
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
    return (
        <button
            className={`px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-md shadow-md hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
