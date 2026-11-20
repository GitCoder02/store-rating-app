import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Lock, Mail, User, MapPin, AlertCircle, ArrowRight, ArrowLeft, Eye, EyeOff, Star, CheckCircle2 } from 'lucide-react';

export default function RegisterPage({ onNavigateLogin }) {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const trimmedName = name.trim();
  const isNameValid = trimmedName.length >= 20 && trimmedName.length <= 60;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = emailRegex.test(email.trim());

  const trimmedAddress = address.trim();
  const isAddressValid = trimmedAddress.length > 0 && trimmedAddress.length <= 400;

  const hasLength = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/~`]/.test(password);
  const isPasswordValid = hasLength && hasUppercase && hasSpecial;
  const passwordsMatch = password && password === confirmPassword;

  const isFormValid = isNameValid && isEmailValid && isAddressValid && isPasswordValid && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }
    if (!isFormValid) {
      setError('Please resolve all validation errors before submitting');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await api.register({
        name: trimmedName,
        email: email.trim().toLowerCase(),
        address: trimmedAddress,
        password,
      });
      login(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Left Column: Store Photography */}
      <div className="relative lg:w-5/12 min-h-[300px] lg:min-h-screen p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden bg-slate-900 text-white">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80"
          alt="Artisan Storefront"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 mix-blend-luminosity filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <Star size={20} className="fill-amber-300 text-amber-300" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">TrustPulse</span>
            <span className="block text-xs text-emerald-400 font-semibold tracking-wide">
              Verified Store Reviews
            </span>
          </div>
        </div>

        <div className="relative z-10 my-8 lg:my-auto max-w-md space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Join your local community review platform.
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Create your account to rate local stores from 1 to 5 stars, modify your reviews, and discover trusted neighborhood businesses.
          </p>

          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-700/80 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Search stores by Name & Street Address</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Submit 1 to 5 star ratings and update them anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Two-way sorting across all store listings</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          <p>© TrustPulse. All rights reserved.</p>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="lg:w-7/12 p-6 sm:p-10 lg:p-14 flex items-center justify-center bg-white overflow-y-auto">
        <div className="w-full max-w-lg space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Register as a normal user to rate and review stores
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to login</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <span className={`text-[11px] ${name.length > 0 && !isNameValid ? 'text-amber-700 font-semibold' : 'text-slate-400'}`}>
                  {name.length}/60 (min 20)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditya Shrikant Kulkarni"
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 text-sm transition-all ${
                    name.length > 0 && !isNameValid
                      ? 'border-amber-400 focus:ring-amber-500/10 focus:border-amber-500'
                      : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-800'
                  }`}
                />
              </div>
              {name.length > 0 && !isNameValid && (
                <p className="text-[11px] text-amber-700 mt-1">Name must be between 20 and 60 characters</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 text-sm transition-all ${
                    email.length > 0 && !isEmailValid
                      ? 'border-amber-400 focus:ring-amber-500/10 focus:border-amber-500'
                      : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-800'
                  }`}
                />
              </div>
              {email.length > 0 && !isEmailValid && (
                <p className="text-[11px] text-amber-700 mt-1">Please enter a valid email address</p>
              )}
            </div>

            {/* Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Address
                </label>
                <span className={`text-[11px] ${address.length > 400 ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
                  {address.length}/400
                </span>
              </div>
              <div className="relative">
                <div className="absolute top-3 left-3.5 flex items-start pointer-events-none text-slate-400">
                  <MapPin size={16} />
                </div>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full physical residential address..."
                  rows={2}
                  required
                  className={`w-full pl-10 pr-3.5 py-2 bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 text-sm transition-all resize-none ${
                    address.length > 400
                      ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500'
                      : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8-16 characters"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 text-sm transition-all ${
                    confirmPassword && !passwordsMatch
                      ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500'
                      : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-[11px] text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Password Requirements Checklist */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">Password Requirements:</p>
              <div className={`flex items-center gap-2 ${hasLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${hasLength ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                <span>8 to 16 characters</span>
              </div>
              <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${hasUppercase ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                <span>At least one uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${hasSpecial ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                <span>At least one special character (!@#$%...)</span>
              </div>
              {confirmPassword && (
                <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-700 font-medium' : 'text-red-600'}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${passwordsMatch ? 'bg-emerald-600' : 'bg-red-400'}`} />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <div className="pt-1 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateLogin}
                className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-4 cursor-pointer"
              >
                Sign in instead
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
