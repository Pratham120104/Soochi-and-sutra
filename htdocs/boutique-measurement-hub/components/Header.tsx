
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import Logo from './Logo';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Logo size="md" variant="default" />
                    
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                           <p className="text-sm font-medium text-brand-primary">{user?.name}</p>
                           <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
                        </div>
                        <Button onClick={logout} variant="secondary" size="sm">
                           Logout
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;