import React, { useCallback, useEffect, useState } from "react";
import { graphql, Link } from "gatsby";
import SEO from "../components/seo";
import type { PVREvent } from "../data/events";

type AdminRsvp = {
  id: string;
  name: string;
  email: string;
  phone: string;
  plusOnes: number;
  status: "confirmed" | "waitlisted";
  createdAt: string;
  updatedAt: string;
};

type AdminData = {
  capacity: number;
  seatsTaken: number;
  spotsLeft: number;
  waitlistCount: number;
  rsvps: AdminRsvp[];
};

const csvEscape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;

const AdminTemplate: React.FC<{ pageContext: { event: PVREvent } }> = ({
  pageContext,
}) => {
  const event = pageContext.event;
  const sessionKey = `pvr-admin-${event.slug}`;

  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (adminKey: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/rsvp?slug=${encodeURIComponent(event.slug)}&key=${encodeURIComponent(
            adminKey
          )}`
        );
        const json = await res.json();
        if (!res.ok || !Array.isArray(json.rsvps)) {
          throw new Error("Wrong password");
        }
        setData(json);
        setAuthed(true);
        sessionStorage.setItem(sessionKey, adminKey);
      } catch (err: any) {
        setError(err.message || "Could not load");
        setAuthed(false);
        sessionStorage.removeItem(sessionKey);
      } finally {
        setLoading(false);
      }
    },
    [event.slug, sessionKey]
  );

  // Try a stored key on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(sessionKey);
    if (stored) {
      setKey(stored);
      load(stored);
    }
  }, [sessionKey, load]);

  const cancelRsvp = async (r: AdminRsvp) => {
    if (
      !window.confirm(
        `Cancel ${r.name}'s RSVP${r.plusOnes ? " (+1)" : ""}? This frees their seat${
          data && data.waitlistCount ? " and promotes the waitlist." : "."
        }`
      )
    )
      return;
    try {
      const res = await fetch(
        `/api/rsvp?slug=${encodeURIComponent(event.slug)}&id=${encodeURIComponent(
          r.id
        )}&key=${encodeURIComponent(key)}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not cancel");
      setData(json);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const downloadCsv = () => {
    if (!data) return;
    const header = ["Name", "Email", "Phone", "Guests", "Status", "RSVP'd"];
    const rows = data.rsvps.map((r) =>
      [
        r.name,
        r.email,
        r.phone || "",
        String(1 + r.plusOnes),
        r.status,
        new Date(r.createdAt).toLocaleString(),
      ]
        .map(csvEscape)
        .join(",")
    );
    const blob = new Blob([[header.map(csvEscape).join(","), ...rows].join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}-rsvps.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sorted = data
    ? [...data.rsvps].sort((a, b) => {
        if (a.status !== b.status) return a.status === "confirmed" ? -1 : 1;
        return a.createdAt.localeCompare(b.createdAt);
      })
    : [];

  return (
    <>
      <SEO title={`Admin · ${event.title}`} />

      <div className="max-w-[900px] mx-auto px-5 pt-10 pb-24">
        <Link
          to={`/events/${event.slug}`}
          className="text-xs tracking-[1px] uppercase text-fg/40 hover:text-fg transition-colors"
        >
          ← Event page
        </Link>

        <p className="text-xs tracking-[2px] uppercase text-fg/40 mt-8 mb-2">
          Guest list · Admin
        </p>
        <h1
          className="text-fg leading-tight mb-8"
          style={{ fontFamily: "var(--font-display)", fontSize: "28px" }}
        >
          {event.title}
        </h1>

        {!authed ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load(key);
            }}
            className="border border-fg/16 p-6 max-w-[360px]"
          >
            <p className="text-xs tracking-[1px] uppercase text-fg/45 mb-4">
              Enter admin password
            </p>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent border border-fg/16 px-4 py-3 text-sm text-fg placeholder:text-fg/30 outline-none focus:border-fg/40 transition-colors mb-4"
            />
            {error && <p className="text-xs text-red-400 mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs tracking-[2px] uppercase border border-fg/30 text-fg hover:bg-fg hover:text-bg transition-colors disabled:opacity-40"
            >
              {loading ? "Checking…" : "Unlock"}
            </button>
          </form>
        ) : data ? (
          <>
            {/* Summary + actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-fg/12 py-4 mb-6">
              <div className="text-xs text-fg/55">
                <span className="text-fg">{data.seatsTaken}</span> / {data.capacity}{" "}
                seats · {data.spotsLeft} left
                {data.waitlistCount ? ` · ${data.waitlistCount} waitlisted` : ""}
              </div>
              <button
                onClick={downloadCsv}
                className="text-xs tracking-[1px] uppercase text-fg/50 border border-fg/20 px-4 py-2 hover:border-fg/50 hover:text-fg transition-colors"
              >
                Download CSV
              </button>
            </div>

            {sorted.length === 0 && (
              <p className="text-sm text-fg/35 py-8 text-center">
                No RSVPs yet.
              </p>
            )}

            {/* Guest rows */}
            <div className="flex flex-col">
              {sorted.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-4 border-b border-fg/12"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-fg">{r.name}</span>
                      {r.plusOnes > 0 && (
                        <span className="text-[11px] text-fg/40">+{r.plusOnes}</span>
                      )}
                      <span
                        className={`text-[10px] tracking-[1px] uppercase px-2 py-0.5 border ${
                          r.status === "confirmed"
                            ? "border-fg/30 text-fg/70"
                            : "border-fg/15 text-fg/35"
                        }`}
                      >
                        {r.status === "confirmed" ? "Going" : "Waitlist"}
                      </span>
                    </div>
                    <div className="text-xs text-fg/45 mt-1 break-all">
                      <a
                        href={`mailto:${r.email}`}
                        className="hover:text-fg transition-colors"
                      >
                        {r.email}
                      </a>
                      {r.phone && (
                        <>
                          {" · "}
                          <a
                            href={`tel:${r.phone}`}
                            className="hover:text-fg transition-colors"
                          >
                            {r.phone}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => cancelRsvp(r)}
                    className="self-start sm:self-auto text-[11px] tracking-[1px] uppercase text-fg/40 border border-fg/15 px-3 py-1.5 hover:border-red-400/60 hover:text-red-400 transition-colors shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>

            {error && <p className="text-xs text-red-400 mt-4">{error}</p>}

            <button
              onClick={() => {
                sessionStorage.removeItem(sessionKey);
                setAuthed(false);
                setData(null);
                setKey("");
              }}
              className="mt-8 text-xs tracking-[1px] uppercase text-fg/40 hover:text-fg transition-colors"
            >
              Lock
            </button>
          </>
        ) : null}
      </div>
    </>
  );
};

export default AdminTemplate;

export const query = graphql`
  query EventAdminPageQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
