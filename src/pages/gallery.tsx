import React, { useState, useCallback, useEffect } from "react";
import AdminSecretAccess from "@/components/AdminSecretAccess";
import {
  clearGalleryAdminOpenQueue,
  consumeGalleryAdminOpen,
  onGlobeSecretClick,
} from "@/lib/gallerySecretUnlock";
import GalleryPhotoManager from "@/components/GalleryPhotoManager";
import { motion } from "framer-motion";
import { Phone, Wrench, Globe, X, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";
import { FaFacebook, FaInstagram, FaTiktok, FaLinkedinIn, FaYoutube } from "react-icons/fa";

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

import { PHONE_DISPLAY, PHONE_HREF, COMPANY_PHONE_DISPLAY, COMPANY_PHONE_HREF } from "@/lib/sitePhones";
const API = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

interface DynamicPhoto {
  id: number;
  filename: string;
  caption_en: string;
  caption_es: string;
}

const K = {
  accent:      "#1B6FE8",
  accentDark:  "#0D47B0",
  accentLight: "#62B6FF",
  bg:          "#EFF6FF",
  dark:        "#0B1A3F",
};

const FADE_UP = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const GALLERY_PHOTOS = [
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
  { src: i83a, captionEn: "Wiring harness inspection inside appliance – Baytown, TX",         captionEs: "Inspección arnés cableado interior – Baytown, TX" },
  { src: new1a, captionEn: "Samsung FDR main control board diagnosis – Houston, TX",          captionEs: "Diagnóstico tarjeta principal Samsung FDR – Houston, TX" },
  { src: new2a, captionEn: "Samsung refrigerator inverter board inspection – Katy, TX",       captionEs: "Inspección tarjeta inversora refrigerador Samsung – Katy, TX" },
  { src: new3a, captionEn: "High-voltage capacitor replacement on inverter board – Sugar Land, TX", captionEs: "Reemplazo capacitor alto voltaje en tarjeta inversora – Sugar Land, TX" },
  { src: new4a, captionEn: "Samsung SmartThings WiFi module replaced – Pearland, TX",         captionEs: "Módulo WiFi SmartThings Samsung reemplazado – Pearland, TX" },
  { src: new5a, captionEn: "Samsung SmartThings display panel diagnosis – The Woodlands, TX", captionEs: "Diagnóstico panel SmartThings Samsung – The Woodlands, TX" },
  { src: new6a, captionEn: "Samsung FDR board component detail – Missouri City, TX",          captionEs: "Detalle componentes tarjeta Samsung FDR – Missouri City, TX" },
  { src: new7a, captionEn: "Washer inverter board with heat sink – Stafford, TX",             captionEs: "Tarjeta inversora lavadora con disipador – Stafford, TX" },
  { src: new8a, captionEn: "Samsung refrigerator main board replacement – Cypress, TX",       captionEs: "Reemplazo tarjeta principal refrigerador Samsung – Cypress, TX" },
];

const SOCIALS = [
  { icon: <FaFacebook   className="h-4 w-4" />, href: "https://www.facebook.com/profile.php?id=61589369241020",  label: "Facebook",  bg: "#1877F2" },
  { icon: <FaInstagram  className="h-4 w-4" />, href: "https://www.instagram.com/htrgroupllc/", label: "Instagram", bg: "linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)" },
  { icon: <FaTiktok     className="h-4 w-4" />, href: "https://www.tiktok.com/@htrgroupllc",    label: "TikTok",    bg: "#010101" },
  { icon: <FaLinkedinIn className="h-4 w-4" />, href: "https://www.linkedin.com/in/eivaz-rakhmanov-010013401",  label: "LinkedIn",  bg: "#0A66C2" },
  { icon: <FaYoutube    className="h-4 w-4" />, href: "https://www.youtube.com/",   label: "YouTube",   bg: "#FF0000" },
];

type Lang = "en" | "es";

const TR = {
  en: {
    backHome:   "Back to Home",
    pageTitle:  "Our Work",
    pageSub:    "A look at real repairs completed by our certified technicians across the Houston area.",
    bookNow:    "Book Now",
    nav:        ["Home", "Services", "About Us", "Reviews", "FAQ", "Contact"],
    allRights:  "All rights reserved.",
    privacy:    "Privacy Policy",
    terms:      "Terms of Service",
  },
  es: {
    backHome:   "Volver al Inicio",
    pageTitle:  "Nuestro Trabajo",
    pageSub:    "Un vistazo a reparaciones reales completadas por nuestros técnicos certificados en el área de Houston.",
    bookNow:    "Reservar",
    nav:        ["Inicio", "Servicios", "Nosotros", "Reseñas", "FAQ", "Contacto"],
    allRights:  "Todos los derechos reservados.",
    privacy:    "Política de Privacidad",
    terms:      "Términos de Servicio",
  },
};

export default function Gallery() {
  const [lang, setLang]         = useState<Lang>("en");
  const [galleryIdx, setGalleryIdx] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Dynamic photos from backend ──────────────────────────────────────────
  const [dynPhotos,    setDynPhotos]    = useState<DynamicPhoto[]>([]);

  // ── Admin gallery panel state ─────────────────────────────────────────────
  const [adminOpen,    setAdminOpen]    = useState(false);
  const [adminPin,     setAdminPin]     = useState("");
  const [adminAuthed,  setAdminAuthed]  = useState(false);
  const [adminError,   setAdminError]   = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const T    = TR[lang];
  const isEs = lang === "es";
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  // ── Load dynamic photos ───────────────────────────────────────────────────
  const loadDynPhotos = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/gallery/photos`, { cache: "no-store" });
      if (r.ok) setDynPhotos(await r.json() as DynamicPhoto[]);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => { void loadDynPhotos(); }, [loadDynPhotos]);

  const openGalleryAdmin = useCallback(() => {
    setAdminOpen(true);
    setAdminPin("");
    setAdminError("");
    setAdminAuthed(false);
  }, []);

  useEffect(() => {
    if (consumeGalleryAdminOpen()) openGalleryAdmin();
    else clearGalleryAdminOpenQueue();
  }, [openGalleryAdmin]);

  const handleGlobeClick = useCallback(() => {
    onGlobeSecretClick(openGalleryAdmin);
  }, [openGalleryAdmin]);

  // ── Admin PIN verify ──────────────────────────────────────────────────────
  const handleAdminLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError("");
    try {
      const r = await fetch(`${API}/api/admin/schedule?date=Jan+1,+2026`, {
        headers: { "x-admin-pin": adminPin },
      });
      if (r.status === 401) { setAdminError("Неверный пароль"); setAdminLoading(false); return; }
      setAdminAuthed(true);
      void loadDynPhotos();
    } catch { setAdminError("Ошибка соединения"); }
    setAdminLoading(false);
  }, [adminPin, loadDynPhotos]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Удалить это фото из галереи?")) return;
    try {
      await fetch(`${API}/api/gallery/photo/${id}`, {
        method: "DELETE",
        headers: { "x-admin-pin": adminPin },
      });
      void loadDynPhotos();
    } catch { /* non-fatal */ }
  }, [adminPin, loadDynPhotos]);

  const navHrefs = [`${base}/`, ...["#services", "#about", "#reviews", "#faq", "#contact"].map(h => `${base}/${h}`)];

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: K.bg, color: K.dark }}>

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-stone-200 shadow-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-3">

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              aria-label="Language region"
              className="p-2 -m-1 rounded-md touch-manipulation"
              onClick={handleGlobeClick}
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
          </nav>

          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <div className="header-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end"><a href={COMPANY_PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}</a>
      <a href={PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}</a></div>
            <a href={`${base}/#contact`} className="text-white font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider" style={{ backgroundColor: K.dark }}>
              {T.bookNow}
            </a>
          </div>

          <button className="md:hidden p-2 rounded" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <span className="block w-5 space-y-1"><span className="block h-0.5 bg-stone-700" /><span className="block h-0.5 bg-stone-700" /><span className="block h-0.5 bg-stone-700" /></span>}
          </button>

        <div className="htr-header-mobile-strip md:hidden">
          <div className="container mx-auto px-4 py-2 flex flex-col gap-2">
            <div className="header-phone-pair flex flex-col gap-1.5 items-stretch w-full">
              <a href={COMPANY_PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}</a>
              <a href={PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}</a>
            </div>
            <a href={`${base}/#contact`} className="htr-header-mobile-book text-white font-bold px-3 py-2 rounded text-sm uppercase tracking-wider" style={{ backgroundColor: K.dark }}>
              {T.bookNow}
            </a>
          </div>
        </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700">
            {T.nav.map((label, i) => (
              <a key={label} href={navHrefs[i]} onClick={() => setMenuOpen(false)} className="py-2 border-b border-stone-100">{label}</a>
            ))}
            <div className="header-phone-pair flex flex-row flex-wrap gap-2 mt-1 items-start justify-start"><a href={COMPANY_PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}</a>
      <a href={PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}</a></div>
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

        {/* ── GALLERY GRID ── */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">

              {/* Dynamic (uploaded) photos — shown first */}
              {dynPhotos.map((photo, di) => (
                <div
                  key={`dyn-${photo.id}`}
                  className="rounded-xl overflow-hidden shadow-sm border border-stone-100 group cursor-pointer flex-shrink-0 relative"
                  style={{ width: "142px" }}
                  onClick={() => setGalleryIdx(di)}
                >
                  <div className="overflow-hidden bg-stone-100 relative" style={{ height: "172px" }}>
                    <img
                      src={`${API}/api/gallery/file/${photo.filename}`}
                      alt={isEs ? photo.caption_es : photo.caption_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <svg className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.15 10.15z" />
                      </svg>
                    </div>
                    {/* NEW badge */}
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: K.accent }}>NEW</span>
                    {/* Admin delete button — visible only when admin is authenticated */}
                    {adminAuthed && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(photo.id); }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/90 hover:bg-red-700 transition shadow"
                        title="Удалить фото">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                  <div className="px-2 py-1.5 text-center" style={{ backgroundColor: K.bg, height: "27px" }}>
                    <p className="text-[10px] font-medium text-stone-600 truncate leading-tight">
                      {isEs ? photo.caption_es : photo.caption_en}
                    </p>
                  </div>
                </div>
              ))}

              {/* Static photos */}
              {GALLERY_PHOTOS.map((photo, i) => (
                <motion.div
                  key={`static-${i}`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={FADE_UP}
                  className="rounded-xl overflow-hidden shadow-sm border border-stone-100 group cursor-pointer flex-shrink-0"
                  style={{ width: "142px" }}
                  onClick={() => setGalleryIdx(dynPhotos.length + i)}
                >
                  <div className="overflow-hidden bg-stone-100 relative" style={{ height: "172px" }}>
                    <img
                      src={photo.src}
                      alt={isEs ? photo.captionEs : photo.captionEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <svg className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.15 10.15z" />
                      </svg>
                    </div>
                  </div>
                  <div className="px-2 py-1.5 text-center" style={{ backgroundColor: K.bg, height: "27px" }}>
                    <p className="text-[10px] font-medium text-stone-600 truncate leading-tight">
                      {isEs ? photo.captionEs : photo.captionEn}
                    </p>
                  </div>
                </motion.div>
              ))}

            </div>
          </div>
        </section>

        {/* ── CTA BAND ── */}
        <div className="py-8 text-center" style={{ backgroundColor: K.dark }}>
          <p className="text-white font-bold text-lg mb-3">
            {isEs ? "¿Tiene un electrodoméstico dañado?" : "Got a broken appliance?"}
          </p>
          <div className="htr-phone-pair--row flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={COMPANY_PHONE_HREF} className="htr-phone-btn htr-phone-btn--lg inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base" style={{ backgroundColor: K.accent }}>
              <Phone className="h-4 w-4" /> {COMPANY_PHONE_DISPLAY}
            </a>
      <a href={PHONE_HREF} className="htr-phone-btn htr-phone-btn--lg inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base" style={{ backgroundColor: K.accent }}>
              <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </main>

      {/* ── Gallery Admin Panel ── */}
      {adminOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4"
          onClick={e => { if (e.target === e.currentTarget) { setAdminOpen(false); setAdminAuthed(false); } }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" style={{ color: K.accent }} />
                <span className="font-bold text-stone-800 text-base">Gallery Manager</span>
              </div>
              <button onClick={() => { setAdminOpen(false); setAdminAuthed(false); }}
                className="p-1 rounded hover:bg-stone-100 transition">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* PIN form */}
            {!adminAuthed ? (
              <form onSubmit={handleAdminLogin} className="p-5">
                <p className="text-sm text-stone-500 mb-4">HTRGroupTX · Введите пароль администратора</p>
                <input
                  autoFocus type="password" placeholder="Пароль"
                  value={adminPin} onChange={e => { setAdminPin(e.target.value); setAdminError(""); }}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm mb-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: adminError ? "#ef4444" : "#e2e8f0", "--tw-ring-color": K.accent } as React.CSSProperties}
                />
                {adminError && <p className="text-xs text-red-500 mb-2">{adminError}</p>}
                <button type="submit" disabled={adminLoading || !adminPin}
                  className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition disabled:opacity-50"
                  style={{ background: K.accent }}>
                  {adminLoading ? "Проверка..." : "Войти"}
                </button>
              </form>
            ) : (
              <div className="p-5">
                <GalleryPhotoManager
                  adminPin={adminPin}
                  onPhotosChange={() => void loadDynPhotos()}
                />
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* ── LIGHTBOX ── */}
      {galleryIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setGalleryIdx(null)}
        >
          <button
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/25 rounded-full p-2 md:p-3 transition-colors"
            onClick={e => { e.stopPropagation(); setGalleryIdx((galleryIdx - 1 + dynPhotos.length + GALLERY_PHOTOS.length) % (dynPhotos.length + GALLERY_PHOTOS.length)); }}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <div
            className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={galleryIdx < dynPhotos.length ? `${API}/api/gallery/file/${dynPhotos[galleryIdx].filename}` : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].src}
              alt={isEs ? (galleryIdx < dynPhotos.length ? dynPhotos[galleryIdx].caption_es : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEs) : (galleryIdx < dynPhotos.length ? dynPhotos[galleryIdx].caption_en : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEn)}
              className="max-h-[75vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            />
            <p className="mt-3 text-white/80 text-sm font-medium text-center">
              {isEs ? (galleryIdx < dynPhotos.length ? dynPhotos[galleryIdx].caption_es : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEs) : (galleryIdx < dynPhotos.length ? dynPhotos[galleryIdx].caption_en : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEn)}
            </p>
            <p className="text-white/40 text-xs mt-1">{galleryIdx + 1} / {dynPhotos.length + GALLERY_PHOTOS.length}</p>
          </div>

          <button
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/25 rounded-full p-2 md:p-3 transition-colors"
            onClick={e => { e.stopPropagation(); setGalleryIdx((galleryIdx + 1) % (dynPhotos.length + GALLERY_PHOTOS.length)); }}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>

          <button
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/25 rounded-full p-2 transition-colors"
            onClick={() => setGalleryIdx(null)}
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      )}

      <ChatWidget lang={lang} />
    </div>
  );
}
