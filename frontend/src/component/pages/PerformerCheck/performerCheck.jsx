import { useCallback, useEffect, useState } from 'react';
import HoverTab from './HoverTab';
import PerformerTable from './performerTable';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5159';

export default function PerformerCheck() {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [query, setQuery] = useState({}); // 目前篩選條件
  const [sort, setSort] = useState({ field: '', order: '' }); // 新增排序狀態
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(
    async (q = query, p = page, ps = rowsPerPage, s = sort) => {
      try {
        setLoading(true);
        const url = new URL(`${API}/api/applications/page`);
        url.searchParams.set('page', p + 1);
        url.searchParams.set('pageSize', ps);

        // 將篩選條件加入 querystring
        Object.entries(q).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
        });

        // 將排序參數加入（如果有）
        if (s?.field) {
          url.searchParams.set('sortBy', s.field);   // 後端 expect 的名稱
          url.searchParams.set('sortDir', s.order);  // asc / desc
        }

        const res = await fetch(url.toString());
        const json = await res.json();
        setData(json.data ?? []);
        setTotalCount(json.totalCount ?? 0);
      } catch (e) {
        console.error('fetchPage error', e);
      } finally {
        setLoading(false);
      }
    },
    [query, page, rowsPerPage, sort]
  );

  // 首次載入
  useEffect(() => { fetchPage(); }, [fetchPage]);

  // refresh 用
  const refresh = useCallback(() => fetchPage(), [fetchPage]);

  return (
    <div className="pc-layout">
      <aside className="pc-sidebar">
        <HoverTab
          rowsPerPage={rowsPerPage}
          setData={setData}
          setTotalCount={setTotalCount}
          setPage={(p) => { setPage(p); }}
          onQueryChange={(q) => {
            setQuery(q);
            setPage(0);
            fetchPage(q, 0, rowsPerPage, sort);
          }}
        />
      </aside>

      <main className="pc-main">
        <PerformerTable
          data={data}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          loading={loading}
          sort={sort}
          onPageChange={(p) => {
            const newPage = Math.max(0, p);
            setPage(newPage);
            fetchPage(query, newPage, rowsPerPage, sort);
          }}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n);
            setPage(0);
            fetchPage(query, 0, n, sort);
          }}
          onSortChange={(s) => {
            // 每次更改排序都回到第 1 頁
            setSort(s);
            setPage(0);
            fetchPage(query, 0, rowsPerPage, s);
          }}
          onSaved={refresh}
        />
      </main>
    </div>
  );
}