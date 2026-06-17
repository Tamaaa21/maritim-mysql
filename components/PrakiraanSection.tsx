"use client";

import { ChevronRight, ChevronLeft, MapPin, Anchor, Waves, TrendingUp, Sun, X, AlertCircle, Calendar } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_ICONS: Record<string, any> = {
  MapPin, Anchor, Waves, TrendingUp, Sun,
};

function getIcon(name?: string) {
  return CATEGORY_ICONS[name || "Sun"] || Sun;
}

function CategorySlider({ categories, activeCategory, setActiveCategory, getIcon }: {
  categories: any[];
  activeCategory: string | null;
  setActiveCategory: (id: string | null) => void;
  getIcon: (name?: string) => any;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
    }
  };

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0);
      setCanScrollRight(scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 1);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const btnClass = (isActive: boolean) =>
    `inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
      isActive
        ? "bg-[#003399] text-white shadow-md"
        : "bg-white text-gray-600 border border-gray-200 hover:border-[#003399] hover:text-[#003399]"
    }`;

  return (
    <div className="relative mb-10">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-50"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
      )}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1 justify-start md:justify-center"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => setActiveCategory(null)}
          className={btnClass(!activeCategory)}
        >
          Semua
        </button>
        {categories.map((cat) => {
          const Icon = getIcon(cat.icon);
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={btnClass(activeCategory === cat.id)}
            >
              <Icon size={14} />
              {cat.name}
            </button>
          );
        })}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-50"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      )}
    </div>
  );
}

const ExpiredPopup = ({
  title,
  onClose,
  isScheduled,
  isUnupdated,
  onViewDetail
}: {
  title: string;
  onClose: () => void;
  isScheduled?: boolean;
  isUnupdated?: boolean;
  onViewDetail?: () => void;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-center">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
          isScheduled ? "bg-blue-100" : "bg-amber-100"
        }`}>
          <AlertCircle size={28} className={isScheduled ? "text-blue-500" : "text-amber-500"} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">
          {isScheduled ? "Belum Tersedia" : isUnupdated ? "Prakiraan Belum Diperbarui" : "Halaman Belum Diperbarui"}
        </h3>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed font-normal">
          {isScheduled ? (
            <>Informasi prakiraan <span className="font-semibold text-gray-700">&quot;{title}&quot;</span> belum mulai tayang. Silakan kembali lagi pada jadwal yang telah ditentukan.</>
          ) : isUnupdated ? (
            <>Informasi prakiraan <span className="font-semibold text-gray-700">&quot;{title}&quot;</span> belum diperbarui ke versi terbaru. Anda tetap dapat melihat informasi sebelumnya.</>
          ) : (
            <>Informasi prakiraan <span className="font-semibold text-gray-700">&quot;{title}&quot;</span> sudah melewati masa tayang. Silakan kembali lagi nanti untuk informasi terbaru.</>
          )}
        </p>
      </div>
      <div className="flex gap-2">
        {isUnupdated && onViewDetail && (
          <button
            onClick={onViewDetail}
            className="flex-1 px-4 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Lihat Detail
          </button>
        )}
        <button
          onClick={onClose}
          className={`px-4 py-2.5 font-semibold rounded-xl transition-colors text-sm ${
            isUnupdated ? "border border-gray-200 text-gray-600 flex-1 hover:bg-gray-50" : "w-full bg-[#003399] hover:bg-[#0044cc] text-white"
          }`}
        >
          {isUnupdated ? "Batal" : "Mengerti"}
        </button>
      </div>
    </div>
  </div>
);

export default function PrakiraanSection({ limit }: { limit?: number }) {
  const router = useRouter();
  const [cards, setCards] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expiredPopup, setExpiredPopup] = useState<{ title: string; isScheduled?: boolean; isUnupdated?: boolean; slug?: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const [cardsRes, catRes] = await Promise.all([
          fetch("/api/admin/prakiraan-images"),
          fetch("/api/admin/prakiraan-categories"),
        ]);
        const cardsJson = await cardsRes.json();
        const catJson = await catRes.json();
        if (mounted) {
          if (cardsJson?.success && Array.isArray(cardsJson.data)) {
            setCards(cardsJson.data);
          }
          if (catJson?.success && Array.isArray(catJson.data)) {
            setCategories(catJson.data);
          }
        }
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  const now = new Date();

  const isExpiredCard = (card: any) => card.waktu_berakhir && new Date(card.waktu_berakhir) < now;
  const isScheduledCard = (card: any) => card.waktu_mulai && new Date(card.waktu_mulai) > now;
  const isActiveCard = (card: any) => !isExpiredCard(card) && !isScheduledCard(card);

  // For each category, find the ID of the single most recently updated expired card
  // (used as fallback when there are no active cards in that category)
  const latestExpiredPerCategory = (() => {
    const map: Record<string, string> = {}; // categoryId -> cardId

    // Get all expired cards grouped by category
    const expiredCards = cards.filter(isExpiredCard);
    for (const card of expiredCards) {
      const catKey = card.category_id || "__none__";
      // Check if there's already an active card in this category — if so, skip
      const hasActive = cards.some(
        (other) => other.category_id === card.category_id && isActiveCard(other)
      );
      if (hasActive) continue;

      // Keep only the most recently updated/created expired card per category
      if (!map[catKey]) {
        map[catKey] = card.id;
      } else {
        const existingTime = new Date(
          cards.find((c) => c.id === map[catKey])?.waktu_berakhir ||
          cards.find((c) => c.id === map[catKey])?.created_at || 0
        ).getTime();
        const cardTime = new Date(card.waktu_berakhir || card.created_at || 0).getTime();
        if (cardTime > existingTime) {
          map[catKey] = card.id;
        }
      }
    }
    return map;
  })();

  const shouldShowCard = (card: any) => {
    if (isScheduledCard(card)) return false;           // hide scheduled
    if (isActiveCard(card)) return true;               // always show active
    // Expired: only show if it's the single fallback card for its category
    const catKey = card.category_id || "__none__";
    return latestExpiredPerCategory[catKey] === card.id;
  };

  const visibleCards = cards.filter((card) => {
    if (!activeCategory) return shouldShowCard(card);
    return card.category_id === activeCategory && shouldShowCard(card);
  }).sort((a, b) => {
    // Active cards first, then by latest time
    const weightA = isActiveCard(a) ? 1 : 3;
    const weightB = isActiveCard(b) ? 1 : 3;
    if (weightA !== weightB) return weightA - weightB;

    const timeA = new Date(a.waktu_mulai || a.created_at || 0).getTime();
    const timeB = new Date(b.waktu_mulai || b.created_at || 0).getTime();
    return timeB - timeA;
  });

  const handleCardClick = (card: any) => {
    const expired = card.waktu_berakhir && new Date(card.waktu_berakhir) < now;
    if (expired) {
      setExpiredPopup({ title: card.title, isUnupdated: true, slug: card.slug });
    } else if (card.slug) {
      router.push(`/prakiraan/${card.slug}`);
    } else {
      setExpiredPopup({ title: card.title });
    }
  };

  return (
    <section id="prakiraan" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Informasi Prakiraan</h2>
          <p className="text-gray-500 mt-2">Pilih kategori informasi prakiraan yang Anda butuhkan</p>
        </div>

        {/* Category Slider */}
        {categories.length > 0 && (
          <CategorySlider categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} getIcon={getIcon} />
        )}

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visibleCards.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
            <p className="text-gray-500 font-medium text-sm">Tidak ada informasi prakiraan cuaca saat ini.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-stretch gap-6">
            {(limit ? visibleCards.slice(0, limit) : visibleCards).map((card, i) => {
              const CategoryIcon = getIcon(card.category?.icon);
              return (
                <button
                  key={card.id || i}
                  onClick={() => handleCardClick(card)}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#003399] transition-all duration-300 group flex flex-col text-left h-full relative"
                >
                  <div className="relative h-44 w-full overflow-hidden flex-shrink-0">
                    <img
                      src={card.url}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60" />
                    <div className="absolute top-4 left-4 w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
                      <CategoryIcon size={18} />
                    </div>
                    {card.category && (
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-2.5 py-0.5 text-white text-[10px] font-semibold">
                        {card.category.name}
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm md:text-base mb-1.5 leading-snug line-clamp-2 text-gray-900 group-hover:text-[#003399] transition-colors capitalize">
                        {card.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-2">
                        <Calendar size={13} className="shrink-0 text-[#003399]" />
                        <span>
                          {card.waktu_mulai 
                            ? new Date(card.waktu_mulai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                            : card.created_at 
                              ? new Date(card.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                              : "-"}
                        </span>
                      </div>
                      {card.next_url && (
                        <div className="mt-3 flex items-center gap-2 text-[10px] text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block flex-shrink-0" />
                          <span className="font-medium">Prakiraan berikutnya tersedia</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#003399]">
                      <span>Lihat Detail</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {limit && (
          <div className="mt-10 text-center">
            <a
              href="/prakiraan"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#003399] text-[#003399] hover:bg-[#003399] hover:text-white font-semibold text-sm rounded-full transition-all duration-200"
            >
              Selanjutnya <ChevronRight size={16} />
            </a>
          </div>
        )}
      </div>

      {expiredPopup && (
        <ExpiredPopup
          title={expiredPopup.title}
          isScheduled={expiredPopup.isScheduled}
          isUnupdated={expiredPopup.isUnupdated}
          onViewDetail={() => {
            if (expiredPopup.slug) {
              router.push(`/prakiraan/${expiredPopup.slug}`);
              setExpiredPopup(null);
            }
          }}
          onClose={() => setExpiredPopup(null)}
        />
      )}
    </section>
  );
}
