import React, { useEffect, useMemo, useState } from "react";
import { getAdminUsers } from "../../api/admin";

/**
 * UserAdmin - Admin view to list users with basic pagination.
 * The backend is expected to return either:
 * - { items: [...], total: number } or
 * - a raw array (fallback without total)
 */
// PUBLIC_INTERFACE
export default function UserAdmin() {
  /** Renders paginated user table for administrators */
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canPrev = page > 1;
  const canNext = useMemo(() => {
    if (typeof total === "number") return page * pageSize < total;
    return users.length === pageSize; // heuristic if total unknown
  }, [page, pageSize, total, users.length]);

  const fetchUsers = async (desiredPage = page) => {
    setLoading(true);
    setErr("");
    try {
      const data = await getAdminUsers({ page: desiredPage, pageSize });
      const items = Array.isArray(data) ? data : (data.items || data.results || []);
      const t = typeof data?.total === "number" ? data.total : undefined;
      setUsers(items);
      setTotal(t);
      setPage(desiredPage);
    } catch (e) {
      setErr(e?.data?.detail || e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPrev = () => {
    if (!canPrev) return;
    fetchUsers(page - 1);
  };
  const onNext = () => {
    if (!canNext) return;
    fetchUsers(page + 1);
  };

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <h3 style={{ margin: 0, marginRight: "auto" }}>Users</h3>
      </div>

      {loading && <div>Loading users...</div>}
      {err && (
        <div role="alert" style={{ color: "#b91c1c" }}>
          {err}
        </div>
      )}

      {!loading && !err && users.length === 0 && <div>No users found.</div>}

      {!loading && !err && users.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "8px 6px" }}>ID</th>
                <th style={{ padding: "8px 6px" }}>Email</th>
                <th style={{ padding: "8px 6px" }}>Username</th>
                <th style={{ padding: "8px 6px" }}>Admin</th>
                <th style={{ padding: "8px 6px" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const id = u.id || u.user_id || u.uuid || u.email || u.username;
                return (
                  <tr key={id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "8px 6px", fontFamily: "monospace" }}>{id}</td>
                    <td style={{ padding: "8px 6px" }}>{u.email || "-"}</td>
                    <td style={{ padding: "8px 6px" }}>{u.username || u.display_name || "-"}</td>
                    <td style={{ padding: "8px 6px" }}>{u.is_admin ? "Yes" : "No"}</td>
                    <td style={{ padding: "8px 6px" }}>
                      {u.created_at || u.createdAt || u.signup_date || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <button
          className="btn"
          disabled={!canPrev}
          onClick={onPrev}
          style={{ background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
        >
          ← Previous
        </button>
        <div style={{ opacity: 0.8 }}>Page {page}</div>
        <button className="btn" disabled={!canNext} onClick={onNext}>
          Next →
        </button>
        {typeof total === "number" && (
          <div style={{ marginLeft: "auto", opacity: 0.7, fontSize: 14 }}>
            {Math.min(page * pageSize, total)} of {total}
          </div>
        )}
      </div>
    </div>
  );
}
