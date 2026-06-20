import React, { useState } from "react";
import AdminSecretAccess from "@/components/AdminSecretAccess";
import { motion } from "framer-motion";
import { Phone, Wrench, Globe, X, ArrowLeft, Clock, Calendar } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";
import { FaFacebook, FaInstagram, FaTiktok, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { useParams } from "wouter";

import svcFridgeImg   from "@assets/svc_refrigerator_card.png";
import svcWashImg     from "@assets/svc_washer_card.png";
import svcDishImg     from "@assets/svc_dishwasher_nobrand.png";
import svcOvenImg     from "@assets/svc_gas_range_card.png";
import svcDryerImg    from "@assets/svc_dryer_nobrand.png";
import svcMicroImg    from "@assets/svc_microwave_nobrand.png";
import svcFreezerImg  from "@assets/svc_freezer.png";
import svcHoodImg     from "@assets/svc_rangehood_nobrand.png";
import svcIceMakerImg from "@assets/svc_icemaker.png";
import svcCooktopImg  from "@assets/svc_cooktop.png";
import svcWineCoolImg from "@assets/svc_winecooler.png";
import svcDisposalImg from "@assets/svc_disposal.png";
import svcWarmerImg   from "@assets/svc_warmer.png";

import { BLOG_POSTS } from "@/data/posts";

import { PHONE_DISPLAY, PHONE_HREF, COMPANY_PHONE_DISPLAY, COMPANY_PHONE_HREF } from "@/lib/sitePhones";


function BlogHeaderPhones() {
  return (
    <div className="header-phone-pair htr-phone-pair htr-blog-header-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end min-w-0 max-w-full">
      <a href={COMPANY_PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ backgroundColor: K.accent }}>
        <Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}
      </a>
      <a href={PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ backgroundColor: K.accent }}>
        <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}
      </a>
    </div>
  );
}

function BlogHeaderPhonesMobile() {
  return (
    <div className="header-phone-pair htr-phone-pair flex flex-col gap-1.5 mt-1 items-start">
      <a href={COMPANY_PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit" style={{ backgroundColor: K.accent }}>
        <Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}
      </a>
      <a href={PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit" style={{ backgroundColor: K.accent }}>
        <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}
      </a>
    </div>
  );
}

const K = {
  accent:      "#1B6FE8",
  accentDark:  "#0D47B0",
  accentLight: "#62B6FF",
  bg:          "#EFF6FF",
  dark:        "#0B1A3F",
};

const FADE_UP = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type Lang = "en" | "es";

const SOCIALS = [
  { label: "Facebook",  href: "https://www.facebook.com/htrgroupllc",          bg: "#1877F2", icon: <FaFacebook  size={14} /> },
  { label: "Instagram", href: "https://www.instagram.com/htrgrouptx",          bg: "#E1306C", icon: <FaInstagram size={14} /> },
  { label: "TikTok",    href: "https://www.tiktok.com/@htrgrouptx",            bg: "#000",    icon: <FaTiktok   size={14} /> },
  { label: "LinkedIn",  href: "https://www.linkedin.com/company/htrgrouptx",   bg: "#0A66C2", icon: <FaLinkedinIn size={14} /> },
  { label: "YouTube",   href: "https://www.youtube.com/@htrgrouptx",           bg: "#FF0000", icon: <FaYoutube  size={14} /> },
];

const IMG_MAP: Record<string, string> = {
  fridge:    svcFridgeImg,
  washer:    svcWashImg,
  dish:      svcDishImg,
  oven:      svcOvenImg,
  dryer:     svcDryerImg,
  micro:     svcMicroImg,
  freezer:   svcFreezerImg,
  hood:      svcHoodImg,
  icemaker:  svcIceMakerImg,
  cooktop:   svcCooktopImg,
  winecooler: svcWineCoolImg,
  disposal:  svcDisposalImg,
  warmer:    svcWarmerImg,
};

const TR = {
  en: {
    backBlog:  "Back to Blog",
    bookNow:   "Book Now",
    minRead:   "min read",
    nav:       ["Home", "Services", "About Us", "Reviews", "FAQ", "Contact"],
    allRights: "All rights reserved.",
    privacy:   "Privacy Policy",
    terms:     "Terms of Service",
    ctaTitle:  "Need Appliance Repair in Houston?",
    ctaSub:    "Our certified technicians are ready to help — same-day service available.",
    callNow:   "Call Now",
    blog:      "Blog",
    notFound:  "Article not found.",
  },
  es: {
    backBlog:  "Volver al Blog",
    bookNow:   "Reservar",
    minRead:   "min de lectura",
    nav:       ["Inicio", "Servicios", "Nosotros", "Reseñas", "FAQ", "Contacto"],
    allRights: "Todos los derechos reservados.",
    privacy:   "Política de Privacidad",
    terms:     "Términos de Servicio",
    ctaTitle:  "¿Necesita Reparación en Houston?",
    ctaSub:    "Nuestros técnicos certificados están listos para ayudarle — servicio disponible el mismo día.",
    callNow:   "Llamar Ahora",
    blog:      "Blog",
    notFound:  "Artículo no encontrado.",
  },
};

export default function BlogPost() {
  const [lang, setLang]     = useState<Lang>("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const params = useParams<{ slug: string }>();

  const T    = TR[lang];
  const isEs = lang === "es";
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  const post = BLOG_POSTS.find(p => p.slug === params.slug);

  const navHrefs = [`${base}/`, ...["#services", "#about", "#reviews", "#faq", "#contact"].map(h => `${base}/${h}`)];

  const relatedPosts = post
    ? BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 3)
    : [];

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: K.bg, color: K.dark }}>

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-stone-200 shadow-sm">
        <div className="container mx-auto px-4 htr-site-header-bar htr-blog-header-bar flex flex-wrap items-center justify-between gap-x-3 gap-y-2">

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Globe className="h-3.5 w-3.5 text-stone-400" />
            <button onClick={() => setLang("en")} className="text-xs font-bold px-2 py-1 rounded transition-all"
              style={lang === "en" ? { backgroundColor: K.accent, color: "#fff" } : { color: "#57534e" }}>EN</button>
            <span className="text-stone-300 text-xs">|</span>
            <button onClick={() => setLang("es")} className="text-xs font-bold px-2 py-1 rounded transition-all"
              style={lang === "es" ? { backgroundColor: K.accent, color: "#fff" } : { color: "#57534e" }}>ES</button>
          </div>

          <a href={`${base}/`} className="flex items-center gap-2 flex-shrink-0">
            <Wrench className="h-5 w-5" style={{ color: K.accent }} />
            <span className="text-lg font-extrabold tracking-tight">
              HTR<span style={{ color: K.accent }}>Group</span>
            </span>
          </a>

          <nav className="htr-blog-header-nav hidden md:flex items-center gap-5 text-sm font-semibold text-stone-600">
            {T.nav.map((label, i) => (
              <a key={label} href={navHrefs[i]} className="hover:opacity-70 transition-opacity">{label}</a>
            ))}
            <a href={`${base}/blog`} className="hover:opacity-70 transition-opacity" style={{ color: K.accent }}>{T.blog}</a>
          </nav>

          <div className="htr-blog-header-actions hidden md:flex items-center gap-2 flex-shrink-0 flex-wrap justify-end min-w-0">
            <BlogHeaderPhones />
            <a href={`${base}/#contact`} className="htr-blog-book-now shrink-0 whitespace-nowrap text-white font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider" style={{ backgroundColor: K.dark }}>
              {T.bookNow}
            </a>
          </div>

          <button className="md:hidden p-2 rounded" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <span className="block w-5 space-y-1"><span className="block h-0.5 bg-stone-700" /><span className="block h-0.5 bg-stone-700" /><span className="block h-0.5 bg-stone-700" /></span>}
          </button>

        <div className="htr-header-mobile-strip md:hidden">
          <div className="container mx-auto px-4 py-2 flex flex-col gap-2">
            <BlogHeaderPhonesMobile />
            <a href={`${base}/#contact`} className="htr-header-mobile-book text-white font-bold px-3 py-2 rounded text-sm uppercase tracking-wider" style={{ backgroundColor: K.dark }}>
              {T.bookNow}
            </a>
          </div>
        </div>
        </div>

        {menuOpen && (
          <div className="htr-site-header-mobile-menu md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700">
            {T.nav.map((label, i) => (
              <a key={label} href={navHrefs[i]} onClick={() => setMenuOpen(false)} className="py-2 border-b border-stone-100">{label}</a>
            ))}
            <a href={`${base}/blog`} onClick={() => setMenuOpen(false)} className="py-2 border-b border-stone-100" style={{ color: K.accent }}>{T.blog}</a>
            <BlogHeaderPhonesMobile />
          </div>
        )}
      </header>


      <main className="flex-grow">
        {!post ? (
          <div className="container mx-auto px-4 py-20 text-center">
            <p className="text-stone-500">{T.notFound}</p>
            <a href={`${base}/blog`} className="mt-4 inline-flex items-center gap-1.5 font-semibold" style={{ color: K.accent }}>
              <ArrowLeft className="h-4 w-4" /> {T.backBlog}
            </a>
          </div>
        ) : (
          <>
            {/* ── HERO IMAGE ── */}
            <div className="w-full bg-stone-900 relative overflow-hidden" style={{ maxHeight: "420px" }}>
              <img
                src={IMG_MAP[post.imgKey]}
                alt={isEs ? post.titleEs : post.titleEn}
                className="w-full object-cover opacity-70"
                style={{ maxHeight: "420px" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end">
                <div className="container mx-auto px-4 pb-8">
                  <a href={`${base}/blog`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors mb-4">
                    <ArrowLeft className="h-4 w-4" /> {T.backBlog}
                  </a>
                  <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight max-w-3xl">
                    {isEs ? post.titleEs : post.titleEn}
                  </h1>
                  <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{post.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{post.readMinutes} {T.minRead}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── ARTICLE BODY ── */}
            <div className="container mx-auto px-4 py-10">
              <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">

                {/* Article content */}
                <motion.article
                  initial="hidden" animate="visible" variants={FADE_UP}
                  className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-10 prose prose-stone prose-headings:font-extrabold prose-headings:text-stone-900 prose-h2:text-xl prose-h3:text-base prose-p:text-stone-600 prose-p:leading-relaxed prose-li:text-stone-600 prose-strong:text-stone-900 max-w-none"
                  dangerouslySetInnerHTML={{ __html: isEs ? post.bodyEs : post.bodyEn }}
                />

                {/* Sidebar */}
                <div className="htr-blog-post-aside flex flex-col gap-5">

                  {/* CTA card */}
                  <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: K.dark }}>
                    <h3 className="font-extrabold text-lg mb-2">{T.ctaTitle}</h3>
                    <p className="text-white/70 text-sm mb-4">{T.ctaSub}</p>
                    <div className="htr-phone-pair flex flex-col gap-2">
                      <a
                        href={COMPANY_PHONE_HREF}
                        className="htr-phone-btn flex items-center justify-center gap-2 font-bold px-4 py-3 rounded text-white w-full"
                        style={{ backgroundColor: K.accent }}
                      >
                        <Phone className="h-4 w-4" /> {COMPANY_PHONE_DISPLAY}
                      </a>
                      <a
                        href={PHONE_HREF}
                        className="htr-phone-btn flex items-center justify-center gap-2 font-bold px-4 py-3 rounded text-white w-full"
                        style={{ backgroundColor: K.accent }}
                      >
                        <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
                      </a>
                    </div>
                  </div>

                  {/* Related articles */}
                  {relatedPosts.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
                      <h3 className="font-extrabold text-base mb-4" style={{ color: K.dark }}>
                        {isEs ? "Más Artículos" : "More Articles"}
                      </h3>
                      <div className="flex flex-col gap-4">
                        {relatedPosts.map(rel => (
                          <a
                            key={rel.slug}
                            href={`${base}/blog/${rel.slug}`}
                            className="flex gap-3 group"
                          >
                            <img
                              src={IMG_MAP[rel.imgKey]}
                              alt={isEs ? rel.titleEs : rel.titleEn}
                              className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                            <div>
                              <p className="text-sm font-semibold text-stone-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                                {isEs ? rel.titleEs : rel.titleEn}
                              </p>
                              <p className="text-xs text-stone-400 mt-0.5">{rel.date}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="pt-6 pb-20 sm:pb-6" style={{ backgroundColor: K.dark }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 footer-top-row">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4" style={{ color: K.accentLight }} />
              <span className="text-white font-extrabold">HTR<span style={{ color: K.accentLight }}>Group</span></span>
            </div>
            <div className="flex items-center gap-2 footer-social-clear">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white hover:opacity-75 transition-opacity"
                  style={{ background: s.bg }}>{s.icon}</a>
              ))}
            </div>
          </div>

          <div className="htr-phone-pair--row flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-sm">
            <a href={COMPANY_PHONE_HREF} className="htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" style={{ color: K.accentLight }} /> {COMPANY_PHONE_DISPLAY}
            </a>
            <a href={PHONE_HREF} className="htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" style={{ color: K.accentLight }} /> {PHONE_DISPLAY}
            </a>
          </div>
          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
            <p><AdminSecretAccess label={`© ${new Date().getFullYear()} HTRGroup. ${T.allRights}`} /></p>
            <div className="flex gap-5 items-center">
              <a href="#" className="hover:text-white transition-colors">{T.privacy}</a>
              <a href="#" className="hover:text-white transition-colors">{T.terms}</a>
            </div>
          </div>
        </div>
      </footer>

      <ChatWidget lang={lang} />
    </div>
  );
}
