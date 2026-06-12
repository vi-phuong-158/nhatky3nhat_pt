import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { donViList } from '../constants';
import './StatsView.css';

/* ─── Helpers ─── */
const parseDate = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

const formatDate = (d) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};

/* Tạo khoảng thời gian nhanh */
const getQuickRange = (key) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (key) {
    case '7d': {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      return { from, to: now };
    }
    case '30d': {
      const from = new Date(today);
      from.setDate(from.getDate() - 29);
      return { from, to: now };
    }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: now };
    }
    case 'quarter': {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const from = new Date(now.getFullYear(), qMonth, 1);
      return { from, to: now };
    }
    case 'year': {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from, to: now };
    }
    default:
      return { from: null, to: null };
  }
};

/* ─── Constants ─── */
const CRITERIA_LIST = ['Kỷ luật nhất', 'Trung thành nhất', 'Gần dân nhất'];
const CRITERIA_COLORS = {
  'Kỷ luật nhất': 'var(--primary)',
  'Trung thành nhất': '#e67e22',
  'Gần dân nhất': '#27ae60',
};

/* ═══════════════════════════════════════
   COMPONENT: StatsView
   ═══════════════════════════════════════ */
export default function StatsView({ entries, loading, onClose }) {
  const [timeFilter, setTimeFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [sortCol, setSortCol] = useState('total');
  const [sortDir, setSortDir] = useState('desc');

  /* ─── Lọc đơn vị cho dropdown tìm kiếm ─── */
  const filteredUnits = useMemo(() => {
    if (!unitSearch.trim()) return donViList;
    const q = unitSearch.toLowerCase();
    return donViList.filter((u) => u.toLowerCase().includes(q));
  }, [unitSearch]);

  /* ─── Lọc entries theo thời gian & đơn vị ─── */
  const filtered = useMemo(() => {
    let result = entries || [];

    // Time filter
    if (timeFilter !== 'all') {
      const { from, to } = getQuickRange(timeFilter);
      if (from && to) {
        result = result.filter((e) => {
          const d = parseDate(e.thoiGian);
          return d && d >= from && d <= to;
        });
      }
    }

    // Unit filter (so sánh không phân biệt hoa/thường)
    if (unitFilter) {
      const uf = unitFilter.toLowerCase();
      result = result.filter((e) => (e.donVi || '').toLowerCase() === uf);
    }

    return result;
  }, [entries, timeFilter, unitFilter]);

  /* ─── Summary stats ─── */
  const summary = useMemo(() => {
    const total = filtered.length;
    const byUnit = {};
    const byCriteria = {};
    const totalFlowers = filtered.reduce((s, e) => s + (e.flowerCount || 0), 0);

    filtered.forEach((e) => {
      // By unit
      const u = e.donVi || 'Không rõ';
      byUnit[u] = (byUnit[u] || 0) + 1;

      // By criteria
      const c = e.tieuChi || 'Khác';
      byCriteria[c] = (byCriteria[c] || 0) + 1;
    });

    const unitCount = Object.keys(byUnit).length;

    return { total, byUnit, byCriteria, unitCount, totalFlowers };
  }, [filtered]);

  /* ─── Sort table rows ─── */
  const tableRows = useMemo(() => {
    const rows = Object.entries(summary.byUnit).map(([name, count]) => {
      const unitEntries = filtered.filter((e) => (e.donVi || 'Không rõ') === name);
      const flowers = unitEntries.reduce((s, e) => s + (e.flowerCount || 0), 0);
      const byCriteria = {};
      CRITERIA_LIST.forEach((c) => {
        byCriteria[c] = unitEntries.filter((e) => e.tieuChi === c).length;
      });
      return { name, total: count, flowers, byCriteria };
    });

    rows.sort((a, b) => {
      let va, vb;
      if (sortCol === 'name') {
        va = a.name;
        vb = b.name;
        return sortDir === 'asc' ? va.localeCompare(vb, 'vi') : vb.localeCompare(va, 'vi');
      }
      if (sortCol === 'flowers') {
        va = a.flowers;
        vb = b.flowers;
      } else if (CRITERIA_LIST.includes(sortCol)) {
        va = a.byCriteria[sortCol] || 0;
        vb = b.byCriteria[sortCol] || 0;
      } else {
        va = a.total;
        vb = b.total;
      }
      return sortDir === 'asc' ? va - vb : vb - va;
    });

    return rows;
  }, [summary, filtered, sortCol, sortDir]);

  /* ─── Horizontal bar chart — top 10 units ─── */
  const topUnits = useMemo(() => {
    return [...tableRows].sort((a, b) => b.total - a.total).slice(0, 10);
  }, [tableRows]);

  const maxCount = topUnits.length > 0 ? topUnits[0].total : 1;

  /* ─── Handlers ─── */
  const handleSort = useCallback(
    (col) => {
      if (sortCol === col) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortCol(col);
        setSortDir('desc');
      }
    },
    [sortCol]
  );

  const handleSelectUnit = useCallback((u) => {
    setUnitFilter(u);
    setUnitSearch('');
    setShowUnitDropdown(false);
  }, []);

  const sortIcon = (col) => {
    if (sortCol !== col) return 'unfold_more';
    return sortDir === 'asc' ? 'expand_less' : 'expand_more';
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="stats-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-title"
    >
      <motion.div
        className="stats-container"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
        exit={{ y: 40, opacity: 0 }}
      >
        {/* Header */}
        <header className="stats-header">
          <div className="stats-header-left">
            <span className="material-symbols-outlined stats-header-icon" aria-hidden="true">analytics</span>
            <h2 id="stats-title" className="stats-title">Thống kê bài viết</h2>
          </div>
          <button className="stats-close" onClick={onClose} aria-label="Đóng thống kê">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Filters */}
        <div className="stats-filters">
          {/* Time filter */}
          <div className="stats-filter-group">
            <label className="stats-filter-label">
              <span className="material-symbols-outlined" aria-hidden="true">calendar_today</span>
              Thời gian
            </label>
            <div className="stats-chips">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: '7d', label: '7 ngày' },
                { key: '30d', label: '30 ngày' },
                { key: 'month', label: 'Tháng này' },
                { key: 'quarter', label: 'Quý này' },
                { key: 'year', label: 'Năm nay' },
              ].map((t) => (
                <button
                  key={t.key}
                  className={`stats-chip ${timeFilter === t.key ? 'stats-chip-active' : ''}`}
                  onClick={() => setTimeFilter(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unit filter */}
          <div className="stats-filter-group">
            <label className="stats-filter-label">
              <span className="material-symbols-outlined" aria-hidden="true">apartment</span>
              Đơn vị
            </label>
            <div className="stats-unit-filter">
              <div className="stats-unit-input-wrapper">
                <input
                  type="text"
                  className="stats-unit-input"
                  placeholder="Tìm đơn vị..."
                  value={unitSearch || unitFilter}
                  onChange={(e) => {
                    setUnitSearch(e.target.value);
                    setUnitFilter('');
                    setShowUnitDropdown(true);
                  }}
                  onFocus={() => setShowUnitDropdown(true)}
                />
                {(unitFilter || unitSearch) && (
                  <button
                    className="stats-unit-clear"
                    onClick={() => {
                      setUnitFilter('');
                      setUnitSearch('');
                    }}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>
              {showUnitDropdown && filteredUnits.length > 0 && (
                <div className="stats-unit-dropdown">
                  <button
                    className={`stats-unit-option ${!unitFilter ? 'stats-unit-option-active' : ''}`}
                    onClick={() => handleSelectUnit('')}
                  >
                    Tất cả đơn vị
                  </button>
                  {filteredUnits.map((u) => (
                    <button
                      key={u}
                      className={`stats-unit-option ${unitFilter === u ? 'stats-unit-option-active' : ''}`}
                      onClick={() => handleSelectUnit(u)}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {showUnitDropdown && (
          <div className="stats-backdrop" onClick={() => setShowUnitDropdown(false)} />
        )}

        {/* Summary cards */}
        <div className="stats-summary">
          <div className="stats-card stats-card-total">
            <span className="material-symbols-outlined stats-card-icon">article</span>
            <div className="stats-card-content">
              <span className="stats-card-value">{summary.total}</span>
              <span className="stats-card-label">Tổng bài viết</span>
            </div>
          </div>
          <div className="stats-card stats-card-units">
            <span className="material-symbols-outlined stats-card-icon">groups</span>
            <div className="stats-card-content">
              <span className="stats-card-value">{summary.unitCount}</span>
              <span className="stats-card-label">Đơn vị</span>
            </div>
          </div>
          <div className="stats-card stats-card-flowers">
            <span className="material-symbols-outlined stats-card-icon">local_florist</span>
            <div className="stats-card-content">
              <span className="stats-card-value">{summary.totalFlowers}</span>
              <span className="stats-card-label">Tổng hoa</span>
            </div>
          </div>
        </div>

        {/* Criteria breakdown */}
        <div className="stats-criteria-grid">
          {CRITERIA_LIST.map((c) => (
            <div key={c} className="stats-criteria-item">
              <div
                className="stats-criteria-bar"
                style={{
                  '--bar-color': CRITERIA_COLORS[c],
                  '--bar-pct': summary.total > 0 ? `${((summary.byCriteria[c] || 0) / summary.total) * 100}%` : '0%',
                }}
              />
              <span className="stats-criteria-count">{summary.byCriteria[c] || 0}</span>
              <span className="stats-criteria-name">{c}</span>
            </div>
          ))}
        </div>

        {/* Top 10 chart */}
        {topUnits.length > 0 && (
          <section className="stats-chart-section">
            <h3 className="stats-section-title">
              <span className="material-symbols-outlined" aria-hidden="true">leaderboard</span>
              Top 10 đơn vị nổi bật
            </h3>
            <div className="stats-chart">
              {topUnits.map((u, i) => (
                <div key={u.name} className="stats-bar-row">
                  <span className="stats-bar-rank">{i + 1}</span>
                  <span className="stats-bar-name" title={u.name}>{u.name}</span>
                  <div className="stats-bar-track">
                    <motion.div
                      className="stats-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${(u.total / maxCount) * 100}%` }}
                      transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="stats-bar-count">{u.total}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Full table */}
        <section className="stats-table-section">
          <h3 className="stats-section-title">
            <span className="material-symbols-outlined" aria-hidden="true">table_chart</span>
            Chi tiết theo đơn vị
          </h3>
          <div className="stats-table-wrapper">
            <table className="stats-table">
              <thead>
                <tr>
                  <th className="stats-th stats-th-stt">#</th>
                  <th className="stats-th stats-th-name" onClick={() => handleSort('name')}>
                    Đơn vị
                    <span className="material-symbols-outlined stats-sort-icon">{sortIcon('name')}</span>
                  </th>
                  <th className="stats-th stats-th-num" onClick={() => handleSort('total')}>
                    Tổng
                    <span className="material-symbols-outlined stats-sort-icon">{sortIcon('total')}</span>
                  </th>
                  {CRITERIA_LIST.map((c) => (
                    <th key={c} className="stats-th stats-th-num" onClick={() => handleSort(c)}>
                      {c.replace(' nhất', '')}
                      <span className="material-symbols-outlined stats-sort-icon">{sortIcon(c)}</span>
                    </th>
                  ))}
                  <th className="stats-th stats-th-num" onClick={() => handleSort('flowers')}>
                    🌸
                    <span className="material-symbols-outlined stats-sort-icon">{sortIcon('flowers')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={3 + CRITERIA_LIST.length + 1} className="stats-empty">
                      Không có dữ liệu phù hợp
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row, i) => (
                    <tr key={row.name} className="stats-tr">
                      <td className="stats-td stats-td-stt">{i + 1}</td>
                      <td className="stats-td stats-td-name">{row.name}</td>
                      <td className="stats-td stats-td-num stats-td-total">{row.total}</td>
                      {CRITERIA_LIST.map((c) => (
                        <td key={c} className="stats-td stats-td-num">{row.byCriteria[c] || 0}</td>
                      ))}
                      <td className="stats-td stats-td-num stats-td-flowers">{row.flowers}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {tableRows.length > 0 && (
                <tfoot>
                  <tr className="stats-tr-footer">
                    <td className="stats-td" colSpan={2}><strong>Tổng cộng</strong></td>
                    <td className="stats-td stats-td-num stats-td-total"><strong>{summary.total}</strong></td>
                    {CRITERIA_LIST.map((c) => (
                      <td key={c} className="stats-td stats-td-num"><strong>{summary.byCriteria[c] || 0}</strong></td>
                    ))}
                    <td className="stats-td stats-td-num stats-td-flowers"><strong>{summary.totalFlowers}</strong></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>
      </motion.div>
    </motion.div>
  );
}
