export interface BlogPost {
  slug: string;
  imgKey: string;
  date: string;
  readMinutes: number;
  titleEn: string;
  titleEs: string;
  excerptEn: string;
  excerptEs: string;
  bodyEn: string;
  bodyEs: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "5-signs-refrigerator-needs-repair",
    imgKey: "fridge",
    date: "April 5, 2026",
    readMinutes: 4,
    titleEn: "5 Signs Your Refrigerator Needs Repair",
    titleEs: "5 Señales de que tu Refrigerador Necesita Reparación",
    excerptEn: "Is your refrigerator making strange noises or not keeping food cold? Learn the top warning signs before a small problem becomes a costly breakdown.",
    excerptEs: "¿Tu refrigerador hace ruidos extraños o no mantiene los alimentos fríos? Conoce las señales de advertencia antes de que un pequeño problema se convierta en una avería costosa.",
    bodyEn: `
<h2>Why Early Detection Saves Money</h2>
<p>A refrigerator works 24 hours a day, 7 days a week — and like any machine, it will show warning signs before it fails completely. Catching these signs early can mean the difference between a simple repair and a full replacement.</p>

<h2>Sign 1: It's Not Keeping Food Cold Enough</h2>
<p>If your milk spoils faster than usual or leftovers feel warm, your refrigerator isn't maintaining the right temperature. The ideal range is 35–38°F (1.7–3.3°C). This could indicate a failing compressor, dirty condenser coils, or a faulty thermostat.</p>

<h2>Sign 2: Unusual Noises</h2>
<p>Refrigerators are not completely silent, but loud buzzing, rattling, or clicking sounds are a red flag. A clicking sound when the compressor tries to start often means it's failing. Rattling can indicate a loose fan blade or condenser coil issue.</p>

<h2>Sign 3: Excessive Frost or Ice Buildup</h2>
<p>If frost accumulates rapidly inside the freezer compartment, the auto-defrost system may have failed. This includes the defrost heater, thermostat, or timer. Left untreated, ice buildup can damage the evaporator fan and reduce cooling efficiency.</p>

<h2>Sign 4: Water Pooling Under the Fridge</h2>
<p>Water on the floor usually points to a clogged defrost drain or a broken water line. Even a small leak can damage your floors or create a mold problem over time — so don't ignore it.</p>

<h2>Sign 5: The Motor Runs Constantly</h2>
<p>Your refrigerator's compressor should cycle on and off throughout the day. If it runs non-stop, it's working overtime — usually because of dirty condenser coils, poor door seals, or a temperature sensor problem. This spikes your electricity bill and shortens the unit's life.</p>

<h2>What to Do</h2>
<p>If you notice any of these signs, contact a certified appliance technician. At HTRGroupTX, we diagnose and repair all major refrigerator brands in the Houston metropolitan area — often on the same day. Don't wait until your food spoils.</p>
    `,
    bodyEs: `
<h2>Por Qué la Detección Temprana Ahorra Dinero</h2>
<p>Un refrigerador funciona las 24 horas del día, los 7 días de la semana, y como cualquier máquina, mostrará señales de advertencia antes de fallar por completo. Detectar estas señales a tiempo puede ser la diferencia entre una reparación sencilla y un reemplazo costoso.</p>

<h2>Señal 1: No Mantiene los Alimentos Fríos</h2>
<p>Si la leche se echa a perder más rápido de lo normal o las sobras se sienten tibias, tu refrigerador no mantiene la temperatura correcta. El rango ideal es entre 1.7°C y 3.3°C. Esto puede indicar un compresor defectuoso, bobinas condensadoras sucias o un termostato dañado.</p>

<h2>Señal 2: Ruidos Inusuales</h2>
<p>Los refrigeradores no son completamente silenciosos, pero los zumbidos fuertes, traqueteos o clics son una señal de alerta. Un clic cuando el compresor intenta arrancar generalmente significa que está fallando.</p>

<h2>Señal 3: Acumulación Excesiva de Escarcha o Hielo</h2>
<p>Si la escarcha se acumula rápidamente dentro del congelador, el sistema de descongelación automática puede haber fallado. Sin tratamiento, la acumulación de hielo puede dañar el ventilador del evaporador.</p>

<h2>Señal 4: Agua en el Piso</h2>
<p>El agua en el piso generalmente indica un desagüe de descongelación obstruido o una línea de agua rota. Incluso una pequeña fuga puede dañar sus pisos o crear problemas de moho.</p>

<h2>Señal 5: El Motor Funciona Constantemente</h2>
<p>Si el compresor funciona sin parar, está trabajando demasiado, generalmente debido a bobinas condensadoras sucias, sellos de puerta deficientes o un problema con el sensor de temperatura. Esto aumenta su factura de electricidad y acorta la vida útil del aparato.</p>

<h2>Qué Hacer</h2>
<p>Si nota alguna de estas señales, contacte a un técnico certificado. En HTRGroupTX, diagnosticamos y reparamos todas las marcas principales de refrigeradores en el área metropolitana de Houston, frecuentemente el mismo día.</p>
    `,
  },
  {
    slug: "extend-washing-machine-life",
    imgKey: "washer",
    date: "April 3, 2026",
    readMinutes: 5,
    titleEn: "How to Extend the Life of Your Washing Machine",
    titleEs: "Cómo Prolongar la Vida de tu Lavadora",
    excerptEn: "A washing machine can last 10–15 years with proper care. Follow these maintenance tips to avoid expensive repairs and keep your laundry running smoothly.",
    excerptEs: "Una lavadora puede durar de 10 a 15 años con el cuidado adecuado. Sigue estos consejos para evitar reparaciones costosas y mantener tu ropa limpia.",
    bodyEn: `
<h2>The Average Washing Machine Lifespan</h2>
<p>With proper maintenance, a modern washing machine should last 10–15 years. Neglect, however, can cut that lifespan in half. Here's how to protect your investment.</p>

<h2>1. Don't Overload the Drum</h2>
<p>Overloading is the #1 cause of premature washer failure. When the drum is too full, the motor, bearings, and suspension system work under excessive strain. As a rule: clothes should move freely inside the drum — if they don't, remove some.</p>

<h2>2. Use the Right Amount of Detergent</h2>
<p>More detergent does not mean cleaner clothes. Excess detergent leaves residue that builds up inside the drum, hoses, and pump, eventually causing clogs and mold. Use HE (High-Efficiency) detergent for HE machines and follow the manufacturer's guidelines.</p>

<h2>3. Clean the Filter Regularly</h2>
<p>Most front-load washers have a drain pump filter that collects lint, coins, and debris. Clean it every 2–3 months. A clogged filter forces the pump to work harder, leading to drainage problems and premature failure.</p>

<h2>4. Leave the Door Open After Each Wash</h2>
<p>Moisture trapped inside the drum is the main cause of mold and mildew odors. After every wash cycle, leave the door slightly open for at least 30 minutes to allow air circulation.</p>

<h2>5. Level the Machine Properly</h2>
<p>An unleveled washer vibrates excessively, causing wear on the drum bearings, suspension rods, and housing. Check the level with a bubble level and adjust the feet as needed.</p>

<h2>6. Inspect Hoses Annually</h2>
<p>Water supply hoses should be checked every year for cracks, bulges, or corrosion. Replace them every 5 years regardless of condition — a burst hose can cause thousands of dollars of water damage.</p>

<h2>When to Call a Technician</h2>
<p>If your washer vibrates violently, won't drain, makes grinding noises, or doesn't spin properly, don't delay. Early repair is always cheaper than replacement. HTRGroupTX serves the entire Houston metropolitan area with same-day service.</p>
    `,
    bodyEs: `
<h2>La Vida Útil Promedio de una Lavadora</h2>
<p>Con el mantenimiento adecuado, una lavadora moderna debería durar entre 10 y 15 años. Sin embargo, el descuido puede reducir a la mitad esa vida útil. Aquí te explicamos cómo proteger tu inversión.</p>

<h2>1. No Sobrecargues el Tambor</h2>
<p>La sobrecarga es la causa número uno del deterioro prematuro de la lavadora. Cuando el tambor está demasiado lleno, el motor, los rodamientos y el sistema de suspensión trabajan bajo una tensión excesiva.</p>

<h2>2. Usa la Cantidad Correcta de Detergente</h2>
<p>Más detergente no significa ropa más limpia. El exceso de detergente deja residuos que se acumulan dentro del tambor, las mangueras y la bomba, causando obstrucciones y moho.</p>

<h2>3. Limpia el Filtro Regularmente</h2>
<p>La mayoría de las lavadoras de carga frontal tienen un filtro de bomba de desagüe. Límpialo cada 2 o 3 meses. Un filtro obstruido obliga a la bomba a trabajar más, lo que provoca problemas de drenaje.</p>

<h2>4. Deja la Puerta Abierta Después de Cada Lavado</h2>
<p>La humedad atrapada dentro del tambor es la principal causa de olores a moho. Después de cada ciclo de lavado, deja la puerta ligeramente abierta al menos 30 minutos.</p>

<h2>5. Nivela la Máquina Correctamente</h2>
<p>Una lavadora desnivelada vibra excesivamente, causando desgaste en los rodamientos del tambor y las barras de suspensión. Comprueba el nivel con un nivel de burbuja y ajusta los pies según sea necesario.</p>

<h2>6. Inspecciona las Mangueras Anualmente</h2>
<p>Las mangueras de suministro de agua deben revisarse cada año en busca de grietas o corrosión. Reemplázalas cada 5 años — una manguera reventada puede causar miles de dólares en daños por agua.</p>

<h2>Cuándo Llamar a un Técnico</h2>
<p>Si tu lavadora vibra violentamente, no drena, hace ruidos de molienda o no centrifuga correctamente, no lo dejes pasar. HTRGroupTX sirve a toda el área metropolitana de Houston con servicio el mismo día.</p>
    `,
  },
  {
    slug: "dishwasher-not-draining",
    imgKey: "dish",
    date: "March 28, 2026",
    readMinutes: 4,
    titleEn: "Dishwasher Not Draining? Here's Why",
    titleEs: "¿El Lavavajillas No Drena? Aquí la Causa",
    excerptEn: "Standing water at the bottom of your dishwasher is one of the most common problems homeowners face. Discover the causes and when to call a professional.",
    excerptEs: "El agua estancada en el fondo de tu lavavajillas es uno de los problemas más comunes. Descubre las causas y cuándo llamar a un profesional.",
    bodyEn: `
<h2>Why Is There Water at the Bottom of My Dishwasher?</h2>
<p>Finding standing water after a wash cycle is frustrating — and a sign something in the drainage system isn't working. Here are the most common causes, from easy DIY fixes to issues requiring a technician.</p>

<h2>1. Clogged Filter or Drain Basket</h2>
<p>The most common culprit. Food particles, grease, and debris accumulate in the filter at the bottom of the tub. Most modern dishwashers have a removable filter — check your manual, pull it out, and rinse it under warm water weekly. This alone solves the problem about 40% of the time.</p>

<h2>2. Blocked Drain Hose</h2>
<p>The drain hose connects the dishwasher to your sink drain or garbage disposal. It can become kinked behind the appliance or clogged with grease buildup. Check that the hose isn't bent and has a high loop or air gap to prevent backflow.</p>

<h2>3. Garbage Disposal Connection</h2>
<p>If your dishwasher drains through the garbage disposal and you recently installed a new disposal, make sure the knockout plug was removed from the dishwasher inlet. This is a very common installation oversight.</p>

<h2>4. Failed Drain Pump</h2>
<p>The drain pump forces water out of the tub at the end of each cycle. If you hear a humming sound but no water drains, or if the pump is silent altogether, it may have failed. This requires professional replacement.</p>

<h2>5. Faulty Door Latch or Control Board</h2>
<p>Sometimes the dishwasher doesn't complete the drain cycle because the control board sends the wrong signal, or the door latch doesn't register as fully closed. These issues require diagnostic tools to identify.</p>

<h2>When to Call HTRGroupTX</h2>
<p>If cleaning the filter and checking the drain hose doesn't solve the problem, it's time to call a certified technician. We service all major dishwasher brands throughout the Houston area and carry common replacement parts on our trucks.</p>
    `,
    bodyEs: `
<h2>¿Por Qué Hay Agua en el Fondo de Mi Lavavajillas?</h2>
<p>Encontrar agua estancada después de un ciclo de lavado es frustrante y una señal de que algo en el sistema de drenaje no funciona correctamente.</p>

<h2>1. Filtro u Cesta de Drenaje Obstruidos</h2>
<p>El culpable más común. Las partículas de comida, la grasa y los residuos se acumulan en el filtro ubicado en el fondo del compartimento. La mayoría de los lavavajillas modernos tienen un filtro extraíble — revísalo y enjuágalo con agua tibia semanalmente. Esto solo resuelve el problema aproximadamente el 40% de las veces.</p>

<h2>2. Manguera de Drenaje Bloqueada</h2>
<p>La manguera de drenaje conecta el lavavajillas al desagüe del fregadero o al triturador de basura. Puede doblarse detrás del electrodoméstico u obstruirse con acumulación de grasa.</p>

<h2>3. Conexión al Triturador de Basura</h2>
<p>Si tu lavavajillas drena a través del triturador y recientemente instalaste uno nuevo, asegúrate de que el tapón de derivación haya sido removido de la entrada del lavavajillas.</p>

<h2>4. Bomba de Drenaje Defectuosa</h2>
<p>La bomba de drenaje fuerza el agua fuera del compartimento al final de cada ciclo. Si escuchas un zumbido pero no drena agua, o si la bomba está completamente silenciosa, puede haber fallado y requiere reemplazo profesional.</p>

<h2>5. Pestillo de Puerta o Placa de Control Defectuosos</h2>
<p>A veces el lavavajillas no completa el ciclo de drenaje porque la placa de control envía una señal incorrecta. Estos problemas requieren herramientas de diagnóstico para identificarlos.</p>

<h2>Cuándo Llamar a HTRGroupTX</h2>
<p>Si limpiar el filtro y revisar la manguera no resuelve el problema, es hora de llamar a un técnico certificado. Atendemos todas las marcas principales en el área de Houston.</p>
    `,
  },
  {
    slug: "common-oven-problems",
    imgKey: "oven",
    date: "March 20, 2026",
    readMinutes: 5,
    titleEn: "Common Oven Problems and When to Call a Pro",
    titleEs: "Problemas Comunes del Horno y Cuándo Llamar a un Técnico",
    excerptEn: "Uneven heating, burners that won't ignite, or a door that won't seal — oven problems disrupt daily cooking. Here's what each symptom means.",
    excerptEs: "Calor desigual, quemadores que no encienden o puertas que no cierran bien — los problemas del horno interrumpen la cocina diaria. Esto es lo que significa cada síntoma.",
    bodyEn: `
<h2>Oven Problems That Shouldn't Be Ignored</h2>
<p>An oven that doesn't work properly doesn't just ruin meals — it can be a safety hazard, especially with gas ranges. Here are the most common oven problems we see at HTRGroupTX and what causes them.</p>

<h2>1. Oven Won't Heat Up (or Takes Too Long)</h2>
<p>For electric ovens, this is usually a failed bake element or broil element — the coils inside the oven that generate heat. You may see visible damage (breaks or burns) on the element, or it may fail invisibly. For gas ovens, a faulty igniter is the most common cause — it glows but doesn't get hot enough to open the gas valve.</p>

<h2>2. Uneven Cooking</h2>
<p>If one side of your dish cooks faster than the other, or baked goods rise unevenly, you likely have a failing bake element, a calibration issue with the thermostat, or a damaged temperature sensor (RTD probe). A simple temperature test with an oven thermometer can confirm this.</p>

<h2>3. Burners Won't Ignite (Gas Range)</h2>
<p>If you hear clicking but no ignition, the igniter may be dirty or the igniter electrode may be cracked. Clean the area around the burner cap with a toothbrush. If the clicking continues even when the burner is lit, the igniter switch may need replacement.</p>

<h2>4. Oven Door Won't Close Properly</h2>
<p>A door that doesn't seal wastes energy and results in inaccurate temperatures. The most common causes are worn door gaskets (the rubber/silicone seal around the door) or broken door hinges. Both are relatively inexpensive repairs.</p>

<h2>5. Control Panel Not Responding</h2>
<p>Unresponsive touch controls or error codes on the display usually point to a failed control board. This is a more expensive repair but often cheaper than replacing the entire unit.</p>

<h2>Gas Range Safety Warning</h2>
<p>If you smell gas near your range and the burners are off, leave the house immediately and call your gas company. Never attempt to repair gas connections yourself.</p>

<h2>Call HTRGroupTX</h2>
<p>We repair electric and gas ranges and ovens of all major brands. Our trucks carry common replacement parts for same-day repairs in the Houston area.</p>
    `,
    bodyEs: `
<h2>Problemas del Horno que No Deben Ignorarse</h2>
<p>Un horno que no funciona correctamente no solo arruina las comidas — puede ser un peligro de seguridad, especialmente con cocinas de gas.</p>

<h2>1. El Horno No Calienta (o Tarda Demasiado)</h2>
<p>En hornos eléctricos, generalmente se debe a un elemento de horneado o gratinado defectuoso. En hornos de gas, un encendedor defectuoso es la causa más común — brilla pero no alcanza la temperatura suficiente para abrir la válvula de gas.</p>

<h2>2. Cocción Desigual</h2>
<p>Si un lado de tu plato se cocina más rápido que el otro, probablemente tengas un elemento de horneado defectuoso, un problema de calibración del termostato o un sensor de temperatura dañado.</p>

<h2>3. Los Quemadores No Encienden (Cocina de Gas)</h2>
<p>Si escuchas clics pero no hay ignición, el encendedor puede estar sucio o el electrodo puede estar agrietado. Limpia el área alrededor del quemador con un cepillo de dientes.</p>

<h2>4. La Puerta del Horno No Cierra Bien</h2>
<p>Una puerta que no sella desperdicia energía y resulta en temperaturas inexactas. Las causas más comunes son las juntas de puerta desgastadas o las bisagras rotas.</p>

<h2>5. El Panel de Control No Responde</h2>
<p>Los controles táctiles que no responden o los códigos de error en la pantalla generalmente indican una placa de control defectuosa.</p>

<h2>Advertencia de Seguridad para Cocinas de Gas</h2>
<p>Si huele a gas cerca de su cocina y los quemadores están apagados, salga de la casa inmediatamente y llame a su compañía de gas. Nunca intente reparar las conexiones de gas usted mismo.</p>

<h2>Llame a HTRGroupTX</h2>
<p>Reparamos cocinas y hornos eléctricos y de gas de todas las marcas principales en el área de Houston.</p>
    `,
  },
  {
    slug: "dryer-vent-cleaning",
    imgKey: "dryer",
    date: "March 12, 2026",
    readMinutes: 4,
    titleEn: "How to Clean Your Dryer Vent (and Prevent Fire Hazards)",
    titleEs: "Cómo Limpiar el Conducto de tu Secadora (y Prevenir Incendios)",
    excerptEn: "Dryer vent fires are one of the leading causes of house fires in the US. Learn how to clean your vent and recognize when it's dangerously clogged.",
    excerptEs: "Los incendios por conductos de secadora son una de las principales causas de incendios domésticos. Aprende a limpiar el tuyo y reconoce cuándo está peligrosamente obstruido.",
    bodyEn: `
<h2>A Clogged Dryer Vent Is a Fire Hazard</h2>
<p>According to the U.S. Fire Administration, nearly 3,000 dryer fires occur every year — and the leading cause is failure to clean the dryer vent. Lint is highly flammable, and when it accumulates in the vent duct, it only takes one spark to ignite.</p>

<h2>Signs Your Dryer Vent Is Clogged</h2>
<ul>
  <li>Clothes take more than one cycle to dry completely</li>
  <li>The dryer exterior or clothes feel excessively hot at the end of a cycle</li>
  <li>You smell a burning odor during or after drying</li>
  <li>The laundry room feels unusually humid during a cycle</li>
  <li>The vent flap outside doesn't open fully when the dryer is running</li>
</ul>

<h2>How to Clean the Dryer Vent (DIY)</h2>
<p><strong>Step 1:</strong> Disconnect the dryer from power (and gas if applicable) and pull it away from the wall.</p>
<p><strong>Step 2:</strong> Disconnect the vent hose from the back of the dryer and from the wall duct.</p>
<p><strong>Step 3:</strong> Use a dryer vent cleaning kit (available at hardware stores) — a long, flexible brush that reaches deep into the duct — to brush out lint from both ends.</p>
<p><strong>Step 4:</strong> Use a vacuum to remove loosened lint from inside the hose and the wall duct opening.</p>
<p><strong>Step 5:</strong> Reconnect everything and run the dryer on air-only (no heat) for a few minutes to blow out any remaining debris.</p>
<p>Repeat this process every 12 months, or more frequently if you do many loads per week.</p>

<h2>Replace Plastic or Foil Accordion Hose</h2>
<p>If your dryer connects to the wall duct via a plastic or thin foil accordion hose, replace it with a rigid or semi-rigid metal duct. Accordion hoses trap lint in their ridges and are a major fire risk.</p>

<h2>When to Call a Professional</h2>
<p>If your vent run is long, has multiple bends, or vents through the roof, professional cleaning is recommended. HTRGroupTX technicians can also diagnose dryer heating element and motor problems that may be contributing to poor performance.</p>
    `,
    bodyEs: `
<h2>Un Conducto de Secadora Obstruido Es un Peligro de Incendio</h2>
<p>Según la Administración de Incendios de EE. UU., casi 3,000 incendios de secadoras ocurren cada año — y la causa principal es no limpiar el conducto. La pelusa es muy inflamable y cuando se acumula en el conducto, solo se necesita una chispa para encenderse.</p>

<h2>Señales de que el Conducto Está Obstruido</h2>
<ul>
  <li>La ropa tarda más de un ciclo en secarse completamente</li>
  <li>El exterior de la secadora o la ropa se siente excesivamente caliente al final de un ciclo</li>
  <li>Hueles un olor a quemado durante o después del secado</li>
  <li>El cuarto de lavandería se siente inusualmente húmedo durante un ciclo</li>
  <li>La solapa del conducto exterior no se abre completamente cuando la secadora está funcionando</li>
</ul>

<h2>Cómo Limpiar el Conducto de la Secadora</h2>
<p><strong>Paso 1:</strong> Desconecta la secadora de la corriente eléctrica (y del gas si corresponde) y aléjala de la pared.</p>
<p><strong>Paso 2:</strong> Desconecta la manguera del conducto de la parte trasera de la secadora y del conducto de la pared.</p>
<p><strong>Paso 3:</strong> Usa un kit de limpieza de conductos de secadora con un cepillo largo y flexible para limpiar la pelusa desde ambos extremos.</p>
<p><strong>Paso 4:</strong> Usa una aspiradora para eliminar la pelusa suelta del interior de la manguera.</p>
<p><strong>Paso 5:</strong> Vuelve a conectar todo y pon la secadora en modo solo aire durante unos minutos.</p>

<h2>Reemplaza las Mangueras de Plástico o Acordeón</h2>
<p>Si tu secadora se conecta a la pared mediante una manguera de acordeón de plástico o papel de aluminio delgado, reemplázala con un conducto de metal rígido o semirígido. Las mangueras de acordeón atrapan pelusa en sus crestas y son un riesgo importante de incendio.</p>

<h2>Cuándo Llamar a un Profesional</h2>
<p>Si el recorrido de tu conducto es largo o tiene múltiples curvas, se recomienda la limpieza profesional. Los técnicos de HTRGroupTX también pueden diagnosticar problemas de calefacción y motor de la secadora.</p>
    `,
  },
  {
    slug: "microwave-sparking-not-heating",
    imgKey: "micro",
    date: "March 5, 2026",
    readMinutes: 3,
    titleEn: "Microwave Sparking or Not Heating? Here's What's Wrong",
    titleEs: "¿Tu Microondas Chisporrotea o No Calienta? Esto Es Lo que Pasa",
    excerptEn: "Sparking inside a microwave is alarming — but it's not always dangerous. Learn what causes it and when your microwave actually needs professional repair.",
    excerptEs: "Las chispas dentro de un microondas son alarmantes, pero no siempre son peligrosas. Aprende qué las causa y cuándo tu microondas necesita reparación profesional.",
    bodyEn: `
<h2>Is Sparking Inside a Microwave Dangerous?</h2>
<p>Sparks inside a microwave are always a sign that something is wrong, but the severity varies. Sometimes it's a simple fix — other times it points to a component failure that requires professional attention.</p>

<h2>Common Causes of Sparking</h2>

<h3>Metal or Foil Inside the Cavity</h3>
<p>The most obvious cause. Always remove all metal utensils, aluminum foil, and foil-lined containers before microwaving. Even small amounts of metal can cause arcing.</p>

<h3>Damaged Waveguide Cover</h3>
<p>The waveguide cover is the flat panel (usually mica or plastic) inside the top of the microwave cavity. It protects the magnetron from food splatter. When food burns onto it and gets charred, it can cause sparking. The cover is inexpensive and easy to replace.</p>

<h3>Worn or Damaged Rack Support</h3>
<p>If your microwave has a metal rack, make sure the rack supports (small plastic or ceramic pieces) are intact. Damaged supports can cause the rack to arc against the microwave walls.</p>

<h2>Microwave Not Heating at All</h2>
<p>If the microwave runs but food stays cold, the most likely culprits are:</p>
<ul>
  <li><strong>Failed magnetron</strong> — the component that generates microwave energy. This is the most expensive repair and sometimes not cost-effective on older units.</li>
  <li><strong>Blown diode or capacitor</strong> — the high-voltage system components. Warning: these components can hold a lethal charge even when the microwave is unplugged. Never open the microwave cabinet yourself.</li>
  <li><strong>Failed door switch</strong> — microwaves have multiple safety switches that prevent operation if the door isn't fully closed. One failing switch can stop the heating entirely.</li>
</ul>

<h2>When to Repair vs. Replace</h2>
<p>If your microwave is less than 7 years old and the repair cost is under 50% of a replacement unit, repair is usually the better choice. For older units with magnetron failure, replacement may be more practical.</p>

<h2>HTRGroupTX Can Help</h2>
<p>Our technicians diagnose and repair over-the-range and countertop microwaves of all brands throughout Houston. We'll give you an honest assessment: repair or replace.</p>
    `,
    bodyEs: `
<h2>¿Son Peligrosas las Chispas Dentro de un Microondas?</h2>
<p>Las chispas dentro de un microondas siempre son una señal de que algo está mal, pero la gravedad varía. A veces es una solución sencilla — otras veces indica un fallo de componente que requiere atención profesional.</p>

<h2>Causas Comunes de las Chispas</h2>

<h3>Metal o Papel de Aluminio Dentro del Compartimento</h3>
<p>La causa más obvia. Siempre retira todos los utensilios de metal, el papel de aluminio y los envases forrados con papel antes de usar el microondas.</p>

<h3>Cubierta del Guía de Ondas Dañada</h3>
<p>La cubierta del guía de ondas es el panel plano (generalmente de mica o plástico) dentro de la parte superior del compartimento del microondas. Cuando los alimentos se queman sobre ella, puede causar chispas. La cubierta es económica y fácil de reemplazar.</p>

<h3>Soporte de Bandeja Desgastado o Dañado</h3>
<p>Si tu microondas tiene una bandeja de metal, asegúrate de que los soportes estén intactos. Los soportes dañados pueden causar que la bandeja haga arco contra las paredes del microondas.</p>

<h2>El Microondas No Calienta</h2>
<p>Si el microondas funciona pero la comida no se calienta, los culpables más probables son:</p>
<ul>
  <li><strong>Magnetrón defectuoso</strong> — el componente que genera la energía de microondas.</li>
  <li><strong>Diodo o condensador quemado</strong> — Advertencia: estos componentes pueden retener una carga letal incluso cuando el microondas está desenchufado. Nunca abras el gabinete del microondas tú mismo.</li>
  <li><strong>Interruptor de puerta defectuoso</strong> — un interruptor fallido puede detener el calentamiento por completo.</li>
</ul>

<h2>Cuándo Reparar vs. Reemplazar</h2>
<p>Si tu microondas tiene menos de 7 años y el costo de reparación es inferior al 50% de una unidad de reemplazo, la reparación suele ser la mejor opción.</p>

<h2>HTRGroupTX Puede Ayudar</h2>
<p>Nuestros técnicos diagnostican y reparan microondas de todas las marcas en toda Houston.</p>
    `,
  },
  {
    slug: "freezer-maintenance-tips",
    imgKey: "freezer",
    date: "February 25, 2026",
    readMinutes: 4,
    titleEn: "Freezer Maintenance Tips for Maximum Efficiency",
    titleEs: "Consejos de Mantenimiento del Congelador para Máxima Eficiencia",
    excerptEn: "A well-maintained freezer keeps food safe, uses less energy, and lasts longer. Follow these simple tips to get the most out of your freezer.",
    excerptEs: "Un congelador bien mantenido conserva los alimentos seguros, consume menos energía y dura más tiempo. Sigue estos sencillos consejos para sacar el mayor provecho.",
    bodyEn: `
<h2>Why Freezer Maintenance Matters</h2>
<p>Your freezer works harder than almost any other appliance in your home — running continuously at 0°F (-18°C) to keep food safely frozen. A little maintenance goes a long way toward preventing costly repairs and food loss.</p>

<h2>1. Keep It at the Right Temperature</h2>
<p>Set your freezer to 0°F (-18°C). Temperatures higher than this can allow bacterial growth; temperatures much lower waste energy unnecessarily. Use a standalone freezer thermometer to verify accuracy — built-in displays can be off by several degrees.</p>

<h2>2. Don't Leave It More Than 75% Full — But Not Empty Either</h2>
<p>Overfilling blocks air circulation and forces the compressor to work harder. But a very empty freezer is also inefficient — frozen items help maintain the cold temperature when the door is opened. Aim for 75% capacity.</p>

<h2>3. Defrost Regularly (Manual-Defrost Models)</h2>
<p>If you have a manual-defrost chest or upright freezer, defrost it when frost buildup reaches about ¼ inch (6mm). Thick frost acts as insulation, making the unit work harder. Empty the freezer, place towels on the floor, and let the frost melt naturally — never use a sharp tool to chip at frost.</p>

<h2>4. Clean the Condenser Coils</h2>
<p>Dirty coils are one of the biggest efficiency killers. On most chest freezers, the coils are on the outside walls (no cleaning needed). On upright freezers, coils are often at the back or underneath — vacuum them annually with a coil brush.</p>

<h2>5. Check the Door Seal</h2>
<p>A damaged or dirty gasket lets warm air in, causing the compressor to run constantly. Test the seal by closing the door on a dollar bill — if you can pull it out easily, the seal needs cleaning or replacement. Clean the gasket with warm soapy water and dry thoroughly.</p>

<h2>6. Keep the Freezer Away from Heat Sources</h2>
<p>Don't place your freezer next to the oven, dishwasher, or in direct sunlight. Heat forces the compressor to run more frequently, increasing energy consumption and wear.</p>

<h2>Signs Your Freezer Needs Professional Attention</h2>
<ul>
  <li>Frost builds up very quickly even though you just defrosted</li>
  <li>The motor runs continuously without the freezer reaching temperature</li>
  <li>You notice warm spots inside the freezer</li>
  <li>There's a burning smell or unusual noise from the compressor area</li>
</ul>
<p>HTRGroupTX services chest freezers, upright freezers, and combination refrigerator-freezers throughout the Houston metropolitan area.</p>
    `,
    bodyEs: `
<h2>Por Qué es Importante el Mantenimiento del Congelador</h2>
<p>Tu congelador trabaja más que casi cualquier otro electrodoméstico en tu hogar, funcionando continuamente a -18°C para mantener los alimentos seguros. Un poco de mantenimiento ayuda mucho a prevenir reparaciones costosas y pérdida de alimentos.</p>

<h2>1. Mantenlo a la Temperatura Correcta</h2>
<p>Configura tu congelador a -18°C. Usa un termómetro independiente para verificar la precisión — las pantallas incorporadas pueden desviarse varios grados.</p>

<h2>2. No Lo Llenes Más del 75% — Pero Tampoco Lo Dejes Vacío</h2>
<p>El llenado excesivo bloquea la circulación de aire. Pero un congelador muy vacío también es ineficiente — los artículos congelados ayudan a mantener la temperatura fría cuando se abre la puerta. Apunta al 75% de capacidad.</p>

<h2>3. Descongela Regularmente (Modelos de Descongelación Manual)</h2>
<p>Si tienes un congelador de descongelación manual, descongélalo cuando la acumulación de escarcha alcance aproximadamente 6mm. La escarcha gruesa actúa como aislante, haciendo trabajar más a la unidad.</p>

<h2>4. Limpia las Bobinas del Condensador</h2>
<p>Las bobinas sucias son uno de los mayores factores de ineficiencia. Aspíralas anualmente con un cepillo de bobinas.</p>

<h2>5. Verifica el Sello de la Puerta</h2>
<p>Una junta dañada permite que entre aire caliente, haciendo que el compresor funcione constantemente. Prueba el sello cerrando la puerta sobre un billete de dólar — si puedes sacarlo fácilmente, el sello necesita limpieza o reemplazo.</p>

<h2>6. Mantén el Congelador Alejado de Fuentes de Calor</h2>
<p>No coloques tu congelador junto al horno o al lavavajillas. El calor obliga al compresor a funcionar con más frecuencia, aumentando el consumo de energía.</p>

<h2>Señales de que tu Congelador Necesita Atención Profesional</h2>
<ul>
  <li>La escarcha se acumula muy rápidamente</li>
  <li>El motor funciona continuamente sin que el congelador alcance la temperatura</li>
  <li>Notas zonas calientes dentro del congelador</li>
  <li>Hay un olor a quemado o ruidos inusuales del área del compresor</li>
</ul>
<p>HTRGroupTX presta servicio a congeladores horizontales, verticales y combinados en toda el área metropolitana de Houston.</p>
    `,
  },
  {
    slug: "range-hood-repair-guide",
    imgKey: "hood",
    date: "February 18, 2026",
    readMinutes: 4,
    titleEn: "Range Hood Not Working? Common Problems and Fixes",
    titleEs: "¿La Campana Extractora No Funciona? Problemas Comunes y Soluciones",
    excerptEn: "A range hood keeps your kitchen air clean and grease-free. Learn why your hood fan may stop working, make noise, or lose suction — and when to call a pro.",
    excerptEs: "Una campana extractora mantiene el aire de tu cocina limpio y libre de grasa. Aprende por qué puede dejar de funcionar y cuándo llamar a un técnico.",
    bodyEn: `
<h2>Why Your Range Hood Matters</h2>
<p>A properly working range hood removes smoke, steam, grease particles, and cooking odors from your kitchen. When it fails, grease accumulates on cabinets and surfaces, and indoor air quality drops. Here are the most common problems and what causes them.</p>

<h2>1. Fan Won't Turn On</h2>
<p>If the fan doesn't respond at all, start by checking the circuit breaker — range hoods draw significant power and can trip the breaker. If power is fine, the issue is likely a failed fan motor, a burnt capacitor, or a faulty control board. These require professional diagnosis.</p>

<h2>2. Fan Is Noisy or Vibrating</h2>
<p>Rattling or vibrating usually means a loose fan blade, worn motor bearings, or debris caught in the fan. A grinding noise after the motor has been running for years typically signals bearing failure. Humming without air movement points to a seized motor.</p>

<h2>3. Weak or No Suction</h2>
<p>Reduced suction is almost always caused by clogged grease filters. Most range hood filters should be cleaned every 1–3 months depending on cooking frequency. Soak them in hot water with degreasing dish soap for 15–30 minutes, then rinse and dry before reinstalling. For charcoal filters (ductless hoods), replacement is necessary — they cannot be cleaned.</p>

<h2>4. Lights Not Working</h2>
<p>Blown bulbs are the most obvious cause, but if replacing the bulb doesn't help, the light socket or the control board may be at fault. Make sure you're using the correct bulb type and wattage specified in your owner's manual.</p>

<h2>5. Control Panel Not Responding</h2>
<p>Touch controls can fail due to moisture damage, grease buildup on the touch surface, or a failed control board. Wipe the panel with a dry cloth — sometimes moisture on the sensors prevents them from registering touch.</p>

<h2>Maintenance Tips</h2>
<ul>
  <li>Clean grease filters monthly if you cook frequently</li>
  <li>Wipe the interior and exterior with a degreaser every 2–3 months</li>
  <li>Check the duct connection annually for blockages</li>
  <li>Replace charcoal filters every 6 months (ductless models)</li>
</ul>

<h2>Call HTRGroupTX</h2>
<p>We repair range hoods of all brands — wall-mounted, under-cabinet, and island models — throughout the Houston metropolitan area. Same-day service available.</p>
    `,
    bodyEs: `
<h2>Por Qué Importa Tu Campana Extractora</h2>
<p>Una campana extractora en buen estado elimina humo, vapor, partículas de grasa y olores de cocina. Cuando falla, la grasa se acumula en los gabinetes y la calidad del aire interior disminuye.</p>

<h2>1. El Ventilador No Enciende</h2>
<p>Si el ventilador no responde, comienza revisando el disyuntor. Si la corriente está bien, el problema probablemente es un motor de ventilador defectuoso, un condensador quemado o una placa de control dañada.</p>

<h2>2. El Ventilador Hace Ruido o Vibra</h2>
<p>Los traqueteos generalmente significan una paleta de ventilador suelta, rodamientos de motor desgastados o residuos atrapados en el ventilador. Un ruido de molienda señala típicamente falla de rodamientos.</p>

<h2>3. Succión Débil o Nula</h2>
<p>La succión reducida casi siempre es causada por filtros de grasa obstruidos. Límpielos cada 1–3 meses según la frecuencia de cocción. Para filtros de carbón activado (campanas sin ducto), el reemplazo es necesario — no se pueden limpiar.</p>

<h2>4. Las Luces No Funcionan</h2>
<p>Las bombillas quemadas son la causa más obvia, pero si reemplazar la bombilla no ayuda, el socket o la placa de control pueden estar defectuosos.</p>

<h2>5. El Panel de Control No Responde</h2>
<p>Los controles táctiles pueden fallar por daño de humedad o acumulación de grasa. Limpie el panel con un paño seco — a veces la humedad en los sensores impide que registren el toque.</p>

<h2>Consejos de Mantenimiento</h2>
<ul>
  <li>Limpia los filtros de grasa mensualmente si cocinas con frecuencia</li>
  <li>Limpia el interior y exterior con un desengrasante cada 2–3 meses</li>
  <li>Revisa la conexión del conducto anualmente</li>
  <li>Reemplaza los filtros de carbón cada 6 meses (modelos sin ducto)</li>
</ul>

<h2>Llame a HTRGroupTX</h2>
<p>Reparamos campanas extractoras de todas las marcas en toda el área metropolitana de Houston. Servicio disponible el mismo día.</p>
    `,
  },
  {
    slug: "ice-maker-repair-guide",
    imgKey: "icemaker",
    date: "February 10, 2026",
    readMinutes: 4,
    titleEn: "Ice Maker Not Making Ice? Here's What to Check",
    titleEs: "¿La Máquina de Hielo No Produce Hielo? Esto Es Lo que Debes Revisar",
    excerptEn: "An ice maker that stops producing ice or leaks water can ruin your day. Learn the most common causes and quick checks before calling a technician.",
    excerptEs: "Una máquina de hielo que deja de producir hielo o gotea puede arruinar tu día. Aprende las causas más comunes antes de llamar a un técnico.",
    bodyEn: `
<h2>How Ice Makers Work</h2>
<p>Ice makers are relatively simple mechanisms: water flows in through a valve, fills a tray mold, freezes, and a heating element briefly warms the tray so the cubes release into the bin. A motor-driven arm sweeps the cubes out. When any of these steps fail, ice production stops.</p>

<h2>1. No Ice Production at All</h2>
<p><strong>Check the shutoff arm first.</strong> Most ice makers have a metal or plastic arm that rises when the bin is full and shuts off production. Make sure it's in the down (on) position. If the bin is empty but the arm is up, it may be stuck — carefully lower it by hand.</p>
<p><strong>Check the water supply.</strong> Is the water supply line valve behind the refrigerator turned on fully? A kinked supply line or a clogged water filter can also stop water from reaching the ice maker.</p>
<p><strong>Water inlet valve.</strong> If water pressure is adequate but water still isn't entering the maker, the water inlet valve solenoid may have failed. This requires replacement.</p>

<h2>2. Ice Maker Is Slow (Small or Hollow Cubes)</h2>
<p>Small or hollow cubes usually mean restricted water flow — often a partially clogged water filter. Replace the refrigerator's water filter every 6 months. Low water pressure (below 20 psi) can also cause this.</p>

<h2>3. Ice Tastes Bad or Smells Off</h2>
<p>Old ice absorbs food odors from the freezer. Empty and wash the ice bin, then replace the water filter. Store strong-smelling foods in airtight containers. If the taste persists after a filter change, the supply line may have bacterial growth — flush the line and sanitize.</p>

<h2>4. Ice Maker is Leaking</h2>
<p>Leaks usually come from a cracked water supply line, a loose connection at the inlet valve, or an overfilled ice mold caused by a faulty water inlet valve that doesn't close properly. Water leaking inside the freezer and refreezing into a sheet of ice at the bottom is a classic sign of this problem.</p>

<h2>5. Ice Maker is Making Noise</h2>
<p>Clicking and buzzing during the fill cycle is normal. Loud grinding or squealing during the harvest cycle (when ice drops) can mean a worn motor or a jammed ejector arm.</p>

<h2>HTRGroupTX Can Help</h2>
<p>We repair built-in and stand-alone ice makers of all major brands throughout the Houston area. Our trucks carry common replacement parts for water inlet valves, motors, and control modules.</p>
    `,
    bodyEs: `
<h2>Cómo Funcionan las Máquinas de Hielo</h2>
<p>Las máquinas de hielo son mecanismos relativamente simples: el agua entra a través de una válvula, llena un molde, se congela, y un elemento calefactor calienta brevemente el molde para que los cubos se liberen en el recipiente.</p>

<h2>1. No Produce Hielo en Absoluto</h2>
<p><strong>Revisa el brazo de apagado primero.</strong> La mayoría de las máquinas de hielo tienen un brazo que sube cuando el recipiente está lleno. Asegúrate de que esté en posición baja (encendida).</p>
<p><strong>Revisa el suministro de agua.</strong> ¿Está la válvula de la línea de suministro de agua abierta completamente? Una línea doblada o un filtro de agua obstruido también pueden detener el agua.</p>
<p><strong>Válvula de entrada de agua.</strong> Si la presión es adecuada pero el agua no entra, el solenoide de la válvula de entrada puede haber fallado y requiere reemplazo.</p>

<h2>2. La Máquina Produce Hielo Lentamente (Cubos Pequeños o Huecos)</h2>
<p>Los cubos pequeños o huecos generalmente indican flujo de agua restringido — a menudo un filtro de agua parcialmente obstruido. Reemplaza el filtro cada 6 meses.</p>

<h2>3. El Hielo Tiene Mal Sabor u Olor</h2>
<p>El hielo viejo absorbe olores del congelador. Vacía y lava el recipiente de hielo, luego reemplaza el filtro de agua. Almacena los alimentos de olor fuerte en recipientes herméticos.</p>

<h2>4. La Máquina Está Goteando</h2>
<p>Las fugas generalmente provienen de una línea de suministro de agua agrietada, una conexión suelta en la válvula de entrada, o un molde de hielo sobrellenado por una válvula de entrada defectuosa.</p>

<h2>5. La Máquina Hace Ruido</h2>
<p>Los clics y zumbidos durante el ciclo de llenado son normales. Los chirridos fuertes durante el ciclo de cosecha pueden indicar un motor desgastado o un brazo eyector atascado.</p>

<h2>HTRGroupTX Puede Ayudar</h2>
<p>Reparamos máquinas de hielo integradas e independientes de todas las marcas en el área de Houston.</p>
    `,
  },
  {
    slug: "cooktop-repair-guide",
    imgKey: "cooktop",
    date: "February 2, 2026",
    readMinutes: 4,
    titleEn: "Cooktop Burners Not Working? Gas vs. Electric Diagnosis",
    titleEs: "¿Los Quemadores de la Placa No Funcionan? Diagnóstico Gas vs. Eléctrico",
    excerptEn: "Whether gas or electric, a cooktop that doesn't heat properly makes cooking impossible. Learn the most common causes for each type and when to call a pro.",
    excerptEs: "Ya sea de gas o eléctrica, una placa que no calienta correctamente hace imposible cocinar. Aprende las causas más comunes para cada tipo.",
    bodyEn: `
<h2>Gas Cooktop Problems</h2>

<h3>Burner Won't Ignite (Clicking But No Flame)</h3>
<p>This is the #1 gas cooktop complaint. The most common cause is a wet or dirty igniter. After boilovers, food and water get under the burner cap and block the igniter. Remove the burner grate and cap, and use a toothbrush or small brush to clean around the igniter. Let everything dry completely before trying again.</p>
<p>If cleaning doesn't help, the igniter itself may be cracked or worn — you'll see a visible break in the ceramic tip. The igniter switch or spark module may also need replacement.</p>

<h3>Burner Clicks Constantly (Even When Not in Use)</h3>
<p>Constant clicking is almost always caused by moisture inside the igniter housing. This happens after spills or heavy steam. Keep the burner off and let the area dry for several hours. In humid climates, this can take longer.</p>

<h3>Weak or Uneven Flame</h3>
<p>A weak or yellow flame (should be blue) indicates partially clogged burner ports. Remove the burner cap and use a straightened paper clip or small wire to clear the small holes around the burner. Never use toothpicks — they can break and clog the ports further.</p>

<h2>Electric Cooktop Problems</h2>

<h3>One Burner Not Heating</h3>
<p>On coil electric cooktops, a burner that doesn't heat is usually the element itself — they burn out over time. Coil elements simply unplug and replace. On glass-ceramic (smooth-top) cooktops, the element is beneath the glass and requires professional replacement.</p>

<h3>Burner Stays on Maximum Heat</h3>
<p>If a burner won't turn down or off, the infinite switch (the control that adjusts the heat level) has likely failed. This is a safety issue — do not use the burner and call a technician promptly.</p>

<h3>Cracked Glass Surface</h3>
<p>A cracked glass-ceramic cooktop surface should not be used — it's a safety and electrical hazard. The glass must be replaced. While this is a more expensive repair, it's significantly cheaper than a new cooktop.</p>

<h2>HTRGroupTX Cooktop Repair</h2>
<p>We service all types of cooktops — gas, electric coil, and glass-ceramic — throughout the Houston area. We carry common replacement parts on our trucks for same-day repairs.</p>
    `,
    bodyEs: `
<h2>Problemas de Placa de Gas</h2>

<h3>El Quemador No Enciende (Hace Clic Pero No Hay Llama)</h3>
<p>Esta es la queja número uno de las placas de gas. La causa más común es un encendedor húmedo o sucio. Después de derrames, la comida y el agua se meten bajo la tapa del quemador y bloquean el encendedor. Limpia alrededor del encendedor con un cepillo de dientes y deja que todo se seque completamente.</p>

<h3>El Quemador Hace Clic Constantemente</h3>
<p>El clic constante casi siempre es causado por humedad dentro del alojamiento del encendedor. Apaga el quemador y deja que el área se seque durante varias horas.</p>

<h3>Llama Débil o Irregular</h3>
<p>Una llama débil o amarilla (debe ser azul) indica puertos del quemador parcialmente obstruidos. Retira la tapa del quemador y usa un clip de papel enderezado para limpiar los pequeños orificios.</p>

<h2>Problemas de Placa Eléctrica</h2>

<h3>Un Quemador No Calienta</h3>
<p>En placas eléctricas de bobina, un quemador que no calienta generalmente es el propio elemento. Los elementos de bobina simplemente se desenchufan y reemplazan. En placas de vitrocerámica, el elemento está debajo del vidrio y requiere reemplazo profesional.</p>

<h3>El Quemador Se Queda en Calor Máximo</h3>
<p>Si un quemador no baja o no se apaga, el interruptor de control probablemente ha fallado. Este es un problema de seguridad — no uses el quemador y llama a un técnico.</p>

<h3>Superficie de Vidrio Agrietada</h3>
<p>Una superficie de vitrocerámica agrietada no debe usarse — es un peligro eléctrico. El vidrio debe reemplazarse.</p>

<h2>Reparación de Placas HTRGroupTX</h2>
<p>Atendemos todo tipo de placas en el área de Houston con servicio disponible el mismo día.</p>
    `,
  },
  {
    slug: "wine-cooler-repair-guide",
    imgKey: "winecooler",
    date: "January 25, 2026",
    readMinutes: 3,
    titleEn: "Wine Cooler Not Cooling? Causes and Fixes",
    titleEs: "¿El Enfriador de Vino No Enfría? Causas y Soluciones",
    excerptEn: "Wine stored at the wrong temperature quickly loses its quality. Learn why your wine cooler may stop cooling and what you can do about it.",
    excerptEs: "El vino almacenado a temperatura incorrecta pierde calidad rápidamente. Aprende por qué tu enfriador puede dejar de enfriar y qué puedes hacer al respecto.",
    bodyEn: `
<h2>Thermoelectric vs. Compressor Wine Coolers</h2>
<p>There are two main types of wine coolers: thermoelectric and compressor-based. Understanding which type you have determines what can go wrong and how it's repaired.</p>
<ul>
  <li><strong>Thermoelectric coolers</strong> use the Peltier effect to transfer heat — they're quiet and vibration-free but can only cool 20–30°F below room temperature. They struggle in hot rooms.</li>
  <li><strong>Compressor coolers</strong> work like mini-refrigerators — they cool more aggressively and handle warmer rooms better, but they vibrate slightly and use more energy.</li>
</ul>

<h2>Common Problems</h2>

<h3>Not Cooling at All</h3>
<p>For thermoelectric units, the most common cause is a failed Peltier module or cooling fan. For compressor units, the compressor itself may have failed, or the refrigerant may be low — both require professional service.</p>

<h3>Not Cooling Enough</h3>
<p>If the cooler runs but doesn't reach the set temperature, check the room temperature first — thermoelectric coolers struggle above 77°F (25°C). Also check the condenser fan (usually at the back) — if it's not running, the cooler can't expel heat properly. Dirty condenser coils can also cause this.</p>

<h3>Temperature Fluctuations</h3>
<p>Inconsistent temperatures are often caused by a faulty thermostat or temperature sensor. Check that the door seal is intact — a warped or damaged gasket lets warm air in, causing the temperature to swing.</p>

<h3>Noisy Operation</h3>
<p>Compressor wine coolers make some noise — a faint hum is normal. Loud buzzing or rattling can indicate a loose compressor mounting, a failing fan motor, or a refrigerant issue. Thermoelectric units should be nearly silent — any noise suggests a fan problem.</p>

<h3>Interior Light Not Working</h3>
<p>Usually just a burnt-out LED or bulb. If replacing the bulb doesn't help, the door switch (which activates the light when the door opens) may be faulty.</p>

<h2>Maintenance Tips</h2>
<ul>
  <li>Keep the cooler in a room that stays below 75°F for best performance</li>
  <li>Don't block ventilation slots — leave 2–3 inches on all sides</li>
  <li>Clean condenser coils annually with a soft brush</li>
  <li>Check the door seal every 6 months</li>
</ul>

<h2>HTRGroupTX Wine Cooler Service</h2>
<p>We repair both thermoelectric and compressor wine coolers throughout Houston. Contact us for same-day diagnosis and repair.</p>
    `,
    bodyEs: `
<h2>Enfriadores Termoeléctricos vs. de Compresor</h2>
<p>Hay dos tipos principales de enfriadores de vino: termoeléctricos y de compresor.</p>
<ul>
  <li><strong>Enfriadores termoeléctricos:</strong> silenciosos y sin vibración, pero solo pueden enfriar 11–17°C por debajo de la temperatura ambiente.</li>
  <li><strong>Enfriadores de compresor:</strong> funcionan como mini-refrigeradores — enfrían más agresivamente pero vibran ligeramente.</li>
</ul>

<h2>Problemas Comunes</h2>

<h3>No Enfría en Absoluto</h3>
<p>Para unidades termoeléctricas, la causa más común es un módulo Peltier o ventilador defectuoso. Para unidades de compresor, el compresor puede haber fallado o el refrigerante puede estar bajo — ambos requieren servicio profesional.</p>

<h3>No Enfría Suficiente</h3>
<p>Si el enfriador funciona pero no alcanza la temperatura establecida, revisa la temperatura ambiente primero — los enfriadores termoeléctricos tienen dificultades por encima de 25°C. También verifica el ventilador condensador.</p>

<h3>Fluctuaciones de Temperatura</h3>
<p>Las temperaturas inconsistentes frecuentemente son causadas por un termostato o sensor de temperatura defectuoso. Verifica que el sello de la puerta esté intacto.</p>

<h3>Operación Ruidosa</h3>
<p>Los enfriadores de compresor hacen algo de ruido — un zumbido suave es normal. Los zumbidos o traqueteos fuertes pueden indicar un compresor suelto o un motor de ventilador defectuoso.</p>

<h2>Consejos de Mantenimiento</h2>
<ul>
  <li>Mantén el enfriador en un ambiente que no supere los 24°C</li>
  <li>No bloquees las ranuras de ventilación</li>
  <li>Limpia las bobinas condensadoras anualmente</li>
  <li>Revisa el sello de la puerta cada 6 meses</li>
</ul>

<h2>Servicio de Enfriadores HTRGroupTX</h2>
<p>Reparamos enfriadores de vino termoeléctricos y de compresor en Houston. Contáctenos para diagnóstico y reparación el mismo día.</p>
    `,
  },
  {
    slug: "garbage-disposal-repair-guide",
    imgKey: "disposal",
    date: "January 16, 2026",
    readMinutes: 3,
    titleEn: "Garbage Disposal Jammed or Leaking? Quick Fixes and When to Call",
    titleEs: "¿El Triturador de Basura Está Atascado o Gota? Soluciones Rápidas",
    excerptEn: "A jammed or leaking garbage disposal can bring your kitchen to a halt. Learn the simple fixes you can try yourself and the signs that require a professional.",
    excerptEs: "Un triturador atascado o que gotea puede paralizar tu cocina. Aprende las soluciones simples que puedes intentar tú mismo y las señales que requieren un profesional.",
    bodyEn: `
<h2>Garbage Disposal Jammed (Humming But Not Spinning)</h2>
<p>If you turn on the disposal and hear a humming sound but the grinding plate doesn't spin, it's jammed. Continuing to run it in this state will burn out the motor — turn it off immediately.</p>

<h3>How to Unjam It</h3>
<p><strong>Step 1:</strong> Turn off the disposal switch and unplug the unit (or turn off the circuit breaker).</p>
<p><strong>Step 2:</strong> Look under the sink at the bottom of the disposal unit. You'll find a small hex (Allen wrench) socket in the center. Insert a ¼-inch hex key and turn it back and forth to free the jam.</p>
<p><strong>Step 3:</strong> Use disposal tongs or pliers (never your hand) to remove the object causing the jam from inside the drain opening.</p>
<p><strong>Step 4:</strong> Press the red reset button on the bottom of the unit, wait 10 minutes, then restore power and test.</p>

<h2>Disposal Won't Turn On (No Humming)</h2>
<p>Press the reset button on the bottom of the unit — it often trips when the motor overheats. If that doesn't work, check that the unit is plugged in and that the circuit breaker hasn't tripped. If power is fine and it still won't start, the motor has likely failed.</p>

<h2>Disposal Is Leaking</h2>
<p>The location of the leak determines the fix:</p>
<ul>
  <li><strong>Leak from the top (sink flange):</strong> The plumber's putty seal between the disposal and the sink has failed. The unit needs to be removed and resealed.</li>
  <li><strong>Leak from the side (dishwasher or drain connection):</strong> The connection hose or clamp has come loose — tighten or replace the clamp.</li>
  <li><strong>Leak from the bottom:</strong> An internal seal has failed. This typically means the disposal needs replacement rather than repair.</li>
</ul>

<h2>Disposal Making Loud Grinding or Rattling Noises</h2>
<p>Hard objects — bottle caps, small bones, seeds, or silverware — are the most common cause. Turn off the unit and remove the object. Persistent grinding after clearing foreign objects suggests worn grinding components.</p>

<h2>Items That Should Never Go in a Disposal</h2>
<ul>
  <li>Grease and cooking oil (solidifies in pipes)</li>
  <li>Fibrous vegetables (celery, artichokes — wrap around the blade)</li>
  <li>Coffee grounds (accumulate and clog)</li>
  <li>Pasta, rice, and bread (expand with water)</li>
  <li>Bones (damage the grinding plate)</li>
</ul>

<h2>HTRGroupTX Garbage Disposal Service</h2>
<p>We repair and replace garbage disposals of all brands throughout the Houston area. If your unit can't be salvaged, we'll recommend the right replacement and install it the same day.</p>
    `,
    bodyEs: `
<h2>Triturador Atascado (Zumba Pero No Gira)</h2>
<p>Si enciendes el triturador y escuchas un zumbido pero la placa de molienda no gira, está atascado. Apágalo inmediatamente para no quemar el motor.</p>

<h3>Cómo Desatascarlo</h3>
<p><strong>Paso 1:</strong> Apaga el interruptor y desenchufa la unidad.</p>
<p><strong>Paso 2:</strong> Busca en la parte inferior del triturador un socket hexagonal pequeño. Inserta una llave Allen de ¼ de pulgada y gírala hacia adelante y hacia atrás para liberar el atasco.</p>
<p><strong>Paso 3:</strong> Usa pinzas (nunca tu mano) para quitar el objeto que causa el atasco.</p>
<p><strong>Paso 4:</strong> Presiona el botón de reinicio rojo en la parte inferior, espera 10 minutos, luego restaura la corriente y prueba.</p>

<h2>El Triturador No Enciende</h2>
<p>Presiona el botón de reinicio en la parte inferior — se activa frecuentemente cuando el motor se sobrecalienta. Si no funciona, verifica que esté enchufado y que el disyuntor no haya saltado.</p>

<h2>El Triturador Está Goteando</h2>
<ul>
  <li><strong>Fuga desde arriba (brida del fregadero):</strong> El sello de masilla de plomero ha fallado.</li>
  <li><strong>Fuga desde el lado:</strong> La manguera de conexión o la abrazadera se ha aflojado.</li>
  <li><strong>Fuga desde abajo:</strong> Un sello interno ha fallado — generalmente significa que el triturador necesita reemplazo.</li>
</ul>

<h2>Artículos que Nunca Deben Entrar en el Triturador</h2>
<ul>
  <li>Grasa y aceite de cocina</li>
  <li>Verduras fibrosas (apio, alcachofas)</li>
  <li>Posos de café</li>
  <li>Pasta, arroz y pan</li>
  <li>Huesos</li>
</ul>

<h2>Servicio de Trituradores HTRGroupTX</h2>
<p>Reparamos y reemplazamos trituradores de basura de todas las marcas en el área de Houston.</p>
    `,
  },
  {
    slug: "warming-drawer-repair-guide",
    imgKey: "warmer",
    date: "January 8, 2026",
    readMinutes: 3,
    titleEn: "Warming Drawer Not Heating or Stuck? Here's What to Do",
    titleEs: "¿El Cajón Calentador No Calienta o Está Atascado? Esto Es Lo que Debes Hacer",
    excerptEn: "A warming drawer keeps your meals at perfect serving temperature. When it stops heating or won't open, here's how to diagnose the problem.",
    excerptEs: "Un cajón calentador mantiene tus comidas a la temperatura perfecta. Cuando deja de calentar o no se abre, aquí te explicamos cómo diagnosticar el problema.",
    bodyEn: `
<h2>What Is a Warming Drawer?</h2>
<p>A warming drawer is a built-in appliance that maintains food at a safe serving temperature (typically 80–200°F / 27–93°C) without continuing to cook it. They're commonly found beneath wall ovens, built into kitchen islands, or as standalone units. Despite their simple function, they can develop several types of problems.</p>

<h2>Problem 1: Drawer Won't Heat</h2>
<p>If the drawer powers on but doesn't get warm, the most common causes are:</p>
<ul>
  <li><strong>Failed heating element:</strong> The hidden element beneath the drawer floor burns out over time. This requires professional replacement.</li>
  <li><strong>Faulty thermostat or temperature sensor:</strong> The thermostat regulates how much heat the element produces. A failed thermostat may prevent the element from activating at all.</li>
  <li><strong>Control board failure:</strong> If the display works but the heating doesn't, the control board may not be sending the signal to activate the element.</li>
</ul>

<h2>Problem 2: Drawer Stuck (Won't Open or Close)</h2>
<p>Warming drawer slides use the same mechanisms as kitchen cabinet slides — they can warp, corrode, or accumulate food debris. Try the following:</p>
<ul>
  <li>Pull firmly but evenly — avoid pulling at an angle, which can jam the slides</li>
  <li>Look for visible obstructions or food that may have fallen under or behind the drawer</li>
  <li>Check if the drawer has a child lock feature engaged (common in modern units)</li>
</ul>
<p>If the slides themselves are bent or corroded, they need professional replacement.</p>

<h2>Problem 3: Temperature Too High or Too Low</h2>
<p>If food is drying out or not staying warm enough, the thermostat needs calibration or replacement. Most modern warming drawers don't have user-adjustable thermostat calibration — this requires a technician with the appropriate diagnostic equipment.</p>

<h2>Problem 4: Control Panel Not Responding</h2>
<p>Unresponsive touch controls are often caused by:</p>
<ul>
  <li>A tripped circuit breaker — reset it and wait 30 seconds before restarting</li>
  <li>Moisture behind the touch panel — let it dry completely</li>
  <li>Failed control board or touch sensor — requires professional diagnosis</li>
</ul>

<h2>Maintenance Tips</h2>
<ul>
  <li>Wipe the interior after each use to prevent grease buildup on the element cover</li>
  <li>Keep the drawer slides clean and dry — wipe with a dry cloth monthly</li>
  <li>Never use abrasive cleaners on the control panel</li>
</ul>

<h2>HTRGroupTX Warming Drawer Repair</h2>
<p>We repair warming drawers of all major brands — Wolf, Sub-Zero, Thermador, GE, KitchenAid, and more — throughout the Houston metropolitan area. Contact us for a same-day service appointment.</p>
    `,
    bodyEs: `
<h2>¿Qué Es un Cajón Calentador?</h2>
<p>Un cajón calentador mantiene los alimentos a una temperatura de servicio segura (típicamente 27–93°C) sin continuar cocinándolos. A pesar de su función simple, pueden desarrollar varios tipos de problemas.</p>

<h2>Problema 1: El Cajón No Calienta</h2>
<p>Si el cajón se enciende pero no se calienta, las causas más comunes son:</p>
<ul>
  <li><strong>Elemento calefactor defectuoso:</strong> El elemento oculto debajo del piso del cajón se quema con el tiempo.</li>
  <li><strong>Termostato o sensor de temperatura defectuoso:</strong> Un termostato fallido puede impedir que el elemento se active por completo.</li>
  <li><strong>Fallo de la placa de control:</strong> Si la pantalla funciona pero el calefactor no, la placa puede no estar enviando la señal.</li>
</ul>

<h2>Problema 2: Cajón Atascado</h2>
<p>Los rieles del cajón calentador pueden deformarse, correrse o acumular residuos. Intenta lo siguiente:</p>
<ul>
  <li>Tira de manera firme y uniforme — evita tirar en ángulo</li>
  <li>Busca obstrucciones visibles o alimentos que puedan haber caído</li>
  <li>Verifica si el cajón tiene una función de bloqueo para niños activada</li>
</ul>

<h2>Problema 3: Temperatura Demasiado Alta o Baja</h2>
<p>Si la comida se seca o no se mantiene suficientemente caliente, el termostato necesita calibración o reemplazo por parte de un técnico.</p>

<h2>Problema 4: Panel de Control No Responde</h2>
<ul>
  <li>Un disyuntor activado — reinícialo y espera 30 segundos</li>
  <li>Humedad detrás del panel táctil — deja que se seque completamente</li>
  <li>Placa de control o sensor táctil defectuoso — requiere diagnóstico profesional</li>
</ul>

<h2>Reparación de Cajones Calentadores HTRGroupTX</h2>
<p>Reparamos cajones calentadores de todas las marcas principales en toda el área metropolitana de Houston.</p>
    `,
  },
];
