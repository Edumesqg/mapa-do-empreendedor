'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/site/SiteHeader';
import { AppConfig, DEFAULT_CONFIG, hydrateDevConfig, saveConfig } from '@/lib/session';

export default function ConfigPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateDevConfig().then((config) => {
      setConfig(config);
      setSaved(Boolean(config.apiKey));
      setReady(true);
    });
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveConfig({
      apiKey: config.apiKey.trim(),
      model: config.model.trim() || DEFAULT_CONFIG.model,
      baseURL: config.baseURL.trim() || DEFAULT_CONFIG.baseURL,
    });
    setSaved(true);
  };

  const clearKey = () => {
    const next = { ...config, apiKey: '' };
    setConfig(next);
    saveConfig(next);
    setSaved(true);
  };

  if (!ready) return <div className="min-h-screen bg-slate-gray" />;

  return (
    <div className="min-h-screen bg-slate-gray">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-12">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-royal-blue">Config</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy-blue">A sua API, no seu navegador.</h1>
        <p className="mt-3 text-slate-600">
          A chave fica neste dispositivo. Ela só sai daqui no momento da mensagem, direto para o provedor que você indicar. Sem conta, sem painel, sem chave nossa.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-carbon">
            Chave da API
            <Input
              type="password"
              value={config.apiKey}
              onChange={(event) => {
                setSaved(false);
                setConfig((current) => ({ ...current, apiKey: event.target.value }));
              }}
              placeholder="sk-..."
              className="mt-2 h-12"
              autoComplete="off"
            />
          </label>

          <label className="block text-sm font-medium text-carbon">
            Modelo
            <Input
              value={config.model}
              onChange={(event) => {
                setSaved(false);
                setConfig((current) => ({ ...current, model: event.target.value }));
              }}
              className="mt-2 h-12"
            />
          </label>

          <label className="block text-sm font-medium text-carbon">
            Endpoint compatível com OpenAI
            <Input
              value={config.baseURL}
              onChange={(event) => {
                setSaved(false);
                setConfig((current) => ({ ...current, baseURL: event.target.value }));
              }}
              className="mt-2 h-12"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="bg-royal-blue text-white hover:bg-[#1565C0]">
              Salvar neste navegador
            </Button>
            <Button type="button" variant="outline" onClick={clearKey}>
              Apagar chave
            </Button>
          </div>
          {saved && <p className="text-sm text-emerald-700">Salvo neste navegador.</p>}
        </form>
      </main>
    </div>
  );
}
