"use client"
import { useEffect, useMemo, useState } from "react";
import { logsApi } from "@/services/api";

export default function LogsPage() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [loggerName, setLoggerName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ total: number; page: number; limit: number; items: any[] }>({ total: 0, page: 1, limit: 50, items: [] });

  const levels = useMemo(() => ["", "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"], []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await logsApi.list({
        q: query || undefined,
        level: level || undefined,
        logger_name: loggerName || undefined,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        page,
        limit,
      });
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">System Logs</h1>

      <form onSubmit={onSearch} className="bg-gray-900/50 border border-gray-800/60 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input className="bg-gray-800/60 border border-gray-700 rounded px-3 py-2" placeholder="Search message..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="bg-gray-800/60 border border-gray-700 rounded px-3 py-2" value={level} onChange={(e) => setLevel(e.target.value)}>
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl || "All Levels"}</option>
          ))}
        </select>
        <input className="bg-gray-800/60 border border-gray-700 rounded px-3 py-2" placeholder="Logger name" value={loggerName} onChange={(e) => setLoggerName(e.target.value)} />
        <input type="datetime-local" className="bg-gray-800/60 border border-gray-700 rounded px-3 py-2" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        <input type="datetime-local" className="bg-gray-800/60 border border-gray-700 rounded px-3 py-2" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        <div className="flex items-center gap-2">
          <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white">Search</button>
          <select className="bg-gray-800/60 border border-gray-700 rounded px-2 py-2" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            {[25,50,100,200,500].map((n) => (<option key={n} value={n}>{n}/page</option>))}
          </select>
        </div>
      </form>

      <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg">
        <div className="p-3 border-b border-gray-800/60 flex justify-between text-sm text-gray-400">
          <div>Total: {data.total.toLocaleString()}</div>
          <div>Page {data.page} • {data.items.length} items</div>
        </div>
        <div className="p-0 max-h-[70vh] overflow-auto font-mono text-sm">
          {loading ? (
            <div className="p-4">Loading...</div>
          ) : error ? (
            <div className="p-4 text-red-400">{error}</div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-900/80 backdrop-blur">
                <tr className="text-left">
                  <th className="px-3 py-2 w-56">Time</th>
                  <th className="px-3 py-2 w-28">Level</th>
                  <th className="px-3 py-2 w-64">Logger</th>
                  <th className="px-3 py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={idx} className="border-t border-gray-800/60">
                    <td className="px-3 py-2 text-gray-400">{item.time}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.level === 'ERROR' || item.level === 'CRITICAL' ? 'bg-red-900/40 text-red-300' :
                        item.level === 'WARNING' ? 'bg-yellow-900/40 text-yellow-300' :
                        'bg-cyan-900/40 text-cyan-300'
                      }`}>{item.level}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-300">{item.logger}</td>
                    <td className="px-3 py-2 whitespace-pre-wrap text-gray-200">{item.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-3 border-t border-gray-800/60 flex items-center justify-between text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p-1))} className="px-3 py-1 bg-gray-800/70 rounded disabled:opacity-50">Prev</button>
          <div>Page {page}</div>
          <button disabled={(page * limit) >= data.total} onClick={() => setPage((p) => p+1)} className="px-3 py-1 bg-gray-800/70 rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}


