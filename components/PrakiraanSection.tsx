"use client";

import { ChevronRight, AlertCircle, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getIcon } from "@/lib/prakiraan-icons";

function getEndDateColor(waktuBerakhir: string) {
  const now = new Date();
  const end = new Date(waktuBerakhir);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 2) {
    return "text-emerald-600 font-semibold";
  } else if (diffDays === 2) {
    return "text-amber-500 font-semibold";
  } else {
    return "text-rose-600 font-semibold";
  }
}

function CategorySlider({ categories, activeCategory, setActiveCategory, getIcon }: {
  categories: any[];
  activeCategory: string | null;
  setActiveCategory: (id: string | null) => void;
  getIcon: (name?: string) => any;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [minBtnWidth, setMinBtnWidth] = useState(0);

  useEffect(() => {
    let max = 0;
    for (const btn of btnRefs.current.values()) {
      if (btn && btn.offsetWidth > max) max = btn.offsetWidth;
    }
    if (max > 0) setMinBtnWidth(max);
  }, [categories]);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 2 || activeCategory !== null);
      setCanScrollRight(
        scrollLeft < scrollWidth - clientWidth - 2 ||
        (activeCategory !== null && categories.findIndex(c => c.id === activeCategory) < categories.length - 1)
      );
    }
  }, [activeCategory, categories]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);

      const timer = setTimeout(checkScroll, 200);

      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
        clearTimeout(timer);
      };
    }
  }, [categories, activeCategory, checkScroll]);

  // Scroll active category into view automatically when selection changes
  useEffect(() => {
    if (activeCategory === null) {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
    } else {
      const activeEl = scrollRef.current?.querySelector(`[data-category-id="${activeCategory}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }
    const timer = setTimeout(checkScroll, 350);
    return () => clearTimeout(timer);
  }, [activeCategory, checkScroll]);

  const handleArrowClick = (dir: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const currentIdx = activeCategory
      ? categories.findIndex((c) => c.id === activeCategory)
      : -1; // "Semua"

    const targetIdx = dir === "right"
      ? Math.min(currentIdx + 1, categories.length - 1)
      : Math.max(currentIdx - 1, -1);

    if (targetIdx === currentIdx) return;

    if (targetIdx === -1) {
      // scroll to start
      container.scrollTo({ left: 0, behavior: "smooth" });
      setActiveCategory(null);
      return;
    }

    const targetBtn = container.querySelector(`button[data-category-id="${categories[targetIdx].id}"]`);
    if (targetBtn) {
      targetBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }

    setActiveCategory(categories[targetIdx].id);
  };

  const isFirstCategory = activeCategory === null;
  const isLastCategory = activeCategory !== null && categories.length > 0 && categories[categories.length - 1].id === activeCategory;

  const btnClass = (isActive: boolean) =>
    `inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 shadow-sm border cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-98 ${isActive
      ? "bg-[#003399] text-white border-[#003399] shadow-md hover:bg-[#002b80] hover:shadow-lg"
      : "bg-white text-gray-700 border-gray-200/80 hover:border-[#003399] hover:text-[#003399] hover:shadow-md"
    }`;

  const shouldShowArrows = categories.length > 5 || canScrollLeft || canScrollRight;

  return (
    <div className="relative max-w-5xl mx-auto mb-10 flex items-center">
      {/* Fixed "Semua" Pill on the left */}
      <div className="pl-1 pr-3 border-r border-gray-300/80 flex-shrink-0">
        <button
          onClick={() => setActiveCategory(null)}
          className={btnClass(!activeCategory)}
          style={minBtnWidth > 0 ? { minWidth: minBtnWidth } : undefined}
          data-category-id="__all__"
        >
          Semua
        </button>
      </div>

      {/* Scrollable Container Wrapper */}
      <div className="relative flex-1 overflow-hidden pl-3">
        {/* Left Fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        )}

        {/* Right Fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto scrollbar-hide py-1 px-2 justify-start scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon);
            return (
              <button
                key={cat.id}
                data-category-id={cat.id}
                ref={(el) => { if (el) btnRefs.current.set(cat.id, el); }}
                onClick={() => setActiveCategory(cat.id)}
                className={btnClass(activeCategory === cat.id)}
                style={minBtnWidth > 0 ? { minWidth: minBtnWidth } : undefined}
              >
                <Icon size={14} className="shrink-0" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons on the Right Side */}
      {shouldShowArrows && (
        <div className="flex items-center gap-1.5 pl-3 pr-1 border-l border-gray-200/80 flex-shrink-0">
          <button
            onClick={() => handleArrowClick("left")}
            disabled={isFirstCategory}
            className="w-9 h-9 rounded-full bg-white border border-gray-200/80 text-gray-600 hover:text-[#003399] hover:border-[#003399]/40 hover:bg-blue-50/50 active:bg-[#003399] active:text-white active:border-[#003399] shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none"
            aria-label="Previous category"
          >
            <ArrowLeft size={16} />
          </button>

          <button
            onClick={() => handleArrowClick("right")}
            disabled={isLastCategory}
            className="w-9 h-9 rounded-full bg-white border border-gray-200/80 text-gray-600 hover:text-[#003399] hover:border-[#003399]/40 hover:bg-blue-50/50 active:bg-[#003399] active:text-white active:border-[#003399] shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none"
            aria-label="Next category"
          >
            <ArrowRight size={16} />
          </button>
        </div>
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
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isScheduled ? "bg-blue-100" : "bg-amber-100"
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
            <>Informasi prakiraan <span className="font-semibold text-gray-700">&quot;{title}&quot;</span> belum diperbarui ke versi terbaru.</>
          ) : (
            <>Informasi prakiraan <span className="font-semibold text-gray-700">&quot;{title}&quot;</span> sudah melewati masa tayang. Silakan kembali lagi nanti untuk informasi terbaru.</>
          )}
        </p>
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
          <span className="inline-block px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-[#003399] text-xs font-bold rounded-full uppercase tracking-wider mb-3">
            Informasi Terkini
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-1">
            Informasi Prakiraan
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Pilih kategori informasi prakiraan di bawah ini untuk melihat kondisi cuaca, maritim, pasang surut, dan pelabuhan secara real-time.
          </p>
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
                  key={`${activeCategory || "all"}-${card.id || i}`}
                  onClick={() => handleCardClick(card)}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#003399] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col text-left h-full relative animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
                >
                  <div className="relative h-44 w-full overflow-hidden flex-shrink-0">
                    <img
                      src={card.url}
                      alt={card.title}
                      loading="lazy"
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
                      <div className="flex items-start gap-1.5 text-gray-500 text-[11px] md:text-xs mt-2.5">
                        <Calendar size={13} className="shrink-0 text-[#003399] mt-0.5" />
                        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 leading-snug">
                          <span>
                            {card.waktu_mulai
                              ? new Date(card.waktu_mulai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                              : card.created_at
                                ? new Date(card.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                                : "-"}
                          </span>
                          {card.waktu_berakhir && (
                            <>
                              <span className="text-gray-400 font-light mx-0.5">s/d</span>
                              <span className={getEndDateColor(card.waktu_berakhir)}>
                                {new Date(card.waktu_berakhir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                              </span>
                            </>
                          )}
                        </div>
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
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-[#003399] text-[#003399] hover:bg-[#003399] hover:text-white font-semibold text-sm rounded-full transition-all duration-200 w-auto"
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
