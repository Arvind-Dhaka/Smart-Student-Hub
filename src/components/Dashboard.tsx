import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/AuthContext.tsx';
import { ActivityTracker } from './ActivityTracker.tsx';
import { FileDown, Award, BookOpen, GraduationCap, Clock, FileCheck, X, Loader2, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Markdown from 'react-markdown';

export function Dashboard() {
  const { user, dbUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'tracker'>('overview');
  const [activities, setActivities] = useState<any[]>([]);

  const [generatingPortfolio, setGeneratingPortfolio] = useState(false);
  const [portfolioMarkdown, setPortfolioMarkdown] = useState<string | null>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const portfolioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      const token = await user.getIdToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        const actRes = await fetch('/api/activities', { headers });
        if (actRes.ok) {
          const actData = await actRes.json();
          setActivities(actData.activities || []);
        }
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      }
    }
    fetchData();
  }, [user]);

  const handleGeneratePortfolio = async () => {
    if (!user) return;
    setGeneratingPortfolio(true);
    setShowPortfolioModal(true);
    setPortfolioMarkdown(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/activities/generate-portfolio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (res.ok) {
        setPortfolioMarkdown(data.markdown);
      } else {
        alert(data.error || 'Failed to generate portfolio');
        setShowPortfolioModal(false);
      }
    } catch (e) {
      console.error(e);
      alert('Network error while generating portfolio.');
      setShowPortfolioModal(false);
    } finally {
      setGeneratingPortfolio(false);
    }
  };

  const downloadPdf = async () => {
    if (!portfolioMarkdown) return;
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const { marked } = await import('marked');

      const htmlContent = await marked.parse(portfolioMarkdown);

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        alert("Error preparing PDF generator");
        return;
      }

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                color: #1a1a1a; 
                background: #ffffff; 
                padding: 40px; 
                line-height: 1.6;
              }
              h1, h2, h3 { color: #000000; border-bottom: 1px solid #eaeaea; padding-bottom: 8px; margin-top: 24px; margin-bottom: 16px; font-weight: bold; }
              h1 { font-size: 28px; }
              h2 { font-size: 22px; }
              h3 { font-size: 18px; }
              p { margin-bottom: 16px; }
              ul { margin-bottom: 16px; padding-left: 20px; }
              li { margin-bottom: 8px; }
            </style>
          </head>
          <body>
            <div id="pdf-content">${htmlContent}</div>
          </body>
        </html>
      `);
      doc.close();

      const element = doc.getElementById('pdf-content');
      const opt = {
        margin:       [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
        filename:     `${user?.displayName?.split(' ').join('_') || 'Student'}_Portfolio.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
      document.body.removeChild(iframe);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const stats = [
    { label: 'Total Activities', value: activities.length, icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Verified Credits', value: activities.filter(a => a.status === 'APPROVED').length * 2, icon: FileCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Approval', value: activities.filter(a => a.status === 'PENDING').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const chartData = [
    { name: 'Sem 1', gpa: 8.5 },
    { name: 'Sem 2', gpa: 9.1 },
    { name: 'Sem 3', gpa: 8.8 },
    { name: 'Sem 4', gpa: 9.3 },
  ];

  return (
    <div className="space-y-6">
      <div className="print:hidden space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back, {dbUser?.name?.split(' ')[0] || user?.displayName?.split(' ')[0]}</h2>
            <p className="text-sm text-gray-500 mt-1">{dbUser?.branch || "Computer Science & Engineering"} • Graduation Year {dbUser?.graduationYear || "N/A"}</p>
          </div>
          <button onClick={handleGeneratePortfolio} className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            <FileDown className="w-4 h-4" />
            <span>Generate Portfolio PDF</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'tracker', label: 'Activity Tracker' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-1 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Academic Performance */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-6">
                  <GraduationCap className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Academic Performance</h3>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} domain={[0, 10]} />
                      <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="gpa" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-6">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                </div>
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{activity.type.replace('_', ' ')}</p>
                      </div>
                      <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        activity.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        activity.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {activity.status}
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-center py-10 text-gray-500 text-sm">
                      No activities recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <ActivityTracker activities={activities} setActivities={setActivities} />
          </div>
        )}
      </div>

      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:relative print:inset-auto print:bg-transparent print:p-0 print:block">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden print:max-w-none print:shadow-none print:max-h-none print:rounded-none">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 print:hidden">
              <h3 className="text-xl font-bold text-gray-900">Your AI-Generated Portfolio</h3>
              <button 
                onClick={() => setShowPortfolioModal(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50 print:p-0 print:bg-white print:overflow-visible">
              {generatingPortfolio ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4 print:hidden">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  <p>Synthesizing your activities into a portfolio...</p>
                </div>
              ) : portfolioMarkdown ? (
                <div className="bg-white p-10 shadow-sm border border-gray-200 rounded-lg min-h-full print:border-none print:shadow-none print:p-0">
                  <div ref={portfolioRef} className="markdown-body prose prose-indigo max-w-none">
                    <Markdown>{portfolioMarkdown}</Markdown>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-6 border-t border-gray-100 bg-white flex justify-end space-x-3 print:hidden">
              <button 
                onClick={() => setShowPortfolioModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Close
              </button>
              <button 
                disabled={generatingPortfolio || !portfolioMarkdown}
                onClick={() => downloadPdf()}
                className="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
