import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext.tsx';
import { Plus, Link as LinkIcon, CheckCircle2, Clock, XCircle, Calendar, UploadCloud } from 'lucide-react';
import { format } from 'date-fns';
import { app } from '../lib/firebase.ts';

export function ActivityTracker({ activities, setActivities }: { activities: any[], setActivities: any }) {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'SEMINAR',
    description: '',
    date: '',
    proofUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    
    // Check if it's a pdf or image
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
       alert('Please upload a PDF document or an image (JPEG/PNG).');
       return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Please upload a file smaller than 5MB.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setFormData({ ...formData, proofUrl: reader.result as string });
      setUploadProgress(100);
      setUploading(false);
    };
    reader.onerror = () => {
      console.error('File reading failed');
      setUploading(false);
    };
    // Convert to base64
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.proofUrl) {
      alert("Please upload a proof document before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(editingId ? `/api/activities/${editingId}` : '/api/activities', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const { activity } = await res.json();
        if (editingId) {
          setActivities(activities.map(a => a.id === editingId ? activity : a));
        } else {
          setActivities([activity, ...activities]);
        }
        setShowAddForm(false);
        setEditingId(null);
        setFormData({ title: '', type: 'SEMINAR', description: '', date: '', proofUrl: '' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const activityTypes = [
    'SEMINAR', 'CONFERENCE', 'COURSE', 'INTERNSHIP', 'EXTRA_CURRICULAR', 'COMPETITION', 'LEADERSHIP', 'COMMUNITY_SERVICE'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Activity Tracker</h3>
          <p className="text-sm text-gray-500 mt-1">Log your co-curricular and extracurricular achievements.</p>
        </div>
        <button
          onClick={() => {
            if (!showAddForm || editingId) {
              setFormData({ title: '', type: 'SEMINAR', description: '', date: '', proofUrl: '' });
              setEditingId(null);
              setShowAddForm(true);
            } else {
              setShowAddForm(false);
            }
          }}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Activity Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" placeholder="e.g. React Advanced Course" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Activity Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm">
                  {activityTypes.map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Proof Document (PDF/Image)</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <input type="file" accept="image/png, image/jpeg, application/pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud className="w-6 h-6 text-indigo-500 mb-2" />
                  <span className="text-sm font-medium text-indigo-600 text-center">
                     {uploading ? `Uploading...` : formData.proofUrl ? 'File uploaded successfully (click to replace)' : 'Click or drag PDF/Image here'}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm h-24" placeholder="Briefly describe what you did..." />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => { setShowAddForm(false); setEditingId(null); setFormData({ title: '', type: 'SEMINAR', description: '', date: '', proofUrl: '' }); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
              <button disabled={submitting || uploading} type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2">
                {submitting ? 'Saving...' : editingId ? 'Update Activity' : 'Submit to Faculty'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No activities found. Start logging!</div>
          ) : activities.map((activity) => (
            <li key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-base font-semibold text-gray-900">{activity.title}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 uppercase tracking-wide">
                      {activity.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 max-w-2xl">{activity.description}</p>
                  
                  {activity.status === 'REJECTED' && activity.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 text-red-800 text-sm rounded-lg border border-red-100 flex items-start space-x-2 w-full max-w-2xl">
                      <XCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                      <div>
                         <p className="font-semibold text-red-900 mb-0.5">Rejection Reason</p>
                         <p>{activity.rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center space-x-6 text-xs text-gray-500 font-medium">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{format(new Date(activity.date), 'MMM d, yyyy')}</span>
                    </div>
                    {activity.proofUrl && (
                      <a href={activity.proofUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:text-indigo-600 transition-colors">
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>View Proof</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                  <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    activity.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    activity.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {activity.status === 'APPROVED' && <CheckCircle2 className="w-4 h-4" />}
                    {activity.status === 'PENDING' && <Clock className="w-4 h-4" />}
                    {activity.status === 'REJECTED' && <XCircle className="w-4 h-4" />}
                    <span>{activity.status}</span>
                  </div>
                  
                  {activity.status === 'REJECTED' && (
                    <button
                      onClick={() => {
                        setEditingId(activity.id);
                        setFormData({
                          title: activity.title,
                          type: activity.type,
                          description: activity.description,
                          date: new Date(activity.date).toISOString().split('T')[0],
                          proofUrl: activity.proofUrl
                        });
                        setShowAddForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors border border-indigo-200"
                    >
                      Re-apply
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
