import { FormEvent, ReactNode, useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Cpu,
  Menu,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap,
} from "lucide-react";

type Phone = {
  id: string;
  name: string;
  series: string;
  tagline: string;
  price: number;
  display: string;
  camera: string;
  battery: string;
  processor: string;
  storage: string;
  color: string;
  image: string;
};

type Review = {
  id: string;
  name: string;
  model: string;
  rating: number;
  text: string;
};

type ReviewForm = {
  name: string;
  model: string;
  rating: number;
  text: string;
};

type MobileForm = {
  name: string;
  series: string;
  tagline: string;
  price: string;
  display: string;
  camera: string;
  battery: string;
  processor: string;
  storage: string;
  color: string;
};

type ApiError = {
  message?: string;
};

const ADMIN_STORAGE_KEY = "galaxy_admin_key";

const emptyMobileForm: MobileForm = {
  name: "",
  series: "",
  tagline: "",
  price: "",
  display: "",
  camera: "",
  battery: "",
  processor: "",
  storage: "",
  color: "",
};

const getAdminKey = () => localStorage.getItem(ADMIN_STORAGE_KEY) || "";

const isAdminAuthenticated = () => Boolean(getAdminKey());

const logoutAdmin = () => {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
};

const api = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, options);

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const error = (await response.json()) as ApiError;
      message = error.message || message;
    } catch {
      const text = await response.text();
      message = text || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const getImageUrl = (image: string) => {
  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  return image.startsWith("/") ? image : `/${image}`;
};

const getPhoneTheme = (series: string) => {
  if (series === "S Series") {
    return {
      gradient: "from-blue-400 via-indigo-500 to-violet-600",
      glow: "rgba(99, 102, 241, 0.42)",
    };
  }

  if (series === "Z Series") {
    return {
      gradient: "from-fuchsia-400 via-violet-500 to-indigo-600",
      glow: "rgba(217, 70, 239, 0.38)",
    };
  }

  if (series === "A Series") {
    return {
      gradient: "from-emerald-400 via-teal-500 to-cyan-500",
      glow: "rgba(16, 185, 129, 0.38)",
    };
  }

  if (series === "M Series") {
    return {
      gradient: "from-orange-400 via-rose-500 to-pink-600",
      glow: "rgba(244, 63, 94, 0.38)",
    };
  }

  return {
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
    glow: "rgba(6, 182, 212, 0.38)",
  };
};

function MagneticPhone({
  phone,
  compact = false,
}: {
  phone: Phone;
  compact?: boolean;
}) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateX = useSpring(useTransform(pointerY, [-120, 120], [12, -12]), {
    stiffness: 180,
    damping: 18,
  });

  const rotateY = useSpring(useTransform(pointerX, [-120, 120], [-14, 14]), {
    stiffness: 180,
    damping: 18,
  });

  const theme = getPhoneTheme(phone.series);
  const imageUrl = getImageUrl(phone.image);

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set(event.clientX - box.left - box.width / 2);
    pointerY.set(event.clientY - box.top - box.height / 2);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.div
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative mx-auto ${compact ? "h-64" : "h-[440px]"}`}
    >
      <motion.div
        animate={{ scale: [1, 1.16, 1], opacity: [0.2, 0.42, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-[15%] rounded-full bg-gradient-to-br ${theme.gradient} blur-[65px]`}
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className={`absolute inset-[22%] rounded-[2.5rem] bg-gradient-to-br ${theme.gradient} opacity-20 blur-2xl`}
      />

      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          onError={(event) => {
            if (event?.currentTarget) {
              event.currentTarget.style.display = "none";
            }
          }}
          className="relative z-10 h-full w-full object-contain drop-shadow-[0_35px_30px_rgba(0,0,0,0.7)]"
          style={{ transform: "translateZ(55px)" }}
        />
      ) : (
        <div className="relative z-10 grid h-full w-full place-items-center text-slate-600">
          <Smartphone size={64} />
        </div>
      )}

      <motion.div
        animate={{ scaleX: [0.8, 1.1, 0.8], opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-[20%] bottom-3 h-3 rounded-[50%] border border-white/20 bg-black/50 blur-[2px]"
      />
    </motion.div>
  );
}

function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = isAdminAuthenticated();

  const handleLogout = () => {
    logoutAdmin();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05060a] text-white selection:bg-indigo-500/40">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(59,130,246,0.11), transparent 30%), radial-gradient(circle at 90% 25%, rgba(168,85,247,0.1), transparent 28%)",
        }}
      />

      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-black/60 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:px-5">
          <Link to="/" className="flex items-center gap-3">
            <motion.span
              whileHover={{ rotate: -8, scale: 1.08 }}
              className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25"
            >
              <Zap size={19} />
            </motion.span>

            <span>
              <b className="block text-left text-lg tracking-[0.22em]">
                Ishita
              </b>
              <small className="block text-[16px] tracking-[0.18em] text-slate-500">
                Mobiles
              </small>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            <Link
              to="/"
              className="relative transition hover:text-white after:absolute after:-bottom-2 after:left-0 after:h-px after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
            >
              Shop
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="relative transition hover:text-white after:absolute after:-bottom-2 after:left-0 after:h-px after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
              >
                Manage mobiles
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className="hidden items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-black transition hover:scale-[1.03] sm:flex"
                >
                  <Pencil size={16} />
                  Manage
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 sm:block"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="hidden rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 sm:block"
              >
                Admin
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="rounded-xl border border-white/10 p-2.5 md:hidden"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              className="mx-auto mt-2 max-w-7xl rounded-2xl border border-white/10 bg-black/90 p-3 shadow-2xl backdrop-blur-2xl md:hidden"
            >
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 hover:bg-white/5"
              >
                Shop
              </Link>

              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-4 py-3 hover:bg-white/5"
                  >
                    Manage mobiles
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-4 py-3 text-left text-red-300 hover:bg-red-500/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 hover:bg-white/5"
                >
                  Admin login
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="relative z-10 pt-24">{children}</div>
    </div>
  );
}

function Shop() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    name: "",
    model: "",
    rating: 5,
    text: "",
  });

  const isAdmin = isAdminAuthenticated();

  const loadData = async () => {
    try {
      setError("");

      const [phonesData, reviewsData] = await Promise.all([
        api<Phone[]>("/api/phones"),
        api<Review[]>("/api/reviews"),
      ]);

      setPhones(phonesData);
      setReviews(reviewsData);

      setReviewForm((current) => ({
        ...current,
        model: current.model || phonesData[0]?.name || "",
      }));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleCompare = (phoneId: string) => {
    setCompareIds((current) => {
      if (current.includes(phoneId)) {
        return current.filter((id) => id !== phoneId);
      }

      if (current.length === 2) {
        return [current[1], phoneId];
      }

      return [...current, phoneId];
    });
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setReviewSubmitting(true);
      setError("");

      await api<Review>("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });

      setReviewForm((current) => ({
        ...current,
        name: "",
        text: "",
        rating: 5,
      }));

      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit review",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const comparedPhones = compareIds
    .map((id) => phones.find((phone) => phone.id === id))
    .filter((phone): phone is Phone => Boolean(phone));

  if (isLoading) {
    return (
      <Layout>
        <main className="grid min-h-[75vh] place-items-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />
            <p className="mt-4 text-slate-400">Loading Galaxy mobiles...</p>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-5">
        <section className="grid min-h-[82vh] items-center gap-10 pb-16 pt-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75 }}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-bold text-blue-200">
              <Sparkles size={14} />A new dimension of Galaxy
            </div>

            <h1 className="text-6xl font-black leading-[0.88] tracking-[-0.065em] sm:text-8xl lg:text-[100px]">
              Beyond
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                ordinary.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">
              Explore Samsung mobiles, compare specifications side by side, and
              share your shop experience.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("collection")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="group flex items-center gap-3 rounded-full bg-white px-6 py-3.5 font-black text-black transition hover:scale-105"
              >
                Explore Galaxy
                <ArrowRight
                  className="transition group-hover:translate-x-1"
                  size={18}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("comparison")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-bold backdrop-blur transition hover:bg-white/10"
              >
                Compare models
              </button>
            </div>
          </motion.div>
        </section>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <section id="collection" className="py-16">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-400">
                Curated collection
              </p>
              <h2 className="mt-4 max-w-2xl text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl">
                Designed to move with you.
              </h2>
            </div>
          </div>

          {phones.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-white/20 p-12 text-center">
              <Smartphone className="mx-auto text-slate-500" size={42} />
              <h3 className="mt-4 text-2xl font-black">No mobiles available</h3>
              <p className="mt-2 text-slate-400">
                No Samsung mobiles are currently available.
              </p>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-bold transition hover:bg-blue-500"
                >
                  <Plus size={18} />
                  Add mobile
                </Link>
              )}
            </div>
          ) : (
            <motion.div
              layout
              className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
            >
              <AnimatePresence>
                {phones.map((phone, index) => {
                  const theme = getPhoneTheme(phone.series);

                  return (
                    <motion.article
                      layout
                      initial={{ opacity: 0, y: 35, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        delay: index * 0.06,
                        type: "spring",
                        stiffness: 130,
                        damping: 18,
                      }}
                      key={phone.id}
                      className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.075] to-white/[0.025] p-4 shadow-2xl transition hover:border-white/20"
                      style={{
                        boxShadow: `0 30px 75px -42px ${theme.glow}`,
                      }}
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition group-hover:opacity-100" />

                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                          {phone.series}
                        </span>

                        <span className="flex items-center gap-1 text-xs font-bold">
                          <Star
                            size={13}
                            className="fill-amber-400 text-amber-400"
                          />
                          4.9
                        </span>
                      </div>

                      <MagneticPhone phone={phone} compact />

                      <div className="px-2 pb-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                          {phone.color}
                        </p>

                        <h3 className="mt-2 text-2xl font-black tracking-tight">
                          {phone.name}
                        </h3>

                        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
                          {phone.tagline}
                        </p>

                        <div className="mt-5 flex items-end justify-between">
                          <div>
                            <small className="text-slate-500">From</small>
                            <p className="font-black">
                              {formatPrice(phone.price)}
                            </p>
                          </div>

                          <motion.span
                            whileHover={{ rotate: -8, scale: 1.1 }}
                            className="grid h-11 w-11 place-items-center rounded-full bg-white text-black"
                          >
                            <ChevronRight />
                          </motion.span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleCompare(phone.id)}
                          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black transition ${
                            compareIds.includes(phone.id)
                              ? "bg-blue-600 text-white"
                              : "border border-white/10 bg-white/[0.06] hover:bg-white/10"
                          }`}
                        >
                          {compareIds.includes(phone.id) ? (
                            <>
                              <Check size={16} />
                              Selected
                            </>
                          ) : (
                            "Add to comparison"
                          )}
                        </button>

                        {isAdmin && (
                          <Link
                            to={`/admin?edit=${phone.id}`}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"
                          >
                            <Pencil size={14} />
                            Edit product
                          </Link>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {comparedPhones.length === 2 && (
          <section id="comparison" className="py-16">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-400">
                Precision comparison
              </p>
              <h2 className="mt-4 text-5xl font-black tracking-[-0.04em]">
                See the difference.
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#0a0c12]/90 shadow-2xl"
            >
              <div className="grid grid-cols-2">
                {comparedPhones.map((phone) => (
                  <div
                    key={phone.id}
                    className="relative border-r border-white/10 p-6 text-center last:border-r-0"
                  >
                    <MagneticPhone phone={phone} compact />
                    <h3 className="relative text-2xl font-black">
                      {phone.name}
                    </h3>
                    <p className="relative mt-1 text-slate-400">
                      {formatPrice(phone.price)}
                    </p>
                  </div>
                ))}
              </div>

              {[
                { label: "Display", key: "display" as const, icon: Smartphone },
                { label: "Camera", key: "camera" as const, icon: Sparkles },
                { label: "Battery", key: "battery" as const, icon: Zap },
                { label: "Processor", key: "processor" as const, icon: Cpu },
                {
                  label: "Storage",
                  key: "storage" as const,
                  icon: ShieldCheck,
                },
              ].map((item) => (
                <div key={item.key} className="border-t border-white/10">
                  <div className="flex items-center justify-center gap-2 bg-white/[0.025] py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <item.icon size={14} />
                    {item.label}
                  </div>

                  <div className="grid grid-cols-2">
                    {comparedPhones.map((phone) => (
                      <div
                        key={phone.id}
                        className="border-r border-white/10 p-5 text-center font-bold last:border-r-0"
                      >
                        {phone[item.key]}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </section>
        )}

        <section className="grid gap-10 py-24 lg:grid-cols-2">
          <form
            onSubmit={submitReview}
            className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
          >
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-400">
                Customer review
              </p>
              <h2 className="mt-3 text-3xl font-black">Review the shop</h2>
            </div>

            <input
              required
              type="text"
              placeholder="Your name"
              value={reviewForm.name}
              onChange={(event) =>
                setReviewForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none transition focus:border-violet-500"
            />

            <select
              required
              value={reviewForm.model}
              onChange={(event) =>
                setReviewForm((current) => ({
                  ...current,
                  model: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-white/10 bg-[#111318] p-3 outline-none"
            >
              <option value="" disabled>
                Select mobile
              </option>

              {phones.map((phone) => (
                <option key={phone.id} value={phone.name}>
                  {phone.name}
                </option>
              ))}
            </select>

            <div>
              <p className="mb-2 text-sm text-slate-400">Rating</p>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    type="button"
                    key={rating}
                    aria-label={`${rating} star rating`}
                    onClick={() =>
                      setReviewForm((current) => ({ ...current, rating }))
                    }
                  >
                    <Star
                      className={
                        rating <= reviewForm.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-600"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              required
              rows={5}
              placeholder="Tell us about your shop experience"
              value={reviewForm.text}
              onChange={(event) =>
                setReviewForm((current) => ({
                  ...current,
                  text: event.target.value,
                }))
              }
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 outline-none transition focus:border-violet-500"
            />

            <button
              type="submit"
              disabled={reviewSubmitting || phones.length === 0}
              className="w-full rounded-xl bg-violet-600 p-3 font-bold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reviewSubmitting ? "Submitting..." : "Submit review"}
            </button>
          </form>

          <div>
            <h2 className="mb-6 text-3xl font-black">Customer experiences</h2>

            {reviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/20 p-10 text-center text-slate-400">
                No reviews yet. Be the first customer to share an experience.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <motion.article
                    key={review.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold">{review.name}</p>
                        <p className="text-xs text-slate-500">
                          Reviewed {review.model}
                        </p>
                      </div>

                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star
                            key={rating}
                            size={14}
                            className={
                              rating <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-700"
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <p className="mt-4 leading-7 text-slate-300">
                      {review.text}
                    </p>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}

function AdminLogin() {
  const navigate = useNavigate();

  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey: adminKey.trim() }),
      });

      if (!response.ok) {
        const result = (await response
          .json()
          .catch(() => null)) as ApiError | null;

        throw new Error(result?.message || "Invalid administrator key");
      }

      localStorage.setItem(ADMIN_STORAGE_KEY, adminKey.trim());
      navigate("/admin");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to authenticate",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <Layout>
      <main className="grid min-h-[75vh] place-items-center px-5 py-16">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-9"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600">
            <Smartphone size={22} />
          </div>

          <h1 className="mt-6 text-3xl font-black">Administrator login</h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Enter the administrator key to manage Samsung mobiles.
          </p>

          <input
            required
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="Administrator key"
            autoComplete="current-password"
            className="mt-7 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none transition focus:border-blue-500"
          />

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 w-full rounded-xl bg-blue-600 p-3 font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Login as admin"}
          </button>

          <Link
            to="/"
            className="mt-4 block text-center text-sm text-slate-400 hover:text-white"
          >
            Return to shop
          </Link>
        </form>
      </main>
    </Layout>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const editId = searchParams.get("edit");
  const isEditing = Boolean(editId);

  const [phones, setPhones] = useState<Phone[]>([]);
  const [form, setForm] = useState<MobileForm>(emptyMobileForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const loadPhones = async () => {
    try {
      setMessage("");

      const phonesData = await api<Phone[]>("/api/phones");
      setPhones(phonesData);
    } catch (loadError) {
      setMessage(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load mobiles",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhones();
  }, []);

  useEffect(() => {
    if (!editId) {
      setForm(emptyMobileForm);
      setSelectedImage(null);
      setCurrentImage("");
      return;
    }

    if (phones.length === 0) {
      return;
    }

    const phoneToEdit = phones.find((phone) => phone.id === editId);

    if (!phoneToEdit) {
      setMessage("Mobile not found");
      return;
    }

    setForm({
      name: phoneToEdit.name || "",
      series: phoneToEdit.series || "",
      tagline: phoneToEdit.tagline || "",
      price: String(phoneToEdit.price ?? ""),
      display: phoneToEdit.display || "",
      camera: phoneToEdit.camera || "",
      battery: phoneToEdit.battery || "",
      processor: phoneToEdit.processor || "",
      storage: phoneToEdit.storage || "",
      color: phoneToEdit.color || "",
    });

    setCurrentImage(phoneToEdit.image || "");
    setSelectedImage(null);
    setMessage("");
  }, [editId, phones]);

  const updateField = (field: keyof MobileForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyMobileForm);
    setSelectedImage(null);
    setCurrentImage("");
    setMessage("");
    setSearchParams({});
  };

  const submitMobile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setMessage("");

      if (!isEditing && !selectedImage) {
        setMessage("Mobile image is required");
        return;
      }

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      if (isEditing && editId) {
        await api<Phone>(`/api/phones/${editId}`, {
          method: "PUT",
          headers: { "x-admin-key": getAdminKey() },
          body: formData,
        });
      } else {
        await api<Phone>("/api/phones", {
          method: "POST",
          headers: { "x-admin-key": getAdminKey() },
          body: formData,
        });
      }

      navigate("/");
    } catch (submitError) {
      const errorMessage =
        submitError instanceof Error
          ? submitError.message
          : isEditing
            ? "Unable to update mobile"
            : "Unable to add mobile";

      setMessage(errorMessage);

      if (errorMessage === "Administrator access required") {
        logoutAdmin();
        navigate("/admin/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const beginEditing = (phone: Phone) => {
    setSearchParams({ edit: phone.id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteMobile = async (phoneId: string) => {
    try {
      setDeletingId(phoneId);
      setMessage("");

      await api<null>(`/api/phones/${phoneId}`, {
        method: "DELETE",
        headers: { "x-admin-key": getAdminKey() },
      });

      setPhones((current) =>
        current.filter((phoneItem) => phoneItem.id !== phoneId),
      );

      if (editId === phoneId) {
        resetForm();
      }
    } catch (deleteError) {
      const errorMessage =
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete mobile";

      setMessage(errorMessage);

      if (errorMessage === "Administrator access required") {
        logoutAdmin();
        navigate("/admin/login");
      }
    } finally {
      setDeletingId("");
    }
  };

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <Layout>
      <main className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              Admin workspace
            </p>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              {isEditing ? "Edit mobile" : "Mobile management"}
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              {isEditing
                ? "Update the selected mobile information and product image."
                : "Add a Samsung model, upload its image, and provide its comparison information."}
            </p>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-semibold text-slate-300 transition hover:bg-white/10"
            >
              <X size={18} />
              Cancel editing
            </button>
          )}
        </div>

        <form
          onSubmit={submitMobile}
          className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 md:grid-cols-2"
        >
          <input
            required
            name="name"
            type="text"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Mobile name"
            className="rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-blue-500"
          />

          <select
            required
            name="series"
            value={form.series}
            onChange={(event) => updateField("series", event.target.value)}
            className="rounded-xl border border-white/10 bg-[#111318] p-3 outline-none focus:border-blue-500"
          >
            <option value="" disabled>
              Select series
            </option>
            <option value="S Series">S Series</option>
            <option value="Z Series">Z Series</option>
            <option value="A Series">A Series</option>
            <option value="M Series">M Series</option>
            <option value="F Series">F Series</option>
          </select>

          <input
            required
            name="tagline"
            type="text"
            value={form.tagline}
            onChange={(event) => updateField("tagline", event.target.value)}
            placeholder="Tagline"
            className="rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-blue-500 md:col-span-2"
          />

          <input
            required
            name="price"
            type="number"
            min="0"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
            placeholder="Price in INR"
            className="rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-blue-500"
          />

          <input
            required
            name="color"
            type="text"
            value={form.color}
            onChange={(event) => updateField("color", event.target.value)}
            placeholder="Color"
            className="rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-blue-500"
          />

          <input
            required
            name="display"
            type="text"
            value={form.display}
            onChange={(event) => updateField("display", event.target.value)}
            placeholder="Display, for example 6.8-inch AMOLED"
            className="rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-blue-500"
          />

          <input
            required
            name="camera"
            type="text"
            value={form.camera}
            onChange={(event) => updateField("camera", event.target.value)}
            placeholder="Camera, for example 200 MP"
            className="rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-blue-500"
          />

          <input
            required
            name="battery"
            type="text"
            value={form.battery}
            onChange={(event) => updateField("battery", event.target.value)}
            placeholder="Battery, for example 5000 mAh"
            className="rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-blue-500"
          />

          <input
            required
            name="processor"
            type="text"
            value={form.processor}
            onChange={(event) => updateField("processor", event.target.value)}
            placeholder="Processor"
            className="rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-blue-500"
          />

          <input
            required
            name="storage"
            type="text"
            value={form.storage}
            onChange={(event) => updateField("storage", event.target.value)}
            placeholder="Storage, for example 256 GB"
            className="rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-blue-500 md:col-span-2"
          />

          {isEditing && currentImage && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 md:col-span-2">
              <p className="mb-3 text-sm font-semibold text-slate-300">
                Current mobile image
              </p>

              <img
                src={getImageUrl(currentImage)}
                alt={form.name}
                className="h-56 w-full rounded-2xl object-contain"
              />
            </div>
          )}

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              {isEditing ? "Replace mobile image, optional" : "Mobile image"}
            </span>

            <input
              required={!isEditing}
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) =>
                setSelectedImage(event.target.files?.[0] || null)
              }
              className="block w-full rounded-xl border border-white/10 bg-black/30 p-3 text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white"
            />
          </label>

          {selectedImage && (
            <p className="text-sm text-emerald-400 md:col-span-2">
              Selected image: {selectedImage.name}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
          >
            {isEditing ? <Pencil size={19} /> : <Plus size={19} />}

            {isSubmitting
              ? isEditing
                ? "Updating mobile..."
                : "Adding mobile..."
              : isEditing
                ? "Update mobile and view in shop"
                : "Add mobile and view in shop"}
          </button>

          {message && <p className="text-red-400 md:col-span-2">{message}</p>}
        </form>

        <section className="mt-14">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black">Available mobiles</h2>

            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">
              {phones.length} mobiles
            </span>
          </div>

          {isLoading ? (
            <div className="mt-6 rounded-2xl border border-white/10 p-8 text-center text-slate-400">
              Loading mobiles...
            </div>
          ) : phones.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/20 p-8 text-center text-slate-400">
              No mobiles have been added.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {phones.map((phone) => (
                <div
                  key={phone.id}
                  className={`flex items-center gap-4 rounded-2xl border p-4 ${
                    editId === phone.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <img
                    src={getImageUrl(phone.image)}
                    alt={phone.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{phone.name}</p>
                    <p className="text-sm text-slate-500">
                      {phone.series} · {formatPrice(phone.price)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => beginEditing(phone)}
                    className="rounded-xl bg-blue-500/15 p-3 text-blue-400 transition hover:bg-blue-500/25"
                    aria-label={`Edit ${phone.name}`}
                  >
                    <Pencil size={19} />
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === phone.id}
                    onClick={() => deleteMobile(phone.id)}
                    className="rounded-xl bg-red-500/15 p-3 text-red-400 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Delete ${phone.name}`}
                  >
                    <Trash2 size={19} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Shop />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
