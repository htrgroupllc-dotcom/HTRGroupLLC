import React, { useState, useRef, useEffect, useCallback } from "react";
import AdminSecretAccess from "@/components/AdminSecretAccess";
import { onGlobeSecretClick, queueGalleryAdminOpen } from "@/lib/gallerySecretUnlock";
import { motion } from "framer-motion";
import {
  Phone, Wrench, ShieldCheck, Clock, Star, CheckCircle2,
  ChevronRight, Menu, X, Users, Award, RefreshCw, ExternalLink, ThumbsUp, Globe,
  CalendarCheck, Truck, SearchCode, Hammer, BadgeCheck,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

import { ALL_REVIEWS } from "../data/reviews";
import ChatWidget from "@/components/ChatWidget";
import ServiceAreaMapOverlay from "@/components/ServiceAreaMapOverlay";
import { HeroCircuitEffect } from "@/components/HeroCircuitEffect";
import svcDryerImg    from "@assets/svc_dryer_nobrand.png";
import svcWasherImg   from "@assets/ChatGPT_Image_3_апр._2026_г.,_21_04_57_1775269648058.png";
import svcFridgeImg   from "@assets/ChatGPT_Image_3_апр._2026_г.,_21_10_20_1775269648058.png";
import svcDishImg     from "@assets/svc_dishwasher_nobrand.png";
import svcMicroImg    from "@assets/svc_microwave_nobrand.png";
import svcHoodImg     from "@assets/svc_rangehood_nobrand.png";
import svcOvenImg     from "@assets/ChatGPT_Image_3_апр._2026_г.,_21_18_00_1775269648060.png";
import svcStoveImg    from "@assets/ChatGPT_Image_3_апр._2026_г.,_21_20_14_1775269648060.png";
import whyUsBgImg     from "@assets/why-us-photo.png";
import svcIceMakerImg from "@assets/svc_icemaker.png";
import svcCooktopImg  from "@assets/svc_cooktop.png";
import svcWineCoolImg from "@assets/svc_winecooler.png";
import svcFreezerImg  from "@assets/svc_freezer.png";
import svcDisposalImg from "@assets/svc_disposal.png";
import svcWarmerImg   from "@assets/svc_warmer.png";
import g62  from "@assets/photo_62_2026-04-02_02-47-29_1775273301589.jpg";
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
import heroImg        from "@assets/ChatGPT_Image_12_апр._2026_г.,_02_07_40_1775977673189.png";

import { PHONE_DISPLAY, PHONE_HREF, COMPANY_PHONE_DISPLAY, COMPANY_PHONE_HREF } from "@/lib/sitePhones";

/* ── Brand / Model data ────────────────────────────────────────── */

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
    { brand: "GE / GE Profile", models: ["GFE / EFE (French Door)","GSS / GSE (Side-by-Side)","GTS / GTE (Top Freezer)","GE Café","GE Monogram","GE Profile","Other GE"] },
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
    { brand: "GE / GE Profile", models: ["GFW (Front Load)","GTW (Top Load)","GE Profile","GE Café","Artistry Series","Other GE"] },
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
    { brand: "GE / GE Profile", models: ["GTD / GFD (Electric / Gas)","GE Profile","GE Café","Other GE"] },
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
    { brand: "GE / GE Profile", models: ["JB / JGB (Freestanding Range)","GE Profile (P9B / P2B)","GE Café (C2S / C2H)","GE Monogram","Other GE"] },
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
    { brand: "La Cornue",       models: ["CornuFé 90 / 110 / 150","Château 75 / 100 / 150","Fontenay 80 / 100","Other La Cornue"] },
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
    { brand: "GE / GE Profile", models: ["JB / JES (Electric Range)","GE Profile (P2B)","GE Café","Other GE"] },
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
    { brand: "GE / GE Profile", models: ["GDT / GDF Series","GE Profile","GE Café","Other GE"] },
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
    { brand: "GE / GE Profile", models: ["JVM (Over-the-Range)","JES (Countertop)","PVM / PEB (Profile)","GE Café","Other GE"] },
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
    { brand: "GE / GE Profile", models: ["JVW (Wall)","JV (Under Cabinet)","GE Café Hood","Other GE"] },
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
  if (v.includes("warm") || v.includes("cajón") || v.includes("cajon"))            return "oven";
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

/* ── Translations ──────────────────────────────────────────────── */
const TR = {
  en: {
    nav:       ["Home", "Services", "About Us", "Reviews", "FAQ", "Contact"],
    bookNow:   "Book Now",
    promoBar:  "⭐ Returning customers save $50 on any repair — mention this offer when booking!",
    ourSvcs:   "Our Services",
    trust:     ["Same-Day Service", "Licensed & Insured", "90-Day Warranty"],
    heroH1:    ["Your Local", "Appliance Repair"],
    heroSub:   "Precision Repair. Trusted Technicians. Guaranteed Solutions.",
    svcH2:     "Fast & Reliable Appliance Repair",
    statsLabels: ["Happy Customers", "Services Repaired", "Hours Spent", "Professional Team"],
    whyH2:     "The HTRGroupTX Difference",
    whyDesc:   "With over 25 years of appliance repair expertise, our team has the expertise and parts to get your home running again — fast.",
    whyItems:  [
      { title: "Certified Technicians",  desc: "All specialists are certified, insured, and trained on the latest appliance technology." },
      { title: "Fully Stocked Trucks",   desc: "We carry common parts, completing 85% of repairs on the first visit — saving your time." },
      { title: "Upfront Honest Pricing", desc: "See the full quote before we start. No hidden fees. 90-day parts and labor warranty." },
    ],
    reviewsH2:   "Customer Reviews",
    reviewsBased: "Based on 312 reviews",
    writeReview:  "Write a Review",
    refresh:      "Refresh",
    reviewsUpdated: "Reviews updated",
    showingLatest:  "Showing latest reviews.",
    tabLabels:    ["All Reviews", "5 Stars", "4 Stars", "Recent"],
    helpful:      "Helpful",
    faqH2:        "Frequently Asked Questions",
    faqs: [
      { q: "How much is the service call fee?",   a: "We charge a flat diagnostic fee. If you proceed with the repair, that fee is applied toward the total cost." },
      { q: "Do you repair all brands?",            a: "Yes — Whirlpool, LG, GE, Maytag, KitchenAid, Sub-Zero, Miele, Electrolux, and more." },
      { q: "How quickly can you come?",            a: "Same-day service if you call before noon. We do our best to arrive as soon as possible — please keep in mind travel time may vary depending on your location." },
      { q: "Do you guarantee your work?",          a: "Yes — 90-day warranty on all parts and labor. We return and fix for free if the same issue recurs." },
      { q: "Do I need to prepare anything before the technician arrives?", a: "For the safety of both our technician and your pets, please isolate all large animals, reptiles, exotic animals, and cats in a separate room before our arrival." },
    ],
    ctaH2:   "We Fix What Your Home Depends On.",
    ctaSub:  "Expert Appliance Repair For Every Major Brand.",
    contactH2: "Contact Us Today",
    address:  "Houston, TX & surrounding areas (Sugar Land, Katy, Pearland, The Woodlands, Pasadena)",
    hours1:   "Mon–Fri: 9:00 AM – 5:00 PM",
    hours2:   "Sat–Sun: Closed",
    learnMore: "Learn More",
    bookH2:   "Book a Repair",
    bookSub:  "We'll call you within 15 minutes to confirm your appointment.",
    formFields: ["Your name", "Phone number", "ZIP Code"],
    emailPh:    "Email address (required)",
    addressPh:  "Home address (street, city, ZIP)",
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
    galleryEmpty: "Photos coming soon — check back after your next repair!",
    galleryPlaceholder: "Photo coming soon",
    galleryViewAll: "View All Photos",
    processH2:  "How We Work",
    processSub: "Simple, transparent, and stress-free from first call to final check.",
    processSteps: [
      { title: "Book Online or Call",     desc: "Request service online or call (346) 820-6021. We confirm within 15 minutes." },
      { title: "Same-Day Dispatch",       desc: "A certified technician is dispatched to your home — often the same day you call." },
      { title: "Diagnosis & Estimate",    desc: "We diagnose the issue and provide an upfront, honest quote before any work begins." },
      { title: "Repair & Parts",          desc: "Most repairs are completed on the first visit using parts we carry in our fully-stocked trucks." },
      { title: "Quality Check & Warranty",desc: "We test everything before we leave. All repairs come with a 90-day parts and labor warranty." },
    ],
  },
  es: {
    nav:       ["Inicio", "Servicios", "Nosotros", "Reseñas", "FAQ", "Contacto"],
    bookNow:   "Reservar",
    promoBar:  "⭐ Clientes frecuentes ahorran $50 en cualquier reparación — ¡mencione esta oferta al reservar!",
    ourSvcs:   "Nuestros Servicios",
    trust:     ["Servicio el Mismo Día", "Licenciados y Asegurados", "Garantía 90 Días"],
    heroH1:    ["Reparación de", "Electrodomésticos"],
    heroSub:   "Reparación de Precisión. Técnicos de Confianza. Soluciones Garantizadas.",
    svcH2:     "Reparación Rápida y Confiable",
    statsLabels: ["Clientes Satisfechos", "Servicios Realizados", "Horas Trabajadas", "Equipo Profesional"],
    whyH2:     "La Diferencia de HTRGroupTX",
    whyDesc:   "Con más de 25 años de experiencia en reparación de electrodomésticos, nuestro equipo tiene la experiencia y las piezas para hacer funcionar su hogar nuevamente — rápido.",
    whyItems:  [
      { title: "Técnicos Certificados",     desc: "Todos nuestros especialistas están certificados, asegurados y capacitados en las últimas tecnologías." },
      { title: "Camiones Equipados",         desc: "Llevamos las piezas más comunes y completamos el 85% de reparaciones en la primera visita." },
      { title: "Precios Honestos y Claros",  desc: "Vea el presupuesto completo antes de empezar. Sin cargos ocultos. Garantía de 90 días en piezas y mano de obra." },
    ],
    reviewsH2:    "Reseñas de Clientes",
    reviewsBased: "Basado en 312 reseñas",
    writeReview:  "Escribir Reseña",
    refresh:      "Actualizar",
    reviewsUpdated: "Reseñas actualizadas",
    showingLatest:  "Mostrando las últimas reseñas.",
    tabLabels:    ["Todas", "5 Estrellas", "4 Estrellas", "Recientes"],
    helpful:      "Útil",
    faqH2:        "Preguntas Frecuentes",
    faqs: [
      { q: "¿Cuánto cuesta la visita de diagnóstico?", a: "Cobramos una tarifa fija de diagnóstico. Si procede con la reparación, ese monto se aplica al costo total." },
      { q: "¿Reparan todas las marcas?",                a: "Sí — Whirlpool, LG, GE, Maytag, KitchenAid, Sub-Zero, Miele, Electrolux y más." },
      { q: "¿Qué tan rápido pueden venir?",             a: "Servicio el mismo día si llama antes del mediodía. Hacemos todo lo posible por llegar lo antes posible — tenga en cuenta que el tiempo de viaje puede variar según su ubicación." },
      { q: "¿Garantizan su trabajo?",                   a: "Sí — garantía de 90 días en piezas y mano de obra. Regresamos y arreglamos sin costo si el mismo problema regresa." },
      { q: "¿Necesito preparar algo antes de la llegada del técnico?", a: "Por seguridad del técnico y de sus mascotas, por favor aísle en una habitación separada a todos los animales grandes, reptiles, animales exóticos y gatos antes de nuestra llegada." },
    ],
    ctaH2:   "Reparamos Lo Que Su Hogar Necesita.",
    ctaSub:  "Reparación Experta Para Todas Las Marcas.",
    contactH2: "Contáctenos Hoy",
    address:  "Houston, TX y áreas cercanas (Sugar Land, Katy, Pearland, The Woodlands, Pasadena)",
    hours1:   "Lun–Vie: 9:00 AM – 5:00 PM",
    hours2:   "Sáb–Dom: Cerrado",
    learnMore: "Más Información",
    bookH2:   "Reserve una Reparación",
    bookSub:  "Le llamaremos en 15 minutos para confirmar su cita.",
    formFields: ["Su nombre", "Número de teléfono", "Código ZIP"],
    emailPh:    "Correo electrónico (requerido)",
    addressPh:  "Dirección (calle, ciudad, ZIP)",
    datePh:     "Fecha preferida (ej. 10 de Abr)",
    timePh:     "Hora preferida (ej. 10:00 AM)",
    selectPh:   "Seleccione el tipo de electrodoméstico...",
    brandModelPh: "Seleccione marca y modelo...",
    descPh:     "Describa el problema en detalle (opcional)",
    appTypes:   ["Refrigerador / Congelador", "Lavadora", "Secadora", "Horno / Cocina", "Horno Eléctrico y Estufa", "Lavavajillas", "Microondas", "Campana extractora", "Máquina de Hielo", "Placa de Cocción", "Enfriador de Vino", "Congelador", "Triturador de Basura", "Cajón Calentador", "Otro"],
    requestBtn: "Solicitar Cita",
    received:   "¡Solicitud Recibida!",
    callSoon:   "Le llamaremos en 15 minutos para confirmar.",
    smsHint:    "Si no contestamos, envíenos un SMS con la descripción del problema y nos pondremos en contacto a la brevedad.",
    serviceAreaTitle: "Nuestra Área de Servicio",
    serviceAreaSub:   "Atendemos Houston y todas las ciudades vecinas. Haz clic en el mapa para obtener direcciones.",
    openInMaps:       "Abrir en Google Maps",
    privacy:    "Política de Privacidad",
    terms:      "Términos de Servicio",
    allRights:  "Todos los derechos reservados.",
    certsH2:    "Nuestras Certificaciones",
    certsSub:   "Técnicos certificados y de confianza.",
    galleryH2:  "Nuestros Trabajos",
    gallerySub: "Reparaciones reales realizadas por nuestros técnicos certificados.",
    galleryEmpty: "¡Fotos próximamente — vuelva después de su próxima reparación!",
    galleryPlaceholder: "Foto próximamente",
    galleryViewAll: "Ver Todas las Fotos",
    processH2:  "Cómo Trabajamos",
    processSub: "Simple, transparente y sin estrés desde la primera llamada hasta la revisión final.",
    processSteps: [
      { title: "Reserve en Línea o Llame",    desc: "Solicite el servicio en línea o llame al (346) 820-6021. Confirmamos en 15 minutos." },
      { title: "Despacho el Mismo Día",        desc: "Un técnico certificado se envía a su hogar — a menudo el mismo día que llama." },
      { title: "Diagnóstico y Presupuesto",    desc: "Diagnosticamos el problema y le damos un presupuesto claro antes de comenzar cualquier trabajo." },
      { title: "Reparación con Repuestos",     desc: "La mayoría de las reparaciones se completan en la primera visita con piezas que llevamos en nuestros camiones." },
      { title: "Control de Calidad y Garantía",desc: "Probamos todo antes de irnos. Todas las reparaciones incluyen garantía de 90 días en piezas y mano de obra." },
    ],
  },
};

/* ── Services (with appliance-type mapping) ─────────────────────── */
const SERVICES = [
  { titleEn: "Refrigerator Repair",  titleEs: "Reparación de Refrigerador",    img: svcFridgeImg,  descEn: "Not cooling, leaking, or making noise? We save your groceries fast.",            descEs: "¿No enfría, tiene goteras o hace ruido? Salvamos sus alimentos rápido.",                appEn: "Refrigerator / Freezer", appEs: "Refrigerador / Congelador" },
  { titleEn: "Washer Repair",        titleEs: "Reparación de Lavadora",         img: svcWasherImg,  descEn: "Washer not spinning, leaking, or draining? Same-day certified fix.",             descEs: "¿Lavadora no gira, gotea o no desagua? Reparación certificada el mismo día.",           appEn: "Washing Machine",        appEs: "Lavadora" },
  { titleEn: "Dryer Repair",         titleEs: "Reparación de Secadora",         img: svcDryerImg,   descEn: "Dryer not heating or taking too long? We get your laundry moving again.",        descEs: "¿La secadora no calienta o tarda demasiado? Volvemos a secar tu ropa.",                  appEn: "Dryer",                  appEs: "Secadora" },
  { titleEn: "Dishwasher Repair",    titleEs: "Reparación de Lavavajillas",     img: svcDishImg,    descEn: "Dishwasher not cleaning, draining, or filling? Fast expert diagnosis.",           descEs: "¿El lavavajillas no limpia, drena o llena? Diagnóstico experto rápido.",                 appEn: "Dishwasher",             appEs: "Lavavajillas" },
  { titleEn: "Microwave Repair",     titleEs: "Reparación de Microondas",       img: svcMicroImg,   descEn: "Microwave sparking, not heating, or display issues? We fix it same day.",        descEs: "¿Microondas chisporrotea, no calienta o falla la pantalla? Lo arreglamos hoy.",          appEn: "Microwave",              appEs: "Microondas" },
  { titleEn: "Range Hood Repair",    titleEs: "Reparación de Campana",          img: svcHoodImg,    descEn: "Hood fan not working, noisy, or lights out? Restore your kitchen ventilation.",   descEs: "¿El ventilador no funciona, hace ruido o las luces están apagadas? Lo restauramos.",     appEn: "Range Hood",             appEs: "Campana extractora" },
  { titleEn: "Oven & Gas Range",     titleEs: "Horno y Cocina de Gas",          img: svcOvenImg,    descEn: "Burners won't ignite or oven won't heat evenly? Certified gas technicians.",      descEs: "¿Los quemadores no encienden o el horno no calienta? Técnicos certificados en gas.",     appEn: "Oven / Range",           appEs: "Horno / Cocina" },
  { titleEn: "Electric Oven & Stove", titleEs: "Horno Eléctrico y Estufa",      img: svcStoveImg,   descEn: "Electric burners not working or oven not reaching temperature? We have you covered.", descEs: "¿Los quemadores eléctricos no funcionan o el horno no alcanza temperatura? Te cubrimos.", appEn: "Electric Stove",         appEs: "Estufa eléctrica" },
  { titleEn: "Ice Maker Repair",     titleEs: "Reparación de Máquina de Hielo", img: svcIceMakerImg, descEn: "Ice maker not producing ice or leaking? We diagnose and fix it fast.",              descEs: "¿La máquina de hielo no produce hielo o gotea? La diagnosticamos y reparamos rápido.",  appEn: "Ice Maker",              appEs: "Máquina de Hielo" },
  { titleEn: "Cooktop Repair",       titleEs: "Reparación de Placa de Cocción", img: svcCooktopImg,  descEn: "Gas or electric cooktop burners not working? Expert diagnosis and repair.",          descEs: "¿Los quemadores de su placa no funcionan? Diagnóstico y reparación experta.",           appEn: "Cooktop",                appEs: "Placa de Cocción" },
  { titleEn: "Wine Cooler Repair",   titleEs: "Reparación de Enfriador de Vino",img: svcWineCoolImg, descEn: "Wine cooler not cooling or making noise? We restore the perfect temperature.",       descEs: "¿El enfriador de vino no enfría o hace ruido? Restauramos la temperatura perfecta.",    appEn: "Wine Cooler",            appEs: "Enfriador de Vino" },
  { titleEn: "Freezer Repair",       titleEs: "Reparación de Congelador",       img: svcFreezerImg,  descEn: "Freezer not freezing, frosting over, or making noise? Same-day expert service.",     descEs: "¿El congelador no congela o acumula escarcha? Servicio experto el mismo día.",          appEn: "Freezer",                appEs: "Congelador" },
  { titleEn: "Garbage Disposal Repair",titleEs:"Reparación de Triturador",      img: svcDisposalImg, descEn: "Disposal jammed, leaking, or won't turn on? We have you covered fast.",             descEs: "¿El triturador está atascado, gotea o no enciende? Lo solucionamos rápido.",           appEn: "Garbage Disposal",       appEs: "Triturador de Basura" },
  { titleEn: "Warming Drawer Repair",titleEs: "Reparación de Cajón Calentador", img: svcWarmerImg,   descEn: "Warming drawer not heating or stuck? We service all major brands.",                  descEs: "¿El cajón calentador no calienta o está atascado? Reparamos todas las marcas.",         appEn: "Warming Drawer",         appEs: "Cajón Calentador" },
];

function getDailyStats(): string[] {
  const BASE_DATE  = new Date(2026, 3, 4); // April 4, 2026
  const BASE       = [4123, 3995, 9567, 10];
  const PER_DAY    = [2, 3, 2, 0];         // daily increment per counter
  const today      = new Date();
  today.setHours(0, 0, 0, 0);
  BASE_DATE.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.floor((today.getTime() - BASE_DATE.getTime()) / 86400000));
  return BASE.map((v, i) => (v + days * PER_DAY[i]).toLocaleString("en-US"));
}
const STATS_VALUES = getDailyStats();

/* ── Gallery photos ─────────────────────────────────────────────────
   To add photos: push objects to this array using the format below.
   src  – import path or public URL of the image
   captionEn / captionEs – short label shown under the photo
   Example:
     import myPhoto from "@assets/my-repair-photo.jpg";
     { src: myPhoto, captionEn: "Washer repair – Katy TX", captionEs: "Reparación lavadora – Katy TX" },
─────────────────────────────────────────────────────────────────── */
const GALLERY_PHOTOS: { src: string; captionEn: string; captionEs: string }[] = [
  { src: g62,  captionEn: "Washer repair – Houston, TX",       captionEs: "Reparación lavadora – Houston, TX" },
  { src: g67,  captionEn: "Refrigerator repair – Katy, TX",    captionEs: "Reparación refrigerador – Katy, TX" },
  { src: g73,  captionEn: "Dryer repair – Sugar Land, TX",     captionEs: "Reparación secadora – Sugar Land, TX" },
  { src: g75,  captionEn: "Dishwasher repair – Pearland, TX",  captionEs: "Reparación lavavajillas – Pearland, TX" },
  { src: g76,  captionEn: "Oven repair – The Woodlands, TX",   captionEs: "Reparación horno – The Woodlands, TX" },
  { src: g77a, captionEn: "Range hood service – Humble, TX",   captionEs: "Servicio campana – Humble, TX" },
  { src: g77b, captionEn: "Microwave repair – Pasadena, TX",   captionEs: "Reparación microondas – Pasadena, TX" },
  { src: g79,  captionEn: "Gas range repair – Cypress, TX",    captionEs: "Reparación cocina gas – Cypress, TX" },
  { src: g80,  captionEn: "Electric stove – Spring, TX",       captionEs: "Estufa eléctrica – Spring, TX" },
  { src: g83,  captionEn: "Refrigerator – League City, TX",    captionEs: "Refrigerador – League City, TX" },
  { src: g84,  captionEn: "Washer motor – Stafford, TX",       captionEs: "Motor lavadora – Stafford, TX" },
  { src: g85,  captionEn: "Dryer heating – Missouri City, TX", captionEs: "Calentador secadora – Missouri City, TX" },
  { src: g88,  captionEn: "Control board repair – Katy, TX",   captionEs: "Tarjeta de control – Katy, TX" },
  { src: g90,  captionEn: "Oven element – Sugar Land, TX",     captionEs: "Elemento horno – Sugar Land, TX" },
  { src: g91,  captionEn: "Ice maker repair – Houston, TX",    captionEs: "Reparación máquina hielo – Houston, TX" },
  { src: g92,  captionEn: "Appliance tune-up – Baytown, TX",      captionEs: "Mantenimiento general – Baytown, TX" },
  { src: n63,  captionEn: "Gas range burners – Houston, TX",      captionEs: "Quemadores cocina gas – Houston, TX" },
  { src: n65,  captionEn: "Oven heating element – Katy, TX",      captionEs: "Elemento calefactor horno – Katy, TX" },
  { src: n73,  captionEn: "Oven error code – Sugar Land, TX",     captionEs: "Código de error horno – Sugar Land, TX" },
  { src: n78,  captionEn: "Dishwasher spring – Pearland, TX",     captionEs: "Resorte lavavajillas – Pearland, TX" },
  { src: n84,  captionEn: "LG dishwasher door – The Woodlands, TX", captionEs: "Puerta lavavajillas LG – The Woodlands, TX" },
  { src: n85a, captionEn: "GE washer front-load – Humble, TX",    captionEs: "Lavadora GE carga frontal – Humble, TX" },
  { src: n85b, captionEn: "LG dishwasher pull-out – Pasadena, TX",captionEs: "Desmontaje lavavajillas LG – Pasadena, TX" },
  { src: n86a, captionEn: "Gas range service – Cypress, TX",      captionEs: "Servicio cocina gas – Cypress, TX" },
  { src: n86b, captionEn: "Under-counter dishwasher – Spring, TX",captionEs: "Lavavajillas bajo encimera – Spring, TX" },
  { src: n87,  captionEn: "GE gas range – League City, TX",       captionEs: "Cocina gas GE – League City, TX" },
  { src: b1a,  captionEn: "Refrigerator coils – Stafford, TX",       captionEs: "Bobinas refrigerador – Stafford, TX" },
  { src: b1b,  captionEn: "Dryer drum repair – Missouri City, TX",    captionEs: "Tambor secadora – Missouri City, TX" },
  { src: b1c,  captionEn: "Washer pump – Pearland, TX",               captionEs: "Bomba lavadora – Pearland, TX" },
  { src: b1d,  captionEn: "Washer door seal – Baytown, TX",           captionEs: "Sello puerta lavadora – Baytown, TX" },
  { src: b2a,  captionEn: "Oven thermostat – Sugar Land, TX",         captionEs: "Termostato horno – Sugar Land, TX" },
  { src: b2b,  captionEn: "Dishwasher pump – Katy, TX",               captionEs: "Bomba lavavajillas – Katy, TX" },
  { src: b2c,  captionEn: "Refrigerator door – Spring, TX",           captionEs: "Puerta refrigerador – Spring, TX" },
  { src: b3a,  captionEn: "Gas range igniter – Humble, TX",           captionEs: "Encendedor cocina gas – Humble, TX" },
  { src: b3b,  captionEn: "Dryer belt replacement – Cypress, TX",     captionEs: "Cambio correa secadora – Cypress, TX" },
  { src: b3c,  captionEn: "Washer bearing – The Woodlands, TX",       captionEs: "Rodamiento lavadora – The Woodlands, TX" },
  { src: b3d,  captionEn: "Oven control board – League City, TX",     captionEs: "Tarjeta horno – League City, TX" },
  { src: b3e,  captionEn: "Microwave magnetron – Houston, TX",        captionEs: "Magnetrón microondas – Houston, TX" },
  { src: b4a,  captionEn: "Refrigerator fan motor – Pasadena, TX",   captionEs: "Motor ventilador refrigerador – Pasadena, TX" },
  { src: b4b,  captionEn: "Range element – Pearland, TX",             captionEs: "Elemento estufa – Pearland, TX" },
  { src: b4c,  captionEn: "Dishwasher spray arm – Katy, TX",         captionEs: "Brazo aspersor lavavajillas – Katy, TX" },
  { src: b4d,  captionEn: "Washer agitator – Sugar Land, TX",        captionEs: "Agitador lavadora – Sugar Land, TX" },
  { src: b4e,  captionEn: "Dryer thermal fuse – Spring, TX",         captionEs: "Fusible térmico secadora – Spring, TX" },
  { src: b4f,  captionEn: "Oven bake element – Cypress, TX",         captionEs: "Elemento hornear – Cypress, TX" },
  { src: b5a,  captionEn: "Ice maker module – Houston, TX",          captionEs: "Módulo máquina hielo – Houston, TX" },
  { src: b5b,  captionEn: "Refrigerator compressor – Humble, TX",    captionEs: "Compresor refrigerador – Humble, TX" },
  { src: c8a,  captionEn: "Capacitor replacement – Houston, TX",     captionEs: "Cambio de capacitor – Houston, TX" },
  { src: c9a,  captionEn: "Control board PCB – Katy, TX",            captionEs: "Tarjeta PCB control – Katy, TX" },
  { src: c10a, captionEn: "Burnt component repair – Sugar Land, TX", captionEs: "Reparación componente quemado – Sugar Land, TX" },
  { src: c10b, captionEn: "LG top-load washer – Pearland, TX",       captionEs: "Lavadora LG carga superior – Pearland, TX" },
  { src: c10c, captionEn: "Whirlpool control board – Cypress, TX",   captionEs: "Tarjeta Whirlpool – Cypress, TX" },
  { src: c10d, captionEn: "Capacitor repair – Spring, TX",           captionEs: "Reparación capacitor – Spring, TX" },
  { src: d10e, captionEn: "Control board diagnostics – Houston, TX",   captionEs: "Diagnóstico tarjeta control – Houston, TX" },
  { src: d11a, captionEn: "LG washer LE2 error – Katy, TX",            captionEs: "Error LE2 lavadora LG – Katy, TX" },
  { src: d11b, captionEn: "Capacitor swap – Sugar Land, TX",           captionEs: "Cambio capacitor – Sugar Land, TX" },
  { src: d11c, captionEn: "IC chip replacement – Pearland, TX",        captionEs: "Cambio chip IC – Pearland, TX" },
  { src: d12a, captionEn: "Oven PCB repair – The Woodlands, TX",       captionEs: "Reparación PCB horno – The Woodlands, TX" },
  { src: d12b, captionEn: "Burnt resistor repair – Humble, TX",        captionEs: "Reparación resistor quemado – Humble, TX" },
  { src: d13a, captionEn: "Whirlpool control board – Pasadena, TX",    captionEs: "Tarjeta Whirlpool – Pasadena, TX" },
  { src: d14a, captionEn: "LG washer error code – Cypress, TX",        captionEs: "Código error lavadora LG – Cypress, TX" },
  { src: d14b, captionEn: "Gas burner disassembly – Spring, TX",       captionEs: "Desmontaje quemador gas – Spring, TX" },
  { src: d15a, captionEn: "Transformer coil repair – League City, TX", captionEs: "Reparación bobina transformador – League City, TX" },
  { src: d17a, captionEn: "Gas range burner cap – Houston, TX",        captionEs: "Tapa quemador cocina gas – Houston, TX" },
  { src: d17b, captionEn: "SMD board soldering – Stafford, TX",        captionEs: "Soldadura placa SMD – Stafford, TX" },
  { src: d18a, captionEn: "LG washer & dryer set – Missouri City, TX", captionEs: "Set lavadora y secadora LG – Missouri City, TX" },
  { src: d19a, captionEn: "Relay board repair – Baytown, TX",          captionEs: "Reparación tarjeta relay – Baytown, TX" },
  { src: d20a, captionEn: "Side-by-side refrigerator – Katy, TX",      captionEs: "Refrigerador side-by-side – Katy, TX" },
  { src: d21a, captionEn: "Dryer motor capacitor – Sugar Land, TX",    captionEs: "Capacitor motor secadora – Sugar Land, TX" },
  { src: d21b, captionEn: "Double line break board – Pearland, TX",    captionEs: "Tarjeta doble línea – Pearland, TX" },
  { src: d23a, captionEn: "Electrolux control module – Cypress, TX",   captionEs: "Módulo control Electrolux – Cypress, TX" },
  { src: d24a, captionEn: "LG washer error display – Spring, TX",      captionEs: "Display error lavadora LG – Spring, TX" },
  { src: d26a, captionEn: "Wiring harness repair – The Woodlands, TX", captionEs: "Reparación arnés eléctrico – The Woodlands, TX" },
  { src: e32a, captionEn: "Multimeter diagnostics – Houston, TX",      captionEs: "Diagnóstico multímetro – Houston, TX" },
  { src: e32b, captionEn: "Whirlpool french door fridge – Katy, TX",   captionEs: "Refrigerador Whirlpool – Katy, TX" },
  { src: e32c, captionEn: "Water inlet valve – Sugar Land, TX",        captionEs: "Válvula de entrada agua – Sugar Land, TX" },
  { src: e32d, captionEn: "Thermostat KSD1 – Pearland, TX",            captionEs: "Termostato KSD1 – Pearland, TX" },
  { src: e34a, captionEn: "Water valve inspection – The Woodlands, TX",captionEs: "Inspección válvula agua – The Woodlands, TX" },
  { src: e35a, captionEn: "Dryer wiring connector – Humble, TX",       captionEs: "Conector cableado secadora – Humble, TX" },
  { src: e35b, captionEn: "Elan sensor board – Pasadena, TX",          captionEs: "Tarjeta sensor Elan – Pasadena, TX" },
  { src: e36a, captionEn: "Refrigerator liner leak – Cypress, TX",     captionEs: "Fuga liner refrigerador – Cypress, TX" },
  { src: e36b, captionEn: "Control sub-board – Spring, TX",            captionEs: "Subtarjeta control – Spring, TX" },
  { src: e36c, captionEn: "Built-in refrigerator – League City, TX",   captionEs: "Refrigerador empotrado – League City, TX" },
  { src: e37a, captionEn: "Burnt solder joints – Houston, TX",         captionEs: "Soldadura quemada – Houston, TX" },
  { src: e38a, captionEn: "Burnt terminal block – Stafford, TX",       captionEs: "Bloque terminal quemado – Stafford, TX" },
  { src: e38b, captionEn: "Dryer motor switch – Missouri City, TX",    captionEs: "Interruptor motor secadora – Missouri City, TX" },
  { src: e38c, captionEn: "Appliance control harness – Baytown, TX",   captionEs: "Arnés control equipo – Baytown, TX" },
  { src: e38d, captionEn: "Control board solder side – Katy, TX",      captionEs: "Lado soldadura tarjeta – Katy, TX" },
  { src: e39a, captionEn: "AC unit control board – Sugar Land, TX",    captionEs: "Tarjeta control AC – Sugar Land, TX" },
  { src: e40a, captionEn: "Elan sensor module – Pearland, TX",         captionEs: "Módulo sensor Elan – Pearland, TX" },
  { src: e40b, captionEn: "Whirlpool control module – Cypress, TX",    captionEs: "Módulo control Whirlpool – Cypress, TX" },
  { src: f43a, captionEn: "Dryer diagnostics in garage – Katy, TX",    captionEs: "Diagnóstico secadora en garaje – Katy, TX" },
  { src: f43b, captionEn: "Refrigerator condenser coils – Houston, TX", captionEs: "Serpentines condensador – Houston, TX" },
  { src: f43c, captionEn: "Appliance wiring relay module – Pearland, TX", captionEs: "Módulo relé cableado – Pearland, TX" },
  { src: f43d, captionEn: "Power board C0411 – Sugar Land, TX",         captionEs: "Placa de potencia C0411 – Sugar Land, TX" },
  { src: f43e, captionEn: "Whirlpool W11578563 wiring – Spring, TX",   captionEs: "Cableado Whirlpool W11578563 – Spring, TX" },
  { src: f44a, captionEn: "Range back panel inspection – Humble, TX",  captionEs: "Inspección panel trasero estufa – Humble, TX" },
  { src: f44b, captionEn: "PCB burnt trace repair – The Woodlands, TX",captionEs: "Reparación traza quemada PCB – The Woodlands, TX" },
  { src: f45a, captionEn: "Kenmore dryer repair – Katy, TX",           captionEs: "Reparación secadora Kenmore – Katy, TX" },
  { src: f45b, captionEn: "Compressor wiring R134a – Pasadena, TX",    captionEs: "Cableado compresor R134a – Pasadena, TX" },
  { src: f45c, captionEn: "Toroidal inductor soldering – Cypress, TX", captionEs: "Soldadura inductor toroidal – Cypress, TX" },
  { src: f45d, captionEn: "Control module W11578563 – Missouri City, TX", captionEs: "Módulo control W11578563 – Missouri City, TX" },
  { src: f46a, captionEn: "Inductor & capacitor repair – League City, TX", captionEs: "Reparación inductor y capacitor – League City, TX" },
  { src: f46b, captionEn: "Whirlpool module wiring – Baytown, TX",     captionEs: "Cableado módulo Whirlpool – Baytown, TX" },
  { src: f47a, captionEn: "Dryer back valve connections – Stafford, TX", captionEs: "Conexiones válvula secadora – Stafford, TX" },
  { src: g59a, captionEn: "Refrigerator LED lighting – Houston, TX",    captionEs: "Iluminación LED refrigerador – Houston, TX" },
  { src: g60a, captionEn: "LG washer control board – Katy, TX",         captionEs: "Tarjeta control lavadora LG – Katy, TX" },
  { src: g60b, captionEn: "Viking professional gas range – Sugar Land, TX", captionEs: "Cocina Viking profesional – Sugar Land, TX" },
  { src: g61a, captionEn: "Top-load washer water valves – Pearland, TX",captionEs: "Válvulas lavadora tina – Pearland, TX" },
  { src: g62a, captionEn: "LG washer board – second angle – Cypress, TX",captionEs: "Tarjeta LG – segundo ángulo – Cypress, TX" },
  { src: g62b, captionEn: "Refrigerator door LED strip – Spring, TX",   captionEs: "Franja LED puerta refrigerador – Spring, TX" },
  { src: g62c, captionEn: "Washer tub & motor assembly – Humble, TX",   captionEs: "Tina y motor lavadora – Humble, TX" },
  { src: g63a, captionEn: "Whirlpool FSP board 4452890 – The Woodlands, TX", captionEs: "Tarjeta Whirlpool FSP 4452890 – The Woodlands, TX" },
  { src: g63b, captionEn: "Washer motor pump assembly – League City, TX",captionEs: "Bomba motor lavadora – League City, TX" },
  { src: g64a, captionEn: "Direct drive motor hub – Pasadena, TX",      captionEs: "Cubo motor directo – Pasadena, TX" },
  { src: g64b, captionEn: "Whirlpool WP540-0102 board – Baytown, TX",   captionEs: "Tarjeta Whirlpool WP540 – Baytown, TX" },
  { src: g64c, captionEn: "GE Appliances WiFi module – Missouri City, TX", captionEs: "Módulo WiFi GE Appliances – Missouri City, TX" },
  { src: g65a, captionEn: "LG EBR8019 board (dusty) – Stafford, TX",   captionEs: "Tarjeta LG EBR8019 polvosa – Stafford, TX" },
  { src: g65b, captionEn: "Appliance shock hazard warning – Houston, TX",captionEs: "Advertencia peligro eléctrico – Houston, TX" },
  { src: g66a, captionEn: "LG Electronics main board – Katy, TX",       captionEs: "Tarjeta principal LG Electronics – Katy, TX" },
  { src: g66b, captionEn: "Direct drive motor stator – Sugar Land, TX", captionEs: "Estátor motor directo – Sugar Land, TX" },
  { src: g69a, captionEn: "Oven control board connector – Pearland, TX",captionEs: "Conector tarjeta horno – Pearland, TX" },
  { src: g70a, captionEn: "AMC transformer component – Cypress, TX",    captionEs: "Transformador AMC – Cypress, TX" },
  { src: g70b, captionEn: "Oven board solder edge – Spring, TX",        captionEs: "Borde soldadura tarjeta horno – Spring, TX" },
  { src: g72a, captionEn: "Power transformer repair – Humble, TX",      captionEs: "Reparación transformador – Humble, TX" },
  { src: h58a, captionEn: "Burnt burner coil socket replaced – League City, TX",  captionEs: "Toma bobina quemada reemplazada – League City, TX" },
  { src: h65a, captionEn: "Kenmore wall oven at 350°F – Katy, TX",                captionEs: "Horno empotrado Kenmore a 350°F – Katy, TX" },
  { src: h71a, captionEn: "Samwha 450V 47µF capacitor close-up – Sugar Land, TX", captionEs: "Capacitor Samwha 450V 47µF – Sugar Land, TX" },
  { src: h71b, captionEn: "PCB solder-side edge inspection – Pearland, TX",       captionEs: "Inspección cara suelda PCB – Pearland, TX" },
  { src: h73a, captionEn: "New LG control board installed – Missouri City, TX",   captionEs: "Tarjeta LG nueva instalada – Missouri City, TX" },
  { src: h73b, captionEn: "Samsung dryer HE error code – Stafford, TX",           captionEs: "Código error HE secadora Samsung – Stafford, TX" },
  { src: h74a, captionEn: "Samsung dryer 9L error diagnosis – Friendswood, TX",   captionEs: "Diagnóstico error 9L secadora Samsung – Friendswood, TX" },
  { src: h74b, captionEn: "Control board repair with capacitor kit – Baytown, TX", captionEs: "Reparación tarjeta con kit condensadores – Baytown, TX" },
  { src: h75a, captionEn: "Ground wire reconnected on control board – Cypress, TX", captionEs: "Cable tierra reconectado en tarjeta – Cypress, TX" },
  { src: h76a, captionEn: "Samsung dishwasher service call – Spring, TX",          captionEs: "Servicio lavavajillas Samsung – Spring, TX" },
  { src: h79a, captionEn: "Electrolytic capacitor replacement – Tomball, TX",     captionEs: "Reemplazo condensador electrolítico – Tomball, TX" },
  { src: h80a, captionEn: "Dishwasher door spring & hinge repair – The Woodlands, TX", captionEs: "Reparación resorte y bisagra puerta – The Woodlands, TX" },
  { src: h80b, captionEn: "Main control board replacement – Conroe, TX",          captionEs: "Reemplazo tarjeta principal – Conroe, TX" },
  { src: h81a, captionEn: "Samsung front-load dryer open for inspection – Galveston, TX", captionEs: "Secadora carga frontal Samsung abierta – Galveston, TX" },
  { src: h81b, captionEn: "Burnt fuse & capacitor identified – Humble, TX",       captionEs: "Fusible y capacitor quemados identificados – Humble, TX" },
  { src: h85a, captionEn: "Dryer high-limit thermostat 352°F – Deer Park, TX",    captionEs: "Termostato límite secadora 352°F – Deer Park, TX" },
  { src: h88a, captionEn: "Refrigerator evaporator fan motor – Pasadena, TX",     captionEs: "Motor ventilador evaporador refrigerador – Pasadena, TX" },
  { src: h90a, captionEn: "High-voltage relay board service – La Porte, TX",      captionEs: "Servicio tablero relé alto voltaje – La Porte, TX" },
  { src: h91a, captionEn: "Dryer thermal cutoff replaced – Channelview, TX",      captionEs: "Fusible térmico secadora reemplazado – Channelview, TX" },
  { src: i55a, captionEn: "Spitfire control board capacitor replaced – Katy, TX",  captionEs: "Capacitor tarjeta Spitfire reemplazado – Katy, TX" },
  { src: i55b, captionEn: "Burnt terminal contacts close-up – Pearland, TX",       captionEs: "Terminales quemados en detalle – Pearland, TX" },
  { src: i55c, captionEn: "Whirlpool board W10739408 identified – Sugar Land, TX", captionEs: "Tarjeta Whirlpool W10739408 identificada – Sugar Land, TX" },
  { src: i57a, captionEn: "Faulty igniter wire on gas range – Friendswood, TX",    captionEs: "Cable encendedor defectuoso en cocina – Friendswood, TX" },
  { src: i57b, captionEn: "Whirlpool washer control panel service – Missouri City, TX", captionEs: "Servicio panel control lavadora Whirlpool – Missouri City, TX" },
  { src: i62a, captionEn: "6-burner gas range all burners verified – Stafford, TX", captionEs: "Cocina 6 quemadores verificados – Stafford, TX" },
  { src: i83a,  captionEn: "Wiring harness inspection inside appliance – Baytown, TX",         captionEs: "Inspección arnés cableado interior – Baytown, TX" },
  { src: new1a, captionEn: "Samsung FDR main control board diagnosis – Houston, TX",          captionEs: "Diagnóstico tarjeta principal Samsung FDR – Houston, TX" },
  { src: new2a, captionEn: "Samsung refrigerator inverter board inspection – Katy, TX",       captionEs: "Inspección tarjeta inversora refrigerador Samsung – Katy, TX" },
  { src: new3a, captionEn: "High-voltage capacitor replacement on inverter board – Sugar Land, TX", captionEs: "Reemplazo capacitor alto voltaje en tarjeta inversora – Sugar Land, TX" },
  { src: new4a, captionEn: "Samsung SmartThings WiFi module replaced – Pearland, TX",         captionEs: "Módulo WiFi SmartThings Samsung reemplazado – Pearland, TX" },
  { src: new5a, captionEn: "Samsung SmartThings display panel diagnosis – The Woodlands, TX", captionEs: "Diagnóstico panel SmartThings Samsung – The Woodlands, TX" },
  { src: new6a, captionEn: "Samsung FDR board component detail – Missouri City, TX",          captionEs: "Detalle componentes tarjeta Samsung FDR – Missouri City, TX" },
  { src: new7a, captionEn: "Washer inverter board with heat sink – Stafford, TX",             captionEs: "Tarjeta inversora lavadora con disipador – Stafford, TX" },
  { src: new8a, captionEn: "Samsung refrigerator main board replacement – Cypress, TX",       captionEs: "Reemplazo tarjeta principal refrigerador Samsung – Cypress, TX" },
];

const GALLERY_PLACEHOLDER_COUNT = 8;

const SOCIALS = [
  { icon: <FaFacebook   className="h-4 w-4" />, href: "https://www.facebook.com/profile.php?id=61589369241020",  label: "Facebook",  bg: "#1877F2" },
  { icon: <FaInstagram  className="h-4 w-4" />, href: "https://www.instagram.com/htrgroupllc/", label: "Instagram", bg: "linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)" },
  { icon: <FaTiktok     className="h-4 w-4" />, href: "https://www.tiktok.com/@htrgroupllc", label: "TikTok", bg: "#010101" },
  { icon: <FaLinkedinIn className="h-4 w-4" />, href: "https://www.linkedin.com/in/eivaz-rakhmanov-010013401", label: "LinkedIn", bg: "#0A66C2" },
  { icon: <FaYoutube    className="h-4 w-4" />, href: "https://www.youtube.com/",   label: "YouTube",   bg: "#FF0000" },
];

// ALL_REVIEWS imported from ../data/reviews (300 entries, rotated daily)

/* ── Certifications (pre-processed images with name redacted) ────── */
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

/* ── Draggable infinite marquee ──────────────────────────────────── */
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
  // Compute Houston (CDT) time; if >= 17:00 default to tomorrow
  const _houstonNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const _minBooking = new Date(_houstonNow);
  if (_houstonNow.getHours() >= 17) _minBooking.setDate(_minBooking.getDate() + 1);
  _minBooking.setHours(0, 0, 0, 0);
  const [bMonth, setBMonth] = useState(_minBooking.getMonth() + 1);
  const [bDay,   setBDay]   = useState(_minBooking.getDate());
  const [bYear,  setBYear]  = useState(_minBooking.getFullYear());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots,  setBookedSlots]  = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [certModal, setCertModal] = useState<{ img: string; label: string } | null>(null);

  const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const TIME_SLOTS = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM"];

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
        setBookedSlots([...new Set([...booked, ...blocked])]);
      })
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false));
  }, []);

  // Skip weekends: if user picks Sat or Sun, jump to next Monday
  useEffect(() => {
    const d   = new Date(bYear, bMonth - 1, bDay);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) {
      const skip = dow === 6 ? 2 : 1; // Sat→+2, Sun→+1
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

  // Show 8 reviews per day (2 rows × 4 cols), rotating daily
  const _day = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  // Hero overlay card: rotates every 12 hours
  const _halfDay = Math.floor(Date.now() / (12 * 3_600_000));
  const _fiveStar  = ALL_REVIEWS.filter(r => r.category === "5");
  const _fourStar  = ALL_REVIEWS.filter(r => r.category === "4");
  const _recentRev = ALL_REVIEWS.filter(r => r.category === "recent");
  const _overlayReview = _fiveStar[_halfDay % _fiveStar.length];
  const _dailyReview   = _fiveStar[_day % _fiveStar.length];
  const _pickN = (pool: typeof ALL_REVIEWS, n: number) => {
    const start = (_day * n) % pool.length;
    return [...pool.slice(start, start + n), ...pool.slice(0, Math.max(0, start + n - pool.length))];
  };
  // "all" tab: 6 five-star + 2 four-star interleaved (4★ at positions 3 and 7)
  const [f5a,f5b,f5c,f5d,f5e,f5f] = _pickN(_fiveStar, 6);
  const [f4a,f4b]                  = _pickN(_fourStar, 2);
  const _dailyMix = [f5a, f5b, f5c, f4a, f5d, f5e, f5f, f4b];
  const filteredReviews =
    reviewTab === "all"    ? _dailyMix :
    reviewTab === "5"      ? _pickN(_fiveStar, 8) :
    reviewTab === "4"      ? _pickN(_fourStar, 8) :
                             _pickN(_recentRev, 8);

  const handleServiceClick = (svc: typeof SERVICES[0]) => {
    setAppliance(isEs ? svc.appEs : svc.appEn);
    setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
    toast({ title: T.reviewsUpdated, description: T.showingLatest });
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
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");
      const res = await fetch(`${apiBase}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:       data.get("name"),
          phone:      data.get("phone"),
          email:      data.get("email"),
          address:    data.get("address"),
          appliance,
          brandModel,
          date: selectedDateStr,
          time: selectedSlot ?? "",
          message:    data.get("message"),
          lang,
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
      if (!res.ok) throw new Error("server error");
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
          ? "Ocurrió un error. Llámenos al (346) 820-6021."
          : "Something went wrong. Please call us at (346) 820-6021.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden font-sans" style={{ backgroundColor: K.bg, color: K.dark }}>

      {/* ── NAV ── */}
      <div className="htr-header-spacer w-full flex-shrink-0" aria-hidden="true" />
      <header className="htr-site-header-root fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-stone-200 shadow-sm">
        <div className="container mx-auto px-4 htr-site-header-bar flex items-center justify-between gap-3">

          {/* Language switcher — left side */}
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
              HTRGroupTX
            </span>
            <span className="logo-spark logo-spark-1">✦</span>
            <span className="logo-spark logo-spark-2">✦</span>
            <span className="logo-spark logo-spark-3">✦</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-stone-600">
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
          <div className="md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700">
            {["/","#services","#about","#reviews","#faq","#contact"].map((href, i) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="py-2 border-b border-stone-100">{T.nav[i]}</a>
            ))}
            <a href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/blog`} onClick={() => setMenuOpen(false)} className="py-2 border-b border-stone-100" style={{ color: K.accent }}>Blog</a>
            <div className="mt-1"><PhonePair inHeader /></div>
          </div>
        )}
      </header>


      {/* ── PROMO BAR ── */}
      <div className="htr-promo-bar w-full text-center text-xs sm:text-sm md:text-lg font-semibold text-white py-1.5 px-3 leading-snug" style={{ backgroundColor: "#D97706" }}>
        {T.promoBar}
      </div>

      <main className="flex-grow">

        {/* ── HERO ── */}
        <section>

          {/* ════ MOBILE layout (< md): image on top, text below ════ */}
          <div className="block md:hidden">
            {/* Hero image — right-aligned so logo is visible */}
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
                <span className="hero-sparkle hero-sparkle-1" aria-hidden>✦</span>
                <span className="hero-sparkle hero-sparkle-2" aria-hidden>✦</span>
                <span className="hero-sparkle hero-sparkle-3" aria-hidden>✦</span>
                <span className="hero-sparkle hero-sparkle-4" aria-hidden>✦</span>
                <span className="hero-sparkle hero-sparkle-5" aria-hidden>✦</span>
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

          {/* ════ DESKTOP layout (≥ md): text overlay on image ════ */}
          <div className="hidden md:block relative htr-home-hero-desktop">
            <img src={heroImg} alt="Appliance repair" className="w-full block" style={{ display: "block" }} />
            <div className="absolute inset-0" style={{ background: "rgba(11,26,63,0.10)" }} />
            <div className="htr-home-hero-effects absolute inset-0 overflow-visible pointer-events-none" aria-hidden>
              <HeroCircuitEffect />
              <div className="hero-pulse-ring" />
              <div className="hero-pulse-ring-2" />
              <div className="hero-rotate-glow" />
              <span className="hero-sparkle hero-sparkle-1" aria-hidden>✦</span>
              <span className="hero-sparkle hero-sparkle-2" aria-hidden>✦</span>
              <span className="hero-sparkle hero-sparkle-3" aria-hidden>✦</span>
              <span className="hero-sparkle hero-sparkle-4" aria-hidden>✦</span>
              <span className="hero-sparkle hero-sparkle-5" aria-hidden>✦</span>
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

        {/* ── TRUST BAR ── */}
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


        {/* ── SERVICES ── */}
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
                    {isEs ? "Reservar →" : "Book →"}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
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

        {/* ── WHY US ── */}
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[2fr_3fr] gap-8 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="relative">
                <img src={whyUsBgImg} alt="Appliance repair" className="rounded-xl shadow-lg w-full object-cover aspect-[4/3]" />

                {/* Google review overlay card — rotates every 12 h */}
                <div className="absolute bottom-4 right-4 max-w-[260px] bg-transparent border-0 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 drop-shadow"
                      style={{ backgroundColor: _overlayReview.avatarColor }}>
                      {_overlayReview.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white leading-tight drop-shadow">{_overlayReview.name}</p>
                      <p className="text-[10px] text-white/80 leading-tight drop-shadow">{_overlayReview.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-1.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 drop-shadow" />
                    ))}
                  </div>
                  <p className="text-[11px] text-white leading-relaxed line-clamp-2 drop-shadow">
                    "{isEs ? _overlayReview.textEs : _overlayReview.textEn}"
                  </p>
                </div>
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

        {/* ── OUR WORK ── */}
        <section id="gallery" className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[2fr_3fr] gap-8 items-center">

              {/* LEFT — photo */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="relative">
                <a href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/gallery`} className="block rounded-xl overflow-hidden shadow-lg group">
                  <img
                    src={GALLERY_PHOTOS[0].src}
                    alt={isEs ? GALLERY_PHOTOS[0].captionEs : GALLERY_PHOTOS[0].captionEn}
                    className="w-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </a>
                {/* review overlay */}
                <div className="absolute bottom-4 right-4 max-w-[220px] bg-transparent border-0 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 drop-shadow"
                      style={{ backgroundColor: _dailyReview.avatarColor }}>
                      {_dailyReview.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white leading-tight drop-shadow">{_dailyReview.name}</p>
                      <p className="text-[10px] text-white/80 leading-tight drop-shadow">{_dailyReview.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-1.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 drop-shadow" />)}
                  </div>
                  <p className="text-[11px] text-white leading-relaxed line-clamp-2 drop-shadow">
                    "{isEs ? _dailyReview.textEs : _dailyReview.textEn}"
                  </p>
                </div>
              </motion.div>

              {/* RIGHT — content */}
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2">{T.galleryH2}</h2>
                <div className="h-1 w-12 mb-4 rounded-full" style={{ backgroundColor: K.accent }} />
                <p className="text-stone-500 text-sm leading-relaxed">{T.gallerySub}</p>
              </div>

            </div>
          </div>
        </section>

        <MidPhoneStrip />

        {/* ── OUR CERTIFICATIONS ── */}
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
                    ? "Todos nuestros técnicos están asegurados y certificados por la EPA."
                    : "All our technicians are insured and EPA-certified for your peace of mind."}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── HOW WE WORK (PROCESS) ── */}
        <section className="py-12" style={{ backgroundColor: K.bg }}>
          <div className="container mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold">{T.processH2}</h2>
              <div className="h-1 w-14 mx-auto mt-2 rounded-full" style={{ backgroundColor: K.accent }} />
              <p className="text-stone-500 text-sm mt-2">{T.processSub}</p>
            </div>

            <div className="relative">
              {/* Connector line – visible on md+ */}
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

        {/* ── GOOGLE REVIEWS ── */}
        <section id="reviews" className="py-10" style={{ backgroundColor: K.bg }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-extrabold">{T.reviewsH2}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
                  <span className="text-sm font-semibold text-stone-600">5.0 · {T.reviewsBased}</span>
                  <span className="text-lg font-bold text-[#4285F4]">G</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href="https://google.com/maps" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded border border-stone-300 hover:bg-stone-100 transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" /> {T.writeReview}
                </a>
                <button onClick={handleRefresh} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded text-white transition-opacity hover:opacity-80" style={{ backgroundColor: K.accent }}>
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> {T.refresh}
                </button>
              </div>
            </div>

            <div className="flex gap-1 mb-5 bg-white rounded-lg p-1 w-fit shadow-sm border border-stone-200">
              {(["all","5","4","recent"] as Tab[]).map((key, i) => (
                <button key={key} onClick={() => setReviewTab(key)}
                  className="px-3 py-1.5 rounded text-xs font-semibold transition-all"
                  style={reviewTab === key ? { backgroundColor: K.accent, color: "#fff" } : { color: "#57534e" }}>
                  {T.tabLabels[i]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {filteredReviews.map((r, i) => (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
                  className="bg-white rounded-lg p-2.5 shadow-sm border border-stone-100 flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: r.avatarColor }}>{r.initials}</div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-stone-900 truncate">{r.name}</p>
                        <p className="text-[10px] text-stone-400 leading-none">{r.time}</p>
                      </div>
                    </div>
                    <span className="text-[#4285F4] font-bold text-base leading-none flex-shrink-0">G</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-stone-600 text-[11px] leading-snug flex-1 line-clamp-4">{isEs ? r.textEs : r.textEn}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
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

        {/* ── BRANDS WE SERVICE ── */}
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

        {/* ── CTA BANNER ── */}
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

        {/* ── CONTACT ── */}
        <section id="contact" ref={contactRef} className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-6 w-6" style={{ color: K.accent }} />
                  <span className="text-xl font-extrabold">HTR<span style={{ color: K.accent }}>GroupTX</span></span>
                </div>
                <a href="#services" className="inline-block text-white font-bold px-5 py-2 uppercase tracking-widest text-xs rounded mb-6 hover:opacity-80 transition-opacity" style={{ backgroundColor: K.accent }}>
                  {T.learnMore}
                </a>
                <h3 className="font-bold uppercase tracking-wider text-xs mb-3" style={{ color: K.accent }}>{T.contactH2}</h3>
                <ul className="space-y-3 text-sm text-stone-600">
                  <li className="flex items-start gap-2"><span style={{ color: K.accent }}>📍</span> {T.address}</li>
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
                  {/* Home Address */}
                  <input name="address" type="text" required
                    placeholder={T.addressPh}
                    className="w-full border border-stone-200 bg-white rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": K.accent } as React.CSSProperties} />
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
                  {/* Brand & Model — filtered by selected appliance */}
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
                          <option key={`${brand}__${m}`} value={`${brand} — ${m}`}>{m}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {/* Preferred date — Month / Day / Year */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <select value={bMonth} onChange={e => { const m = +e.target.value; setBMonth(m); const max = new Date(bYear, m, 0).getDate(); if (bDay > max) setBDay(max); }}
                      className="border border-stone-200 bg-white rounded px-2 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": K.accent } as React.CSSProperties}>
                      {MONTHS_SHORT.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
                    </select>
                    <select value={bDay} onChange={e => setBDay(+e.target.value)}
                      className="border border-stone-200 bg-white rounded px-2 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": K.accent } as React.CSSProperties}>
                      {Array.from({ length: new Date(bYear, bMonth, 0).getDate() }, (_, i) => i + 1).map(d => {
                        const opt = new Date(bYear, bMonth - 1, d);
                        opt.setHours(0, 0, 0, 0);
                        return <option key={d} value={d} disabled={opt < _minBooking}>{d}</option>;
                      })}
                    </select>
                    <select value={bYear} onChange={e => setBYear(+e.target.value)}
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
                      <div className="text-xs text-stone-400 py-2">{isEs ? "Cargando horarios…" : "Loading availability…"}</div>
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
                              {booked ? `${slot} ✗` : slot}
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
                      ? "El tiempo de viaje hasta su ubicación puede superar una hora — el técnico podría llegar después de la hora seleccionada."
                      : "Travel time to your location may exceed one hour — the technician may arrive after the selected time."}
                  </p>
                  {/* Message */}
                  <textarea name="message" rows={3}
                    placeholder={T.descPh}
                    className="w-full border border-stone-200 bg-white rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
                    style={{ "--tw-ring-color": K.accent } as React.CSSProperties} />
                  <button type="submit" disabled={submitting}
                    className="w-full text-white font-bold py-3 rounded uppercase tracking-widest text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: K.accent }}>
                    {submitting ? (isEs ? "Enviando…" : "Sending…") : T.requestBtn}
                  </button>
                </form>
              </div>
            </div>

            {/* ── SERVICE AREA MAP ── */}
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
                    📍 {city}
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
          <div className="htr-phone-pair--row flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-sm">
            <a href={COMPANY_PHONE_HREF} className="htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" style={{ color: K.accentLight }} /> {COMPANY_PHONE_DISPLAY}
            </a>
      <a href={PHONE_HREF} className="htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" style={{ color: K.accentLight }} /> {PHONE_DISPLAY}
            </a>
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

      {/* ── CERT LIGHTBOX ── */}
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
