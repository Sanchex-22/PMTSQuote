import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Users, UserCheck, X, Loader2 } from 'lucide-react';
import Context from '../../context/userContext';
import UserProfileContext from '../../context/userProfileContext';

const API_URL = import.meta.env.VITE_API_URL;

interface Result {
  id: number;
  label: string;
  sublabel?: string;
  href: string;
  type: 'course' | 'user' | 'client';
}

const typeIcon: Record<Result['type'], React.ReactNode> = {
  course: <BookOpen className="h-3.5 w-3.5" />,
  user:   <Users className="h-3.5 w-3.5" />,
  client: <UserCheck className="h-3.5 w-3.5" />,
};

const typeLabel: Record<Result['type'], string> = {
  course: 'Curso',
  user:   'Usuario',
  client: 'Cliente',
};

const typeBadge: Record<Result['type'], string> = {
  course: 'bg-blue-50 text-blue-600 border border-blue-200',
  user:   'bg-purple-50 text-purple-600 border border-purple-200',
  client: 'bg-orange-50 text-orange-600 border border-orange-200',
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function getJwtToken(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return raw;
  }
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  const { jwt } = useContext(Context) as { jwt: string | null };
  const profileCtx = useContext(UserProfileContext);
  const role = profileCtx?.profile?.roles ?? 'user';
  const isAdmin = role === 'admin' || role === 'super_admin';

  const token = getJwtToken(jwt);
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const lower = q.toLowerCase();
      const found: Result[] = [];

      // Courses — accesible para admin y moderador
      try {
        const res = await fetch(`${API_URL}/api/courses/getAllCourses?page=1&limit=100`, { headers: authHeaders });
        if (res.ok) {
          const json = await res.json();
          const courses = json?.data ?? (Array.isArray(json) ? json : []);
          courses
            .filter((c: any) =>
              c.name?.toLowerCase().includes(lower) ||
              c.abbr?.toLowerCase().includes(lower) ||
              c.imo_no?.toLowerCase().includes(lower)
            )
            .slice(0, 5)
            .forEach((c: any) => found.push({
              id: c.id, type: 'course',
              label: c.name,
              sublabel: [c.abbr, c.imo_no].filter(Boolean).join(' · ') || undefined,
              href: '/courses-admin/list',
            }));
        }
      } catch { /* silencioso */ }

      // Usuarios — solo admin y super_admin
      if (isAdmin) {
        try {
          const res = await fetch(`${API_URL}/api/user?page=1&limit=100`, { headers: authHeaders });
          if (res.ok) {
            const json = await res.json();
            const users = json?.data ?? (Array.isArray(json) ? json : []);
            users
              .filter((u: any) =>
                u.name?.toLowerCase().includes(lower) ||
                u.email?.toLowerCase().includes(lower)
              )
              .slice(0, 5)
              .forEach((u: any) => found.push({
                id: u.id, type: 'user',
                label: u.name || u.email,
                sublabel: u.name ? u.email : undefined,
                href: '/users/list',
              }));
          }
        } catch { /* silencioso */ }
      }

      // Clientes — admin y moderador
      try {
        const res = await fetch(`${API_URL}/api/clients/getAll?page=1&limit=100`, { headers: authHeaders });
        if (res.ok) {
          const json = await res.json();
          const clients = json?.data ?? (Array.isArray(json) ? json : []);
          clients
            .filter((c: any) =>
              c.name?.toLowerCase().includes(lower) ||
              c.email?.toLowerCase().includes(lower)
            )
            .slice(0, 5)
            .forEach((c: any) => found.push({
              id: c.id, type: 'client',
              label: c.name || c.email,
              sublabel: c.name ? c.email : undefined,
              href: '/clients/list',
            }));
        }
      } catch { /* silencioso */ }

      setResults(found);
      setOpen(found.length > 0);
      setFocused(-1);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, token]);

  useEffect(() => { runSearch(debouncedQuery); }, [debouncedQuery, runSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)); }
    if (e.key === 'Enter' && focused >= 0) { navigate(results[focused].href); clear(); }
  };

  const clear = () => { setQuery(''); setResults([]); setOpen(false); setFocused(-1); };
  const handleSelect = (r: Result) => { navigate(r.href); clear(); };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        {loading
          ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 animate-spin" />
          : <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        }
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar cursos, usuarios, clientes..."
          className="w-full pl-9 pr-16 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition placeholder:text-gray-400"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query && (
            <button onClick={clear} className="p-0.5 text-gray-400 hover:text-gray-600 transition">
              <X className="h-3 w-3" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          <ul>
            {results.map((r, idx) => (
              <li key={`${r.type}-${r.id}`}>
                <button
                  onClick={() => handleSelect(r)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition
                    ${idx === focused ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                >
                  <span className={`flex-shrink-0 p-1.5 rounded-md ${typeBadge[r.type]}`}>
                    {typeIcon[r.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.label}</p>
                    {r.sublabel && <p className="text-xs text-gray-400 truncate">{r.sublabel}</p>}
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeBadge[r.type]}`}>
                    {typeLabel[r.type]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400">↑↓ navegar · Enter seleccionar · Esc cerrar</p>
          </div>
        </div>
      )}

      {open && results.length === 0 && !loading && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-lg z-50 px-4 py-6 text-center">
          <p className="text-sm text-gray-400">Sin resultados para "<span className="font-medium text-gray-600">{query}</span>"</p>
        </div>
      )}
    </div>
  );
}
