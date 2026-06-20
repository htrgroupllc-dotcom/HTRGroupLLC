import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import AdminSecretAccess from "@/components/AdminSecretAccess";
import { onGlobeSecretClick, queueGalleryAdminOpen } from "@/lib/gallerySecretUnlock";
import { motion } from "framer-motion";
import {
  Phone, Wrench, ShieldCheck, Clock, Star, CheckCircle2,
  ChevronLeft, ChevronRight, Menu, X, Users, Award, RefreshCw, ExternalLink, ThumbsUp, Globe,
  CalendarCheck, Truck, SearchCode, Hammer, BadgeCheck,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

import ReviewsSection from "@/components/ReviewsSection";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { GOOGLE_STAR_COLOR } from "@/lib/googleReviewsClient";
import ChatWidget from "@/components/ChatWidget";
import ServiceAreaMapOverlay from "@/components/ServiceAreaMapOverlay";
import { HeroCircuitEffect } from "@/components/HeroCircuitEffect";
import {
  BOOKING_TIME_SLOTS,
  getMinBookingDate,
  getPastTimeSlots,
  isDayFullyBooked,
  skipToNextBusinessDay,
} from "@/lib/bookingDate";
import svcDryerImg    from "@assets/svc_dryer_nobrand.png";
import svcWasherImg   from "@assets/svc_washer_card.png";
import svcFridgeImg   from "@assets/svc_refrigerator_card.png";
import svcDishImg     from "@assets/svc_dishwasher_nobrand.png";
import svcMicroImg    from "@assets/svc_microwave_nobrand.png";
import svcHoodImg     from "@assets/svc_rangehood_nobrand.png";
import svcOvenImg     from "@assets/svc_gas_range_card.png";
import svcStoveImg    from "@assets/svc_electric_stove_card.png";
import whyUsBgImg     from "@assets/why-us-photo.png";
import svcIceMakerImg from "@assets/svc_icemaker.png";
import svcCooktopImg  from "@assets/svc_cooktop.png";
import svcWineCoolImg from "@assets/svc_winecooler.png";
import svcFreezerImg  from "@assets/svc_freezer.png";
import svcDisposalImg from "@assets/svc_disposal.png";
import svcWarmerImg   from "@assets/svc_warmer.png";
import g62  from "@assets/photo_62_2026-04-02_02-47-29_1775273301589.jpg";
import ourWorkSectionImg from "@assets/our-work-hero.webp";
import g67  from "@assets/photo_67_2026-04-02_02-42-16_1775273301590.jpg";
import g73  from "@assets/photo_73_2026-04-02_02-42-16_1775273301591.jpg";
import g75  from "@assets/photo_75_2026-04-02_02-42-16_1775273301591.jpg";
import g76  from "@assets/photo_76_2026-04-02_02-42-16_1775273301592.jpg";
import g77a from "@assets/photo_77_2026-04-02_02-41-17_1775273301592.jpg";
import g77b from "@assets/photo_77_2026-04-02_02-42-16_1775273301592.jpg";
import g79  from "@assets/photo_79_2026-04-02_02-41-17_1775273301593.jpg";
import g80  from "@assets/photo_80_2026-04-02_02-41-17_1775273301593.jpg";
import g83  from "@assets/photo_83_2026-04-02_02-41-17_1775273301594.jpg";
import g84  from "@assets/photo_84_2026-04-02_02-41-17_1775273301594.jpg";
import g85  from "@assets/photo_85_2026-04-02_02-41-17_1775273301595.jpg";
import g88  from "@assets/photo_88_2026-04-02_02-41-17_1775273301595.jpg";
import g90  from "@assets/photo_90_2026-04-02_02-41-17_1775273301596.jpg";
import g91  from "@assets/photo_91_2026-04-02_02-41-17_1775273301596.jpg";
import g92  from "@assets/photo_92_2026-04-02_02-41-17_1775273301597.jpg";
import n63  from "@assets/photo_63_2026-04-02_02-42-16_1775273781270.jpg";
import n65  from "@assets/photo_65_2026-04-02_02-41-17_1775273781271.jpg";
import n73  from "@assets/photo_73_2026-04-02_02-42-40_1775273781271.jpg";
import n78  from "@assets/photo_78_2026-04-02_02-41-58_1775273781272.jpg";
import n84  from "@assets/photo_84_2026-04-02_02-41-58_1775273781273.jpg";
import n85a from "@assets/photo_85_2026-04-02_02-41-17_1775273781273.jpg";
import n85b from "@assets/photo_85_2026-04-02_02-41-58_1775273781274.jpg";
import n86a from "@assets/photo_86_2026-04-02_02-41-17_1775273781274.jpg";
import n86b from "@assets/photo_86_2026-04-02_02-41-58_1775273781275.jpg";
import n87  from "@assets/photo_87_2026-04-02_02-41-17_1775273781275.jpg";
import b1a  from "@assets/photo_1_2026-04-02_02-42-16_1775275535738.jpg";
import b1b  from "@assets/photo_1_2026-04-02_02-42-40_1775275535738.jpg";
import b1c  from "@assets/photo_1_2026-04-02_02-47-16_1775275535739.jpg";
import b1d  from "@assets/photo_1_2026-04-02_02-47-29_1775275535739.jpg";
import b2a  from "@assets/photo_2_2026-04-02_02-42-40_1775275535739.jpg";
import b2b  from "@assets/photo_2_2026-04-02_02-47-16_1775275535740.jpg";
import b2c  from "@assets/photo_2_2026-04-02_02-47-29_1775275535740.jpg";
import b3a  from "@assets/photo_3_2026-04-02_02-41-17_1775275535740.jpg";
import b3b  from "@assets/photo_3_2026-04-02_02-42-16_1775275535741.jpg";
import b3c  from "@assets/photo_3_2026-04-02_02-42-40_1775275535741.jpg";
import b3d  from "@assets/photo_3_2026-04-02_02-47-16_1775275535741.jpg";
import b3e  from "@assets/photo_3_2026-04-02_02-47-29_1775275535742.jpg";
import b4a  from "@assets/photo_4_2026-04-02_02-41-17_1775275535742.jpg";
import b4b  from "@assets/photo_4_2026-04-02_02-41-58_1775275535742.jpg";
import b4c  from "@assets/photo_4_2026-04-02_02-42-16_1775275535743.jpg";
import b4d  from "@assets/photo_4_2026-04-02_02-42-40_1775275535743.jpg";
import b4e  from "@assets/photo_4_2026-04-02_02-47-16_1775275535743.jpg";
import b4f  from "@assets/photo_4_2026-04-02_02-47-29_1775275535744.jpg";
import b5a  from "@assets/photo_5_2026-04-02_02-42-16_1775275535744.jpg";
import b5b  from "@assets/photo_5_2026-04-02_02-42-40_1775275535744.jpg";
import c8a  from "@assets/photo_8_2026-04-02_02-47-29_1775275789107.jpg";
import c9a  from "@assets/photo_9_2026-04-02_02-47-29_1775275789108.jpg";
import c10a from "@assets/photo_10_2026-04-02_02-41-17_1775275789108.jpg";
import c10b from "@assets/photo_10_2026-04-02_02-41-58_1775275789108.jpg";
import c10c from "@assets/photo_10_2026-04-02_02-42-40_1775275789109.jpg";
import c10d from "@assets/photo_10_2026-04-02_02-47-16_1775275789109.jpg";
import d10e from "@assets/photo_10_2026-04-02_02-47-29_1775276001260.jpg";
import d11a from "@assets/photo_11_2026-04-02_02-41-58_1775276001261.jpg";
import d11b from "@assets/photo_11_2026-04-02_02-47-16_1775276001262.jpg";
import d11c from "@assets/photo_11_2026-04-02_02-47-29_1775276001262.jpg";
import d12a from "@assets/photo_12_2026-04-02_02-42-40_1775276001263.jpg";
import d12b from "@assets/photo_12_2026-04-02_02-47-16_1775276001263.jpg";
import d13a from "@assets/photo_13_2026-04-02_02-42-40_1775276001264.jpg";
import d14a from "@assets/photo_14_2026-04-02_02-41-58_1775276001264.jpg";
import d14b from "@assets/photo_14_2026-04-02_02-42-16_1775276001265.jpg";
import d15a from "@assets/photo_15_2026-04-02_02-47-29_1775276001265.jpg";
import d17a from "@assets/photo_17_2026-04-02_02-42-16_1775276001266.jpg";
import d17b from "@assets/photo_17_2026-04-02_02-47-16_1775276001266.jpg";
import d18a from "@assets/photo_18_2026-04-02_02-41-58_1775276001267.jpg";
import d19a from "@assets/photo_19_2026-04-02_02-42-16_1775276001267.jpg";
import d20a from "@assets/photo_20_2026-04-02_02-42-40_1775276001268.jpg";
import d21a from "@assets/photo_21_2026-04-02_02-41-17_1775276001268.jpg";
import d21b from "@assets/photo_21_2026-04-02_02-42-16_1775276001269.jpg";
import d23a from "@assets/photo_23_2026-04-02_02-42-40_1775276001269.jpg";
import d24a from "@assets/photo_24_2026-04-02_02-41-58_1775276001269.jpg";
import d26a from "@assets/photo_26_2026-04-02_02-42-16_1775276001270.jpg";
import e32a from "@assets/photo_32_2026-04-02_02-41-17_1775276156822.jpg";
import e32b from "@assets/photo_32_2026-04-02_02-41-58_1775276156822.jpg";
import e32c from "@assets/photo_32_2026-04-02_02-42-16_1775276156823.jpg";
import e32d from "@assets/photo_32_2026-04-02_02-42-40_1775276156823.jpg";
import e34a from "@assets/photo_34_2026-04-02_02-42-16_1775276156824.jpg";
import e35a from "@assets/photo_35_2026-04-02_02-41-17_1775276156824.jpg";
import e35b from "@assets/photo_35_2026-04-02_02-42-16_1775276156824.jpg";
import e36a from "@assets/photo_36_2026-04-02_02-41-58_1775276156825.jpg";
import e36b from "@assets/photo_36_2026-04-02_02-42-16_1775276156825.jpg";
import e36c from "@assets/photo_36_2026-04-02_02-42-40_1775276156825.jpg";
import e37a from "@assets/photo_37_2026-04-02_02-47-16_1775276156826.jpg";
import e38a from "@assets/photo_38_2026-04-02_02-41-17_1775276156826.jpg";
import e38b from "@assets/photo_38_2026-04-02_02-42-16_1775276156826.jpg";
import e38c from "@assets/photo_38_2026-04-02_02-42-40_1775276156826.jpg";
import e38d from "@assets/photo_38_2026-04-02_02-47-16_1775276156827.jpg";
import e39a from "@assets/photo_39_2026-04-02_02-47-16_1775276156827.jpg";
import e40a from "@assets/photo_40_2026-04-02_02-42-16_1775276156827.jpg";
import e40b from "@assets/photo_40_2026-04-02_02-47-16_1775276156828.jpg";
import f43a from "@assets/photo_43_2026-04-02_02-41-17_1775276347862.jpg";
import f43b from "@assets/photo_43_2026-04-02_02-41-58_1775276347863.jpg";
import f43c from "@assets/photo_43_2026-04-02_02-42-40_1775276347863.jpg";
import f43d from "@assets/photo_43_2026-04-02_02-47-16_1775276347864.jpg";
import f43e from "@assets/photo_43_2026-04-02_02-47-29_1775276347864.jpg";
import f44a from "@assets/photo_44_2026-04-02_02-42-16_1775276347864.jpg";
import f44b from "@assets/photo_44_2026-04-02_02-47-16_1775276347865.jpg";
import f45a from "@assets/photo_45_2026-04-02_02-41-17_1775276347866.jpg";
import f45b from "@assets/photo_45_2026-04-02_02-41-58_1775276347866.jpg";
import f45c from "@assets/photo_45_2026-04-02_02-47-16_1775276347867.jpg";
import f45d from "@assets/photo_45_2026-04-02_02-47-29_1775276347867.jpg";
import f46a from "@assets/photo_46_2026-04-02_02-47-16_1775276347867.jpg";
import f46b from "@assets/photo_46_2026-04-02_02-47-29_1775276347868.jpg";
import f47a from "@assets/photo_47_2026-04-02_02-41-58_1775276347868.jpg";
import g59a from "@assets/photo_59_2026-04-02_02-42-40_1775276478268.jpg";
import g60a from "@assets/photo_60_2026-04-02_02-41-58_1775276478268.jpg";
import g60b from "@assets/photo_60_2026-04-02_02-42-16_1775276478269.jpg";
import g61a from "@assets/photo_61_2026-04-02_02-47-29_1775276478269.jpg";
import g62a from "@assets/photo_62_2026-04-02_02-41-58_1775276478269.jpg";
import g62b from "@assets/photo_62_2026-04-02_02-42-40_1775276478270.jpg";
import g62c from "@assets/photo_62_2026-04-02_02-47-16_1775276478270.jpg";
import g63a from "@assets/photo_63_2026-04-02_02-42-40_1775276478271.jpg";
import g63b from "@assets/photo_63_2026-04-02_02-47-16_1775276478271.jpg";
import g64a from "@assets/photo_64_2026-04-02_02-42-16_1775276478271.jpg";
import g64b from "@assets/photo_64_2026-04-02_02-42-40_1775276478272.jpg";
import g64c from "@assets/photo_64_2026-04-02_02-47-16_1775276478272.jpg";
import g65a from "@assets/photo_65_2026-04-02_02-41-58_1775276478272.jpg";
import g65b from "@assets/photo_65_2026-04-02_02-47-16_1775276478272.jpg";
import g66a from "@assets/photo_66_2026-04-02_02-41-58_1775276478273.jpg";
import g66b from "@assets/photo_66_2026-04-02_02-42-16_1775276478273.jpg";
import g69a from "@assets/photo_69_2026-04-02_02-42-40_1775276478273.jpg";
import g70a from "@assets/photo_70_2026-04-02_02-41-17_1775276478274.jpg";
import g70b from "@assets/photo_70_2026-04-02_02-42-40_1775276478274.jpg";
import g72a from "@assets/photo_72_2026-04-02_02-41-17_1775276478274.jpg";
import h58a from "@assets/photo_58_2026-04-02_02-42-16_1775276590974.jpg";
import h65a from "@assets/photo_65_2026-04-02_02-41-17_1775276590975.jpg";
import h71a from "@assets/photo_71_2026-04-02_02-41-58_1775276590975.jpg";
import h71b from "@assets/photo_71_2026-04-02_02-42-40_1775276590976.jpg";
import h73a from "@assets/photo_73_2026-04-02_02-41-58_1775276590976.jpg";
import h73b from "@assets/photo_73_2026-04-02_02-42-16_1775276590977.jpg";
import h74a from "@assets/photo_74_2026-04-02_02-42-16_1775276590977.jpg";
import h74b from "@assets/photo_74_2026-04-02_02-42-40_1775276590978.jpg";
import h75a from "@assets/photo_75_2026-04-02_02-47-16_1775276590978.jpg";
import h76a from "@assets/photo_76_2026-04-02_02-41-17_1775276590979.jpg";
import h79a from "@assets/photo_79_2026-04-02_02-42-40_1775276590979.jpg";
import h80a from "@assets/photo_80_2026-04-02_02-41-58_1775276590980.jpg";
import h80b from "@assets/photo_80_2026-04-02_02-42-16_1775276590980.jpg";
import h81a from "@assets/photo_81_2026-04-02_02-41-17_1775276590980.jpg";
import h81b from "@assets/photo_81_2026-04-02_02-47-16_1775276590981.jpg";
import h85a from "@assets/photo_85_2026-04-02_02-42-40_1775276590981.jpg";
import h88a from "@assets/photo_88_2026-04-02_02-41-58_1775276590981.jpg";
import h90a from "@assets/photo_90_2026-04-02_02-41-58_1775276590982.jpg";
import h91a from "@assets/photo_91_2026-04-02_02-42-40_1775276590982.jpg";
import i55a from "@assets/photo_55_2026-04-02_02-41-17_1775277220520.jpg";
import i55b from "@assets/photo_55_2026-04-02_02-42-16_1775277220520.jpg";
import i55c from "@assets/photo_55_2026-04-02_02-42-40_1775277220520.jpg";
import i57a from "@assets/photo_57_2026-04-02_02-42-16_1775277220519.jpg";
import i57b from "@assets/photo_57_2026-04-02_02-47-29_1775277220519.jpg";
import i62a from "@assets/photo_62_2026-04-02_02-42-16_1775277220519.jpg";
import i83a from "@assets/photo_83_2026-04-02_02-42-16_1775277220519.jpg";
import new1a from "@assets/photo_1_2026-04-10_13-45-35_1775846776370.jpg";
import new2a from "@assets/photo_2_2026-04-10_13-45-35_1775846776370.jpg";
import new3a from "@assets/photo_3_2026-04-10_13-45-35_1775846776370.jpg";
import new4a from "@assets/photo_4_2026-04-10_13-45-35_1775846776371.jpg";
import new5a from "@assets/photo_5_2026-04-10_13-45-35_1775846776371.jpg";
import new6a from "@assets/photo_6_2026-04-10_13-45-35_1775846776371.jpg";
import new7a from "@assets/photo_7_2026-04-10_13-45-35_1775846776371.jpg";
import new8a from "@assets/photo_8_2026-04-10_13-45-35_1775846776372.jpg";
import ctaBg          from "@assets/photo_18_2026-04-03_01-13-35_1775196883895.jpg";
import heroImg        from "@assets/ChatGPT_Image_12_Ð°Ð¿Ñ€._2026_Ð³.,_02_07_40_1775977673189.png";

import { PHONE_DISPLAY, PHONE_HREF, COMPANY_PHONE_DISPLAY, COMPANY_PHONE_HREF } from "@/lib/sitePhones";

/* â”€â”€ Brand / Model data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function PhonePair({ compact = false, inHeader = false }: { compact?: boolean; inHeader?: boolean }) {
  const linkCls = compact
    ? "htr-phone-btn inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm"
    : inHeader
      ? "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm"
      : "htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm";
  const iconCls = compact ? "h-4 w-4" : "h-3.5 w-3.5";
  const wrapCls = compact
    ? "htr-phone-pair--hero-top flex flex-row flex-wrap gap-2 items-center justify-start"
    : inHeader
      ? "header-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end"
      : "htr-phone-pair flex flex-col gap-1.5 items-start";
  return (
    <div className={wrapCls}>
      <a href={COMPANY_PHONE_HREF} className={linkCls} style={{ backgroundColor: K.accent }}>
        <Phone className={iconCls} /> {COMPANY_PHONE_DISPLAY}
      </a>
      <a href={PHONE_HREF} className={linkCls} style={{ backgroundColor: K.accent }}>
        <Phone className={iconCls} /> {PHONE_DISPLAY}
      </a>
    </div>
  );
}

function MidPhoneStrip() {
  return (
    <div className="py-6 text-center bg-white border-y border-stone-100">
      <p className="text-stone-600 text-sm font-semibold mb-3">Call us anytime</p>
      <div className="htr-phone-pair--row flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href={COMPANY_PHONE_HREF} className="htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm" style={{ backgroundColor: K.accent }}>
          <Phone className="h-4 w-4" /> {COMPANY_PHONE_DISPLAY}
        </a>
      <a href={PHONE_HREF} className="htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm" style={{ backgroundColor: K.accent }}>
          <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
        </a>
      </div>
    </div>
  );
}

type BrandEntry = { brand: string; models: string[] };

const BRANDS_BY_APPLIANCE: Record<string, BrandEntry[]> = {
  refrigerator: [
    { brand: "Samsung",         models: ["French Door (RF Series)","Side-by-Side (RS Series)","Top Freezer (RT Series)","4-Door Flex","Bespoke","Family Hub","Chef Collection","Other Samsung"] },
    { brand: "LG",              models: ["Door-in-Door (LRMVS)","InstaView","French Door (LFXS / LRFCS)","Side-by-Side (LSXS)","Top Freezer (LTCS / LRTNSS)","LG Signature","LG STUDIO","Other LG"] },
    { brand: "Whirlpool",       models: ["WRS (Side-by-Side)","WRF (French Door)","WRT (Top Freezer)","WRB (Bottom Freezer)","Gold Series","Other Whirlpool"] },
    { brand: "GE / GE Profile", models: ["GFE / EFE (French Door)","GSS / GSE (Side-by-Side)","GTS / GTE (Top Freezer)","GE CafÃ©","GE Monogram","GE Profile","Other GE"] },
    { brand: "Frigidaire",      models: ["FFSS (Side-by-Side)","FFHB / FPHN (French Door)","FFTN / FFTR (Top Freezer)","Gallery Series","Professional Series","Other Frigidaire"] },
    { brand: "Maytag",          models: ["MFI / MFF (French Door)","MSD / MSF (Side-by-Side)","MRT (Top Freezer)","Other Maytag"] },
    { brand: "KitchenAid",      models: ["KRMF / KFIS (French Door)","KSSC / KSCS (Side-by-Side)","KBBR (Bottom Freezer)","Other KitchenAid"] },
    { brand: "Bosch",           models: ["B24 / B30 / B36 (Column)","B22 / B26 (Counter-Depth)","800 Series","Benchmark Series","Other Bosch"] },
    { brand: "Sub-Zero",        models: ["Classic BI-36 / BI-42 / BI-48","PRO Series (Column)","Designer IT (Integrated)","UC (Undercounter)","IC (Integrated Column)","Other Sub-Zero"] },
    { brand: "Miele",           models: ["K 2000 / K 7000","KFN (French Door)","Other Miele"] },
    { brand: "Thermador",       models: ["T24 / T36 (Column)","T18 / T30 (Column Freezer)","Other Thermador"] },
    { brand: "Viking",          models: ["VCBB / VCFB (Refrigerator / Freezer)","Professional 7 Series","Designer Series","Other Viking"] },
    { brand: "JennAir",         models: ["JCD / JFC (French Door)","JBSS (Side-by-Side)","RISE Series","NOIR Series","Other JennAir"] },
    { brand: "Dacor",           models: ["EF / IF Series","Renaissance Series","Modernist Series","Other Dacor"] },
    { brand: "Fisher & Paykel", models: ["ActiveSmart (RF Series)","CoolDrawer (RS / RB Series)","Other Fisher & Paykel"] },
    { brand: "Kenmore",         models: ["Elite Series","Pro Series","700 / 800 / 900 Series","Other Kenmore"] },
    { brand: "Hotpoint",        models: ["HTR (Top Freezer)","HTS (Side-by-Side)","Other Hotpoint"] },
    { brand: "Amana",           models: ["ART (Top Freezer)","ABB (Bottom Freezer)","AQU / ASI (Side-by-Side)","Other Amana"] },
    { brand: "U-Line",          models: ["1000 Series","2000 Series","3000 Series","Other U-Line"] },
    { brand: "Perlick",         models: ["HP48 (Refrigerator)","HC24 (Counter-Depth)","HR24 (Refrigerator)","Other Perlick"] },
    { brand: "True",            models: ["T-23 (Reach-In)","T-49 (Two-Section)","TUC-27 / TUC-48 (Undercounter)","Other True"] },
    { brand: "Scotsman",        models: ["C0322 (Cube Ice)","C0522 / C0630 (Cube Ice)","HID312 / HID525 (Gourmet Ice)","Other Scotsman"] },
    { brand: "Hoshizaki",       models: ["KM-515 / KM-901","B-500 / B-1300 (Undercounter)","Other Hoshizaki"] },
    { brand: "Manitowoc",       models: ["IDT-0300 / IDT-0900","IYT-0300 / IYT-1500","Other Manitowoc"] },
    { brand: "Danby",           models: ["DAR (Refrigerator)","DCR (Compact Fridge)","DWC (Wine Cooler)","Other Danby"] },
    { brand: "Summit",          models: ["FF Series","SCR (Compact Fridge)","ALF (Freezer)","Other Summit"] },
    { brand: "Magic Chef",      models: ["HMR (Mini Fridge)","MCBR (Beverage Center)","Other Magic Chef"] },
    { brand: "Insignia",        models: ["NS-RTM18SS","NS-CF50SS9 (Compact Fridge)","Other Insignia"] },
    { brand: "Other / Unknown", models: ["Other Brand / Model Not Listed"] },
  ],
  washer: [
    { brand: "Samsung",         models: ["Front Load (WF Series)","Top Load (WA Series)","FlexWash","Bespoke AI","Other Samsung"] },
    { brand: "LG",              models: ["Front Load (WM Series)","Top Load (WT Series)","TwinWash","TurboWash 360","LG STUDIO","Other LG"] },
    { brand: "Whirlpool",       models: ["WFW (Front Load)","WTW (Top Load)","Cabrio","Duet","Bravos XL","Other Whirlpool"] },
    { brand: "GE / GE Profile", models: ["GFW (Front Load)","GTW (Top Load)","GE Profile","GE CafÃ©","Artistry Series","Other GE"] },
    { brand: "Frigidaire",      models: ["FFFW (Front Load)","FFTW (Top Load)","Gallery Series","Professional Series","Other Frigidaire"] },
    { brand: "Maytag",          models: ["MHW (Front Load)","MVW (Top Load)","Bravos XL","Bravos X","Other Maytag"] },
    { brand: "Speed Queen",     models: ["TC5 / TR5 / TR7 (Top Load)","FF7 / FS7 / FP7 (Front Load)","Commercial Series","Other Speed Queen"] },
    { brand: "Bosch",           models: ["WAT / WAE Series","500 Series","800 Series","Benchmark Series","Other Bosch"] },
    { brand: "Miele",           models: ["W1 Classic","W1 Performance","W1 TwinDos","Other Miele"] },
    { brand: "Electrolux",      models: ["EFLS (Front Load)","EIFLW (Front Load)","Icon Professional","Other Electrolux"] },
    { brand: "KitchenAid",      models: ["KFFW (Front Load)","KTTS (Top Load)","Other KitchenAid"] },
    { brand: "Amana",           models: ["NFW (Front Load)","NTW (Top Load)","Other Amana"] },
    { brand: "Kenmore",         models: ["Elite Series","Pro Series","700 / 800 Series","Other Kenmore"] },
    { brand: "Hotpoint",        models: ["HTW / HTWP (Top Load)","Other Hotpoint"] },
    { brand: "Insignia",        models: ["NS-WM45SS","Other Insignia"] },
    { brand: "Other / Unknown", models: ["Other Brand / Model Not Listed"] },
  ],
  dryer: [
    { brand: "Samsung",         models: ["Electric Dryer (DV Series)","Gas Dryer (DV Series)","FlexDry","Bespoke","Other Samsung"] },
    { brand: "LG",              models: ["Electric (DLEX Series)","Gas (DLGX Series)","Ultra Large Capacity","LG STUDIO","Other LG"] },
    { brand: "Whirlpool",       models: ["WED (Electric)","WGD (Gas)","Cabrio","Duet","Gold Series","Other Whirlpool"] },
    { brand: "GE / GE Profile", models: ["GTD / GFD (Electric / Gas)","GE Profile","GE CafÃ©","Other GE"] },
    { brand: "Frigidaire",      models: ["FFED (Electric)","FGEW (Gas)","Gallery Series","Professional Series","Other Frigidaire"] },
    { brand: "Maytag",          models: ["MEDB (Electric)","MGDB (Gas)","Bravos XL","Bravos X","Other Maytag"] },
    { brand: "Speed Queen",     models: ["ADEE9 / ADEE8 (Electric)","ADGE9 (Gas)","Commercial Series","Other Speed Queen"] },
    { brand: "Bosch",           models: ["WTG / WTZ Series","500 Series","800 Series","Other Bosch"] },
    { brand: "Miele",           models: ["T1 Classic","T1 Performance","Other Miele"] },
    { brand: "Electrolux",      models: ["EFME (Electric)","Icon Professional","Other Electrolux"] },
    { brand: "KitchenAid",      models: ["OMED / YMEDX","Other KitchenAid"] },
    { brand: "Amana",           models: ["NED (Electric)","NGD (Gas)","Other Amana"] },
    { brand: "Kenmore",         models: ["Elite Series","Pro Series","700 / 800 Series","Other Kenmore"] },
    { brand: "Hotpoint",        models: ["HTDX / HTDP","Other Hotpoint"] },
    { brand: "Other / Unknown", models: ["Other Brand / Model Not Listed"] },
  ],
  oven: [
    { brand: "Samsung",         models: ["Slide-In Range (NE/NX Series)","Freestanding (NX Series)","Bespoke","Smart Range","Other Samsung"] },
    { brand: "LG",              models: ["ProBake (LRE / LRG)","InstaView Range (LSE / LSG)","LG STUDIO Range","Smart Wall Oven","Other LG"] },
    { brand: "Whirlpool",       models: ["WOS / WOC (Wall Oven)","WEE / WEG (Range)","Gold Series","Other Whirlpool"] },
    { brand: "GE / GE Profile", models: ["JB / JGB (Freestanding Range)","GE Profile (P9B / P2B)","GE CafÃ© (C2S / C2H)","GE Monogram","Other GE"] },
    { brand: "Frigidaire",      models: ["FFEF / FGEF (Electric / Gas)","Gallery Series","Professional Series","Other Frigidaire"] },
    { brand: "KitchenAid",      models: ["KERS / KEMS (Electric Range)","KFGD / KFGS (Gas Range)","KOCE / KODC (Double Oven)","Other KitchenAid"] },
    { brand: "Maytag",          models: ["MER (Electric Range)","MGR (Gas Range)","Other Maytag"] },
    { brand: "Bosch",           models: ["HEI / HGI (Slide-In)","HES / HGS (Freestanding)","HBL (Wall Oven)","500 / 800 Series","Other Bosch"] },
    { brand: "Wolf",            models: ["DF Series (Dual Fuel)","GR Series (Gas)","IR Series (Induction)","DO (Double Oven)","CT (Convection)","Other Wolf"] },
    { brand: "Thermador",       models: ["PRD (Pro Dual Fuel)","PRL (Pro Rangetop)","PCG (Pro Gas)","PRFD (Pro Harmony)","MES (Masterpiece Oven)","Other Thermador"] },
    { brand: "Viking",          models: ["VGRC (Gas Range)","VDSC (Dual Fuel)","Professional 7","Designer Series","Other Viking"] },
    { brand: "JennAir",         models: ["JGR / JER (Range)","JMW (Wall Oven)","RISE Series","NOIR Series","Other JennAir"] },
    { brand: "Dacor",           models: ["RNR / RNT (Range)","STW / SGM (Rangetop)","Renaissance Series","Modernist Series","Other Dacor"] },
    { brand: "Bertazzoni",      models: ["Master Series","Professional Series","Heritage Series","Modern Series","Other Bertazzoni"] },
    { brand: "BlueStar",        models: ["BSP (Platinum Range)","RNB (Open Burner)","BSD (Dual Fuel)","RCS / RGT (Rangetop)","Other BlueStar"] },
    { brand: "La Cornue",       models: ["CornuFÃ© 90 / 110 / 150","ChÃ¢teau 75 / 100 / 150","Fontenay 80 / 100","Other La Cornue"] },
    { brand: "Gaggenau",        models: ["VG / VI (Vario Cooktop)","BS (Steam Oven)","EB (Wall Oven)","200 / 400 Series","Other Gaggenau"] },
    { brand: "Miele",           models: ["HR (Range)","H (Wall Oven)","KM 6000 / 7000 (Induction)","Other Miele"] },
    { brand: "SMEG",            models: ["Victoria Series","Classic Series","Opera Range","50s Retro","Other SMEG"] },
    { brand: "Amana",           models: ["AGR (Gas Range)","AER (Electric Range)","Other Amana"] },
    { brand: "Electrolux",      models: ["EI30 / EW30 (Range)","Icon Professional","Other Electrolux"] },
    { brand: "Kenmore",         models: ["Elite Series","Pro Series","Other Kenmore"] },
    { brand: "Hotpoint",        models: ["RGB (Gas Range)","Other Hotpoint"] },
    { brand: "Vulcan",          models: ["VC4 / VC6 (Convection Oven)","VG / VS (Restaurant Range)","Other Vulcan"] },
    { brand: "Garland",         models: ["US Range Series","Master 200 Series","G-Series (Range)","Other Garland"] },
    { brand: "TurboChef",       models: ["i3 / i5 (Speed Oven)","Sota","Encore 2","Other TurboChef"] },
    { brand: "Other / Unknown", models: ["Other Brand / Model Not Listed"] },
  ],
  stove: [
    { brand: "Samsung",         models: ["Slide-In Electric (NE Series)","Freestanding Electric (NX)","Bespoke","Other Samsung"] },
    { brand: "LG",              models: ["Electric Range (LRE Series)","InstaView Electric (LSE)","LG STUDIO","Other LG"] },
    { brand: "Whirlpool",       models: ["WEE (Electric Range)","Gold Series","Other Whirlpool"] },
    { brand: "GE / GE Profile", models: ["JB / JES (Electric Range)","GE Profile (P2B)","GE CafÃ©","Other GE"] },
    { brand: "Frigidaire",      models: ["FFEF (Electric Range)","Gallery Series","Professional Series","Other Frigidaire"] },
    { brand: "KitchenAid",      models: ["KEMS / KERS (Electric)","KOCE (Wall Oven)","Other KitchenAid"] },
    { brand: "Bosch",           models: ["HEI (Slide-In Electric)","500 / 800 Series","Other Bosch"] },
    { brand: "Maytag",          models: ["MER (Electric Range)","Other Maytag"] },
    { brand: "Bertazzoni",      models: ["Master Series","Professional Series","Heritage Series","Other Bertazzoni"] },
    { brand: "SMEG",            models: ["Victoria Series","Classic Series","50s Retro Style","Other SMEG"] },
    { brand: "Kenmore",         models: ["Elite Series","Pro Series","Other Kenmore"] },
    { brand: "Hotpoint",        models: ["RBS (Electric Range)","Other Hotpoint"] },
    { brand: "Other / Unknown", models: ["Other Brand / Model Not Listed"] },
  ],
  dishwasher: [
    { brand: "Bosch",           models: ["SHPM (800 Plus)","SHPX (800 Series)","SHEM (500 Series)","300 / 100 / 200 Series","Benchmark Series","Other Bosch"] },
    { brand: "KitchenAid",      models: ["KDTE / KDTM","Top Control Series","Other KitchenAid"] },
    { brand: "Miele",           models: ["G 5000 Series","G 7000 Series","Futura Crystal","Futura Diamond","Futura Classic","Other Miele"] },
    { brand: "Samsung",         models: ["StormWash (DW Series)","Linear Wash","AutoRelease Door","Other Samsung"] },
    { brand: "LG",              models: ["QuadWash (LDT Series)","Top Control (LDF Series)","NeveRust Tub","Other LG"] },
    { brand: "Whirlpool",       models: ["WDT / WDP Series","Gold Series","Other Whirlpool"] },
    { brand: "GE / GE Profile", models: ["GDT / GDF Series","GE Profile","GE CafÃ©","Other GE"] },
    { brand: "Frigidaire",      models: ["FGHS / FFCD Series","Gallery Series","Professional Series","Other Frigidaire"] },
    { brand: "Maytag",          models: ["MDB Series","Other Maytag"] },
    { brand: "Electrolux",      models: ["EWDW Series","Icon Professional","Other Electrolux"] },
    { brand: "Thermador",       models: ["DWHD / DWHZ Series","Other Thermador"] },
    { brand: "Viking",          models: ["VDWU Series","Other Viking"] },
    { brand: "Dacor",           models: ["DYCT / DYCTD Series","Other Dacor"] },
    { brand: "Fisher & Paykel", models: ["DishDrawer DD (2-Drawer)","DishDrawer DD (Single)","Other Fisher & Paykel"] },
    { brand: "Gaggenau",        models: ["DF / SF Series","400 Series","Other Gaggenau"] },
    { brand: "Amana",           models: ["ADB Series","Other Amana"] },
    { brand: "Kenmore",         models: ["Elite Series","500 / 700 Series","Other Kenmore"] },
    { brand: "Hotpoint",        models: ["HLD Series","Other Hotpoint"] },
    { brand: "Hobart",          models: ["CRS / CRB / CRC","AM-15","CLPS66","Other Hobart"] },
    { brand: "Danby",           models: ["DDW (Countertop)","Other Danby"] },
    { brand: "Summit",          models: ["SPS Series","Other Summit"] },
    { brand: "Insignia",        models: ["NS-DWH2SS9","Other Insignia"] },
    { brand: "Other / Unknown", models: ["Other Brand / Model Not Listed"] },
  ],
  microwave: [
    { brand: "LG",              models: ["NeoChef (LMC / LMVH)","Over-the-Range (LMV Series)","Built-In (LMBS)","Other LG"] },
    { brand: "Samsung",         models: ["Over-the-Range (ME / MC Series)","Countertop (MS Series)","Smart Oven Combo","Other Samsung"] },
    { brand: "Panasonic",       models: ["NN-SN Series","NN-SE Series","FlashXpress","Inverter Series","Other Panasonic"] },
    { brand: "Sharp",           models: ["SMD2480CS (Drawer)","SMC (Countertop)","KB (Built-In Drawer)","Other Sharp"] },
    { brand: "GE / GE Profile", models: ["JVM (Over-the-Range)","JES (Countertop)","PVM / PEB (Profile)","GE CafÃ©","Other GE"] },
    { brand: "Whirlpool",       models: ["WMH (Over-the-Range)","WML (Countertop)","Other Whirlpool"] },
    { brand: "KitchenAid",      models: ["KMHS (Over-the-Range)","KMHC (Built-In)","Other KitchenAid"] },
    { brand: "Frigidaire",      models: ["FFMV (Over-the-Range)","FGMV (Gallery Over-the-Range)","Other Frigidaire"] },
    { brand: "Toshiba",         models: ["EM925 / EM131 (Countertop)","ML-EM45 (Smart)","Other Toshiba"] },
    { brand: "Breville",        models: ["BM0 / BM6 Series","Combi Wave","Smart Oven Compact","Other Breville"] },
    { brand: "Wolf",            models: ["M Series Drawer (MW24)","Other Wolf"] },
    { brand: "Thermador",       models: ["MC / ME (Built-In)","Other Thermador"] },
    { brand: "JennAir",         models: ["JMW / JMC (Built-In)","NOIR Series","RISE Series","Other JennAir"] },
    { brand: "Amana",           models: ["AMV (Over-the-Range)","Other Amana"] },
    { brand: "Kenmore",         models: ["Elite Series","600 / 800 Series","Other Kenmore"] },
    { brand: "Magic Chef",      models: ["MCM Countertop Series","Other Magic Chef"] },
    { brand: "Other / Unknown", models: ["Other Brand / Model Not Listed"] },
  ],
  hood: [
    { brand: "Broan",           models: ["Glacier (BCSD)","RM (Wall Range Hood)","BKBN Series","PowerPack","Other Broan"] },
    { brand: "Zephyr",          models: ["Essentials","Luce","Gust","Tornado I / II","AK Series","Other Zephyr"] },
    { brand: "GE / GE Profile", models: ["JVW (Wall)","JV (Under Cabinet)","GE CafÃ© Hood","Other GE"] },
    { brand: "KitchenAid",      models: ["KVWB (Wall)","KVWC (Wall Chimney)","Other KitchenAid"] },
    { brand: "Bosch",           models: ["DPH / DHU / DUH / DHL Series","Other Bosch"] },
    { brand: "Miele",           models: ["DA (Wall)","DA (Under Cabinet)","Other Miele"] },
    { brand: "Wolf",            models: ["VW (Wall Hood)","VI (Island Hood)","Other Wolf"] },
    { brand: "Thermador",       models: ["HMWB / HMIB / HMCB Series","Other Thermador"] },
    { brand: "Viking",          models: ["VWCH / VCIH / VMWH Series","Other Viking"] },
    { brand: "Vent-A-Hood",     models: ["M Series","K Series","Other Vent-A-Hood"] },
    { brand: "Samsung",         models: ["NK (Wall)","NK (Under Cabinet)","Other Samsung"] },
    { brand: "LG",              models: ["LCB / LSHD Series","Other LG"] },
    { brand: "Other / Unknown", models: ["Other Brand / Model Not Listed"] },
  ],
  other: [
    { brand: "Other / Unknown", models: ["Other Brand / Model Not Listed"] },
  ],
};

/** Normalize the stored appliance string (EN or ES) to a BRANDS_BY_APPLIANCE key */
function appKey(appliance: string): string {
  const v = appliance.toLowerCase();
  if (v.includes("refriger") || v.includes("freezer") || v.includes("congelad")) return "refrigerator";
  if (v.includes("wash") || v.includes("lavad"))                                   return "washer";
  if (v.includes("dry") || v.includes("secad"))                                    return "dryer";
  if (v.includes("oven") || v.includes("range") || v.includes("horno") || v.includes("cocina")) return "oven";
  if (v.includes("stove") || v.includes("estufa"))                                 return "stove";
  if (v.includes("dish") || v.includes("lavajar") || v.includes("lavavaj"))        return "dishwasher";
  if (v.includes("micro"))                                                          return "microwave";
  if (v.includes("hood") || v.includes("campan"))                                  return "hood";
  if (v.includes("ice") || v.includes("hielo"))                                    return "refrigerator";
  if (v.includes("cooktop") || v.includes("placa"))                                return "stove";
  if (v.includes("wine") || v.includes("vino"))                                    return "refrigerator";
  if (v.includes("garbage") || v.includes("triturad") || v.includes("disposal"))   return "dishwasher";
  if (v.includes("warm") || v.includes("cajÃ³n") || v.includes("cajon"))            return "oven";
  return "other";
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const STAGGER = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

/* â”€â”€ Translations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const TR = {
  en: {
    nav:       ["Home", "Services", "About Us", "Reviews", "FAQ", "Contact"],
    bookNow:   "Book Now",
    promoBar:  "Returning customers save $50 on any repair - mention this offer when booking!",
    ourSvcs:   "Our Services",
    trust:     ["Same-Day Service", "Licensed & Insured", "90-Day Warranty"],
    heroH1:    ["Your Local", "Appliance Repair"],
    heroSub:   "Precision Repair. Trusted Technicians. Guaranteed Solutions.",
    svcH2:     "Fast & Reliable Appliance Repair",
    statsLabels: ["Happy Customers", "Services Repaired", "Hours Spent", "Professional Team"],
    whyH2:     "The HTRGroup Difference",
    whyDesc:   "With over 25 years of appliance repair expertise, our team has the expertise and parts to get your home running again â€” fast.",
    whyItems:  [
      { title: "Certified Technicians",  desc: "All specialists are certified, insured, and trained on the latest appliance technology." },
      { title: "Fully Stocked Trucks",   desc: "We carry common parts, completing 85% of repairs on the first visit â€” saving your time." },
      { title: "Upfront Honest Pricing", desc: "See the full quote before we start. No hidden fees. 90-day parts and labor warranty." },
    ],
    reviewsH2:   "Google Reviews",
    reviewsLoading: "Reviews loading…",
    reviewsBased: "Reviews on Google",
    writeReview:  "Leave a Google Review",
    refresh:      "Refresh",
    reviewsUpdated: "Reviews updated",
    showingLatest:  "Showing latest reviews.",
    tabLabels:    ["All Reviews", "5 Stars", "4 Stars", "Recent"],
    helpful:      "Helpful",
    faqH2:        "Frequently Asked Questions",
    faqs: [
      { q: "How much is the service call fee?",   a: "We charge a flat diagnostic fee. If you proceed with the repair, that fee is applied toward the total cost." },
      { q: "Do you repair all brands?",            a: "Yes â€” Whirlpool, LG, GE, Maytag, KitchenAid, Sub-Zero, Miele, Electrolux, and more." },
      { q: "How quickly can you come?",            a: "Same-day service if you call before noon. We do our best to arrive as soon as possible â€” please keep in mind travel time may vary depending on your location." },
      { q: "Do you guarantee your work?",          a: "Yes â€” 90-day warranty on all parts and labor. We return and fix for free if the same issue recurs." },
      { q: "Do I need to prepare anything before the technician arrives?", a: "For the safety of both our technician and your pets, please isolate all large animals, reptiles, exotic animals, and cats in a separate room before our arrival." },
    ],
    ctaH2:   "We Fix What Your Home Depends On.",
    ctaSub:  "Expert Appliance Repair For Every Major Brand.",
    contactH2: "Contact Us Today",
    address:  "Houston, TX & surrounding areas (Sugar Land, Katy, Pearland, The Woodlands, Pasadena)",
    hours1:   "Monâ€“Fri: 9:00 AM â€“ 5:00 PM",
    hours2:   "Satâ€“Sun: Closed",
    learnMore: "Learn More",
    bookH2:   "Book a Repair",
    bookSub:  "We'll call you within 15 minutes to confirm your appointment.",
    formFields: ["Your name", "Phone number", "ZIP Code"],
    emailPh:    "Email address (required)",
    addressPh:  "Street address (required)",
    cityPh:     "City (required)",
    zipPh:      "ZIP code (required, Houston area: 770, 773, 774, 775)",
    datePh:     "Preferred date (e.g. Apr 10)",
    timePh:     "Preferred time (e.g. 10:00 AM)",
    selectPh:   "Select appliance type...",
    brandModelPh: "Select brand & model series...",
    descPh:     "Describe the problem in detail (optional)",
    appTypes:   ["Refrigerator / Freezer", "Washing Machine", "Dryer", "Oven / Range", "Electric Oven & Stove", "Dishwasher", "Microwave", "Range Hood", "Ice Maker", "Cooktop", "Wine Cooler", "Freezer", "Garbage Disposal", "Warming Drawer", "Other"],
    requestBtn: "Request Appointment",
    received:   "Request Received!",
    callSoon:   "We'll call you within 15 minutes to confirm.",
    smsHint:    "If we don't answer, please text us a description of your issue and we'll get back to you shortly.",
    serviceAreaTitle: "Our Service Area",
    serviceAreaSub:   "We serve Houston and all surrounding cities. Click the map to get directions.",
    openInMaps:       "Open in Google Maps",
    privacy:    "Privacy Policy",
    terms:      "Terms of Service",
    allRights:  "All rights reserved.",
    certsH2:    "Our Certifications",
    certsSub:   "Certified technicians you can trust.",
    galleryH2:   "Our Work",
    gallerySub:  "Real repairs by our certified technicians.",
    galleryEmpty: "Photos coming soon â€” check back after your next repair!",
    galleryPlaceholder: "Photo coming soon",
    galleryViewAll: "View All Photos",
    processH2:  "How We Work",
    processSub: "Simple, transparent, and stress-free from first call to final check.",
    processSteps: [
      { title: "Book Online or Call",     desc: "Request service online or call (346) 696-8751. We confirm within 15 minutes." },
      { title: "Same-Day Dispatch",       desc: "A certified technician is dispatched to your home â€” often the same day you call." },
      { title: "Diagnosis & Estimate",    desc: "We diagnose the issue and provide an upfront, honest quote before any work begins." },
      { title: "Repair & Parts",          desc: "Most repairs are completed on the first visit using parts we carry in our fully-stocked trucks." },
      { title: "Quality Check & Warranty",desc: "We test everything before we leave. All repairs come with a 90-day parts and labor warranty." },
    ],
  },
  es: {
    nav:       ["Inicio", "Servicios", "Nosotros", "ReseÃ±as", "FAQ", "Contacto"],
    bookNow:   "Reservar",
    promoBar:  "Clientes frecuentes ahorran $50 en cualquier reparacion - mencione esta oferta al reservar!",
    ourSvcs:   "Nuestros Servicios",
    trust:     ["Servicio el Mismo DÃ­a", "Licenciados y Asegurados", "GarantÃ­a 90 DÃ­as"],
    heroH1:    ["ReparaciÃ³n de", "ElectrodomÃ©sticos"],
    heroSub:   "ReparaciÃ³n de PrecisiÃ³n. TÃ©cnicos de Confianza. Soluciones Garantizadas.",
    svcH2:     "ReparaciÃ³n RÃ¡pida y Confiable",
    statsLabels: ["Clientes Satisfechos", "Servicios Realizados", "Horas Trabajadas", "Equipo Profesional"],
    whyH2:     "La Diferencia de HTRGroup",
    whyDesc:   "Con mÃ¡s de 25 aÃ±os de experiencia en reparaciÃ³n de electrodomÃ©sticos, nuestro equipo tiene la experiencia y las piezas para hacer funcionar su hogar nuevamente â€” rÃ¡pido.",
    whyItems:  [
      { title: "TÃ©cnicos Certificados",     desc: "Todos nuestros especialistas estÃ¡n certificados, asegurados y capacitados en las Ãºltimas tecnologÃ­as." },
      { title: "Camiones Equipados",         desc: "Llevamos las piezas mÃ¡s comunes y completamos el 85% de reparaciones en la primera visita." },
      { title: "Precios Honestos y Claros",  desc: "Vea el presupuesto completo antes de empezar. Sin cargos ocultos. GarantÃ­a de 90 dÃ­as en piezas y mano de obra." },
    ],
    reviewsLoading: "Cargando reseñas…",
    reviewsH2:    "ReseÃ±as en Google",
    reviewsBased: "9 reseÃ±as en Google",
    writeReview:  "Dejar reseÃ±a en Google",
    refresh:      "Actualizar",
    reviewsUpdated: "ReseÃ±as actualizadas",
    showingLatest:  "Mostrando las Ãºltimas reseÃ±as.",
    tabLabels:    ["Todas", "5 Estrellas", "4 Estrellas", "Recientes"],
    helpful:      "Ãštil",
    faqH2:        "Preguntas Frecuentes",
    faqs: [
      { q: "Â¿CuÃ¡nto cuesta la visita de diagnÃ³stico?", a: "Cobramos una tarifa fija de diagnÃ³stico. Si procede con la reparaciÃ³n, ese monto se aplica al costo total." },
      { q: "Â¿Reparan todas las marcas?",                a: "SÃ­ â€” Whirlpool, LG, GE, Maytag, KitchenAid, Sub-Zero, Miele, Electrolux y mÃ¡s." },
      { q: "Â¿QuÃ© tan rÃ¡pido pueden venir?",             a: "Servicio el mismo dÃ­a si llama antes del mediodÃ­a. Hacemos todo lo posible por llegar lo antes posible â€” tenga en cuenta que el tiempo de viaje puede variar segÃºn su ubicaciÃ³n." },
      { q: "Â¿Garantizan su trabajo?",                   a: "SÃ­ â€” garantÃ­a de 90 dÃ­as en piezas y mano de obra. Regresamos y arreglamos sin costo si el mismo problema regresa." },
      { q: "Â¿Necesito preparar algo antes de la llegada del tÃ©cnico?", a: "Por seguridad del tÃ©cnico y de sus mascotas, por favor aÃ­sle en una habitaciÃ³n separada a todos los animales grandes, reptiles, animales exÃ³ticos y gatos antes de nuestra llegada." },
    ],
    ctaH2:   "Reparamos Lo Que Su Hogar Necesita.",
    ctaSub:  "ReparaciÃ³n Experta Para Todas Las Marcas.",
    contactH2: "ContÃ¡ctenos Hoy",
    address:  "Houston, TX y Ã¡reas cercanas (Sugar Land, Katy, Pearland, The Woodlands, Pasadena)",
    hours1:   "Lunâ€“Vie: 9:00 AM â€“ 5:00 PM",
    hours2:   "SÃ¡bâ€“Dom: Cerrado",
    learnMore: "MÃ¡s InformaciÃ³n",
    bookH2:   "Reserve una ReparaciÃ³n",
    bookSub:  "Le llamaremos en 15 minutos para confirmar su cita.",
    formFields: ["Su nombre", "NÃºmero de telÃ©fono", "CÃ³digo ZIP"],
    emailPh:    "Correo electrÃ³nico (requerido)",
    addressPh:  "DirecciÃ³n (calle)",
    cityPh:     "Ciudad (requerido)",
    zipPh:      "CÃ³digo postal (770, 773, 774, 775)",
    datePh:     "Fecha preferida (ej. 10 de Abr)",
    timePh:     "Hora preferida (ej. 10:00 AM)",
    selectPh:   "Seleccione el tipo de electrodomÃ©stico...",
    brandModelPh: "Seleccione marca y modelo...",
    descPh:     "Describa el problema en detalle (opcional)",
    appTypes:   ["Refrigerador / Congelador", "Lavadora", "Secadora", "Horno / Cocina", "Horno ElÃ©ctrico y Estufa", "Lavavajillas", "Microondas", "Campana extractora", "MÃ¡quina de Hielo", "Placa de CocciÃ³n", "Enfriador de Vino", "Congelador", "Triturador de Basura", "CajÃ³n Calentador", "Otro"],
    requestBtn: "Solicitar Cita",
    received:   "Â¡Solicitud Recibida!",
    callSoon:   "Le llamaremos en 15 minutos para confirmar.",
    smsHint:    "Si no contestamos, envÃ­enos un SMS con la descripciÃ³n del problema y nos pondremos en contacto a la brevedad.",
    serviceAreaTitle: "Nuestra Ãrea de Servicio",
    serviceAreaSub:   "Atendemos Houston y todas las ciudades vecinas. Haz clic en el mapa para obtener direcciones.",
    openInMaps:       "Abrir en Google Maps",
    privacy:    "PolÃ­tica de Privacidad",
    terms:      "TÃ©rminos de Servicio",
    allRights:  "Todos los derechos reservados.",
    certsH2:    "Nuestras Certificaciones",
    certsSub:   "TÃ©cnicos certificados y de confianza.",
    galleryH2:  "Nuestros Trabajos",
    gallerySub: "Reparaciones reales realizadas por nuestros tÃ©cnicos certificados.",
    galleryEmpty: "Â¡Fotos prÃ³ximamente â€” vuelva despuÃ©s de su prÃ³xima reparaciÃ³n!",
    galleryPlaceholder: "Foto prÃ³ximamente",
    galleryViewAll: "Ver Todas las Fotos",
    processH2:  "CÃ³mo Trabajamos",
    processSub: "Simple, transparente y sin estrÃ©s desde la primera llamada hasta la revisiÃ³n final.",
    processSteps: [
      { title: "Reserve en LÃ­nea o Llame",    desc: "Solicite el servicio en lÃ­nea o llame al (346) 696-8751. Confirmamos en 15 minutos." },
      { title: "Despacho el Mismo DÃ­a",        desc: "Un tÃ©cnico certificado se envÃ­a a su hogar â€” a menudo el mismo dÃ­a que llama." },
      { title: "DiagnÃ³stico y Presupuesto",    desc: "Diagnosticamos el problema y le damos un presupuesto claro antes de comenzar cualquier trabajo." },
      { title: "ReparaciÃ³n con Repuestos",     desc: "La mayorÃ­a de las reparaciones se completan en la primera visita con piezas que llevamos en nuestros camiones." },
      { title: "Control de Calidad y GarantÃ­a",desc: "Probamos todo antes de irnos. Todas las reparaciones incluyen garantÃ­a de 90 dÃ­as en piezas y mano de obra." },
    ],
  },
};

/* â”€â”€ Services (with appliance-type mapping) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SERVICES = [
  { titleEn: "Refrigerator Repair",  titleEs: "ReparaciÃ³n de Refrigerador",    img: svcFridgeImg,  descEn: "Not cooling, leaking, or making noise? We save your groceries fast.",            descEs: "Â¿No enfrÃ­a, tiene goteras o hace ruido? Salvamos sus alimentos rÃ¡pido.",                appEn: "Refrigerator / Freezer", appEs: "Refrigerador / Congelador" },
  { titleEn: "Washer Repair",        titleEs: "ReparaciÃ³n de Lavadora",         img: svcWasherImg,  descEn: "Washer not spinning, leaking, or draining? Same-day certified fix.",             descEs: "Â¿Lavadora no gira, gotea o no desagua? ReparaciÃ³n certificada el mismo dÃ­a.",           appEn: "Washing Machine",        appEs: "Lavadora" },
  { titleEn: "Dryer Repair",         titleEs: "ReparaciÃ³n de Secadora",         img: svcDryerImg,   descEn: "Dryer not heating or taking too long? We get your laundry moving again.",        descEs: "Â¿La secadora no calienta o tarda demasiado? Volvemos a secar tu ropa.",                  appEn: "Dryer",                  appEs: "Secadora" },
  { titleEn: "Dishwasher Repair",    titleEs: "ReparaciÃ³n de Lavavajillas",     img: svcDishImg,    descEn: "Dishwasher not cleaning, draining, or filling? Fast expert diagnosis.",           descEs: "Â¿El lavavajillas no limpia, drena o llena? DiagnÃ³stico experto rÃ¡pido.",                 appEn: "Dishwasher",             appEs: "Lavavajillas" },
  { titleEn: "Microwave Repair",     titleEs: "ReparaciÃ³n de Microondas",       img: svcMicroImg,   descEn: "Microwave sparking, not heating, or display issues? We fix it same day.",        descEs: "Â¿Microondas chisporrotea, no calienta o falla la pantalla? Lo arreglamos hoy.",          appEn: "Microwave",              appEs: "Microondas" },
  { titleEn: "Range Hood Repair",    titleEs: "ReparaciÃ³n de Campana",          img: svcHoodImg,    descEn: "Hood fan not working, noisy, or lights out? Restore your kitchen ventilation.",   descEs: "Â¿El ventilador no funciona, hace ruido o las luces estÃ¡n apagadas? Lo restauramos.",     appEn: "Range Hood",             appEs: "Campana extractora" },
  { titleEn: "Oven & Gas Range",     titleEs: "Horno y Cocina de Gas",          img: svcOvenImg,    descEn: "Burners won't ignite or oven won't heat evenly? Certified gas technicians.",      descEs: "Â¿Los quemadores no encienden o el horno no calienta? TÃ©cnicos certificados en gas.",     appEn: "Oven / Range",           appEs: "Horno / Cocina" },
  { titleEn: "Electric Oven & Stove", titleEs: "Horno ElÃ©ctrico y Estufa",      img: svcStoveImg,   descEn: "Electric burners not working or oven not reaching temperature? We have you covered.", descEs: "Â¿Los quemadores elÃ©ctricos no funcionan o el horno no alcanza temperatura? Te cubrimos.", appEn: "Electric Stove",         appEs: "Estufa elÃ©ctrica" },
  { titleEn: "Ice Maker Repair",     titleEs: "ReparaciÃ³n de MÃ¡quina de Hielo", img: svcIceMakerImg, descEn: "Ice maker not producing ice or leaking? We diagnose and fix it fast.",              descEs: "Â¿La mÃ¡quina de hielo no produce hielo o gotea? La diagnosticamos y reparamos rÃ¡pido.",  appEn: "Ice Maker",              appEs: "MÃ¡quina de Hielo" },
  { titleEn: "Cooktop Repair",       titleEs: "ReparaciÃ³n de Placa de CocciÃ³n", img: svcCooktopImg,  descEn: "Gas or electric cooktop burners not working? Expert diagnosis and repair.",          descEs: "Â¿Los quemadores de su placa no funcionan? DiagnÃ³stico y reparaciÃ³n experta.",           appEn: "Cooktop",                appEs: "Placa de CocciÃ³n" },
  { titleEn: "Wine Cooler Repair",   titleEs: "ReparaciÃ³n de Enfriador de Vino",img: svcWineCoolImg, descEn: "Wine cooler not cooling or making noise? We restore the perfect temperature.",       descEs: "Â¿El enfriador de vino no enfrÃ­a o hace ruido? Restauramos la temperatura perfecta.",    appEn: "Wine Cooler",            appEs: "Enfriador de Vino" },
  { titleEn: "Freezer Repair",       titleEs: "ReparaciÃ³n de Congelador",       img: svcFreezerImg,  descEn: "Freezer not freezing, frosting over, or making noise? Same-day expert service.",     descEs: "Â¿El congelador no congela o acumula escarcha? Servicio experto el mismo dÃ­a.",          appEn: "Freezer",                appEs: "Congelador" },
  { titleEn: "Garbage Disposal Repair",titleEs:"ReparaciÃ³n de Triturador",      img: svcDisposalImg, descEn: "Disposal jammed, leaking, or won't turn on? We have you covered fast.",             descEs: "Â¿El triturador estÃ¡ atascado, gotea o no enciende? Lo solucionamos rÃ¡pido.",           appEn: "Garbage Disposal",       appEs: "Triturador de Basura" },
  { titleEn: "Warming Drawer Repair",titleEs: "ReparaciÃ³n de CajÃ³n Calentador", img: svcWarmerImg,   descEn: "Warming drawer not heating or stuck? We service all major brands.",                  descEs: "Â¿El cajÃ³n calentador no calienta o estÃ¡ atascado? Reparamos todas las marcas.",         appEn: "Warming Drawer",         appEs: "CajÃ³n Calentador" },
];

function statsDayIncrement(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return 1 + (Math.abs(h) % 3);
}

function getDailyStats(): string[] {
  const LAUNCH_DATE = new Date(2026, 5, 11); // June 11, 2026 â€” baseline day
  const BASE = [4259, 4199, 9703, 10];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  LAUNCH_DATE.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.floor((today.getTime() - LAUNCH_DATE.getTime()) / 86400000));
  let extraHappy = 0;
  let extraServices = 0;
  for (let d = 0; d < days; d++) {
    const day = new Date(LAUNCH_DATE.getTime() + d * 86400000);
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    extraHappy += statsDayIncrement(key + ":happy");
    extraServices += statsDayIncrement(key + ":services");
  }
  return [
    BASE[0] + extraHappy,
    BASE[1] + extraServices,
    BASE[2],
    BASE[3],
  ].map((v) => v.toLocaleString("en-US"));
}
const STATS_VALUES = getDailyStats();

/* â”€â”€ Gallery photos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   To add photos: push objects to this array using the format below.
   src  â€“ import path or public URL of the image
   captionEn / captionEs â€“ short label shown under the photo
   Example:
     import myPhoto from "@assets/my-repair-photo.jpg";
     { src: myPhoto, captionEn: "Washer repair â€“ Katy TX", captionEs: "ReparaciÃ³n lavadora â€“ Katy TX" },
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const GALLERY_PHOTOS: { src: string; captionEn: string; captionEs: string }[] = [
  { src: ourWorkSectionImg,  captionEn: "Washer repair â€“ Houston, TX",       captionEs: "ReparaciÃ³n lavadora â€“ Houston, TX" },
  { src: g67,  captionEn: "Refrigerator repair â€“ Katy, TX",    captionEs: "ReparaciÃ³n refrigerador â€“ Katy, TX" },
  { src: g73,  captionEn: "Dryer repair â€“ Sugar Land, TX",     captionEs: "ReparaciÃ³n secadora â€“ Sugar Land, TX" },
  { src: g75,  captionEn: "Dishwasher repair â€“ Pearland, TX",  captionEs: "ReparaciÃ³n lavavajillas â€“ Pearland, TX" },
  { src: g76,  captionEn: "Oven repair â€“ The Woodlands, TX",   captionEs: "ReparaciÃ³n horno â€“ The Woodlands, TX" },
  { src: g77a, captionEn: "Range hood service â€“ Humble, TX",   captionEs: "Servicio campana â€“ Humble, TX" },
  { src: g77b, captionEn: "Microwave repair â€“ Pasadena, TX",   captionEs: "ReparaciÃ³n microondas â€“ Pasadena, TX" },
  { src: g79,  captionEn: "Gas range repair â€“ Cypress, TX",    captionEs: "ReparaciÃ³n cocina gas â€“ Cypress, TX" },
  { src: g80,  captionEn: "Electric stove â€“ Spring, TX",       captionEs: "Estufa elÃ©ctrica â€“ Spring, TX" },
  { src: g83,  captionEn: "Refrigerator â€“ League City, TX",    captionEs: "Refrigerador â€“ League City, TX" },
  { src: g84,  captionEn: "Washer motor â€“ Stafford, TX",       captionEs: "Motor lavadora â€“ Stafford, TX" },
  { src: g85,  captionEn: "Dryer heating â€“ Missouri City, TX", captionEs: "Calentador secadora â€“ Missouri City, TX" },
  { src: g88,  captionEn: "Control board repair â€“ Katy, TX",   captionEs: "Tarjeta de control â€“ Katy, TX" },
  { src: g90,  captionEn: "Oven element â€“ Sugar Land, TX",     captionEs: "Elemento horno â€“ Sugar Land, TX" },
  { src: g91,  captionEn: "Ice maker repair â€“ Houston, TX",    captionEs: "ReparaciÃ³n mÃ¡quina hielo â€“ Houston, TX" },
  { src: g92,  captionEn: "Appliance tune-up â€“ Baytown, TX",      captionEs: "Mantenimiento general â€“ Baytown, TX" },
  { src: n63,  captionEn: "Gas range burners â€“ Houston, TX",      captionEs: "Quemadores cocina gas â€“ Houston, TX" },
  { src: n65,  captionEn: "Oven heating element â€“ Katy, TX",      captionEs: "Elemento calefactor horno â€“ Katy, TX" },
  { src: n73,  captionEn: "Oven error code â€“ Sugar Land, TX",     captionEs: "CÃ³digo de error horno â€“ Sugar Land, TX" },
  { src: n78,  captionEn: "Dishwasher spring â€“ Pearland, TX",     captionEs: "Resorte lavavajillas â€“ Pearland, TX" },
  { src: n84,  captionEn: "LG dishwasher door â€“ The Woodlands, TX", captionEs: "Puerta lavavajillas LG â€“ The Woodlands, TX" },
  { src: n85a, captionEn: "GE washer front-load â€“ Humble, TX",    captionEs: "Lavadora GE carga frontal â€“ Humble, TX" },
  { src: n85b, captionEn: "LG dishwasher pull-out â€“ Pasadena, TX",captionEs: "Desmontaje lavavajillas LG â€“ Pasadena, TX" },
  { src: n86a, captionEn: "Gas range service â€“ Cypress, TX",      captionEs: "Servicio cocina gas â€“ Cypress, TX" },
  { src: n86b, captionEn: "Under-counter dishwasher â€“ Spring, TX",captionEs: "Lavavajillas bajo encimera â€“ Spring, TX" },
  { src: n87,  captionEn: "GE gas range â€“ League City, TX",       captionEs: "Cocina gas GE â€“ League City, TX" },
  { src: b1a,  captionEn: "Refrigerator coils â€“ Stafford, TX",       captionEs: "Bobinas refrigerador â€“ Stafford, TX" },
  { src: b1b,  captionEn: "Dryer drum repair â€“ Missouri City, TX",    captionEs: "Tambor secadora â€“ Missouri City, TX" },
  { src: b1c,  captionEn: "Washer pump â€“ Pearland, TX",               captionEs: "Bomba lavadora â€“ Pearland, TX" },
  { src: b1d,  captionEn: "Washer door seal â€“ Baytown, TX",           captionEs: "Sello puerta lavadora â€“ Baytown, TX" },
  { src: b2a,  captionEn: "Oven thermostat â€“ Sugar Land, TX",         captionEs: "Termostato horno â€“ Sugar Land, TX" },
  { src: b2b,  captionEn: "Dishwasher pump â€“ Katy, TX",               captionEs: "Bomba lavavajillas â€“ Katy, TX" },
  { src: b2c,  captionEn: "Refrigerator door â€“ Spring, TX",           captionEs: "Puerta refrigerador â€“ Spring, TX" },
  { src: b3a,  captionEn: "Gas range igniter â€“ Humble, TX",           captionEs: "Encendedor cocina gas â€“ Humble, TX" },
  { src: b3b,  captionEn: "Dryer belt replacement â€“ Cypress, TX",     captionEs: "Cambio correa secadora â€“ Cypress, TX" },
  { src: b3c,  captionEn: "Washer bearing â€“ The Woodlands, TX",       captionEs: "Rodamiento lavadora â€“ The Woodlands, TX" },
  { src: b3d,  captionEn: "Oven control board â€“ League City, TX",     captionEs: "Tarjeta horno â€“ League City, TX" },
  { src: b3e,  captionEn: "Microwave magnetron â€“ Houston, TX",        captionEs: "MagnetrÃ³n microondas â€“ Houston, TX" },
  { src: b4a,  captionEn: "Refrigerator fan motor â€“ Pasadena, TX",   captionEs: "Motor ventilador refrigerador â€“ Pasadena, TX" },
  { src: b4b,  captionEn: "Range element â€“ Pearland, TX",             captionEs: "Elemento estufa â€“ Pearland, TX" },
  { src: b4c,  captionEn: "Dishwasher spray arm â€“ Katy, TX",         captionEs: "Brazo aspersor lavavajillas â€“ Katy, TX" },
  { src: b4d,  captionEn: "Washer agitator â€“ Sugar Land, TX",        captionEs: "Agitador lavadora â€“ Sugar Land, TX" },
  { src: b4e,  captionEn: "Dryer thermal fuse â€“ Spring, TX",         captionEs: "Fusible tÃ©rmico secadora â€“ Spring, TX" },
  { src: b4f,  captionEn: "Oven bake element â€“ Cypress, TX",         captionEs: "Elemento hornear â€“ Cypress, TX" },
  { src: b5a,  captionEn: "Ice maker module â€“ Houston, TX",          captionEs: "MÃ³dulo mÃ¡quina hielo â€“ Houston, TX" },
  { src: b5b,  captionEn: "Refrigerator compressor â€“ Humble, TX",    captionEs: "Compresor refrigerador â€“ Humble, TX" },
  { src: c8a,  captionEn: "Capacitor replacement â€“ Houston, TX",     captionEs: "Cambio de capacitor â€“ Houston, TX" },
  { src: c9a,  captionEn: "Control board PCB â€“ Katy, TX",            captionEs: "Tarjeta PCB control â€“ Katy, TX" },
  { src: c10a, captionEn: "Burnt component repair â€“ Sugar Land, TX", captionEs: "ReparaciÃ³n componente quemado â€“ Sugar Land, TX" },
  { src: c10b, captionEn: "LG top-load washer â€“ Pearland, TX",       captionEs: "Lavadora LG carga superior â€“ Pearland, TX" },
  { src: c10c, captionEn: "Whirlpool control board â€“ Cypress, TX",   captionEs: "Tarjeta Whirlpool â€“ Cypress, TX" },
  { src: c10d, captionEn: "Capacitor repair â€“ Spring, TX",           captionEs: "ReparaciÃ³n capacitor â€“ Spring, TX" },
  { src: d10e, captionEn: "Control board diagnostics â€“ Houston, TX",   captionEs: "DiagnÃ³stico tarjeta control â€“ Houston, TX" },
  { src: d11a, captionEn: "LG washer LE2 error â€“ Katy, TX",            captionEs: "Error LE2 lavadora LG â€“ Katy, TX" },
  { src: d11b, captionEn: "Capacitor swap â€“ Sugar Land, TX",           captionEs: "Cambio capacitor â€“ Sugar Land, TX" },
  { src: d11c, captionEn: "IC chip replacement â€“ Pearland, TX",        captionEs: "Cambio chip IC â€“ Pearland, TX" },
  { src: d12a, captionEn: "Oven PCB repair â€“ The Woodlands, TX",       captionEs: "ReparaciÃ³n PCB horno â€“ The Woodlands, TX" },
  { src: d12b, captionEn: "Burnt resistor repair â€“ Humble, TX",        captionEs: "ReparaciÃ³n resistor quemado â€“ Humble, TX" },
  { src: d13a, captionEn: "Whirlpool control board â€“ Pasadena, TX",    captionEs: "Tarjeta Whirlpool â€“ Pasadena, TX" },
  { src: d14a, captionEn: "LG washer error code â€“ Cypress, TX",        captionEs: "CÃ³digo error lavadora LG â€“ Cypress, TX" },
  { src: d14b, captionEn: "Gas burner disassembly â€“ Spring, TX",       captionEs: "Desmontaje quemador gas â€“ Spring, TX" },
  { src: d15a, captionEn: "Transformer coil repair â€“ League City, TX", captionEs: "ReparaciÃ³n bobina transformador â€“ League City, TX" },
  { src: d17a, captionEn: "Gas range burner cap â€“ Houston, TX",        captionEs: "Tapa quemador cocina gas â€“ Houston, TX" },
  { src: d17b, captionEn: "SMD board soldering â€“ Stafford, TX",        captionEs: "Soldadura placa SMD â€“ Stafford, TX" },
  { src: d18a, captionEn: "LG washer & dryer set â€“ Missouri City, TX", captionEs: "Set lavadora y secadora LG â€“ Missouri City, TX" },
  { src: d19a, captionEn: "Relay board repair â€“ Baytown, TX",          captionEs: "ReparaciÃ³n tarjeta relay â€“ Baytown, TX" },
  { src: d20a, captionEn: "Side-by-side refrigerator â€“ Katy, TX",      captionEs: "Refrigerador side-by-side â€“ Katy, TX" },
  { src: d21a, captionEn: "Dryer motor capacitor â€“ Sugar Land, TX",    captionEs: "Capacitor motor secadora â€“ Sugar Land, TX" },
  { src: d21b, captionEn: "Double line break board â€“ Pearland, TX",    captionEs: "Tarjeta doble lÃ­nea â€“ Pearland, TX" },
  { src: d23a, captionEn: "Electrolux control module â€“ Cypress, TX",   captionEs: "MÃ³dulo control Electrolux â€“ Cypress, TX" },
  { src: d24a, captionEn: "LG washer error display â€“ Spring, TX",      captionEs: "Display error lavadora LG â€“ Spring, TX" },
  { src: d26a, captionEn: "Wiring harness repair â€“ The Woodlands, TX", captionEs: "ReparaciÃ³n arnÃ©s elÃ©ctrico â€“ The Woodlands, TX" },
  { src: e32a, captionEn: "Multimeter diagnostics â€“ Houston, TX",      captionEs: "DiagnÃ³stico multÃ­metro â€“ Houston, TX" },
  { src: e32b, captionEn: "Whirlpool french door fridge â€“ Katy, TX",   captionEs: "Refrigerador Whirlpool â€“ Katy, TX" },
  { src: e32c, captionEn: "Water inlet valve â€“ Sugar Land, TX",        captionEs: "VÃ¡lvula de entrada agua â€“ Sugar Land, TX" },
  { src: e32d, captionEn: "Thermostat KSD1 â€“ Pearland, TX",            captionEs: "Termostato KSD1 â€“ Pearland, TX" },
  { src: e34a, captionEn: "Water valve inspection â€“ The Woodlands, TX",captionEs: "InspecciÃ³n vÃ¡lvula agua â€“ The Woodlands, TX" },
  { src: e35a, captionEn: "Dryer wiring connector â€“ Humble, TX",       captionEs: "Conector cableado secadora â€“ Humble, TX" },
  { src: e35b, captionEn: "Elan sensor board â€“ Pasadena, TX",          captionEs: "Tarjeta sensor Elan â€“ Pasadena, TX" },
  { src: e36a, captionEn: "Refrigerator liner leak â€“ Cypress, TX",     captionEs: "Fuga liner refrigerador â€“ Cypress, TX" },
  { src: e36b, captionEn: "Control sub-board â€“ Spring, TX",            captionEs: "Subtarjeta control â€“ Spring, TX" },
  { src: e36c, captionEn: "Built-in refrigerator â€“ League City, TX",   captionEs: "Refrigerador empotrado â€“ League City, TX" },
  { src: e37a, captionEn: "Burnt solder joints â€“ Houston, TX",         captionEs: "Soldadura quemada â€“ Houston, TX" },
  { src: e38a, captionEn: "Burnt terminal block â€“ Stafford, TX",       captionEs: "Bloque terminal quemado â€“ Stafford, TX" },
  { src: e38b, captionEn: "Dryer motor switch â€“ Missouri City, TX",    captionEs: "Interruptor motor secadora â€“ Missouri City, TX" },
  { src: e38c, captionEn: "Appliance control harness â€“ Baytown, TX",   captionEs: "ArnÃ©s control equipo â€“ Baytown, TX" },
  { src: e38d, captionEn: "Control board solder side â€“ Katy, TX",      captionEs: "Lado soldadura tarjeta â€“ Katy, TX" },
  { src: e39a, captionEn: "AC unit control board â€“ Sugar Land, TX",    captionEs: "Tarjeta control AC â€“ Sugar Land, TX" },
  { src: e40a, captionEn: "Elan sensor module â€“ Pearland, TX",         captionEs: "MÃ³dulo sensor Elan â€“ Pearland, TX" },
  { src: e40b, captionEn: "Whirlpool control module â€“ Cypress, TX",    captionEs: "MÃ³dulo control Whirlpool â€“ Cypress, TX" },
  { src: f43a, captionEn: "Dryer diagnostics in garage â€“ Katy, TX",    captionEs: "DiagnÃ³stico secadora en garaje â€“ Katy, TX" },
  { src: f43b, captionEn: "Refrigerator condenser coils â€“ Houston, TX", captionEs: "Serpentines condensador â€“ Houston, TX" },
  { src: f43c, captionEn: "Appliance wiring relay module â€“ Pearland, TX", captionEs: "MÃ³dulo relÃ© cableado â€“ Pearland, TX" },
  { src: f43d, captionEn: "Power board C0411 â€“ Sugar Land, TX",         captionEs: "Placa de potencia C0411 â€“ Sugar Land, TX" },
  { src: f43e, captionEn: "Whirlpool W11578563 wiring â€“ Spring, TX",   captionEs: "Cableado Whirlpool W11578563 â€“ Spring, TX" },
  { src: f44a, captionEn: "Range back panel inspection â€“ Humble, TX",  captionEs: "InspecciÃ³n panel trasero estufa â€“ Humble, TX" },
  { src: f44b, captionEn: "PCB burnt trace repair â€“ The Woodlands, TX",captionEs: "ReparaciÃ³n traza quemada PCB â€“ The Woodlands, TX" },
  { src: f45a, captionEn: "Kenmore dryer repair â€“ Katy, TX",           captionEs: "ReparaciÃ³n secadora Kenmore â€“ Katy, TX" },
  { src: f45b, captionEn: "Compressor wiring R134a â€“ Pasadena, TX",    captionEs: "Cableado compresor R134a â€“ Pasadena, TX" },
  { src: f45c, captionEn: "Toroidal inductor soldering â€“ Cypress, TX", captionEs: "Soldadura inductor toroidal â€“ Cypress, TX" },
  { src: f45d, captionEn: "Control module W11578563 â€“ Missouri City, TX", captionEs: "MÃ³dulo control W11578563 â€“ Missouri City, TX" },
  { src: f46a, captionEn: "Inductor & capacitor repair â€“ League City, TX", captionEs: "ReparaciÃ³n inductor y capacitor â€“ League City, TX" },
  { src: f46b, captionEn: "Whirlpool module wiring â€“ Baytown, TX",     captionEs: "Cableado mÃ³dulo Whirlpool â€“ Baytown, TX" },
  { src: f47a, captionEn: "Dryer back valve connections â€“ Stafford, TX", captionEs: "Conexiones vÃ¡lvula secadora â€“ Stafford, TX" },
  { src: g59a, captionEn: "Refrigerator LED lighting â€“ Houston, TX",    captionEs: "IluminaciÃ³n LED refrigerador â€“ Houston, TX" },
  { src: g60a, captionEn: "LG washer control board â€“ Katy, TX",         captionEs: "Tarjeta control lavadora LG â€“ Katy, TX" },
  { src: g60b, captionEn: "Viking professional gas range â€“ Sugar Land, TX", captionEs: "Cocina Viking profesional â€“ Sugar Land, TX" },
  { src: g61a, captionEn: "Top-load washer water valves â€“ Pearland, TX",captionEs: "VÃ¡lvulas lavadora tina â€“ Pearland, TX" },
  { src: g62a, captionEn: "LG washer board â€“ second angle â€“ Cypress, TX",captionEs: "Tarjeta LG â€“ segundo Ã¡ngulo â€“ Cypress, TX" },
  { src: g62b, captionEn: "Refrigerator door LED strip â€“ Spring, TX",   captionEs: "Franja LED puerta refrigerador â€“ Spring, TX" },
  { src: g62c, captionEn: "Washer tub & motor assembly â€“ Humble, TX",   captionEs: "Tina y motor lavadora â€“ Humble, TX" },
  { src: g63a, captionEn: "Whirlpool FSP board 4452890 â€“ The Woodlands, TX", captionEs: "Tarjeta Whirlpool FSP 4452890 â€“ The Woodlands, TX" },
  { src: g63b, captionEn: "Washer motor pump assembly â€“ League City, TX",captionEs: "Bomba motor lavadora â€“ League City, TX" },
  { src: g64a, captionEn: "Direct drive motor hub â€“ Pasadena, TX",      captionEs: "Cubo motor directo â€“ Pasadena, TX" },
  { src: g64b, captionEn: "Whirlpool WP540-0102 board â€“ Baytown, TX",   captionEs: "Tarjeta Whirlpool WP540 â€“ Baytown, TX" },
  { src: g64c, captionEn: "GE Appliances WiFi module â€“ Missouri City, TX", captionEs: "MÃ³dulo WiFi GE Appliances â€“ Missouri City, TX" },
  { src: g65a, captionEn: "LG EBR8019 board (dusty) â€“ Stafford, TX",   captionEs: "Tarjeta LG EBR8019 polvosa â€“ Stafford, TX" },
  { src: g65b, captionEn: "Appliance shock hazard warning â€“ Houston, TX",captionEs: "Advertencia peligro elÃ©ctrico â€“ Houston, TX" },
  { src: g66a, captionEn: "LG Electronics main board â€“ Katy, TX",       captionEs: "Tarjeta principal LG Electronics â€“ Katy, TX" },
  { src: g66b, captionEn: "Direct drive motor stator â€“ Sugar Land, TX", captionEs: "EstÃ¡tor motor directo â€“ Sugar Land, TX" },
  { src: g69a, captionEn: "Oven control board connector â€“ Pearland, TX",captionEs: "Conector tarjeta horno â€“ Pearland, TX" },
  { src: g70a, captionEn: "AMC transformer component â€“ Cypress, TX",    captionEs: "Transformador AMC â€“ Cypress, TX" },
  { src: g70b, captionEn: "Oven board solder edge â€“ Spring, TX",        captionEs: "Borde soldadura tarjeta horno â€“ Spring, TX" },
  { src: g72a, captionEn: "Power transformer repair â€“ Humble, TX",      captionEs: "ReparaciÃ³n transformador â€“ Humble, TX" },
  { src: h58a, captionEn: "Burnt burner coil socket replaced â€“ League City, TX",  captionEs: "Toma bobina quemada reemplazada â€“ League City, TX" },
  { src: h65a, captionEn: "Kenmore wall oven at 350Â°F â€“ Katy, TX",                captionEs: "Horno empotrado Kenmore a 350Â°F â€“ Katy, TX" },
  { src: h71a, captionEn: "Samwha 450V 47ÂµF capacitor close-up â€“ Sugar Land, TX", captionEs: "Capacitor Samwha 450V 47ÂµF â€“ Sugar Land, TX" },
  { src: h71b, captionEn: "PCB solder-side edge inspection â€“ Pearland, TX",       captionEs: "InspecciÃ³n cara suelda PCB â€“ Pearland, TX" },
  { src: h73a, captionEn: "New LG control board installed â€“ Missouri City, TX",   captionEs: "Tarjeta LG nueva instalada â€“ Missouri City, TX" },
  { src: h73b, captionEn: "Samsung dryer HE error code â€“ Stafford, TX",           captionEs: "CÃ³digo error HE secadora Samsung â€“ Stafford, TX" },
  { src: h74a, captionEn: "Samsung dryer 9L error diagnosis â€“ Friendswood, TX",   captionEs: "DiagnÃ³stico error 9L secadora Samsung â€“ Friendswood, TX" },
  { src: h74b, captionEn: "Control board repair with capacitor kit â€“ Baytown, TX", captionEs: "ReparaciÃ³n tarjeta con kit condensadores â€“ Baytown, TX" },
  { src: h75a, captionEn: "Ground wire reconnected on control board â€“ Cypress, TX", captionEs: "Cable tierra reconectado en tarjeta â€“ Cypress, TX" },
  { src: h76a, captionEn: "Samsung dishwasher service call â€“ Spring, TX",          captionEs: "Servicio lavavajillas Samsung â€“ Spring, TX" },
  { src: h79a, captionEn: "Electrolytic capacitor replacement â€“ Tomball, TX",     captionEs: "Reemplazo condensador electrolÃ­tico â€“ Tomball, TX" },
  { src: h80a, captionEn: "Dishwasher door spring & hinge repair â€“ The Woodlands, TX", captionEs: "ReparaciÃ³n resorte y bisagra puerta â€“ The Woodlands, TX" },
  { src: h80b, captionEn: "Main control board replacement â€“ Conroe, TX",          captionEs: "Reemplazo tarjeta principal â€“ Conroe, TX" },
  { src: h81a, captionEn: "Samsung front-load dryer open for inspection â€“ Galveston, TX", captionEs: "Secadora carga frontal Samsung abierta â€“ Galveston, TX" },
  { src: h81b, captionEn: "Burnt fuse & capacitor identified â€“ Humble, TX",       captionEs: "Fusible y capacitor quemados identificados â€“ Humble, TX" },
  { src: h85a, captionEn: "Dryer high-limit thermostat 352Â°F â€“ Deer Park, TX",    captionEs: "Termostato lÃ­mite secadora 352Â°F â€“ Deer Park, TX" },
  { src: h88a, captionEn: "Refrigerator evaporator fan motor â€“ Pasadena, TX",     captionEs: "Motor ventilador evaporador refrigerador â€“ Pasadena, TX" },
  { src: h90a, captionEn: "High-voltage relay board service â€“ La Porte, TX",      captionEs: "Servicio tablero relÃ© alto voltaje â€“ La Porte, TX" },
  { src: h91a, captionEn: "Dryer thermal cutoff replaced â€“ Channelview, TX",      captionEs: "Fusible tÃ©rmico secadora reemplazado â€“ Channelview, TX" },
  { src: i55a, captionEn: "Spitfire control board capacitor replaced â€“ Katy, TX",  captionEs: "Capacitor tarjeta Spitfire reemplazado â€“ Katy, TX" },
  { src: i55b, captionEn: "Burnt terminal contacts close-up â€“ Pearland, TX",       captionEs: "Terminales quemados en detalle â€“ Pearland, TX" },
  { src: i55c, captionEn: "Whirlpool board W10739408 identified â€“ Sugar Land, TX", captionEs: "Tarjeta Whirlpool W10739408 identificada â€“ Sugar Land, TX" },
  { src: i57a, captionEn: "Faulty igniter wire on gas range â€“ Friendswood, TX",    captionEs: "Cable encendedor defectuoso en cocina â€“ Friendswood, TX" },
  { src: i57b, captionEn: "Whirlpool washer control panel service â€“ Missouri City, TX", captionEs: "Servicio panel control lavadora Whirlpool â€“ Missouri City, TX" },
  { src: i62a, captionEn: "6-burner gas range all burners verified â€“ Stafford, TX", captionEs: "Cocina 6 quemadores verificados â€“ Stafford, TX" },
  { src: i83a,  captionEn: "Wiring harness inspection inside appliance â€“ Baytown, TX",         captionEs: "InspecciÃ³n arnÃ©s cableado interior â€“ Baytown, TX" },
  { src: new1a, captionEn: "Samsung FDR main control board diagnosis â€“ Houston, TX",          captionEs: "DiagnÃ³stico tarjeta principal Samsung FDR â€“ Houston, TX" },
  { src: new2a, captionEn: "Samsung refrigerator inverter board inspection â€“ Katy, TX",       captionEs: "InspecciÃ³n tarjeta inversora refrigerador Samsung â€“ Katy, TX" },
  { src: new3a, captionEn: "High-voltage capacitor replacement on inverter board â€“ Sugar Land, TX", captionEs: "Reemplazo capacitor alto voltaje en tarjeta inversora â€“ Sugar Land, TX" },
  { src: new4a, captionEn: "Samsung SmartThings WiFi module replaced â€“ Pearland, TX",         captionEs: "MÃ³dulo WiFi SmartThings Samsung reemplazado â€“ Pearland, TX" },
  { src: new5a, captionEn: "Samsung SmartThings display panel diagnosis â€“ The Woodlands, TX", captionEs: "DiagnÃ³stico panel SmartThings Samsung â€“ The Woodlands, TX" },
  { src: new6a, captionEn: "Samsung FDR board component detail â€“ Missouri City, TX",          captionEs: "Detalle componentes tarjeta Samsung FDR â€“ Missouri City, TX" },
  { src: new7a, captionEn: "Washer inverter board with heat sink â€“ Stafford, TX",             captionEs: "Tarjeta inversora lavadora con disipador â€“ Stafford, TX" },
  { src: new8a, captionEn: "Samsung refrigerator main board replacement â€“ Cypress, TX",       captionEs: "Reemplazo tarjeta principal refrigerador Samsung â€“ Cypress, TX" },
];

const GALLERY_PLACEHOLDER_COUNT = 8;

const SOCIALS = [
  { icon: <FaFacebook   className="h-4 w-4" />, href: "https://www.facebook.com/profile.php?id=61589369241020",  label: "Facebook",  bg: "#1877F2" },
  { icon: <FaInstagram  className="h-4 w-4" />, href: "https://www.instagram.com/htrgroupllc/", label: "Instagram", bg: "linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)" },
  { icon: <FaTiktok     className="h-4 w-4" />, href: "https://www.tiktok.com/@htrgroupllc", label: "TikTok", bg: "#010101" },
  { icon: <FaLinkedinIn className="h-4 w-4" />, href: "https://www.linkedin.com/in/eivaz-rakhmanov-010013401", label: "LinkedIn", bg: "#0A66C2" },
  { icon: <FaYoutube    className="h-4 w-4" />, href: "https://www.youtube.com/",   label: "YouTube",   bg: "#FF0000" },
];

/* â”€â”€ Certifications (pre-processed images with name redacted) â”€â”€â”€â”€â”€â”€ */
const CERTS: { img: string; label: string }[] = [
  { img: "/certs/cert1.jpg", label: "R-410A Technician Certification" },
  { img: "/certs/cert2.jpg", label: "HC(A3) & HFO(A2L) Certification" },
  { img: "/certs/cert3.jpg", label: "EPA 608 Certification" },
  { img: "/certs/cert4.jpg", label: "Preventive Maintenance Technician Certification" },
  { img: "/certs/cert5.jpg", label: "EPA Section 608 Type I Certification" },
];

const MARQUEE_BRANDS: [string, string][] = [
  ["Whirlpool",       "whirlpool"],
  ["GE Appliances",   "ge-appliances"],
  ["Frigidaire",      "frigidaire"],
  ["Maytag",          "maytag"],
  ["KitchenAid",      "kitchenaid"],
  ["Amana",           "amana"],
  ["LG",              "lg"],
  ["Samsung",         "samsung"],
  ["Bosch",           "bosch"],
  ["Hotpoint",        "hotpoint"],
  ["Miele",           "miele"],
  ["Electrolux",      "electrolux"],
  ["Sub-Zero",        "sub-zero"],
  ["Wolf",            "wolf"],
  ["Cove",            "cove"],
  ["Thermador",       "thermador"],
  ["Dacor",           "dacor"],
  ["JennAir",         "jennair"],
  ["Gaggenau",        "gaggenau"],
  ["La Cornue",       "lacornue"],
  ["Bertazzoni",      "bertazzoni"],
  ["BlueStar",        "bluestar"],
  ["Fisher & Paykel", "fisherpaykel"],
  ["SMEG",            "smeg"],
  ["U-Line",          "u-line"],
  ["Scotsman",        "scotsman"],
  ["Perlick",         "perlick"],
  ["True",            "true"],
  ["Speed Queen",     "speedqueen"],
  ["Hobart",          "hobart"],
  ["Vulcan",          "vulcan"],
  ["Garland",         "garland"],
  ["TurboChef",       "turbochef"],
  ["Hoshizaki",       "hoshizaki"],
  ["Manitowoc",       "manitowoc"],
  ["Insignia",        "insignia"],
  ["Kenmore",         "kenmore"],
  ["Magic Chef",      "magicchef"],
  ["Danby",           "danby"],
  ["Summit",          "summit"],
  ["RCA",             "rca"],
  ["Asko",            "asko"],
  ["AEG",             "aeg"],
  ["Viking",          "viking"],
  ["True Residential","true-residential"],
  ["Avanti",          "avanti"],
  ["Crosley",         "crosley"],
  ["Haier",           "haier"],
  ["Hisense",         "hisense"],
  ["Panasonic",       "panasonic"],
  ["Sharp",           "sharp"],
  ["Toshiba",         "toshiba"],
  ["Broan",           "broan"],
  ["Zephyr",          "zephyr"],
  ["Faber",           "faber"],
  ["Elica",           "elica"],
  ["Vent-A-Hood",     "ventahood"],
  ["Marvel",          "marvel"],
  ["Capital",         "capital"],
  ["FiveStar",        "fivestar"],
  ["American Range",  "american-range"],
  ["Hestan",          "hestan"],
  ["AGA",             "aga"],
  ["Verona",          "verona"],
  ["Unique",          "unique"],
  ["Equator",         "equator"],
  ["Summit Pro",      "summit-professional"],
  ["Forno",           "forno"],
  ["Thor Kitchen",    "thor-kitchen"],
  ["ZLINE",           "zline"],
  ["Cosmo",           "cosmo"],
  ["Empava",          "empava"],
];

type Tab  = "all" | "5" | "4" | "recent";
type Lang = "en" | "es";

/* â”€â”€ Draggable infinite marquee â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function DraggableMarquee({ brands, base, reverse = false }: { brands: [string, string][]; base: string; reverse?: boolean }) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const speedRef  = useRef(0);
  const lastTsRef = useRef(0);
  const rafRef    = useRef<number>();
  const drag      = useRef({ active: false, startX: 0, startOffset: 0 });
  const [grabbing, setGrabbing] = useState(false);

  const reverseInitRef = useRef(false);

  const wrapOffset = (offset: number, half: number) => {
    if (half <= 0) return offset;
    while (offset > 0) offset -= half;
    while (offset <= -half) offset += half;
    return offset;
  };

  useEffect(() => {
    reverseInitRef.current = false;
    const DURATION_MS = 160_000;
    const tick = (ts: number) => {
      const track = trackRef.current;
      if (track) {
        const half = track.scrollWidth / 2;
        if (half > 0) {
          speedRef.current = half / DURATION_MS;
          if (reverse && !reverseInitRef.current) {
            offsetRef.current = -half;
            reverseInitRef.current = true;
          }
        }
        if (!drag.current.active) {
          const dt = lastTsRef.current ? ts - lastTsRef.current : 0;
          offsetRef.current += (reverse ? 1 : -1) * speedRef.current * dt;
          offsetRef.current = wrapOffset(offsetRef.current, half);
          track.style.transform = `translateX(${offsetRef.current}px)`;
        }
      }
      lastTsRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [reverse]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { active: true, startX: e.clientX, startOffset: offsetRef.current };
    setGrabbing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    let next = drag.current.startOffset + (e.clientX - drag.current.startX);
    const track = trackRef.current;
    if (track) {
      const half = track.scrollWidth / 2;
      if (half > 0) next = wrapOffset(next, half);
    }
    offsetRef.current = next;
    if (track) track.style.transform = `translateX(${next}px)`;
  };
  const onPointerUp = () => { drag.current.active = false; setGrabbing(false); lastTsRef.current = 0; };

  const all = [...brands, ...brands];
  return (
    <div className="relative w-full overflow-hidden min-h-[96px] htr-brand-marquee" style={{ touchAction: "pan-y" }}>
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #f9fafb, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #f9fafb, transparent)" }} />
      <div
        ref={trackRef}
        className="flex items-center gap-4 w-max select-none"
        style={{ cursor: grabbing ? "grabbing" : "grab", willChange: "transform" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {all.map(([name, file], i) => (
          <div key={i} className="flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm p-3"
            style={{ width: 180, height: 90 }}>
            <img src={`${base}/logos/${file}.png`} alt={name}
              className="w-full h-full object-contain" draggable={false} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CenterMarquee({ brands, base }: { brands: [string, string][]; base: string }) {
  const cardClass =
    "htr-brand-marquee-center__card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm p-2";
  const strip = brands.map(([name, file], i) => (
    <div key={i} className={cardClass}>
      <img src={`${base}/logos/${file}.png`} alt={name} className="w-full h-full object-contain" draggable={false} loading="lazy" />
    </div>
  ));

  return (
    <section className="htr-brand-marquee-center relative w-full py-6 bg-stone-50 border-y border-stone-200 overflow-hidden" aria-label="Brands we service">
      <div className="htr-brand-marquee-center__bleed w-screen relative left-1/2 -translate-x-1/2">
        <div className="htr-brand-marquee-center__viewport relative w-full min-h-[88px] h-[88px] overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, #f9fafb, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, #f9fafb, transparent)" }} />
          <div className="htr-brand-marquee-center__track flex items-center w-max h-full">
            <div className="htr-brand-marquee-center__strip flex items-center gap-3 flex-shrink-0">{strip}</div>
            <div className="htr-brand-marquee-center__strip flex items-center gap-3 flex-shrink-0" aria-hidden="true">{strip}</div>
          </div>
        </div>
      </div>
    </section>
  );
}


export default function Home() {
  const { toast }  = useToast();
  const contactRef    = useRef<HTMLElement>(null);
  const bookingFormRef = useRef<HTMLDivElement>(null);

  const [lang, setLang]           = useState<Lang>("en");
  const [menuOpen, setMenuOpen]   = useState(false);
  const [reviewTab, setReviewTab] = useState<Tab>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [appliance, setAppliance] = useState("");
  const [brandModel, setBrandModel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const _now = new Date();
  const [, slotClock] = useState(0);
  useEffect(() => {
    const id = setInterval(() => slotClock(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  const _minBooking = getMinBookingDate();
  const userPickedDate = useRef(false);
  const checkedAdvance = useRef(new Set<string>());
  const autoAdvanceActive = useRef(true);
  const markUserPickedDate = () => {
    userPickedDate.current = true;
    autoAdvanceActive.current = false;
  };
  const [bMonth, setBMonth] = useState(_minBooking.getMonth() + 1);
  const [bDay,   setBDay]   = useState(_minBooking.getDate());
  const [bYear,  setBYear]  = useState(_minBooking.getFullYear());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots,  setBookedSlots]  = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [certModal, setCertModal] = useState<{ img: string; label: string } | null>(null);

  const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const TIME_SLOTS = BOOKING_TIME_SLOTS;

  const selectedDateStr = `${MONTHS_SHORT[bMonth-1]} ${bDay}, ${bYear}`;

  const fetchSlots = useCallback((date: string, resetSelection = false) => {
    if (resetSelection) setSelectedSlot(null);
    setLoadingSlots(true);
    const apiBase = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");
    fetch(`${apiBase}/api/availability?date=${encodeURIComponent(date)}`)
      .then(r => r.json())
      .then(d => {
        const booked: string[]  = d.bookedSlots ?? [];
        const blocked: string[] = (d.blockedSlots ?? []).map((b: { time: string }) => b.time);
        const buffer: string[]  = d.bufferSlots ?? [];
        const past: string[]    = (d.pastSlots as string[] | undefined) ?? getPastTimeSlots(date);
        setBookedSlots([...new Set([...booked, ...blocked, ...buffer, ...past])]);
      })
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false));
  }, []);

  // Skip weekends: if user picks Sat or Sun, jump to next Monday
  useEffect(() => {
    const d   = new Date(bYear, bMonth - 1, bDay);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) {
      const skip = dow === 6 ? 2 : 1; // Satâ†’+2, Sunâ†’+1
      const next = new Date(d);
      next.setDate(d.getDate() + skip);
      setBMonth(next.getMonth() + 1);
      setBDay(next.getDate());
      setBYear(next.getFullYear());
    }
  }, [bMonth, bDay, bYear]);

  // Reload when date changes (reset selection)
  useEffect(() => {
    fetchSlots(selectedDateStr, true);
  }, [bMonth, bDay, bYear]);

  // Auto-advance to next business day while every slot is taken (max 30 days)
  useEffect(() => {
    if (!autoAdvanceActive.current || userPickedDate.current) return;
    if (loadingSlots) return;
    if (!isDayFullyBooked(bookedSlots, TIME_SLOTS)) {
      autoAdvanceActive.current = false;
      return;
    }
    if (checkedAdvance.current.has(selectedDateStr)) return;
    checkedAdvance.current.add(selectedDateStr);
    if (checkedAdvance.current.size > 30) {
      autoAdvanceActive.current = false;
      return;
    }
    const cur = new Date(bYear, bMonth - 1, bDay);
    let next = skipToNextBusinessDay(cur);
    if (next < _minBooking) next = new Date(_minBooking);
    setBMonth(next.getMonth() + 1);
    setBDay(next.getDate());
    setBYear(next.getFullYear());
  }, [loadingSlots, bookedSlots, selectedDateStr, bMonth, bDay, bYear, _minBooking]);

  // Auto-refresh every 30 s so freed/blocked slots appear immediately
  useEffect(() => {
    const id = setInterval(() => fetchSlots(selectedDateStr), 30_000);
    return () => clearInterval(id);
  }, [selectedDateStr, fetchSlots]);

  const T = TR[lang];
  const isEs = lang === "es";

  const STAT_ICONS = [
    <Users  className="h-8 w-8" />,
    <Wrench className="h-8 w-8" />,
    <Clock  className="h-8 w-8" />,
    <Award  className="h-8 w-8" />,
  ];

  // Google reviews — shared hook for hero overlay + ReviewsSection
  const { reviews: googleReviews, rating: googleRating, reviewCount: googleReviewCount, loading: loadingGoogleReviews, refresh: loadGoogleReviews } = useGoogleReviews();
  const overlayReview = googleReviews.length
    ? googleReviews[Math.floor(Date.now() / (12 * 36e5)) % googleReviews.length]
    : null;

  const handleServiceClick = (svc: typeof SERVICES[0]) => {
    setAppliance(isEs ? svc.appEs : svc.appEn);
    setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    void loadGoogleReviews().finally(() => {
      setTimeout(() => setRefreshing(false), 600);
      toast({ title: T.reviewsUpdated, description: T.showingLatest });
    });
  };

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    if (!selectedSlot) {
      toast({
        title: isEs ? "Seleccione un horario" : "Please select a time slot",
        description: isEs ? "Elija un horario disponible antes de continuar." : "Choose an available time before submitting.",
        variant: "destructive",
      });
      return;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    const street = String(data.get("address") ?? "").trim();
    const city = String(data.get("city") ?? "").trim();
    const zipRaw = String(data.get("zip") ?? "").replace(/\D/g, "");
    const houstonZipPrefixes = ["770", "772", "773", "774", "775"];
    if (!city) {
      toast({
        title: isEs ? "Ciudad requerida" : "City required",
        description: isEs ? "Ingrese la ciudad de su dirección." : "Enter the city for your service address.",
        variant: "destructive",
      });
      return;
    }
    if (zipRaw.length !== 5) {
      toast({
        title: isEs ? "Código postal requerido" : "ZIP code required",
        description: isEs
          ? "Ingrese un código postal de 5 dígitos del área de Houston (770, 773, 774, 775)."
          : "Enter a 5-digit ZIP in the Greater Houston area (770, 773, 774, 775).",
        variant: "destructive",
      });
      return;
    }
    if (!houstonZipPrefixes.includes(zipRaw.slice(0, 3))) {
      toast({
        title: isEs ? "Fuera del área de servicio" : "Outside service area",
        description: isEs
          ? "Solo atendemos el área metropolitana de Houston (ZIP 770, 773, 774, 775)."
          : "We only serve the Greater Houston area (ZIP codes starting with 770, 773, 774, or 775).",
        variant: "destructive",
      });
      return;
    }
    const fullAddress = `${street}${street ? ", " : ""}${city}, TX ${zipRaw}`;
    setSubmitting(true);
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");
      const res = await fetch(`${apiBase}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:       data.get("name"),
          phone:      data.get("phone"),
          email:      data.get("email"),
          address:    fullAddress,
          zip:        zipRaw,
          appliance,
          brandModel,
          date: selectedDateStr,
          time: selectedSlot ?? "",
          message:    data.get("message"),
          lang,
          business_type: "appliance",
        }),
      });
      if (res.status === 409) {
        toast({
          title: isEs ? "Horario no disponible" : "Time slot unavailable",
          description: isEs
            ? "Este horario ya fue reservado. Por favor seleccione otro horario."
            : "This time slot was just booked. Please choose another time.",
          variant: "destructive",
        });
        setBookedSlots(prev => selectedSlot ? [...prev, selectedSlot] : prev);
        setSelectedSlot(null);
        setSubmitting(false);
        return;
      }
      const payload = await res.json().catch(() => ({} as { message?: string }));
      if (!res.ok) {
        toast({
          title: isEs ? "Error al enviar" : "Submission error",
          description: payload.message ?? (isEs
            ? "Ocurrió un error. Llámenos al (346) 696-8751."
            : "Something went wrong. Please call us at (346) 696-8751."),
          variant: "destructive",
        });
        return;
      }
      toast({ title: T.received, description: T.callSoon });
      setSelectedSlot(null);
      form.reset();
      setAppliance("");
      setBrandModel("");
      const t = new Date();
      setBMonth(t.getMonth() + 1); setBDay(t.getDate()); setBYear(t.getFullYear());
    } catch {
      toast({
        title: isEs ? "Error al enviar" : "Submission error",
        description: isEs
          ? "OcurriÃ³ un error. LlÃ¡menos al (346) 696-8751."
          : "Something went wrong. Please call us at (346) 696-8751.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden font-sans" style={{ backgroundColor: K.bg, color: K.dark }}>

      {/* â”€â”€ NAV â”€â”€ */}
      <div className="htr-header-spacer w-full flex-shrink-0" aria-hidden="true" />
      <header className="htr-site-header-root fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-stone-200 shadow-sm">
        <div className="container mx-auto px-4 htr-site-header-bar flex items-center justify-between gap-3">

          {/* Language switcher â€” left side */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              aria-label="Language region"
              className="p-2 -m-1 rounded-md touch-manipulation"
              onClick={() => {
                onGlobeSecretClick(() => {
                  queueGalleryAdminOpen();
                  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
                  window.location.href = `${base}/gallery`;
                });
              }}
            >
              <Globe className="h-4 w-4 text-stone-500 pointer-events-none select-none" />
            </button>
            <button
              onClick={() => setLang("en")}
              className="text-xs font-bold px-2 py-1 rounded transition-all"
              style={lang === "en" ? { backgroundColor: K.accent, color: "#fff" } : { color: "#57534e" }}
            >EN</button>
            <span className="text-stone-300 text-xs">|</span>
            <button
              onClick={() => setLang("es")}
              className="text-xs font-bold px-2 py-1 rounded transition-all"
              style={lang === "es" ? { backgroundColor: K.accent, color: "#fff" } : { color: "#57534e" }}
            >ES</button>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0 logo-container">
            <Wrench className="h-5 w-5 logo-wrench" style={{ color: K.accent }} />
            <span className="text-lg font-extrabold tracking-tight logo-shimmer-text">
              HTRGroup
            </span>
            <span className="logo-spark logo-spark-1">âœ¦</span>
            <span className="logo-spark logo-spark-2">âœ¦</span>
            <span className="logo-spark logo-spark-3">âœ¦</span>
          </div>

          {/* Desktop nav */}
          <nav className="htr-site-header-nav hidden md:flex items-center gap-5 text-sm font-semibold text-stone-600">
            {["/","#services","#about","#reviews","#faq","#contact"].map((href, i) => (
              <a key={href} href={href} className="hover:opacity-70 transition-opacity">{T.nav[i]}</a>
            ))}
            <a href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/blog`} className="hover:opacity-70 transition-opacity" style={{ color: K.accent }}>
              {isEs ? "Blog" : "Blog"}
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <PhonePair inHeader />
            <a href="#contact" className="text-white font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider" style={{ backgroundColor: K.dark }}>
              {T.bookNow}
            </a>
          </div>

          <button className="md:hidden p-2 rounded" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        <div className="htr-header-mobile-strip md:hidden">
          <div className="container mx-auto px-4 py-2 flex flex-col gap-2">
            <PhonePair inHeader />
            <a href="#contact" className="htr-header-mobile-book text-white font-bold px-3 py-2 rounded text-sm uppercase tracking-wider" style={{ backgroundColor: K.dark }}>
              {T.bookNow}
            </a>
          </div>
        </div>
        </div>

        {menuOpen && (
          <div className="htr-site-header-mobile-menu md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700">
            {["/","#services","#about","#reviews","#faq","#contact"].map((href, i) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="py-2 border-b border-stone-100">{T.nav[i]}</a>
            ))}
            <a href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/blog`} onClick={() => setMenuOpen(false)} className="py-2 border-b border-stone-100" style={{ color: K.accent }}>Blog</a>
            <div className="mt-1"><PhonePair inHeader /></div>
          </div>
        )}
      </header>


      {/* â”€â”€ PROMO BAR â”€â”€ */}
      <div className="htr-promo-bar w-full text-center text-xs sm:text-sm md:text-lg font-semibold text-white py-1.5 px-3 leading-snug" style={{ backgroundColor: "#D97706" }}>
        {T.promoBar}
      </div>

      <main className="flex-grow">

        {/* â”€â”€ HERO â”€â”€ */}
        <section>

          {/* â•â•â•â• MOBILE layout (< md): image on top, text below â•â•â•â• */}
          <div className="block md:hidden">
            {/* Hero image â€” right-aligned so logo is visible */}
            <div className="relative htr-home-hero-mobile overflow-x-hidden" style={{ height: "220px" }}>
              <img
                src={heroImg}
                alt="Appliance repair"
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: "cover", objectPosition: "right center" }}
              />
              <div className="absolute inset-0" style={{ background: "rgba(11,26,63,0.18)" }} />
              <div className="htr-home-hero-effects absolute inset-0 overflow-visible pointer-events-none" aria-hidden>
                <HeroCircuitEffect />
                <div className="hero-pulse-ring" />
                <div className="hero-pulse-ring-2" />
                <div className="hero-rotate-glow" />
                <span className="hero-sparkle hero-sparkle-1" aria-hidden>âœ¦</span>
                <span className="hero-sparkle hero-sparkle-2" aria-hidden>âœ¦</span>
                <span className="hero-sparkle hero-sparkle-3" aria-hidden>âœ¦</span>
                <span className="hero-sparkle hero-sparkle-4" aria-hidden>âœ¦</span>
                <span className="hero-sparkle hero-sparkle-5" aria-hidden>âœ¦</span>
              </div>
            </div>

            {/* Text content below the image */}
            <motion.div
              initial="hidden" animate="visible" variants={STAGGER}
              className="px-4 py-5"
              style={{ background: "rgba(11,26,63,0.92)" }}
            >
              <motion.div variants={FADE_UP}>
                <div className="mb-4"><PhonePair compact /></div>
              </motion.div>
              <motion.h1 variants={FADE_UP} className="text-2xl font-extrabold text-white uppercase leading-tight mb-3">
                <span style={{ display: "block", marginBottom: "8px" }}>{T.heroH1[0]}</span>
                <span>{T.heroH1[1]}</span>
              </motion.h1>
              <motion.p variants={FADE_UP} className="font-bold text-xs uppercase tracking-wide mb-5" style={{ color: K.accentLight }}>
                {T.heroSub}
              </motion.p>
              <motion.div variants={FADE_UP} className="flex gap-2">
                <a href="#services" className="inline-flex items-center justify-center border-2 border-white text-white font-bold px-3 py-2 rounded uppercase tracking-wide text-xs hover:bg-white/10 transition-all whitespace-nowrap">
                  {T.ourSvcs}
                </a>
                <a href="#contact" className="inline-flex items-center justify-center text-white font-bold px-4 py-2 rounded uppercase tracking-wide text-xs transition-all shadow-lg whitespace-nowrap" style={{ backgroundColor: K.accent }}>
                  {T.bookNow}
                </a>
              </motion.div>
            </motion.div>
          </div>

          {/* â•â•â•â• DESKTOP layout (â‰¥ md): text overlay on image â•â•â•â• */}
          <div className="hidden md:block relative htr-home-hero-desktop">
            <img src={heroImg} alt="Appliance repair" className="w-full block" style={{ display: "block" }} />
            <div className="absolute inset-0" style={{ background: "rgba(11,26,63,0.10)" }} />
            <div className="htr-home-hero-effects absolute inset-0 overflow-visible pointer-events-none" aria-hidden>
              <HeroCircuitEffect />
              <div className="hero-pulse-ring" />
              <div className="hero-pulse-ring-2" />
              <div className="hero-rotate-glow" />
              <span className="hero-sparkle hero-sparkle-1" aria-hidden>âœ¦</span>
              <span className="hero-sparkle hero-sparkle-2" aria-hidden>âœ¦</span>
              <span className="hero-sparkle hero-sparkle-3" aria-hidden>âœ¦</span>
              <span className="hero-sparkle hero-sparkle-4" aria-hidden>âœ¦</span>
              <span className="hero-sparkle hero-sparkle-5" aria-hidden>âœ¦</span>
            </div>
            <div className="absolute top-0 left-0 z-10 htr-hero-banner">
              <motion.div
                initial="hidden" animate="visible" variants={STAGGER}
                style={{
                  maxWidth: "340px",
                  background: "rgba(11,26,63,0.82)",
                  borderRadius: "0 0 12px 0",
                  padding: "20px 24px",
                  backdropFilter: "blur(4px)",
                }}
              >
                <motion.div variants={FADE_UP}>
                  <div className="mb-4"><PhonePair compact /></div>
                </motion.div>
                <motion.h1 variants={FADE_UP} className="text-2xl sm:text-3xl font-extrabold text-white uppercase leading-tight mb-3">
                  <span style={{ display: "block", marginBottom: "8px" }}>{T.heroH1[0]}</span>
                  <span>{T.heroH1[1]}</span>
                </motion.h1>
                <motion.p variants={FADE_UP} className="font-bold text-xs md:text-sm uppercase tracking-wide mb-6" style={{ color: K.accentLight }}>
                  {T.heroSub}
                </motion.p>
                <motion.div variants={FADE_UP} className="flex gap-2">
                  <a href="#services" className="inline-flex items-center justify-center border-2 border-white text-white font-bold px-3 py-2 rounded uppercase tracking-wide text-xs hover:bg-white/10 transition-all whitespace-nowrap">
                    {T.ourSvcs}
                  </a>
                  <a href="#contact" className="inline-flex items-center justify-center text-white font-bold px-4 py-2 rounded uppercase tracking-wide text-xs transition-all shadow-lg whitespace-nowrap" style={{ backgroundColor: K.accent }}>
                    {T.bookNow}
                  </a>
                </motion.div>
              </motion.div>
            </div>
          </div>

        </section>

        {/* â”€â”€ TRUST BAR â”€â”€ */}
        <section className="py-3" style={{ backgroundColor: K.accent }}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-white text-center text-xs font-bold uppercase tracking-wide">
              <div className="flex items-center justify-center gap-1.5"><CheckCircle2 className="h-4 w-4" />{T.trust[0]}</div>
              <div className="flex items-center justify-center gap-1.5"><ShieldCheck  className="h-4 w-4" />{T.trust[1]}</div>
              <div className="flex items-center justify-center gap-1.5"><Star className="h-4 w-4 fill-white" />{T.trust[2]}</div>
              <div className="flex items-center justify-center gap-1.5"><Phone className="h-4 w-4" />{T.trust[3]}</div>
            </div>
          </div>
        </section>


        {/* â”€â”€ SERVICES â”€â”€ */}
        <section id="services" className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold">{T.svcH2}</h2>
              <div className="h-1 w-14 mx-auto mt-2 rounded-full" style={{ backgroundColor: K.accent }} />
              <p className="text-stone-400 text-sm mt-2">
                {isEs ? "Haz clic en una tarjeta para reservar ese servicio" : "Click a card to book that service"}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {SERVICES.map((s, i) => (
                <motion.div
                  key={i}
                  initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={FADE_UP}
                  className="group relative overflow-hidden rounded-lg shadow-sm cursor-pointer ring-0 hover:ring-2 transition-all duration-300"
                  style={{ "--tw-ring-color": K.accent } as React.CSSProperties}
                  onClick={() => handleServiceClick(s)}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={s.img} alt={isEs ? s.titleEs : s.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-base">{isEs ? s.titleEs : s.titleEn}</h3>
                    <p className="text-stone-300 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{isEs ? s.descEs : s.descEn}</p>
                    <span className="inline-flex items-center gap-1 font-semibold text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: K.accentLight }}>
                      {T.bookNow} <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                  {/* Tap indicator */}
                  <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: K.accent }}>
                    {isEs ? "Reservar â†’" : "Book â†’"}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <CenterMarquee
          brands={MARQUEE_BRANDS}
          base={import.meta.env.BASE_URL.replace(/\/$/, "")}
        />

        <section id="about" className="relative py-12" style={{ background: "linear-gradient(135deg, #0B1A3F 0%, #0D47B0 50%, #1B6FE8 100%)" }}>
          <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {STAT_ICONS.map((icon, i) => (
                <motion.div key={i} variants={FADE_UP} className="flex flex-col items-center gap-2">
                  <div style={{ color: K.accentLight }}>{icon}</div>
                  <p className="text-4xl font-extrabold" style={{ color: K.accentLight }}>{STATS_VALUES[i]}</p>
                  <p className="text-white text-xs font-medium uppercase tracking-wide">{T.statsLabels[i]}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <MidPhoneStrip />

        {/* â”€â”€ WHY US â”€â”€ */}
        <section className="py-10 bg-white htr-home-why-section">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[2fr_3fr] gap-8 items-start htr-home-split-grid">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="relative htr-home-split-photo">
                <img src={whyUsBgImg} alt="Appliance repair" className="htr-home-split-photo__img rounded-xl shadow-lg w-full h-auto object-contain" />

                {/* Google review overlay card â€” rotates every 12 h */}
                {overlayReview && (
                <div className="absolute bottom-4 right-4 max-w-[260px] bg-transparent border-0 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 drop-shadow"
                      style={{ backgroundColor: overlayReview?.avatarColor }}>
                      {overlayReview?.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white leading-tight drop-shadow">{overlayReview?.name}</p>
                      <p className="text-[10px] text-white/80 leading-tight drop-shadow">{overlayReview?.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-1.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="h-3 w-3 drop-shadow" style={{ color: GOOGLE_STAR_COLOR, fill: GOOGLE_STAR_COLOR }} />
                    ))}
                  </div>
                  <p className="text-[11px] text-white leading-relaxed line-clamp-2 drop-shadow">
                    "{isEs ? overlayReview?.textEs : overlayReview?.textEn}"
                  </p>
                </div>
                )}
              </motion.div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2">{T.whyH2}</h2>
                <div className="h-1 w-12 mb-4 rounded-full" style={{ backgroundColor: K.accent }} />
                <p className="text-stone-500 text-sm leading-relaxed mb-6">{T.whyDesc}</p>
                <div className="space-y-5">
                  {T.whyItems.map((item, i) => (
                    <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="flex gap-3">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white font-extrabold text-sm" style={{ backgroundColor: K.accent }}>
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 mb-0.5">{item.title}</h3>
                        <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* â”€â”€ OUR WORK â”€â”€ */}
        <section id="gallery" className="py-10 bg-white htr-home-our-work-section">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[2fr_3fr] gap-8 items-start htr-home-split-grid">

              {/* LEFT â€” photo */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="relative htr-home-split-photo">
                <a href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/gallery`} className="block rounded-xl overflow-visible shadow-lg group htr-home-split-photo__frame">
                  <img
                    src={GALLERY_PHOTOS[0].src}
                    alt={isEs ? GALLERY_PHOTOS[0].captionEs : GALLERY_PHOTOS[0].captionEn}
                    className="htr-home-split-photo__img w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </a>
                {overlayReview && (
                <div className="absolute bottom-4 right-4 max-w-[220px] bg-transparent border-0 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 drop-shadow"
                      style={{ backgroundColor: overlayReview.avatarColor }}>
                      {overlayReview.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white leading-tight drop-shadow">{overlayReview.name}</p>
                      <p className="text-[10px] text-white/80 leading-tight drop-shadow">{overlayReview.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-1.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-3 w-3 drop-shadow" style={{ color: GOOGLE_STAR_COLOR, fill: GOOGLE_STAR_COLOR }} />)}
                  </div>
                  <p className="text-[11px] text-white leading-relaxed line-clamp-2 drop-shadow">
                    "{isEs ? overlayReview.textEs : overlayReview.textEn}"
                  </p>
                </div>
                )}
              </motion.div>

              {/* RIGHT â€” content */}
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2">{T.galleryH2}</h2>
                <div className="h-1 w-12 mb-4 rounded-full" style={{ backgroundColor: K.accent }} />
                <p className="text-stone-500 text-sm leading-relaxed">{T.gallerySub}</p>
              </div>

            </div>
          </div>
        </section>

        <MidPhoneStrip />

        {/* â”€â”€ OUR CERTIFICATIONS â”€â”€ */}
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP}
              className="flex flex-col"
            >
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-extrabold">{T.certsH2}</h2>
                <div className="h-1 w-12 mt-2 rounded-full" style={{ backgroundColor: K.accent }} />
                <p className="text-stone-500 text-sm leading-relaxed mt-2">{T.certsSub}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {CERTS.map((cert, i) => (
                  <button
                    key={i}
                    onClick={() => setCertModal(cert)}
                    title={cert.label}
                    className="relative group rounded-xl overflow-hidden border-2 border-stone-200 hover:border-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm hover:shadow-md"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <img src={cert.img} alt={cert.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex flex-col items-center justify-center transition-colors duration-200 px-2">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs font-bold drop-shadow text-center leading-tight">
                        {isEs ? "Ver certificado" : "View cert"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-3 px-4 py-4 rounded-xl border border-blue-100" style={{ backgroundColor: K.bg }}>
                <BadgeCheck className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: K.accent }} />
                <p className="text-sm text-stone-600 leading-relaxed">
                  {isEs
                    ? "Todos nuestros tÃ©cnicos estÃ¡n asegurados y certificados por la EPA."
                    : "All our technicians are insured and EPA-certified for your peace of mind."}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* â”€â”€ HOW WE WORK (PROCESS) â”€â”€ */}
        <section className="py-12" style={{ backgroundColor: K.bg }}>
          <div className="container mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold">{T.processH2}</h2>
              <div className="h-1 w-14 mx-auto mt-2 rounded-full" style={{ backgroundColor: K.accent }} />
              <p className="text-stone-500 text-sm mt-2">{T.processSub}</p>
            </div>

            <div className="relative">
              {/* Connector line â€“ visible on md+ */}
              <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-stone-200 z-0" />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 relative z-10">
                {[
                  <CalendarCheck className="h-7 w-7" />,
                  <Truck         className="h-7 w-7" />,
                  <SearchCode    className="h-7 w-7" />,
                  <Hammer        className="h-7 w-7" />,
                  <BadgeCheck    className="h-7 w-7" />,
                ].map((icon, i) => (
                  <motion.div
                    key={i}
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP}
                    className="flex flex-col items-center text-center gap-3"
                  >
                    <div
                      className="h-20 w-20 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0"
                      style={{ backgroundColor: K.accent }}
                    >
                      {icon}
                    </div>
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: K.accent }}>
                        Step {i + 1}
                      </span>
                      <h3 className="font-bold text-stone-900 text-sm mb-1">{T.processSteps[i].title}</h3>
                      <p className="text-stone-500 text-xs leading-relaxed">{T.processSteps[i].desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ReviewsSection
          reviews={googleReviews}
          rating={googleRating}
          reviewCount={googleReviewCount}
          loading={loadingGoogleReviews}
          isEs={isEs}
          accentColor={K.accent}
          bgColor={K.bg}
          copy={{
            reviewsH2: T.reviewsH2,
            reviewsLoading: T.reviewsLoading,
            writeReview: T.writeReview,
            viewOnGoogle: isEs ? "Ver en Google" : "View on Google",
            empty: isEs
              ? "No hay reseñas de Google disponibles en este momento."
              : "No Google reviews available right now. Please try again later.",
            prev: isEs ? "Reseñas anteriores" : "Previous reviews",
            next: isEs ? "Siguientes reseñas" : "Next reviews",
          }}
        />

        {/* â”€â”€ FAQ â”€â”€ */}
        <section id="faq" className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold">{T.faqH2}</h2>
              <div className="h-1 w-16 mx-auto mt-3 rounded-full" style={{ backgroundColor: K.accent }} />
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {T.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border border-stone-200 rounded-xl px-2 shadow-sm">
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold py-5 hover:opacity-70 transition-opacity">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-stone-500 text-base leading-relaxed pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* â”€â”€ BRANDS WE SERVICE â”€â”€ */}
        <section id="brands" className="py-10 bg-stone-50 border-y border-stone-200 overflow-hidden">
          <div className="container mx-auto px-4 mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
              {isEs ? "Marcas que reparamos" : "Brands We Service"}
            </p>
          </div>
          <div className="htr-brand-marquee-stack flex flex-col gap-4">
            <DraggableMarquee
              brands={MARQUEE_BRANDS}
              base={import.meta.env.BASE_URL.replace(/\/$/, "")}
            />
            <DraggableMarquee
              brands={MARQUEE_BRANDS}
              base={import.meta.env.BASE_URL.replace(/\/$/, "")}
              reverse
            />
          </div>
        </section>

        {/* â”€â”€ CTA BANNER â”€â”€ */}
        <section className="relative py-12" style={{ background: "linear-gradient(135deg, #0B1A3F 0%, #0D47B0 55%, #1B6FE8 100%)" }}>
          <div className="container mx-auto px-4 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}>
              <motion.h2 variants={FADE_UP} className="text-2xl md:text-4xl font-extrabold text-white uppercase mb-2">{T.ctaH2}</motion.h2>
              <motion.p variants={FADE_UP} className="font-bold text-sm uppercase mb-5" style={{ color: K.accentLight }}>{T.ctaSub}</motion.p>
              <motion.a variants={FADE_UP} href="#contact" className="inline-block text-white font-bold px-8 py-3 uppercase tracking-widest text-sm rounded transition-opacity hover:opacity-80" style={{ backgroundColor: K.accentDark }}>
                {T.bookNow}
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* â”€â”€ CONTACT â”€â”€ */}
        <section id="contact" ref={contactRef} className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-6 w-6" style={{ color: K.accent }} />
                  <span className="text-xl font-extrabold">HTR<span style={{ color: K.accent }}>Group</span></span>
                </div>
                <a href="#services" className="inline-block text-white font-bold px-5 py-2 uppercase tracking-widest text-xs rounded mb-6 hover:opacity-80 transition-opacity" style={{ backgroundColor: K.accent }}>
                  {T.learnMore}
                </a>
                <h3 className="font-bold uppercase tracking-wider text-xs mb-3" style={{ color: K.accent }}>{T.contactH2}</h3>
                <ul className="space-y-3 text-sm text-stone-600">
                  <li className="flex items-start gap-2"><span style={{ color: K.accent }}>ðŸ“</span> {T.address}</li>
                  <li className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: K.accent }} />
                    <div>
                      <a href={COMPANY_PHONE_HREF} className="htr-phone-btn htr-phone-btn--contact font-bold text-stone-900 hover:opacity-70 transition-opacity block">{COMPANY_PHONE_DISPLAY}</a>
                      <a href={PHONE_HREF} className="htr-phone-btn htr-phone-btn--contact font-bold text-stone-900 hover:opacity-70 transition-opacity block mt-1">{PHONE_DISPLAY}</a>
                      <p className="text-stone-400 text-xs mt-0.5 leading-snug">{T.smsHint}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2"><span style={{ color: K.accent }}>@</span>
                    <a href="mailto:htrgroupllc@gmail.com" className="hover:opacity-70 transition-opacity">htrgroupllc@gmail.com</a>
                  </li>
                  <li className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: K.accent }} /> {T.hours1}</li>
                  <li className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: K.accent }} /> {T.hours2}</li>
                </ul>
              </div>

              {/* Booking form */}
              <div ref={bookingFormRef} className="rounded-xl p-6" style={{ backgroundColor: K.bg }}>
                <h3 className="text-xl font-extrabold mb-1">{T.bookH2}</h3>
                <p className="text-stone-400 text-xs mb-4">{T.bookSub}</p>
                {appliance && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: K.accent }}>
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    {isEs ? `Servicio seleccionado: ${appliance}` : `Selected service: ${appliance}`}
                  </div>
                )}
                <form onSubmit={handleBooking} className="space-y-3">
                  {/* Name */}
                  <input name="name" type="text" required
                    placeholder={T.formFields[0]}
                    className="w-full border border-stone-200 bg-white rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": K.accent } as React.CSSProperties} />
                  {/* Phone */}
                  <input name="phone" type="tel" required
                    placeholder={T.formFields[1]}
                    className="w-full border border-stone-200 bg-white rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": K.accent } as React.CSSProperties} />
                  {/* Email */}
                  <input name="email" type="email" required
                    placeholder={T.emailPh}
                    className="w-full border border-stone-200 bg-white rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": K.accent } as React.CSSProperties} />
                  {/* Street Address */}
                  <input name="address" type="text" required
                    placeholder={T.addressPh}
                    className="w-full border border-stone-200 bg-white rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": K.accent } as React.CSSProperties} />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input name="city" type="text" required
                      placeholder={T.cityPh}
                      className="w-full border border-stone-200 bg-white rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": K.accent } as React.CSSProperties} />
                    <input name="zip" type="text" required inputMode="numeric" pattern="[0-9]{5}" maxLength={5}
                      placeholder={T.zipPh}
                      className="w-full border border-stone-200 bg-white rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": K.accent } as React.CSSProperties} />
                  </div>
                  {/* Appliance type */}
                  <select
                    name="appliance"
                    required
                    value={appliance}
                    onChange={e => { setAppliance(e.target.value); setBrandModel(""); }}
                    className="w-full border border-stone-200 bg-white rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ color: appliance ? K.dark : "#78716c", "--tw-ring-color": K.accent } as React.CSSProperties}
                  >
                    <option value="">{T.selectPh}</option>
                    {T.appTypes.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {/* Brand & Model â€” filtered by selected appliance */}
                  <select
                    name="brandModel"
                    value={brandModel}
                    onChange={e => setBrandModel(e.target.value)}
                    disabled={!appliance}
                    className="w-full border border-stone-200 bg-white rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: brandModel ? K.dark : "#78716c", "--tw-ring-color": K.accent } as React.CSSProperties}
                  >
                    <option value="">{appliance ? T.brandModelPh : (isEs ? "Primero seleccione el equipo..." : "Select appliance first...")}</option>
                    {(BRANDS_BY_APPLIANCE[appKey(appliance)] ?? []).map(({ brand, models }) => (
                      <optgroup key={brand} label={brand}>
                        {models.map(m => (
                          <option key={`${brand}__${m}`} value={`${brand} â€” ${m}`}>{m}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {/* Preferred date â€” Month / Day / Year */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <select value={bMonth} onChange={e => { markUserPickedDate(); const m = +e.target.value; setBMonth(m); const max = new Date(bYear, m, 0).getDate(); if (bDay > max) setBDay(max); }}
                      className="border border-stone-200 bg-white rounded px-2 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": K.accent } as React.CSSProperties}>
                      {MONTHS_SHORT.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
                    </select>
                    <select value={bDay} onChange={e => { markUserPickedDate(); setBDay(+e.target.value); }}
                      className="border border-stone-200 bg-white rounded px-2 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": K.accent } as React.CSSProperties}>
                      {Array.from({ length: new Date(bYear, bMonth, 0).getDate() }, (_, i) => i + 1).map(d => {
                        const opt = new Date(bYear, bMonth - 1, d);
                        opt.setHours(0, 0, 0, 0);
                        return <option key={d} value={d} disabled={opt < _minBooking}>{d}</option>;
                      })}
                    </select>
                    <select value={bYear} onChange={e => { markUserPickedDate(); setBYear(+e.target.value); }}
                      className="border border-stone-200 bg-white rounded px-2 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": K.accent } as React.CSSProperties}>
                      {[_now.getFullYear(), _now.getFullYear()+1].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  {/* Time slots */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-semibold text-stone-500">
                        {isEs ? "Seleccione un horario disponible:" : "Select an available time slot:"}
                      </p>
                      <button
                        type="button"
                        onClick={() => fetchSlots(selectedDateStr)}
                        disabled={loadingSlots}
                        className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border border-stone-200 text-stone-500 hover:text-blue-600 hover:border-blue-300 transition disabled:opacity-40"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingSlots ? "animate-spin" : ""}`} />
                        {isEs ? "Actualizar" : "Refresh"}
                      </button>
                    </div>
                    {loadingSlots ? (
                      <div className="text-xs text-stone-400 py-2">{isEs ? "Cargando horariosâ€¦" : "Loading availabilityâ€¦"}</div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5">
                        {TIME_SLOTS.map(slot => {
                          const booked = bookedSlots.includes(slot);
                          const selected = selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={booked}
                              onClick={() => setSelectedSlot(slot)}
                              className={`text-xs font-semibold py-2 px-1 rounded border transition-all ${
                                booked
                                  ? "bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed line-through"
                                  : selected
                                    ? "text-white border-transparent shadow-sm"
                                    : "bg-white text-stone-600 border-stone-200 hover:border-blue-300 hover:text-blue-600"
                              }`}
                              style={selected ? { backgroundColor: K.accent, borderColor: K.accent } : {}}
                            >
                              {booked ? `${slot} âœ—` : slot}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {!selectedSlot && !loadingSlots && (
                      <p className="text-xs text-amber-600 mt-1">
                        {isEs ? "Por favor seleccione un horario." : "Please select a time slot."}
                      </p>
                    )}
                  </div>
                  {/* Time notice */}
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {isEs
                      ? "El tiempo de viaje hasta su ubicaciÃ³n puede superar una hora â€” el tÃ©cnico podrÃ­a llegar despuÃ©s de la hora seleccionada."
                      : "Travel time to your location may exceed one hour â€” the technician may arrive after the selected time."}
                  </p>
                  {/* Message */}
                  <textarea name="message" rows={3}
                    placeholder={T.descPh}
                    className="w-full border border-stone-200 bg-white rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
                    style={{ "--tw-ring-color": K.accent } as React.CSSProperties} />
                  <button type="submit" disabled={submitting}
                    className="w-full text-white font-bold py-3 rounded uppercase tracking-widest text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: K.accent }}>
                    {submitting ? (isEs ? "Enviandoâ€¦" : "Sendingâ€¦") : T.requestBtn}
                  </button>
                </form>
              </div>
            </div>

            {/* â”€â”€ SERVICE AREA MAP â”€â”€ */}
            <div className="mt-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-lg font-extrabold">{T.serviceAreaTitle}</h3>
                  <p className="text-stone-400 text-sm mt-0.5">{T.serviceAreaSub}</p>
                </div>
                <a
                  href="https://www.google.com/maps/search/Houston+Metropolitan+Area,+Texas/@29.7,-95.4,9z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-full hover:opacity-80 transition-opacity whitespace-nowrap self-start sm:self-auto"
                  style={{ backgroundColor: K.accent }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {T.openInMaps}
                </a>
              </div>

              {/* City chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {["Houston", "Sugar Land", "Katy", "Pearland", "The Woodlands", "Pasadena", "Baytown", "League City", "Missouri City", "Conroe", "Friendswood", "Rosenberg"].map(city => (
                  <span key={city} className="text-xs font-medium px-3 py-1 rounded-full border"
                    style={{ borderColor: K.accent, color: K.accent, backgroundColor: `${K.accent}12` }}>
                    ðŸ“ {city}
                  </span>
                ))}
              </div>

              {/* Map iframe */}
              <a
                href="https://www.google.com/maps/search/Houston+Metropolitan+Area,+Texas/@29.7,-95.4,9z"
                target="_blank"
                rel="noopener noreferrer"
                className="block relative rounded-xl overflow-hidden shadow-md group"
                style={{ height: 300 }}
              >
                <iframe
                  title="Service Area Map"
                  src="https://maps.google.com/maps?q=Houston+Metropolitan+Area,+Texas&ll=29.7,-95.4&z=9&output=embed"
                  width="100%"
                  height="300"
                  style={{ border: 0, pointerEvents: "none" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <ServiceAreaMapOverlay />
                <div className="absolute inset-0 z-[2] bg-transparent group-hover:bg-black/10 transition-colors duration-200 flex items-end justify-center pb-4">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 text-stone-800 text-xs font-semibold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                    <ExternalLink className="h-3 w-3" />
                    {T.openInMaps}
                  </span>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* â”€â”€ FOOTER â”€â”€ */}
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
            <p><AdminSecretAccess label={`Â© ${new Date().getFullYear()} HTRGroup. ${T.allRights}`} /></p>
            <div className="flex gap-5 items-center">
              <a href="#" className="hover:text-white transition-colors">{T.privacy}</a>
              <a href="#" className="hover:text-white transition-colors">{T.terms}</a>
            </div>
          </div>
        </div>
      </footer>

      {/* â”€â”€ CERT LIGHTBOX â”€â”€ */}
      {certModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          onClick={() => setCertModal(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setCertModal(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-medium flex items-center gap-1"
            >
              <X className="h-5 w-5" />
              {isEs ? "Cerrar" : "Close"}
            </button>
            <img
              src={certModal.img}
              alt={certModal.label}
              className="w-full rounded-xl shadow-2xl"
            />
            <p className="text-center text-white/80 text-sm mt-3 font-medium">{certModal.label}</p>
          </div>
        </div>
      )}

      <ChatWidget lang={lang} />
    </div>
  );
}
