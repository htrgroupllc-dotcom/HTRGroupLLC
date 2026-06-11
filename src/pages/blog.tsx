import React, { useState } from "react";
import AdminSecretAccess from "@/components/AdminSecretAccess";
import { motion } from "framer-motion";
import { Phone, Wrench, Globe, X, ArrowLeft, Clock, Calendar, ChevronRight } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";
import { FaFacebook, FaInstagram, FaTiktok, FaLinkedinIn, FaYoutube } from "react-icons/fa";

import svcFridgeImg   from "@assets/ChatGPT_Image_3_апр._2026_г.,_21_10_20_1775269648058.png";
import svcWashImg     from "@assets/ChatGPT_Image_3_апр._2026_г.,_21_04_57_1775269648058.png";
import svcDishImg     from "@assets/svc_dishwasher_nobrand.png";
import svcOvenImg     from "@assets/ChatGPT_Image_3_апр._2026_г.,_21_18_00_1775269648060.png";
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
    <div className="header-phone-pair htr-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end">
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
    backHome:  "Back to Home",
    pageTitle: "Appliance Care Blog",
    pageSub:   "Tips, guides, and maintenance advice from our certified technicians in Houston.",
    bookNow:   "Book Now",
    readMore:  "Read Article",
    minRead:   "min read",
    nav:       ["Home", "Services", "About Us", "Reviews", "FAQ", "Contact"],
    allRights: "All rights reserved.",
    privacy:   "Privacy Policy",
    terms:     "Terms of Service",
    ctaText:   "Got a broken appliance?",
    blog:      "Blog",
  },
  es: {
    backHome:  "Volver al Inicio",
    pageTitle: "Blog de Cuidado de Electrodomésticos",
    pageSub:   "Consejos, guías y recomendaciones de mantenimiento de nuestros técnicos certificados en Houston.",
    bookNow:   "Reservar",
    readMore:  "Leer Artículo",
    minRead:   "min de lectura",
    nav:       ["Inicio", "Servicios", "Nosotros", "Reseñas", "FAQ", "Contacto"],
    allRights: "Todos los derechos reservados.",
    privacy:   "Política de Privacidad",
    terms:     "Términos de Servicio",
    ctaText:   "¿Tiene un electrodoméstico dañado?",
    blog:      "Blog",
  },
};

export default function Blog() {
  const [lang, setLang]     = useState<Lang>("en");
  const [menuOpen, setMenuOpen] = useState(false);

  const T    = TR[lang];
  const isEs = lang === "es";
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  const navHrefs = [`${base}/`, ...["#services", "#about", "#reviews", "#faq", "#contact"].map(h => `${base}/${h}`)];

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: K.bg, color: K.dark }}>

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-stone-200 shadow-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-3">

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
              HTR<span style={{ color: K.accent }}>GroupTX</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-stone-600">
            {T.nav.map((label, i) => (
              <a key={label} href={navHrefs[i]} className="hover:opacity-70 transition-opacity">{label}</a>
            ))}
            <a href={`${base}/blog`} className="hover:opacity-70 transition-opacity" style={{ color: K.accent }}>{T.blog}</a>
          </nav>

          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <BlogHeaderPhones />
            <a href={`${base}/#contact`} className="text-white font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider" style={{ backgroundColor: K.dark }}>
              {T.bookNow}
            </a>
          </div>

          <button className="md:hidden p-2 rounded" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <span className="block w-5 space-y-1"><span className="block h-0.5 bg-stone-700" /><span className="block h-0.5 bg-stone-700" /><span className="block h-0.5 bg-stone-700" /></span>}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700">
            {T.nav.map((label, i) => (
              <a key={label} href={navHrefs[i]} onClick={() => setMenuOpen(false)} className="py-2 border-b border-stone-100">{label}</a>
            ))}
            <a href={`${base}/blog`} onClick={() => setMenuOpen(false)} className="py-2 border-b border-stone-100" style={{ color: K.accent }}>{T.blog}</a>
            <BlogHeaderPhonesMobile />
          </div>
        )}
      </header>


      <main className="flex-grow">

        {/* ── PAGE HEADER ── */}
        <div className="bg-white border-b border-stone-100 py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-extrabold">{T.pageTitle}</h1>
            <div className="h-1 w-14 mt-2 mb-2 rounded-full" style={{ backgroundColor: K.accent }} />
            <p className="text-stone-500 text-sm max-w-xl">{T.pageSub}</p>
          </div>
        </div>

        {/* ── BLOG GRID ── */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {BLOG_POSTS.map((post, i) => (
                <motion.a
                  key={post.slug}
                  href={`${base}/blog/${post.slug}`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={FADE_UP}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                    <img
                      src={IMG_MAP[post.imgKey]}
                      alt={isEs ? post.titleEs : post.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs text-stone-400 mb-3">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readMinutes} {T.minRead}</span>
                    </div>
                    <h2 className="font-bold text-base text-stone-900 leading-snug mb-2 group-hover:text-blue-700 transition-colors">
                      {isEs ? post.titleEs : post.titleEn}
                    </h2>
                    <p className="text-stone-500 text-sm leading-relaxed flex-1">
                      {isEs ? post.excerptEs : post.excerptEn}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold" style={{ color: K.accent }}>
                      {T.readMore} <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BAND ── */}
        <div className="py-8 text-center" style={{ backgroundColor: K.dark }}>
          <p className="text-white font-bold text-lg mb-3">{T.ctaText}</p>
          <a href={PHONE_HREF} className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base" style={{ backgroundColor: K.accent }}>
            <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
          </a>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="pt-6 pb-20 sm:pb-6" style={{ backgroundColor: K.dark }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4" style={{ color: K.accentLight }} />
              <span className="text-white font-extrabold">HTR<span style={{ color: K.accentLight }}>GroupTX</span></span>
            </div>
            <div className="flex items-center gap-2">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white hover:opacity-75 transition-opacity"
                  style={{ background: s.bg }}>{s.icon}</a>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
            <p><AdminSecretAccess label={`© ${new Date().getFullYear()} HTRGroupTX. ${T.allRights}`} /></p>
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
