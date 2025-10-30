import Link from 'next/link';
import React from 'react';

interface FilledButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    href?: string;
    type?: 'button' | 'submit' | 'reset';
}

const FilledButton: React.FC<FilledButtonProps> = ({
    children,
    onClick,
    disabled = false,
    className = '',
    type = 'button',
    href,
}) => {
    const button = <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-8 py-2 rounded-full font-medium text-gray-800 transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{ backgroundColor: '#FBDF85' }}
    >
        {children}
    </button>

    if (href) {
        return <Link href={href}>
            {button}
        </Link>
    }

    return button
};

export default FilledButton;