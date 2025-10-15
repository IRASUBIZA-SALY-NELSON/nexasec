"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { networkInfoApi } from "@/services/networkService";
import { API_URL, fetchConfig } from "@/lib/api";

interface ServiceItem {
  port: number;
  state: string;
  service: string;
  version?: string;
}

export default function HostDetailsPage() {
  const params = useParams<{ ip?: string } | null>();
  const ip = decodeURIComponent(params?.ip ?? "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ ip: string; mac?: string; services: ServiceItem[]; nmap_error?: string } | null>(null);
  const [whois, setWhois] = useState<unknown | null>(null);
  const [shodan, setShodan] = useState<unknown | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'intel'>('overview');

  // Credential prompt state (UI only for now)
  const [showCreds, setShowCreds] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await networkInfoApi.getHostDetails(ip);
        setData(res);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load host details");
      } finally {
        setLoading(false);
      }
    };
    if (ip) load();
  }, [ip]);

  useEffect(() => {
    const loadIntel = async () => {
      try {
        const w = await fetch(`${API_URL}/external/whois?query=${encodeURIComponent(ip)}`, { ...fetchConfig });
        if (w.ok) setWhois(await w.json());
      } catch { }
      try {
        const s = await fetch(`${API_URL}/external/shodan?ip=${encodeURIComponent(ip)}`, { ...fetchConfig });
        if (s.ok) setShodan(await s.json());
      } catch { }
    };
    if (ip) loadIntel();
  }, [ip]);

  const services = useMemo(() => (data?.services || []).sort((a: ServiceItem, b: ServiceItem) => a.port - b.port), [data]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Host Details: {ip}</h1>
        <button onClick={() => setShowCreds(true)} className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded">Provide Credentials</button>
      </div>

      {showCreds && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl mb-4">Authenticate to {ip}</h2>
            <div className="space-y-3">
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2" />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowCreds(false)} className="px-3 py-2 bg-gray-800 rounded">Cancel</button>
                <button onClick={() => setShowCreds(false)} className="px-3 py-2 bg-cyan-600 rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['overview', 'services', 'intel'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as 'overview' | 'services' | 'intel')} className={`px-3 py-2 rounded ${activeTab === t ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-300'}`}>{t.toUpperCase()}</button>
        ))}
      </div>

      {loading ? (
        <div className="p-4">Loading...</div>
      ) : error ? (
        <div className="p-4 text-red-400">{error}</div>
      ) : data ? (
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg p-4">
              <h2 className="text-lg font-medium mb-2">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                <div><span className="text-gray-400">IP:</span> {data.ip}</div>
                <div><span className="text-gray-400">MAC:</span> {data.mac || "Unknown"}</div>
                <div><span className="text-gray-400">nmap:</span> {data.nmap_error ? <span className="text-yellow-400">{data.nmap_error}</span> : "OK"}</div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg p-4">
              <h2 className="text-lg font-medium mb-3">Services</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left">
                    <tr>
                      <th className="px-3 py-2">Port</th>
                      <th className="px-3 py-2">State</th>
                      <th className="px-3 py-2">Service</th>
                      <th className="px-3 py-2">Version</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s: ServiceItem, idx: number) => (
                      <tr key={idx} className="border-t border-gray-800/60">
                        <td className="px-3 py-2">{s.port}</td>
                        <td className="px-3 py-2">{s.state}</td>
                        <td className="px-3 py-2">{s.service}</td>
                        <td className="px-3 py-2">{s.version}</td>
                      </tr>
                    ))}
                    {services.length === 0 && (
                      <tr><td className="px-3 py-4 text-gray-400" colSpan={4}>No services detected.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'intel' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg p-4">
                <h2 className="text-lg font-medium mb-3">WHOIS / RDAP</h2>
                <pre className="text-xs whitespace-pre-wrap text-gray-300 max-h-96 overflow-auto">{whois ? JSON.stringify(whois, null, 2) : 'No data'}</pre>
              </div>
              <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg p-4">
                <h2 className="text-lg font-medium mb-3">Shodan</h2>
                <pre className="text-xs whitespace-pre-wrap text-gray-300 max-h-96 overflow-auto">{shodan ? JSON.stringify(shodan, null, 2) : 'No data or API key not set'}</pre>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
