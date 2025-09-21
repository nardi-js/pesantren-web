"use client";
import { FormField } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useToast } from '@/components/admin/ToastProvider';

export default function ProfileSettingsPage(){
  const { push } = useToast();
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-wide">Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">UI only. Change fields and click save to see toast.</p>
      </div>
      <form className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Name"><input className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm" placeholder="Your Name" /></FormField>
          <FormField label="Email"><input type="email" className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm" placeholder="you@example.com" /></FormField>
          <FormField label="Password" hint="Not actually updating"><input type="password" className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm" placeholder="••••••••" /></FormField>
          <FormField label="Role"><input className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm" placeholder="Admin" /></FormField>
        </div>
        <div>
          <FormField label="Avatar" hint="Upload preview only">
            <ImageUploader />
          </FormField>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={()=>push('Saved profile (placeholder)','success')} className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium">Save Changes</button>
          <button type="reset" className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-sm">Reset</button>
        </div>
      </form>
    </div>
  );
}
