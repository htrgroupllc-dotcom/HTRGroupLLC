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
};

export const ADMIN_UI: Record<AdminUiLang, AdminUiCopy> = { ru: RU, en: EN };

export function getAdminUi(lang: AdminUiLang): AdminUiCopy {
  return ADMIN_UI[lang];
}
