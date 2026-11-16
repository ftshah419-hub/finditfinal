import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import ItemCard from '../../user/components/ItemCard';
import ItemDetailsModal from '../../user/components/ItemDetailsModal';
import userApi from '../../user/services/userApi';
import '../../user/styles/userDesignTokens.css';

export const Home = () => {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    userApi.searchItems({ limit: 6 }).then((res) => {
      if (res.data?.items) {
        setFeaturedItems(res.data.items);
      }
    }).catch(console.error);
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(searchKeyword.trim())}`);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="w-full pt-16 flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-surface py-20 px-margin border-b border-surface-container-high/40">
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 top-40 w-80 h-80 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>

          <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              CAMPUS LOST & FOUND NETWORK ACTIVE
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-on-surface font-extrabold tracking-tight leading-tight max-w-4xl">
              Reuniting Lost Belongings with <span className="text-primary">Precision & Trust</span>
            </h1>

            <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mt-5 leading-relaxed">
              The modern lost-and-found management platform. Automated neural similarity matching, chain-of-custody tracking, and verified pickup authorization across campus nodes.
            </p>

            {/* Quick Hero Search Console */}
            <form onSubmit={handleHeroSearch} className="w-full max-w-2xl mt-8">
              <div className="flex items-center bg-surface-container-lowest p-2 rounded-2xl shadow-lg border border-outline-variant/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <span className="material-symbols-outlined text-primary text-[24px] ml-3 shrink-0">
                  search
                </span>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search for MacBook, keys, Hydro Flask, jacket, wallet..."
                  className="w-full px-3 py-2.5 bg-transparent text-on-surface font-body-md text-base focus:outline-none placeholder:text-outline"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold shadow-md transition-all shrink-0 cursor-pointer"
                >
                  Search Registry
                </button>
              </div>
            </form>

            {/* Quick CTAs */}
            <div className="flex items-center gap-4 mt-6 flex-wrap justify-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-lg font-semibold shadow-sm hover:bg-primary-container transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">search_off</span>
                <span>Report a Lost Item</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-lowest text-primary font-label-lg font-semibold shadow-sm hover:bg-surface-container transition-all border border-outline-variant/40"
              >
                <span className="material-symbols-outlined text-[18px]">pan_tool</span>
                <span>Log a Found Item</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 3-Step Process: How FINDIT Works */}
        <section className="py-16 px-margin bg-surface max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
              Standard Operating Procedure
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-1">
              How FINDIT Resolves Lost Property
            </h2>
            <p className="font-body-md text-on-surface-variant mt-2">
              Three streamlined steps from initial discovery to physical handover.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {/* Step 1 */}
            <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary font-bold text-lg flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="font-title-md text-title-md font-bold text-on-surface">Report Property</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                Log lost belongings or found items with geo-temporal tags, category metadata, and photo documentation. All submissions undergo initial screening.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-secondary font-bold text-lg flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="font-title-md text-title-md font-bold text-on-surface">Neural Match & Radar</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                FINDIT AI continuously correlates lost profiles against inventory at security collection depots, alerting owners to high-probability candidate matches.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-surface-container-highest text-primary font-bold text-lg flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="font-title-md text-title-md font-bold text-on-surface">Verified Custody Pickup</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                Claimants provide proof of ownership (serial numbers, cosmetic decals, lock codes). Custodians review dossiers and authorize physical retrieval.
              </p>
            </div>
          </div>
        </section>

        {/* Live Inventory Preview Grid */}
        <section className="py-16 px-margin bg-surface-container-low/50 border-t border-surface-container-high/60">
          <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                  Public Directory
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                  Recently Approved Items on Campus
                </h2>
              </div>
              <Link
                to="/browse"
                className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Browse Full Directory</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            {featuredItems.length === 0 ? (
              <div className="p-12 rounded-2xl bg-surface-container-lowest text-center border border-outline-variant/30">
                <span className="material-symbols-outlined text-[36px] text-outline mb-2">inventory_2</span>
                <p className="font-label-lg font-semibold text-on-surface">Live Directory Synchronizing</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Approved lost and found items will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
                {featuredItems.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    onViewDetails={(item) => setSelectedItem(item)}
                    onClaim={() => navigate('/login')}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />

      {/* Item Details Modal */}
      <ItemDetailsModal
        isOpen={Boolean(selectedItem)}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenClaim={() => navigate('/login')}
      />
    </div>
  );
};

export default Home;
