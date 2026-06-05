'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Award, Download, ShieldCheck, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/app/providers';

export default function StudentMarksPage() {
  const { toast } = useToast();
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await api.get('/student/marks');
        setMarks(res.data.data);
      } catch (err) {
        toast('Failed to load marks sheet. Showing demo fallback.', 'warning');
        setMarks([
          { subject_code: 'CS301', subject_name: 'Data Structures & Algorithms', exam_type: 'Internal 1', marks: 22.5, total_marks: 25 },
          { subject_code: 'CS301', subject_name: 'Data Structures & Algorithms', exam_type: 'Internal 2', marks: 21.0, total_marks: 25 },
          { subject_code: 'CS301', subject_name: 'Data Structures & Algorithms', exam_type: 'Semester', marks: 88.0, total_marks: 100 },
          { subject_code: 'CS302', subject_name: 'Database Management Systems', exam_type: 'Internal 1', marks: 19.5, total_marks: 25 },
          { subject_code: 'EC301', subject_name: 'Digital Signal Processing', exam_type: 'Internal 1', marks: 24.0, total_marks: 25 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [toast]);

  const handleDownloadTranscript = async () => {
    try {
      toast('Generating transcript PDF...', 'info');
      const response = await api.get('/student/transcript', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `transcript.pdf`;
      link.click();
      toast('Transcript downloaded successfully!', 'success');
    } catch (err) {
      toast('Failed to generate PDF. Trying direct download.', 'error');
      window.open('http://localhost:5000/api/student/transcript');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Academic Gradebook</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review internal marks, midterm assessments, and semester transcripts.</p>
        </div>
        <button
          onClick={handleDownloadTranscript}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm cursor-pointer shadow-md shadow-brand-500/20 transition-all card-hover"
        >
          <Download className="w-4 h-4" /> Download Official Transcript PDF
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Exam Type</th>
                <th className="py-3 px-4">Score Secured</th>
                <th className="py-3 px-4">Maximum Marks</th>
                <th className="py-3 px-4 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {marks.map((item, idx) => {
                const percentage = Math.round((item.marks / item.total_marks) * 100);
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-850 dark:text-white leading-tight">
                        {item.subject_name || 'Subject Course'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.subject_code}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-650 dark:text-slate-350">{item.exam_type}</td>
                    <td className="py-4 px-4 font-extrabold text-brand-500 text-base">{item.marks}</td>
                    <td className="py-4 px-4 font-bold text-slate-500 dark:text-slate-400">{item.total_marks}</td>
                    <td className="py-4 px-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                        percentage >= 80 
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                          : percentage >= 50 
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' 
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}>
                        {percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
