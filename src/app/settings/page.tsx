"use client";

import { useState, useEffect } from "react";
import { SEARCH_INTERVALS } from "@/lib/constants";
import { SearchConfig } from "@/types";
import { Save, Loader2, Settings, Clock } from "lucide-react";
import { clsx } from "clsx";

export default function SettingsPage() {
  const [config, setConfig] = useState<SearchConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-gray-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500">
            Gerencie suas preferências de busca
          </p>
        </div>
      </div>

      <div className="max-w-2xl bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Palavras-chave
          </label>
          <input
            type="text"
            value={config.keywords}
            onChange={(e) => setConfig({ ...config, keywords: e.target.value })}
            placeholder="Ex: React, Node.js, TypeScript"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Localização
          </label>
          <input
            type="text"
            value={config.location}
            onChange={(e) => setConfig({ ...config, location: e.target.value })}
            placeholder="Ex: Brasil, Remote, São Paulo"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intervalo de busca
          </label>
          <div className="grid grid-cols-4 gap-3">
            {SEARCH_INTERVALS.map((interval) => (
              <button
                key={interval.value}
                onClick={() =>
                  setConfig({ ...config, intervalHours: interval.value })
                }
                className={clsx(
                  "px-4 py-3 rounded-lg border text-sm font-medium transition-colors",
                  config.intervalHours === interval.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {interval.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Busca automática
            </p>
            <p className="text-sm text-gray-500">
              Ativar busca periódica de vagas
            </p>
          </div>
          <button
            onClick={() => setConfig({ ...config, isActive: !config.isActive })}
            className={clsx(
              "relative w-12 h-6 rounded-full transition-colors",
              config.isActive ? "bg-blue-600" : "bg-gray-300"
            )}
          >
            <span
              className={clsx(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                config.isActive && "translate-x-6"
              )}
            />
          </button>
        </div>

        {config.lastSearchAt && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>
              Última busca:{" "}
              {new Date(config.lastSearchAt).toLocaleString("pt-BR")}
            </span>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-colors",
            saved
              ? "bg-green-600"
              : "bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          )}
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "Salvando..." : saved ? "Salvo com sucesso!" : "Salvar"}
        </button>
      </div>
    </div>
  );
}
