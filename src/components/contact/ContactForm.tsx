'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const t = useTranslations('contact_page');
  const [state, setState] = useState<FormState>('idle');
  const [form, setForm] = useState({ name: '', email: '', restaurant: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('submitting');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setState('success');
  };

  if (state === 'success') {
    return (
      <div className="rounded-xl border border-jukely-brique/30 bg-jukely-brique/10 p-8 text-center text-jukely-brique">
        {t('success')}
      </div>
    );
  }

  const fields = [
    { name: 'name', label: t('name_label'), type: 'text' as const },
    { name: 'email', label: t('email_label'), type: 'email' as const },
    { name: 'restaurant', label: t('restaurant_label'), type: 'text' as const },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="mb-2 block text-sm font-medium text-jukely-ardoise" htmlFor={field.name}>
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            required
            value={form[field.name as keyof typeof form]}
            onChange={handleChange}
            className="w-full rounded-lg border border-jukely-nuit/20 bg-white px-4 py-3 text-sm text-jukely-nuit outline-none focus:border-jukely-moutarde focus:ring-1 focus:ring-jukely-moutarde/30"
          />
        </div>
      ))}
      <div>
        <label className="mb-2 block text-sm font-medium text-jukely-ardoise" htmlFor="message">
          {t('message_label')}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          className="w-full rounded-lg border border-jukely-nuit/20 bg-white px-4 py-3 text-sm text-jukely-nuit outline-none focus:border-jukely-moutarde focus:ring-1 focus:ring-jukely-moutarde/30"
        />
      </div>
      {state === 'error' && <p className="text-sm text-jukely-brique">{t('error')}</p>}
      <Button type="submit" variant="primary" disabled={state === 'submitting'} className="w-full py-3">
        {state === 'submitting' ? '...' : t('submit')}
      </Button>
    </form>
  );
}
