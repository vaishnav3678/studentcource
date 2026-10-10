import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { fetchCourseById, fetchEnrollments, subscribeDataChanges } from '../services/api';
import { Course } from '../types';
import { ArrowLeft, CalendarDays, ExternalLink, GraduationCap, Link2, MessageCircle, RefreshCw, Video } from 'lucide-react';

interface CourseLearningPageProps {
  courseId: string;
  onNavigate: (view: string, extra?: any) => void;
}

/** Full-screen course hub. Student-facing video and PDF controls are intentionally removed. */
export const CourseLearningPage: React.FC<CourseLearningPageProps> = ({ courseId, onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const { error } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCourse = useCallback(async (silent = false) => {
    try {
      const loaded = await fetchCourseById(courseId);
      if (!isAdmin && user) {
        const enrollments = await fetchEnrollments(user.id);
        const allowed = enrollments.some((item) => item.courseId === courseId && item.status === 'active');
        if (!allowed) {
          if (!silent) {
            error(`Access denied: you are not enrolled in "${loaded.title}".`);
            onNavigate('dashboard');
          }
          return;
        }
      }
      setCourse(loaded);
    } catch (err: any) {
      if (!silent) {
        error(err?.message || 'Unable to load course links.');
        onNavigate('dashboard');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [courseId, user, isAdmin, error, onNavigate]);

  useEffect(() => {
    void loadCourse();
    const onFocus = () => void loadCourse(true);
    window.addEventListener('focus', onFocus);
    const unsubscribe = subscribeDataChanges(() => void loadCourse(true));
    const timer = window.setInterval(() => void loadCourse(true), 4000);
    return () => {
      window.removeEventListener('focus', onFocus);
      unsubscribe();
      window.clearInterval(timer);
    };
  }, [loadCourse]);

  if (loading || !course) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-600"><div className="text-center"><RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-blue-700" /><p className="text-sm">Loading your course links…</p></div></div>;
  }

  const meeting = course.meetingSchedule;
  const publishedMeeting = meeting?.isPublished;
  const whatsappUrl = meeting?.whatsappGroupUrl;

  return (
    <main className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col">
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => onNavigate('dashboard')} className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" aria-label="Back to dashboard"><ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Back to Dashboard</span></button>
          <div className="min-w-0"><p className="text-xs uppercase tracking-[0.18em] font-bold text-blue-700">Pathfinder Learning Portal</p><h1 className="text-lg sm:text-2xl font-extrabold text-[#0B2147] truncate">{course.title}</h1></div>
        </div>
        <button onClick={() => void loadCourse()} className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100"><RefreshCw className="w-4 h-4" /><span className="hidden sm:inline">Refresh</span></button>
      </header>

      <section className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-[#0B2147] via-[#123c78] to-blue-700 p-6 sm:p-10 text-white shadow-xl overflow-hidden relative">
            <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full border-[28px] border-white/5" />
            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold"><GraduationCap className="w-4 h-4" /> Student Course Hub</div>
              <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">Your learning links, all in one place.</h2>
              <p className="mt-4 max-w-2xl text-sm sm:text-base text-blue-100 leading-relaxed">Use the latest live-class link and join your course WhatsApp group. Links are updated by the Pathfinder administrator and refresh automatically.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-7">
            <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center"><Video className="w-6 h-6" /></div>
              <h3 className="mt-5 text-xl font-extrabold text-[#0B2147]">Live Class Meeting</h3>
              {publishedMeeting ? <>
                <p className="mt-2 text-sm text-slate-600">{meeting.title || 'Live Class'}</p>
                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4"><CalendarDays className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" /><div><p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Schedule</p><p className="mt-1 text-sm font-semibold text-slate-800">{meeting.timeDescription || 'Please check with your instructor.'}</p><p className="mt-1 text-xs text-slate-500">Platform: {meeting.platform}</p></div></div>
                {meeting.instructions && <p className="mt-3 text-sm text-slate-600">{meeting.instructions}</p>}
                <a href={meeting.url} target="_blank" rel="noreferrer" className="mt-6 w-full rounded-xl bg-[#0B2147] hover:bg-blue-900 text-white py-3.5 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors"><Video className="w-4 h-4" /> Join Live Meeting <ExternalLink className="w-4 h-4" /></a>
              </> : <div className="mt-4 flex-1 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">The live meeting link has not been published yet. Please check again later.</div>}
            </article>

            <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><MessageCircle className="w-6 h-6" /></div>
              <h3 className="mt-5 text-xl font-extrabold text-[#0B2147]">Course WhatsApp Group</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Join your course group for announcements, class reminders, and instructor updates.</p>
              {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-6 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors"><MessageCircle className="w-4 h-4" /> Join WhatsApp Group <ExternalLink className="w-4 h-4" /></a> : <div className="mt-6 flex-1 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 flex items-center gap-2"><Link2 className="w-4 h-4 shrink-0" /> The administrator has not added the WhatsApp group link yet.</div>}
            </article>
          </div>
          <p className="mt-7 text-center text-xs text-slate-500">Pathfinder Learning Portal · This page updates when the administrator changes the links.</p>
        </div>
      </section>
    </main>
  );
};
