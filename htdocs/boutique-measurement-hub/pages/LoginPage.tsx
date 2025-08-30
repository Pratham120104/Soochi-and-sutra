import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !/^[0-9]{10}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit phone number.');
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      alert('Please enter your password.');
      return;
    }
    setError('');
    try {
      await login(phone, password);
    } catch (err: any) {
      const msg = err.message || 'Login failed.';
      setError(msg);
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-row">
      {/* Left: Login Card */}
      <div className="w-full max-w-md h-screen bg-white/80 backdrop-blur-md shadow-2xl p-8 md:p-10 border border-brand-secondary flex flex-col justify-center">
        <div className="flex flex-col items-center justify-center mb-8 mt-8">
          <img src="/images/brand.png" alt="Soochi & Sutra Logo Icon" className="h-32 w-auto" />
        </div>
        <h2 className="text-3xl font-bold text-center text-brand-primary mb-2 tracking-tight animate-fade-in">Welcome!</h2>
        <p className="text-center text-neutral-500 mb-8 animate-fade-in">Login with your phone number and password</p>
        <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
          <Input
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="Enter your 10-digit phone number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            containerClassName="mb-1"
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            containerClassName="mb-1"
            required
          />
          {error && <p className="text-red-500 text-sm animate-fade-in">{error}</p>}
          <Button
            type="submit"
            isLoading={loading}
            size="lg"
            className="w-full mt-2"
          >
            Login
          </Button>
        </form>
        <div className="mt-8 text-center text-brand-primary text-xs opacity-80 animate-fade-in">
          © 2024 Soochi & Sutra. All rights reserved.
        </div>
      </div>
      {/* Right: Background Image */}
      <div
        className="flex-1 h-screen"
        style={{
          backgroundImage: "url('/images/brandpattern.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </div>
  );
};

export default LoginPage;