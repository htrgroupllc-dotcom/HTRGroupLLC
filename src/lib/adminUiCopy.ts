import type { AdminUiLang } from "@/components/admin/AdminLangToggle";

export type AdminUiCopy = {
  scheduleMgmt: string;
  protectedSection: string;
  logout: string;
  photoTab: string;
  photoUploadTitle: string;
  photoUploadDesc: string;
  settingsTab: string;
  settingsDesc: string;
  employeePortal: string;
  pay: string;
  tabSlots: string;
  tabBookings: string;
  tabPhotos: string;
  tabSettings: string;
  pickDate: string;
  refresh: string;
  dateLabel: string;
  slotsOn: string;
  legendFree: string;
  legendBlocked: string;
  legendBusy: string;
  blockReason: string;
  blockReasonPh: string;
  statusApproved: string;
  statusPending: string;
  statusCompleted: string;
  statusCancelled: string;
  slotFree: string;
  slotBlocked: string;
  releaseSlot: string;
  unblock: string;
  block: string;
  book: string;
  allBookings: string;
  activeBookings: string;
  activeOnly: string;
  allWithHistory: string;
  category: string;
  filterAll: string;
  searchPh: string;
  clearSearch: string;
  foundCount: string;
  selectAll: string;
  deselectAll: string;
  selected: string;
  deleteSelected: string;
  resetSelection: string;
  loadErrorTitle: string;
  noSearchResults: string;
  noBookings: string;
  history: string;
  colCreated: string;
  colVisitDate: string;
  colTime: string;
  colClient: string;
  colPhone: string;
  colEquipment: string;
  colStatus: string;
  colAction: string;
  approve: string;
  edit: string;
  reschedule: string;
  complete: string;
  cancel: string;
  deleteForever: string;
  restore: string;
  cancelBookingTitle: string;
  cancelBookingClient: string;
  cancelBookingTime: string;
  cancelBookingHint: string;
  back: string;
  yesRelease: string;
  completeTitle: string;
  completeHint: string;
  completeConfirm: string;
  bulkDeleteTitle: string;
  bulkDeleteCount: string;
  bulkDeleteWarn: string;
  deleting: string;
  deleteConfirm: string;
  deleteTitle: string;
  deleteWarn: string;
  restoreTitle: string;
  restoreClient: string;
  restoreDate: string;
  hideEdits: string;
  showEdits: string;
  clientName: string;
  phone: string;
  email: string;
  address: string;
  equipment: string;
  note: string;
  newDate: string;
  newTime: string;
  rescheduling: string;
  rescheduleBtn: string;
  editBookingTitle: string;
  dateRequired: string;
  dateFormatHint: string;
  timeRequired: string;
  saving: string;
  saveChanges: string;
  manualBookingTitle: string;
  zipOptional: string;
  booking: string;
  pinLabel: string;
  pinPh: string;
  pinWrong: string;
  login: string;
  dbDevEn: string;
  dbDevRu: string;
  fidEnableTitle: string;
  fidEnableDesc: string;
  fidEnable: string;
  fidRegistering: string;
  fidSkip: string;
  fidSignIn: string;
  fidFailed: string;
  fidUsePassword: string;
  apiNotConnected: string;
  adminPinMissing: string;
  sessionSecretMissing: string;
  serverError: string;
  loginError: string;
  noToken: string;
  connError: string;
};

const RU: AdminUiCopy = {
  scheduleMgmt: "Управление расписанием",
  protectedSection: "Защищённый раздел",
  logout: "Выйти",
  photoTab: "Фото",
  photoUploadTitle: "Загрузка фото на сайт",
  photoUploadDesc: "Раздел Our Work / Gallery — выберите Dental или Appliance перед загрузкой.",
  settingsTab: "Настройки",
  settingsDesc: "Всплывающее окно при первом заходе на сайт. Цены для Appliance и Dental задаются отдельно.",
  employeePortal: "Портал сотрудника",
  pay: "Оплата",
  tabSlots: "Слоты",
  tabBookings: "Заявки",
  tabPhotos: "Фото",
  tabSettings: "Настройки",
  pickDate: "Выберите дату",
  refresh: "Обновить",
  dateLabel: "Дата",
  slotsOn: "Слоты на",
  legendFree: "🟢 Свободен",
  legendBlocked: "🟠 Заблок.",
  legendBusy: "🔴 Занят",
  blockReason: "Причина блокировки:",
  blockReasonPh: "Повторный вызов...",
  statusApproved: "✅ Подтверждён",
  statusPending: "⏳ Ожидает",
  statusCompleted: "✓ Завершён",
  statusCancelled: "❌ Отменён",
  slotFree: "🟢 Свободен",
  slotBlocked: "🔒 Заблокирован",
  releaseSlot: "Освободить",
  unblock: "Разблокировать",
  block: "Блок",
  book: "Бронь",
  allBookings: "Все заявки",
  activeBookings: "Активные заявки",
  activeOnly: "Активные",
  allWithHistory: "Все заявки",
  category: "Категория:",
  filterAll: "Все",
  searchPh: "Поиск по имени, телефону, адресу, дате, оборудованию…",
  clearSearch: "Очистить",
  foundCount: "Найдено",
  selectAll: "Выбрать всё",
  deselectAll: "Снять всё",
  selected: "Выбрано",
  deleteSelected: "Удалить выбранные",
  resetSelection: "× Сбросить",
  loadErrorTitle: "Ошибка загрузки заявок",
  noSearchResults: "Ничего не найдено — попробуйте другой запрос",
  noBookings: "Заявок пока нет",
  history: "История",
  colCreated: "Создано",
  colVisitDate: "Дата визита",
  colTime: "Время",
  colClient: "Клиент",
  colPhone: "Телефон",
  colEquipment: "Оборудование",
  colStatus: "Статус",
  colAction: "Действие",
  approve: "Одобрить",
  edit: "Изменить",
  reschedule: "Перенести",
  complete: "Завершить",
  cancel: "Отменить",
  deleteForever: "Удалить",
  restore: "Восстановить",
  cancelBookingTitle: "Отменить бронирование?",
  cancelBookingClient: "Клиент",
  cancelBookingTime: "Время",
  cancelBookingHint: "Слот снова станет доступным для новых бронирований.",
  back: "Назад",
  yesRelease: "Да, освободить",
  completeTitle: "Отметить как завершённое?",
  completeHint: "Нажмите только после того как ремонт фактически выполнен. Бронь переместится в историю.",
  completeConfirm: "✓ Завершить",
  bulkDeleteTitle: "Удалить выбранные заявки?",
  bulkDeleteCount: "Количество",
  bulkDeleteWarn: "⚠️ Действие необратимо. Все выбранные заявки будут удалены из базы данных навсегда.",
  deleting: "Удаляем...",
  deleteConfirm: "🗑️ Удалить навсегда",
  deleteTitle: "Удалить заявку навсегда?",
  deleteWarn: "⚠️ Это действие необратимо. Заявка будет удалена из базы данных без возможности восстановления.",
  restoreTitle: "Восстановить заявку?",
  restoreClient: "Клиент",
  restoreDate: "Дата",
  hideEdits: "Скрыть изменения",
  showEdits: "✏️ Внести изменения в заявку",
  clientName: "Имя клиента",
  phone: "Телефон",
  email: "Email",
  address: "Адрес",
  equipment: "Оборудование",
  note: "Заметка",
  newDate: "Новая дата",
  newTime: "Новое время",
  rescheduling: "⏳ Переносим...",
  rescheduleBtn: "📅 Перенести",
  editBookingTitle: "Изменить бронирование",
  dateRequired: "Дата *",
  dateFormatHint: "Формат: Apr 25, 2026",
  timeRequired: "Время *",
  saving: "Сохранение…",
  saveChanges: "Сохранить изменения",
  manualBookingTitle: "Создать бронирование",
  zipOptional: "ZIP-код (необязательно)",
  booking: "Забронировать",
  pinLabel: "PIN-код",
  pinPh: "Введите PIN",
  pinWrong: "Неверный PIN-код",
  login: "Войти",
  dbDevEn: "Database developed by Eivaz Rakhmanov 2026",
  dbDevRu: "База данных разработана Эйвазом Рахмановым в 2026 году",
  fidEnableTitle: "Включить Face ID?",
  fidEnableDesc: "Вход одним касанием, без пароля.\nЛицо / отпечаток не покидает устройство.",
  fidEnable: "Включить Face ID / Отпечаток",
  fidRegistering: "Регистрация...",
  fidSkip: "Пропустить",
  fidSignIn: "Войти через Face ID",
  fidFailed: "Face ID не прошёл. Попробуйте пароль.",
  fidUsePassword: "Войти по паролю",
  apiNotConnected: "Сайт не подключён к API (VITE_API_BASE). Подождите деплой Cloudflare или проверьте Secrets.",
  adminPinMissing: "На сервере не задан ADMIN_PIN. Replit → Secrets → ADMIN_PIN → Publish.",
  sessionSecretMissing: "На сервере не задан SESSION_SECRET. Replit → Secrets → Publish.",
  serverError: "Ошибка сервера. Проверьте Replit Secrets.",
  loginError: "Ошибка входа. Проверьте подключение к API.",
  noToken: "Ошибка сервера: нет токена",
  connError: "Ошибка соединения",
};

const EN: AdminUiCopy = {
  scheduleMgmt: "Schedule management",
  protectedSection: "Protected area",
  logout: "Log out",
  photoTab: "Photos",
  photoUploadTitle: "Upload photos to site",
  photoUploadDesc: "Our Work / Gallery — choose Dental or Appliance before uploading.",
  settingsTab: "Settings",
  settingsDesc: "First-visit popup. Appliance and Dental prices are set separately.",
  employeePortal: "Employee Portal",
  pay: "Pay",
  tabSlots: "Slots",
  tabBookings: "Bookings",
  tabPhotos: "Photos",
  tabSettings: "Settings",
  pickDate: "Select date",
  refresh: "Refresh",
  dateLabel: "Date",
  slotsOn: "Slots for",
  legendFree: "🟢 Free",
  legendBlocked: "🟠 Blocked",
  legendBusy: "🔴 Booked",
  blockReason: "Block reason:",
  blockReasonPh: "Follow-up visit...",
  statusApproved: "✅ Approved",
  statusPending: "⏳ Pending",
  statusCompleted: "✓ Completed",
  statusCancelled: "❌ Cancelled",
  slotFree: "🟢 Free",
  slotBlocked: "🔒 Blocked",
  releaseSlot: "Release",
  unblock: "Unblock",
  block: "Block",
  book: "Book",
  allBookings: "All bookings",
  activeBookings: "Active bookings",
  activeOnly: "Active",
  allWithHistory: "All bookings",
  category: "Category:",
  filterAll: "All",
  searchPh: "Search by name, phone, address, date, equipment…",
  clearSearch: "Clear",
  foundCount: "Found",
  selectAll: "Select all",
  deselectAll: "Deselect all",
  selected: "Selected",
  deleteSelected: "Delete selected",
  resetSelection: "× Reset",
  loadErrorTitle: "Failed to load bookings",
  noSearchResults: "Nothing found — try another query",
  noBookings: "No bookings yet",
  history: "History",
  colCreated: "Created",
  colVisitDate: "Visit date",
  colTime: "Time",
  colClient: "Client",
  colPhone: "Phone",
  colEquipment: "Equipment",
  colStatus: "Status",
  colAction: "Action",
  approve: "Approve",
  edit: "Edit",
  reschedule: "Reschedule",
  complete: "Complete",
  cancel: "Cancel",
  deleteForever: "Delete",
  restore: "Restore",
  cancelBookingTitle: "Cancel booking?",
  cancelBookingClient: "Client",
  cancelBookingTime: "Time",
  cancelBookingHint: "The slot will become available for new bookings.",
  back: "Back",
  yesRelease: "Yes, release",
  completeTitle: "Mark as completed?",
  completeHint: "Click only after the repair is actually done. The booking moves to history.",
  completeConfirm: "✓ Complete",
  bulkDeleteTitle: "Delete selected bookings?",
  bulkDeleteCount: "Count",
  bulkDeleteWarn: "⚠️ This cannot be undone. All selected bookings will be permanently deleted.",
  deleting: "Deleting...",
  deleteConfirm: "🗑️ Delete forever",
  deleteTitle: "Delete booking forever?",
  deleteWarn: "⚠️ This cannot be undone. The booking will be permanently removed from the database.",
  restoreTitle: "Restore booking?",
  restoreClient: "Client",
  restoreDate: "Date",
  hideEdits: "Hide edits",
  showEdits: "✏️ Edit booking before restore",
  clientName: "Client name",
  phone: "Phone",
  email: "Email",
  address: "Address",
  equipment: "Equipment",
  note: "Note",
  newDate: "New date",
  newTime: "New time",
  rescheduling: "⏳ Rescheduling...",
  rescheduleBtn: "📅 Reschedule",
  editBookingTitle: "Edit booking",
  dateRequired: "Date *",
  dateFormatHint: "Format: Apr 25, 2026",
  timeRequired: "Time *",
  saving: "Saving…",
  saveChanges: "Save changes",
  manualBookingTitle: "Create booking",
  zipOptional: "ZIP code (optional)",
  booking: "Book",
  pinLabel: "PIN code",
  pinPh: "Enter PIN",
  pinWrong: "Wrong PIN",
  login: "Sign in",
  dbDevEn: "Database developed by Eivaz Rakhmanov 2026",
  dbDevRu: "Database developed by Eivaz Rakhmanov in 2026",
  fidEnableTitle: "Enable Face ID?",
  fidEnableDesc: "Sign in with one touch, no password.\nYour face / fingerprint never leaves your device.",
  fidEnable: "Enable Face ID / Fingerprint",
  fidRegistering: "Registering...",
  fidSkip: "Skip",
  fidSignIn: "Sign in with Face ID",
  fidFailed: "Face ID failed. Try password.",
  fidUsePassword: "Sign in with password",
  apiNotConnected: "Site is not connected to API (VITE_API_BASE). Wait for Cloudflare deploy or check Secrets.",
  adminPinMissing: "ADMIN_PIN is not set on the server. Replit → Secrets → ADMIN_PIN → Publish.",
  sessionSecretMissing: "SESSION_SECRET is not set on the server. Replit → Secrets → Publish.",
  serverError: "Server error. Check Replit Secrets.",
  loginError: "Login error. Check API connection.",
  noToken: "Server error: no token",
  connError: "Connection error",
};

const AZ: AdminUiCopy = {
  scheduleMgmt: "Cədvəl idarəetməsi",
  protectedSection: "Qorunan bölmə",
  logout: "Çıxış",
  photoTab: "Foto",
  photoUploadTitle: "Sayta foto yüklə",
  photoUploadDesc: "Our Work / Gallery — yükləməzdən əvvəl Dental və ya Appliance seçin.",
  settingsTab: "Parametrlər",
  settingsDesc: "İlk giriş pəncərəsi. Appliance və Dental qiymətləri ayrıca təyin olunur.",
  employeePortal: "Əməkdaş portalı",
  pay: "Ödəniş",
  tabSlots: "Slotlar",
  tabBookings: "Sifarişlər",
  tabPhotos: "Foto",
  tabSettings: "Parametrlər",
  pickDate: "Tarix seçin",
  refresh: "Yenilə",
  dateLabel: "Tarix",
  slotsOn: "Slotlar",
  legendFree: "🟢 Boş",
  legendBlocked: "🟠 Bloklanıb",
  legendBusy: "🔴 Bron edilib",
  blockReason: "Blok səbəbi:",
  blockReasonPh: "Təkrar ziyarət...",
  statusApproved: "✅ Təsdiqlənib",
  statusPending: "⏳ Gözləyir",
  statusCompleted: "✓ Tamamlanıb",
  statusCancelled: "❌ Ləğv edilib",
  slotFree: "🟢 Boş",
  slotBlocked: "🔒 Bloklanıb",
  releaseSlot: "Azad et",
  unblock: "Blokdan çıxar",
  block: "Blokla",
  book: "Bron et",
  allBookings: "Bütün sifarişlər",
  activeBookings: "Aktiv sifarişlər",
  activeOnly: "Aktiv",
  allWithHistory: "Bütün sifarişlər",
  category: "Kateqoriya:",
  filterAll: "Hamısı",
  searchPh: "Ad, telefon, ünvan, tarix, avadanlıq üzrə axtarış…",
  clearSearch: "Təmizlə",
  foundCount: "Tapıldı",
  selectAll: "Hamısını seç",
  deselectAll: "Seçimi ləğv et",
  selected: "Seçilib",
  deleteSelected: "Seçilmişləri sil",
  resetSelection: "Seçimi sıfırla",
  loadErrorTitle: "Yükləmə xətası",
  noSearchResults: "Nəticə yoxdur",
  noBookings: "Sifariş yoxdur",
  history: "Tarixçə",
  colCreated: "Yaradılıb",
  colVisitDate: "Ziyarət tarixi",
  colTime: "Vaxt",
  colClient: "Müştəri",
  colPhone: "Telefon",
  colEquipment: "Avadanlıq",
  colStatus: "Status",
  colAction: "Əməliyyat",
  approve: "Təsdiq et",
  edit: "Redaktə",
  reschedule: "Yenidən planlaşdır",
  complete: "Tamamla",
  cancel: "Ləğv et",
  deleteForever: "Həmişəlik sil",
  restore: "Bərpa et",
  cancelBookingTitle: "Sifariş ləğv edilsin?",
  cancelBookingClient: "Müştəri",
  cancelBookingTime: "Vaxt",
  cancelBookingHint: "Slot yeni sifarişlər üçün boşalacaq.",
  back: "Geri",
  yesRelease: "Bəli, azad et",
  completeTitle: "Tamamlanmış kimi qeyd edilsin?",
  completeHint: "Yalnız təmir bitdikdən sonra basın. Sifariş tarixçəyə keçir.",
  completeConfirm: "✓ Tamamla",
  bulkDeleteTitle: "Seçilmiş sifarişlər silinsin?",
  bulkDeleteCount: "Say",
  bulkDeleteWarn: "⚠️ Geri qaytarıla bilməz. Seçilmiş sifarişlər həmişəlik silinəcək.",
  deleting: "Silinir...",
  deleteConfirm: "🗑️ Həmişəlik sil",
  deleteTitle: "Sifariş həmişəlik silinsin?",
  deleteWarn: "⚠️ Geri qaytarıla bilməz. Sifariş bazadan həmişəlik silinəcək.",
  restoreTitle: "Sifariş bərpa edilsin?",
  restoreClient: "Müştəri",
  restoreDate: "Tarix",
  hideEdits: "Redaktəni gizlət",
  showEdits: "✏️ Bərpadan əvvəl sifarişi redaktə et",
  clientName: "Müştəri adı",
  phone: "Telefon",
  email: "Email",
  address: "Ünvan",
  equipment: "Avadanlıq",
  note: "Qeyd",
  newDate: "Yeni tarix",
  newTime: "Yeni vaxt",
  rescheduling: "⏳ Yenidən planlaşdırılır...",
  rescheduleBtn: "📅 Yenidən planlaşdır",
  editBookingTitle: "Sifarişi redaktə et",
  dateRequired: "Tarix *",
  dateFormatHint: "Format: Apr 25, 2026",
  timeRequired: "Vaxt *",
  saving: "Saxlanılır…",
  saveChanges: "Dəyişiklikləri saxla",
  manualBookingTitle: "Sifariş yarat",
  zipOptional: "ZIP kod (istəyə bağlı)",
  booking: "Bron et",
  pinLabel: "PIN kod",
  pinPh: "PIN daxil edin",
  pinWrong: "Yanlış PIN",
  login: "Daxil ol",
  dbDevEn: "Database developed by Eivaz Rakhmanov 2026",
  dbDevRu: "Database developed by Eivaz Rakhmanov in 2026",
  fidEnableTitle: "Face ID aktivləşdirilsin?",
  fidEnableDesc: "Bir toxunuşla daxil olun, şifrəsiz.\nÜz / barmaq izi cihazdan çıxmır.",
  fidEnable: "Face ID / Barmaq izini aktivləşdir",
  fidRegistering: "Qeydiyyat...",
  fidSkip: "Keç",
  fidSignIn: "Face ID ilə daxil ol",
  fidFailed: "Face ID uğursuz oldu. Şifrəni yoxlayın.",
  fidUsePassword: "Şifrə ilə daxil ol",
  apiNotConnected: "Sayt API-yə qoşulmayıb (VITE_API_BASE). Cloudflare deploy gözləyin və ya Secrets yoxlayın.",
  adminPinMissing: "Serverdə ADMIN_PIN yoxdur. Replit → Secrets → ADMIN_PIN → Publish.",
  sessionSecretMissing: "Serverdə SESSION_SECRET yoxdur. Replit → Secrets → Publish.",
  serverError: "Server xətası. Replit Secrets yoxlayın.",
  loginError: "Giriş xətası. API bağlantısını yoxlayın.",
  noToken: "Server xətası: token yoxdur",
  connError: "Bağlantı xətası",
};


export const ADMIN_UI: Record<AdminUiLang, AdminUiCopy> = { ru: RU, en: EN, az: AZ };

export function getAdminUi(lang: AdminUiLang): AdminUiCopy {
  return ADMIN_UI[lang];
}
