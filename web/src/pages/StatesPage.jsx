import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";

const slugifyState = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function StatesPage({ states, user }) {
  const [query, setQuery] = useState("");

  const normalized = useMemo(() => {
    const items = (states || []).map((state) => {
      const name = typeof state === "string" ? state : state?.name || state?.slug || String(state || "");
      const slugSource = typeof state === "string" ? state : state?.slug || state?.name || String(state || "");
      return {
        name,
        slug: slugifyState(slugSource),
      };
    });

    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) => s.name.toLowerCase().includes(q) || s.slug.includes(q));
  }, [states, query]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <SEO
        title="States Directory"
        description="Find your local state fellowship and connect with communities across the South West Zone."
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-solid border-[#e7e7f4] dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 md:px-20 lg:px-40 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-primary flex items-center">
              <span className="material-symbols-outlined text-4xl">church</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold leading-tight tracking-tight">DLCF South West</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">States Directory</p>
            </div>
          </div>

          <div className="flex flex-1 justify-end gap-8 items-center">
            <nav className="hidden md:flex items-center gap-8">
              <Link className="text-sm font-medium hover:text-primary transition-colors" to="/">
                Home
              </Link>
              <Link className="text-sm font-medium hover:text-primary transition-colors" to="/about">
                About
              </Link>
              <Link className="text-sm font-medium text-primary" to="/states">
                Directory
              </Link>
              <Link className="text-sm font-medium hover:text-primary transition-colors" to="/publications">
                Gospel Library
              </Link>
              <Link className="text-sm font-medium hover:text-primary transition-colors" to="/media">
                Media
              </Link>
            </nav>

            <Link
              className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-md hover:bg-opacity-90 transition-all"
              to="/portal"
            >
              {user ? "Portal" : "Sign In"}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-12 px-6 md:px-20 lg:px-40">
        {/* Hero */}
        <div className="max-w-[960px] w-full mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">States Directory Gallery</h1>
          <p className="text-[#49499c] dark:text-slate-400 text-lg max-w-2xl">
            Find your local state fellowship and connect with our communities across the zone.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-[960px] w-full mb-12">
          <div className="relative flex items-center w-full h-16 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div className="flex items-center justify-center pl-6 text-[#49499c]">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="flex-1 h-full bg-transparent border-none outline-none focus:ring-0 px-4 text-lg placeholder:text-slate-400 dark:text-white"
              placeholder="Search for a state..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="button"
              className="mr-2 h-12 px-6 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
              onClick={() => setQuery("")}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-[960px] w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {normalized.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 dark:text-slate-400">
              No states found.
            </div>
          ) : (
            normalized.map((s) => (
              <div
                key={s.slug || s.name}
                className="flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800"
              >
                <div
                  className="h-52 w-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1200')",
                  }}
                  aria-label={`${s.name} state cover`}
                />

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2">{s.name} State</h3>

                    <div className="flex items-start gap-2 text-sm text-[#49499c] dark:text-slate-400 mb-1">
                      <span className="material-symbols-outlined text-sm pt-0.5">schedule</span>
                      <div>
                        <p>Service times: (to be added)</p>
                        <p>Weekly programs: (to be added)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[#49499c] dark:text-slate-400">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <p>Location: (to be added)</p>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link
                      className="flex items-center justify-center gap-1 bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all"
                      to={`/${s.slug}`}
                    >
                      <span className="material-symbols-outlined text-sm">language</span>
                      View State
                    </Link>
                    <Link
                      className="flex items-center justify-center gap-1 border border-primary/30 text-primary py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/5 transition-all"
                      to={`/${s.slug}/publications`}
                    >
                      <span className="material-symbols-outlined text-sm">menu_book</span>
                      Library
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col items-center gap-6 text-center max-w-[600px] mb-20">
          <p className="text-slate-500 dark:text-slate-400">
            Don&apos;t see your state listed? Please contact the zonal admin to update the directory.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
