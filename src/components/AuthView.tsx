import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext.tsx';
import { LogIn, UserPlus, Search, Check, AlertCircle } from 'lucide-react';
import { LandingPage } from './LandingPage.tsx';

export function AuthView() {
  const { user, loginWithGoogle, completeRegistration, logOut } = useAuth();
  
  // Registration Profile Fields
  const [role, setRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  
  const [rollNumber, setRollNumber] = useState('');
  const [searchingRoll, setSearchingRoll] = useState(false);
  const [rollVerified, setRollVerified] = useState<boolean | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookupRoll = async () => {
    if (!rollNumber) return;
    setSearchingRoll(true);
    setRollVerified(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/auth/lookup-roll?rollNumber=${encodeURIComponent(rollNumber.trim().toUpperCase())}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.record) {
          setName(data.record.name);
          setBranch(data.record.branch);
          setGraduationYear(String(data.record.graduationYear));
          setRollVerified(true);
        }
      } else {
        setRollVerified(false);
      }
    } catch (e) {
      console.error(e);
      setRollVerified(false);
    } finally {
      setSearchingRoll(false);
    }
  };

  // If user is NOT logged into Firebase, show Google Login only
  if (!user) {
    return <LandingPage loginWithGoogle={loginWithGoogle} />;
  }

  // If user IS logged into Firebase, but no profile (dbUser is null), show Registration
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'STUDENT') {
        await completeRegistration(role, { name, branch, graduationYear, phoneNumber, rollNumber });
      } else {
        await completeRegistration(role, { name, department });
      }
    } catch (err: any) {
      setError(err.message || 'Profile setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col font-sans items-center justify-center bg-[#f9f9f9] p-4">
      <div className="max-w-md w-full px-8 py-10 bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100">
        <div className="mb-8 text-center flex justify-between items-start">
          <div className="text-left">
             <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Complete Profile</h1>
             <p className="text-gray-500 font-medium text-sm">One last step before you start.</p>
          </div>
          <button onClick={logOut} className="text-sm font-medium text-gray-500 hover:text-gray-900">Sign Out</button>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmitProfile} className="space-y-4">
          <div className="flex space-x-4 mb-4">
            <label className="flex items-center space-x-2 text-sm text-gray-700 font-medium cursor-pointer">
              <input type="radio" checked={role === 'STUDENT'} onChange={() => setRole('STUDENT')} className="text-indigo-600" />
              <span>I am a Student</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-700 font-medium cursor-pointer">
              <input type="radio" checked={role === 'FACULTY'} onChange={() => setRole('FACULTY')} className="text-indigo-600" />
              <span>I am a Faculty</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="John Doe" />
          </div>

          {role === 'STUDENT' && (
             <>
               <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/60 mb-4 space-y-3">
                 <label className="block text-sm font-semibold text-indigo-900">University Roll Number</label>
                 <div className="flex space-x-2">
                   <div className="relative flex-1">
                     <input 
                       type="text" 
                       value={rollNumber} 
                       onChange={e => setRollNumber(e.target.value)} 
                       className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium uppercase placeholder-slate-400" 
                       placeholder="e.g. 2024UBT1002" 
                     />
                   </div>
                   <button
                     type="button"
                     disabled={searchingRoll || !rollNumber}
                     onClick={handleLookupRoll}
                     className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                   >
                     {searchingRoll ? (
                       <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     ) : (
                       <Search className="w-4 h-4" />
                     )}
                     <span>Verify</span>
                   </button>
                 </div>
                 
                 {rollVerified === true && (
                   <div className="flex items-center space-x-1.5 text-xs text-green-700 font-semibold bg-green-50 border border-green-100 p-2 rounded-lg">
                     <Check className="w-4 h-4 shrink-0 text-green-600" />
                     <span>Verified Gazette Record Found! Auto-filled profile.</span>
                   </div>
                 )}

                 {rollVerified === false && (
                   <div className="flex items-start space-x-1.5 text-xs text-amber-700 font-medium bg-amber-50 border border-amber-100 p-2 rounded-lg">
                     <AlertCircle className="w-4.5 h-4.5 shrink-0 text-amber-600 mt-0.5" />
                     <span>Not found in gazette records. You can still fill name/branch manually.</span>
                   </div>
                 )}
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                 <input required type="text" value={branch} onChange={e => setBranch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Computer Science" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                   <input required type="number" min="2000" max="2100" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="2025" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                   <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="+1..." />
                 </div>
               </div>
             </>
          )}

          {role === 'FACULTY' && (
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
               <input required type="text" value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Computer Science" />
             </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl transition-all duration-200 mt-6 font-semibold disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            <span>{loading ? 'Processing...' : 'Save Profile Dashboard'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
