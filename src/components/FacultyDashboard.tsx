import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext.tsx';
import { CheckCircle, XCircle, Search, Clock, Award, FileText } from 'lucide-react';
import { format } from 'date-fns';

export function FacultyDashboard() {
  const { user, dbUser } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      const token = await user.getIdToken();
      try {
        const res = await fetch('/api/faculty/activities', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data.data || []);
        }
      } catch (e) {
        console.error('Failed to fetch', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleReview = async (id: number, status: 'APPROVED' | 'REJECTED', reasonStr?: string) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/faculty/activities/${id}/review`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status, rejectionReason: reasonStr })
        });
        if (res.ok) {
           const { activity } = await res.json();
           setItems(items.map(item => item.activity.id === id ? { ...item, activity: { ...item.activity, status: activity.status, rejectionReason: activity.rejectionReason } } : item));
           setRejectingId(null);
           setRejectionReason('');
        }
      } catch(e) {
          console.error(e);
      }
  };

  if (loading) {
      return <div className="p-8 text-center text-gray-500">Loading department activities...</div>;
  }

  const pendingCount = items.filter(i => i.activity.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Faculty Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Reviewing submissions for {dbUser?.department} department.</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl">
           <Clock className="w-5 h-5" />
           <span className="font-semibold">{pendingCount} Pending Reviews</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No activities submitted from students yet.</div>
          ) : items.map(({ activity, student }) => (
            <li key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row gap-6">
                 <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                       <div>
                         <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                           <span>{activity.title}</span>
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 uppercase tracking-wide">
                             {activity.type.replace('_', ' ')}
                           </span>
                         </h4>
                         <p className="text-sm text-gray-500 mt-1">
                           Submitted by <span className="font-medium text-gray-900">{student.name}</span> ({student.branch}, Year {student.graduationYear})
                         </p>
                       </div>
                       <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          activity.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          activity.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {activity.status === 'APPROVED' && <CheckCircle className="w-4 h-4" />}
                          {activity.status === 'PENDING' && <Clock className="w-4 h-4" />}
                          {activity.status === 'REJECTED' && <XCircle className="w-4 h-4" />}
                          <span>{activity.status}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-100 p-4 rounded-xl">{activity.description}</p>
                    <div className="flex items-center space-x-4 text-xs font-medium text-gray-500 pt-2">
                       <span className="flex items-center space-x-1"><Award className="w-4 h-4"/> <span>{format(new Date(activity.date), 'MMM d, yyyy')}</span></span>
                       <a href={activity.proofUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:text-indigo-600 text-indigo-500">
                          <FileText className="w-4 h-4" />
                          <span>View Proof</span>
                       </a>
                    </div>
                 </div>
                 <div className="lg:w-48 flex lg:flex-col lg:justify-center gap-3">
                    {activity.status === 'PENDING' ? (
                       <>
                         {rejectingId === activity.id ? (
                           <div className="flex flex-col gap-2 w-full">
                             <textarea 
                               placeholder="Reason for rejection..." 
                               value={rejectionReason}
                               onChange={(e) => setRejectionReason(e.target.value)}
                               className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                               rows={3}
                             />
                             <div className="flex gap-2">
                               <button onClick={() => setRejectingId(null)} className="flex-1 text-xs text-gray-700 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200">Cancel</button>
                               <button onClick={() => handleReview(activity.id, 'REJECTED', rejectionReason)} className="flex-1 text-xs text-white py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium">Confirm</button>
                             </div>
                           </div>
                         ) : (
                           <>
                             <button onClick={() => handleReview(activity.id, 'APPROVED')} className="flex-1 lg:flex-none flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors font-medium">
                               <CheckCircle className="w-4 h-4"/>
                               <span>Approve</span>
                             </button>
                             <button onClick={() => setRejectingId(activity.id)} className="flex-1 lg:flex-none flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl transition-colors font-medium">
                               <XCircle className="w-4 h-4"/>
                               <span>Reject</span>
                             </button>
                           </>
                         )}
                       </>
                    ) : (
                       <div className="text-sm text-gray-500 w-full text-center p-3 border border-dashed border-gray-200 rounded-xl">
                          Review completed
                       </div>
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
