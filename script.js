/* =========================================================
   IGA KEEN V3 — Complete Application Logic
   Vanilla JavaScript + Supabase v2
   ========================================================= */

const SUPABASE_URL = 'https://zywwypqddnvslgqztnep.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_fDRyejheqSBrLQcBe8KpQw_L76yFtp8';

const ADMIN_UID = '85282aac-7813-442f-a51b-6d43e3eccf1e';
const FALLBACK_UUID = '00000000-0000-0000-0000-000000000000'; 

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

/* =========================================================
   STATE
   ========================================================= */
const state = {
  user: null,
  profile: null,
  driver: null,
  isAdmin: false,
  role: 'customer',
  lang: localStorage.getItem('igakeen_lang') || 'so',
  theme: localStorage.getItem('igakeen_theme') || 'light',
  screen: 'home',
  screenParam: null,
  orders: [],
  orderService: 'taxi',
  signupRole: 'customer',
  unread: 0,
  chatChannel: null,
  notifChannel: null,
  orderChannel: null,
  adminSection: 'overview',
  adminData: {},
  chatOrder: null,
  chatMessages: [],
  authMode: 'login',
  recoveryMode: false,
  currentOrder: null
};

/* =========================================================
   TRANSLATIONS
   ========================================================= */
const I18N = {
  so: {
    'auth.tagline': 'Adeeggaaga meel kasta.', 'auth.login': 'Gelid', 'auth.signup': 'Diiwaangelin',
    'auth.email': 'Email', 'auth.password': 'Password', 'auth.forgot': 'Password ma illoowday?',
    'auth.fullName': 'Magaca oo buuxa', 'auth.phone': 'Telefoon', 'auth.iam': 'Macmiil mise Darawal?',
    'role.customer': 'Macmiil', 'role.driver': 'Darawal', 'driver.serviceType': 'Adeegga',
    'driver.vehicle': 'Faahfaahinta gaariga', 'driver.pendingHint': 'Darawallada cusub waxaa ansixiya maamulka ka hor inta aanay dalabyo qaadan.',
    'nav.home': 'Bogga', 'nav.orders': 'Dalabyo', 'nav.community': 'Bulsho', 'nav.notifications': 'Ogeysiis',
    'nav.account': 'Akoon', 'nav.chat': 'Sheeko', 'nav.dashboard': 'Dashboard', 'nav.drivers': 'Darawalo',
    'nav.fees': 'Fees', 'nav.settings': 'Dejinta', 'home.heroTitle': 'Maxaad u baahan tahay?',
    'home.heroSub': 'Dooro adeegga, waxaan ku xiriirinaynaa darawal u dhow.', 'home.services': 'Adeegyada',
    'home.recent': 'Dalabyadaada ugu dambeeyay', 'home.viewAll': 'Dhammaan', 'service.taxi': 'Taxi',
    'service.bajaaj': 'Bajaaj', 'service.delivery': 'Delivery', 'service.safar': 'Safar',
    'service.taxi.desc': 'Safar degdeg ah oo ammaan ah', 'service.bajaaj.desc': 'Safar gaaban oo jaban',
    'service.delivery.desc': 'Dir alaab si ammaan ah', 'service.safar.desc': 'Safar dheer oo la qorsheeyay',
    'common.loading': 'Waa la soo dejinayaa...', 'common.error': 'Khalad ayaa dhacay. Fadlan mar kale isku day.',
    'common.retry': 'Isku day', 'common.cancel': 'Jooji', 'common.save': 'Kaydi', 'common.send': 'Dir',
    'common.close': 'Xir', 'common.confirm': 'Xaqiiji', 'common.reject': 'Diid', 'common.back': 'Dib u noqo',
    'common.empty': 'Wax ma jiraan', 'common.all': 'Dhammaan', 'common.active': 'Firfircoon',
    'common.completed': 'Dhammaaday', 'common.cancelled': 'La joojiyay', 'common.new': 'Cusub',
    'common.online': 'Online', 'common.offline': 'Offline', 'common.approved': 'La ansixiyay',
    'common.pending': 'Sugitaan', 'common.rejected': 'La diiday', 'common.unread': 'Aan la akhrin',
    'common.read': 'La akhriyay', 'order.create': 'Dalab samee', 'order.pickup': 'Goobta qaadista',
    'order.destination': 'Goobta gaadhista', 'order.departure': 'Goobta bixista', 'order.phone': 'Telefoon',
    'order.passengers': 'Tirada rakaabka', 'order.notes': 'Faahfaahin dheeraad ah',
    'order.scheduled': 'Waqtiga safarka', 'order.receiver': 'Qaataha / Xiriirka', 'order.submit': 'Dir dalabka',
    'order.detail': 'Faahfaahinta dalabka', 'order.chat': 'La sheekee darawalka', 'order.accept': 'Aqbal dalabka',
    'order.feePay': 'Fee bixi', 'order.feeRequired': 'Fee loo baahan yahay', 'order.feeSubmitted': 'Fee la gudbiyay — sugitaan maamul',
    'order.feeConfirmed': 'Fee la xaqiijiyay', 'order.noDriver': 'Weli darawal lama xiriirin',
    'order.status': 'Xaaladda', 'order.orderNumber': 'Lambarka dalabka', 'location.current': 'Isticmaal goobta hadda',
    'location.locating': 'Goobta waa la raadinayaa...', 'location.denied': 'Goobta lama helin. Geli cinwaanka gacanta.',
    'location.manual': 'Geli cinwaanka gacanta', 'driver.dashboard': 'Dashboard-ka Darawalka', 'driver.status': 'Xaaladda darawalka',
    'driver.available': 'Dalabyo la heli karo', 'driver.assigned': 'Dalabyada lagu qoondeeyay', 'driver.completed': 'Shaqooyin dhammaaday',
    'driver.feeStatus': 'Xaaladda fee', 'driver.becomeOnline': 'Noqo Online', 'driver.becomeOffline': 'Noqo Offline',
    'driver.pendingMsg': 'Diiwaangelintaada waa la sugayaa. Maamulka ayaa ansixin doona.', 'driver.rejectedMsg': 'Diiwaangelintaada waa la diiday. La xiriir maamulka.',
    'driver.feeModal': 'Gudbi lacagta fee', 'driver.reference': 'Tixraaca lacagta', 'driver.paymentNote': 'Faahfaahin lacag',
    'admin.overview': 'Guudmar', 'admin.orders': 'Dalabyo', 'admin.drivers': 'Darawalo', 'admin.fees': 'Fee Payments',
    'admin.customers': 'Macaamiil', 'admin.community': 'Bulsho', 'admin.notifications': 'Ogeysiis', 'admin.serviceFees': 'Adeeg Fees',
    'admin.settings': 'Dejinta', 'admin.pendingDrivers': 'Darawalo sugitaan', 'admin.pendingFees': 'Fee sugitaan',
    'admin.totalOrders': 'Dalabyo wadarta', 'admin.newOrders': 'Dalabyo cusub', 'admin.activeOrders': 'Dalabyo firfircoon',
    'admin.completedOrders': 'Dalabyo dhammaaday', 'admin.approvedDrivers': 'Darawalo la ansixiyay', 'admin.customersCount': 'Macaamiil',
    'admin.approve': 'Ansixi', 'admin.reject': 'Diid', 'admin.confirmFee': 'Xaqiiji fee', 'admin.rejectFee': 'Diid fee',
    'admin.publishNotice': 'Daabac ogeysiis', 'admin.audience': 'Dadka la gaarsiinayo', 'admin.audienceAll': 'Dhammaan isticmaalayaasha',
    'admin.audienceCustomers': 'Macaamiisha kaliya', 'admin.audienceDrivers': 'Darawallada la ansixiyay',
    'community.newPost': 'Qor wax cusub', 'community.post': 'Daabac', 'community.like': 'Jeclaado', 'community.comment': 'Faallo',
    'community.writeComment': 'Qor faallo...', 'community.noPosts': 'Weli wax post ah ma jiraan.', 'notif.title': 'Ogeysiisyada',
    'notif.markAll': 'Calaamadee dhammaan', 'account.profile': 'Akoonka', 'account.edit': 'Wax ka beddel', 'account.logout': 'Ka bax',
    'account.language': 'Luqadda', 'account.theme': 'Muuqaalka', 'account.light': 'Iftiin', 'account.dark': 'Mugdi',
    'account.saved': 'Waa la kaydiyay', 'auth.resetTitle': 'Dib u dejinta password', 'auth.resetSend': 'Dir linkiga',
    'auth.newPassword': 'Password cusub', 'auth.updatePassword': 'Cusboonaysii password', 'auth.checkEmail': 'Hubi emailkaaga si aad u xaqiijiso akoonka.',
    'auth.welcome': 'Ku soo dhawoow', 'error.generic': 'Dalabka lama dhammaystirin. Fadlan mar kale isku day.',
    'error.network': 'Internet connection-ka waa go\'an yahay.', 'error.auth': 'Email ama password khaldan.',
    'error.permission': 'Ma haysato fasax ku filan.', 'offline': 'Internet connection-ka waa go\'an yahay.', 'online': 'Connection-ka waa soo noqday.'
  },
  en: {
    'auth.tagline': 'Your service, anywhere.', 'auth.login': 'Log in', 'auth.signup': 'Sign up',
    'auth.email': 'Email', 'auth.password': 'Password', 'auth.forgot': 'Forgot password?',
    'auth.fullName': 'Full name', 'auth.phone': 'Phone', 'auth.iam': 'Customer or Driver?',
    'role.customer': 'Customer', 'role.driver': 'Driver', 'driver.serviceType': 'Service',
    'driver.vehicle': 'Vehicle description', 'driver.pendingHint': 'New drivers must be approved by admin before receiving orders.',
    'nav.home': 'Home', 'nav.orders': 'Orders', 'nav.community': 'Community', 'nav.notifications': 'Alerts',
    'nav.account': 'Account', 'nav.chat': 'Chat', 'nav.dashboard': 'Dashboard', 'nav.drivers': 'Drivers',
    'nav.fees': 'Fees', 'nav.settings': 'Settings', 'home.heroTitle': 'What do you need?',
    'home.heroSub': 'Choose a service and we will connect you with a nearby driver.', 'home.services': 'Services',
    'home.recent': 'Your recent orders', 'home.viewAll': 'View all', 'service.taxi': 'Taxi',
    'service.bajaaj': 'Bajaaj', 'service.delivery': 'Delivery', 'service.safar': 'Safar',
    'service.taxi.desc': 'Fast and safe rides', 'service.bajaaj.desc': 'Short affordable trips',
    'service.delivery.desc': 'Send packages safely', 'service.safar.desc': 'Long planned journeys',
    'common.loading': 'Loading...', 'common.error': 'Something went wrong. Please try again.',
    'common.retry': 'Retry', 'common.cancel': 'Cancel', 'common.save': 'Save', 'common.send': 'Send',
    'common.close': 'Close', 'common.confirm': 'Confirm', 'common.reject': 'Reject', 'common.back': 'Back',
    'common.empty': 'Nothing here', 'common.all': 'All', 'common.active': 'Active',
    'common.completed': 'Completed', 'common.cancelled': 'Cancelled', 'common.new': 'New',
    'common.online': 'Online', 'common.offline': 'Offline', 'common.approved': 'Approved',
    'common.pending': 'Pending', 'common.rejected': 'Rejected', 'common.unread': 'Unread',
    'common.read': 'Read', 'order.create': 'Create order', 'order.pickup': 'Pickup',
    'order.destination': 'Destination', 'order.departure': 'Departure', 'order.phone': 'Phone',
    'order.passengers': 'Passengers', 'order.notes': 'Notes', 'order.scheduled': 'Scheduled time',
    'order.receiver': 'Receiver / Contact', 'order.submit': 'Send order', 'order.detail': 'Order details',
    'order.chat': 'Chat with driver', 'order.accept': 'Accept order', 'order.feePay': 'Pay fee',
    'order.feeRequired': 'Fee required', 'order.feeSubmitted': 'Fee submitted — awaiting admin',
    'order.feeConfirmed': 'Fee confirmed', 'order.noDriver': 'No driver assigned yet', 'order.status': 'Status',
    'order.orderNumber': 'Order number', 'location.current': 'Use current location', 'location.locating': 'Locating...',
    'location.denied': 'Location unavailable. Enter address manually.', 'location.manual': 'Enter address manually',
    'driver.dashboard': 'Driver Dashboard', 'driver.status': 'Driver status', 'driver.available': 'Available orders',
    'driver.assigned': 'Assigned orders', 'driver.completed': 'Completed jobs', 'driver.feeStatus': 'Fee status',
    'driver.becomeOnline': 'Go online', 'driver.becomeOffline': 'Go offline', 'driver.pendingMsg': 'Your registration is pending admin approval.',
    'driver.rejectedMsg': 'Your registration was rejected. Contact admin.', 'driver.feeModal': 'Submit fee payment',
    'driver.reference': 'Payment reference', 'driver.paymentNote': 'Payment note', 'admin.overview': 'Overview',
    'admin.orders': 'Orders', 'admin.drivers': 'Drivers', 'admin.fees': 'Fee Payments', 'admin.customers': 'Customers',
    'admin.community': 'Community', 'admin.notifications': 'Notifications', 'admin.serviceFees': 'Service Fees',
    'admin.settings': 'Settings', 'admin.pendingDrivers': 'Pending drivers', 'admin.pendingFees': 'Pending fees',
    'admin.totalOrders': 'Total orders', 'admin.newOrders': 'New orders', 'admin.activeOrders': 'Active orders',
    'admin.completedOrders': 'Completed orders', 'admin.approvedDrivers': 'Approved drivers', 'admin.customersCount': 'Customers',
    'admin.approve': 'Approve', 'admin.reject': 'Reject', 'admin.confirmFee': 'Confirm fee', 'admin.rejectFee': 'Reject fee',
    'admin.publishNotice': 'Publish notice', 'admin.audience': 'Audience', 'admin.audienceAll': 'All users',
    'admin.audienceCustomers': 'Customers only', 'admin.audienceDrivers': 'Approved drivers only', 'community.newPost': 'Create post',
    'community.post': 'Post', 'community.like': 'Like', 'community.comment': 'Comment', 'community.writeComment': 'Write a comment...',
    'community.noPosts': 'No posts yet.', 'notif.title': 'Notifications', 'notif.markAll': 'Mark all read',
    'account.profile': 'Account', 'account.edit': 'Edit profile', 'account.logout': 'Log out', 'account.language': 'Language',
    'account.theme': 'Theme', 'account.light': 'Light', 'account.dark': 'Dark', 'account.saved': 'Saved',
    'auth.resetTitle': 'Reset password', 'auth.resetSend': 'Send reset link', 'auth.newPassword': 'New password',
    'auth.updatePassword': 'Update password', 'auth.checkEmail': 'Check your email to confirm your account.',
    'auth.welcome': 'Welcome', 'error.generic': 'Request could not be completed. Please try again.',
    'error.network': 'You are offline.', 'error.auth': 'Invalid email or password.', 'error.permission': 'You do not have permission.',
    'offline': 'Internet connection lost.', 'online': 'Connection restored.'
  },
  ar: {
    'auth.tagline': 'خدمتك في أي مكان.', 'auth.login': 'تسجيل الدخول', 'auth.signup': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني', 'auth.password': 'كلمة المرور', 'auth.forgot': 'نسيت كلمة المرور؟',
    'auth.fullName': 'الاسم الكامل', 'auth.phone': 'الهاتف', 'auth.iam': 'عميل أم سائق؟',
    'role.customer': 'عميل', 'role.driver': 'سائق', 'driver.serviceType': 'الخدمة',
    'driver.vehicle': 'وصف المركبة', 'driver.pendingHint': 'يجب أن يوافق المسؤول على السائقين الجدد قبل استلام الطلبات.',
    'nav.home': 'الرئيسية', 'nav.orders': 'الطلبات', 'nav.community': 'المجتمع', 'nav.notifications': 'الإشعارات',
    'nav.account': 'الحساب', 'nav.chat': 'المحادثة', 'nav.dashboard': 'لوحة التحكم', 'nav.drivers': 'السائقون',
    'nav.fees': 'الرسوم', 'nav.settings': 'الإعدادات', 'home.heroTitle': 'ماذا تحتاج؟',
    'home.heroSub': 'اختر الخدمة وسنصلك بسائق قريب.', 'home.services': 'الخدمات', 'home.recent': 'طلباتك الأخيرة',
    'home.viewAll': 'عرض الكل', 'service.taxi': 'تاكسي', 'service.bajaaj': 'باجاج', 'service.delivery': 'توصيل',
    'service.safar': 'سفر', 'service.taxi.desc': 'رحلات سريعة وآمنة', 'service.bajaaj.desc': 'رحلات قصيرة ميسورة',
    'service.delivery.desc': 'أرسل الطرود بأمان', 'service.safar.desc': 'رحلات طويلة مخططة',
    'common.loading': 'جار التحميل...', 'common.error': 'حدث خطأ. يرجى المحاولة مرة أخرى.', 'common.retry': 'إعادة المحاولة',
    'common.cancel': 'إلغاء', 'common.save': 'حفظ', 'common.send': 'إرسال', 'common.close': 'إغلاق',
    'common.confirm': 'تأكيد', 'common.reject': 'رفض', 'common.back': 'رجوع', 'common.empty': 'لا يوجد شيء',
    'common.all': 'الكل', 'common.active': 'نشط', 'common.completed': 'مكتمل', 'common.cancelled': 'ملغي',
    'common.new': 'جديد', 'common.online': 'متصل', 'common.offline': 'غير متصل', 'common.approved': 'موافق عليه',
    'common.pending': 'قيد الانتظار', 'common.rejected': 'مرفوض', 'common.unread': 'غير مقروء', 'common.read': 'مقروء',
    'order.create': 'إنشاء طلب', 'order.pickup': 'نقطة الالتقاط', 'order.destination': 'الوجهة', 'order.departure': 'نقطة الانطلاق',
    'order.phone': 'الهاتف', 'order.passengers': 'عدد الركاب', 'order.notes': 'ملاحظات', 'order.scheduled': 'وقت الرحلة',
    'order.receiver': 'المستلم / جهة الاتصال', 'order.submit': 'إرسال الطلب', 'order.detail': 'تفاصيل الطلب',
    'order.chat': 'تحدث مع السائق', 'order.accept': 'قبول الطلب', 'order.feePay': 'دفع الرسوم', 'order.feeRequired': 'الرسوم مطلوبة',
    'order.feeSubmitted': 'تم إرسال الرسوم — بانتظار الإدارة', 'order.feeConfirmed': 'تم تأكيد الرسوم',
    'order.noDriver': 'لم يتم تعيين سائق بعد', 'order.status': 'الحالة', 'order.orderNumber': 'رقم الطلب',
    'location.current': 'استخدم الموقع الحالي', 'location.locating': 'جار تحديد الموقع...', 'location.denied': 'الموقع غير متاح. أدخل العنوان يدوياً.',
    'location.manual': 'إدخال العنوان يدوياً', 'driver.dashboard': 'لوحة السائق', 'driver.status': 'حالة السائق',
    'driver.available': 'الطلبات المتاحة', 'driver.assigned': 'الطلبات المعينة', 'driver.completed': 'الأعمال المكتملة',
    'driver.feeStatus': 'حالة الرسوم', 'driver.becomeOnline': 'اتصل', 'driver.becomeOffline': 'قطع الاتصال',
    'driver.pendingMsg': 'تسجيلك بانتظار موافقة الإدارة.', 'driver.rejectedMsg': 'تم رفض تسجيلك. تواصل مع الإدارة.',
    'driver.feeModal': 'إرسال دفع الرسوم', 'driver.reference': 'مرجع الدفع', 'driver.paymentNote': 'ملاحظة الدفع',
    'admin.overview': 'نظرة عامة', 'admin.orders': 'الطلبات', 'admin.drivers': 'السائقون', 'admin.fees': 'مدفوعات الرسوم',
    'admin.customers': 'العملاء', 'admin.community': 'المجتمع', 'admin.notifications': 'الإشعارات', 'admin.serviceFees': 'رسوم الخدمة',
    'admin.settings': 'الإعدادات', 'admin.pendingDrivers': 'سائقون قيد الانتظار', 'admin.pendingFees': 'رسوم قيد الانتظار',
    'admin.totalOrders': 'إجمالي الطلبات', 'admin.newOrders': 'طلبات جديدة', 'admin.activeOrders': 'طلبات نشطة',
    'admin.completedOrders': 'طلبات مكتملة', 'admin.approvedDrivers': 'سائقون موافق عليهم', 'admin.customersCount': 'العملاء',
    'admin.approve': 'موافقة', 'admin.reject': 'رفض', 'admin.confirmFee': 'تأكيد الرسوم', 'admin.rejectFee': 'رفض الرسوم',
    'admin.publishNotice': 'نشر إشعار', 'admin.audience': 'الجمهور', 'admin.audienceAll': 'جميع المستخدمين',
    'admin.audienceCustomers': 'العملاء فقط', 'admin.audienceDrivers': 'السائقون الموافق عليهم فقط',
    'community.newPost': 'إنشاء منشور', 'community.post': 'نشر', 'community.like': 'إعجاب', 'community.comment': 'تعليق',
    'community.writeComment': 'اكتب تعليقاً...', 'community.noPosts': 'لا توجد منشورات بعد.', 'notif.title': 'الإشعارات',
    'notif.markAll': 'تحديد الكل كمقروء', 'account.profile': 'الحساب', 'account.edit': 'تعديل الملف', 'account.logout': 'تسجيل الخروج',
    'account.language': 'اللغة', 'account.theme': 'المظهر', 'account.light': 'فاتح', 'account.dark': 'داكن', 'account.saved': 'تم الحفظ',
    'auth.resetTitle': 'إعادة تعيين كلمة المرور', 'auth.resetSend': 'إرسال الرابط', 'auth.newPassword': 'كلمة مرور جديدة',
    'auth.updatePassword': 'تحديث كلمة المرور', 'auth.checkEmail': 'تحقق من بريدك لتأكيد الحساب.', 'auth.welcome': 'مرحباً',
    'error.generic': 'تعذر إكمال الطلب. يرجى المحاولة مرة أخرى.', 'error.network': 'أنت غير متصل بالإنترنت.',
    'error.auth': 'البريد أو كلمة المرور غير صحيحة.', 'error.permission': 'ليس لديك إذن.', 'offline': 'انقطع الاتصال بالإنترنت.', 'online': 'تمت استعادة الاتصال.'
  }
};

/* =========================================================
   UTILITIES
   ========================================================= */
const $ = (id) => document.getElementById(id);
const t = (key) => (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleString(state.lang === 'ar' ? 'ar' : state.lang === 'so' ? 'so-SO' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return new Date(d).toLocaleString(); }
}
function fmtMoney(v, c = 'USD') {
  const n = Number(v || 0);
  return `${c === 'USD' ? '$' : ''}${n.toFixed(2)}${c !== 'USD' ? ' ' + c : ''}`;
}
function initials(name) {
  return (name || 'IG').trim().split(/\s+/).slice(0, 2).map(s => s[0]).join('').toUpperCase();
}
function toast(msg, type = '') {
  const el = $('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(el._tid);
  el._tid = setTimeout(() => { el.className = 'toast'; }, 3400);
}
function friendlyError(err) {
  console.error('[IGA KEEN]', err);
  const m = (err && (err.message || err.error_description || err.details)) || '';
  if (!navigator.onLine) return t('error.network');
  if (/invalid login|invalid credentials|email not confirmed/i.test(m)) return t('error.auth');
  if (/row-level security|permission denied|not authorized|unauthorized|jwt/i.test(m)) return t('error.permission');
  if (/duplicate|unique/i.test(m)) return 'Diiwaangelintan horey ayaa loo isticmaalay.';
  return `${t('error.generic')} (${m})`; 
}
function showLoading(show = true) { $('loadingOverlay').classList.toggle('hidden', !show); }
function setBadge(n) {
  state.unread = n || 0;
  const b = $('notifBadge');
  if (!b) return;
  b.textContent = state.unread > 99 ? '99+' : String(state.unread);
  b.classList.toggle('hidden', !state.unread);
}
function statusPill(status) {
  const map = {
    new: ['new', t('common.new')], contacted: ['warn', 'Contacted'], confirmed: ['active', 'Confirmed'],
    in_progress: ['active', 'In progress'], completed: ['done', t('common.completed')], cancelled: ['cancel', t('common.cancelled')]
  };
  const [cls, label] = map[status] || ['done', status || '—'];
  return `<span class="badge-pill ${cls}">${esc(label)}</span>`;
}
function serviceInfo(s) {
  const map = {
    taxi: ['🚕', t('service.taxi'), t('service.taxi.desc')],
    bajaaj: ['🛺', t('service.bajaaj'), t('service.bajaaj.desc')],
    delivery: ['📦', t('service.delivery'), t('service.delivery.desc')],
    safar: ['🧳', t('service.safar'), t('service.safar.desc')]
  };
  return map[s] || ['•', s || '—', ''];
}

/* =========================================================
   THEME / LANGUAGE
   ========================================================= */
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem('igakeen_theme', state.theme);
  document.querySelector('meta[name="theme-color"]').setAttribute('content', state.theme === 'dark' ? '#08080a' : '#ffffff');
}
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  if (state.user) db.from('profiles').update({ theme: state.theme }).eq('id', state.user.id).then(() => {});
}
function applyLanguage() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('igakeen_lang', state.lang);
  const pill = $('authLangBtn');
  if (pill) pill.textContent = state.lang.toUpperCase();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n;
    if (I18N[state.lang][k]) el.textContent = I18N[state.lang][k];
  });
  if (state.user) render();
}
function cycleLanguage() {
  const order = ['so', 'en', 'ar'];
  state.lang = order[(order.indexOf(state.lang) + 1) % order.length];
  applyLanguage();
  if (state.user) db.from('profiles').update({ language: state.lang }).eq('id', state.user.id).then(() => {});
}
function setLanguage(lang) {
  state.lang = lang;
  applyLanguage();
  if (state.user) db.from('profiles').update({ language: lang }).eq('id', state.user.id).then(() => {});
}

/* =========================================================
   AUTH UI
   ========================================================= */
function authTab(mode) {
  state.authMode = mode;
  $('tabLogin').classList.toggle('active', mode === 'login');
  $('tabSignup').classList.toggle('active', mode === 'signup');
  $('loginForm').classList.toggle('hidden', mode !== 'login');
  $('signupForm').classList.toggle('hidden', mode !== 'signup');
}
function signupRole(role) {
  state.signupRole = role;
  $('roleCustomerChip').classList.toggle('active', role === 'customer');
  $('roleDriverChip').classList.toggle('active', role === 'driver');
  $('driverFields').classList.toggle('hidden', role !== 'driver');
}
async function login(e) {
  e.preventDefault();
  showLoading();
  try {
    const { error } = await db.auth.signInWithPassword({
      email: $('loginEmail').value.trim(),
      password: $('loginPassword').value
    });
    if (error) throw error;
    toast(t('auth.welcome'), 'success');
  } catch (err) { toast(friendlyError(err), 'error'); }
  finally { showLoading(false); }
}
async function signup(e) {
  e.preventDefault();
  showLoading();
  try {
    const role = state.signupRole;
    const payload = {
      email: $('signupEmail').value.trim(),
      password: $('signupPassword').value,
      options: {
        data: {
          full_name: $('signupName').value.trim(),
          phone: $('signupPhone').value.trim(),
          role,
          service_type: role === 'driver' ? $('signupServiceType').value : null,
          vehicle_description: role === 'driver' ? $('signupVehicle').value.trim() : null
        }
      }
    };
    const { data, error } = await db.auth.signUp(payload);
    if (error) throw error;
    if (!data.session) toast(t('auth.checkEmail'), 'success');
    else if (role === 'driver') await ensureDriverProfile(data.user);
  } catch (err) { toast(friendlyError(err), 'error'); }
  finally { showLoading(false); }
}
function openForgot() {
  openModal(`
    <div class="modal-head"><h3>${t('auth.resetTitle')}</h3><button class="modal-close" onclick="App.closeModal()">×</button></div>
    <form onsubmit="App.sendReset(event)" class="auth-form">
      <label class="field"><span>${t('auth.email')}</span><input type="email" id="resetEmail" required placeholder="name@email.com" /></label>
      <button class="btn btn-primary btn-block" type="submit">${t('auth.resetSend')}</button>
    </form>
  `, 'center');
}
async function sendReset(e) {
  e.preventDefault();
  showLoading();
  try {
    const { error } = await db.auth.resetPasswordForEmail($('resetEmail').value.trim(), {
      redirectTo: window.location.origin + window.location.pathname
    });
    if (error) throw error;
    closeModal();
    toast('Linkiga dib u dejinta waa la diray. Hubi emailkaaga.', 'success');
  } catch (err) { toast(friendlyError(err), 'error'); }
  finally { showLoading(false); }
}
function openUpdatePassword() {
  openModal(`
    <div class="modal-head"><h3>${t('auth.newPassword')}</h3><button class="modal-close" onclick="App.closeModal()">×</button></div>
    <form onsubmit="App.updatePassword(event)" class="auth-form">
      <label class="field"><span>${t('auth.newPassword')}</span><input type="password" id="newPassword" required minlength="6" /></label>
      <button class="btn btn-primary btn-block" type="submit">${t('auth.updatePassword')}</button>
    </form>
  `, 'center');
}
async function updatePassword(e) {
  e.preventDefault();
  showLoading();
  try {
    const { error } = await db.auth.updateUser({ password: $('newPassword').value });
    if (error) throw error;
    closeModal();
    state.recoveryMode = false;
    toast(t('account.saved'), 'success');
  } catch (err) { toast(friendlyError(err), 'error'); }
  finally { showLoading(false); }
}
async function logout() {
  showLoading();
  try {
    await db.auth.signOut();
    location.reload();
  } catch (err) { toast(friendlyError(err), 'error'); showLoading(false); }
}

/* =========================================================
   SESSION / ROLE
   ========================================================= */
async function handleSession(session) {
  if (!session || !session.user || !session.user.id) {
    state.user = null; state.profile = null; state.driver = null; state.isAdmin = false;
    $('authScreen').classList.remove('hidden');
    $('appShell').classList.add('hidden');
    return;
  }
  state.user = session.user;
  $('authScreen').classList.add('hidden');
  $('appShell').classList.remove('hidden');
  await loadProfile();
  await ensureDriverProfile(state.user);
  await checkAdmin();
  await loadDriver();
  state.role = state.isAdmin ? 'admin' : (state.driver ? 'driver' : 'customer');
  buildNav();
  await refreshUnread();
  subscribeNotifications();
  subscribeOrders();
  navigate('home');
}

async function loadProfile() {
  if (!state.user?.id) return;
  const { data, error } = await db.from('profiles').select('*').eq('id', state.user.id).maybeSingle();
  if (error) console.warn('profile load', error);
  if (data) state.profile = data;
  else {
    state.profile = {
      id: state.user.id,
      full_name: state.user.user_metadata?.full_name || state.user.email?.split('@')[0] || 'IG User',
      phone: state.user.user_metadata?.phone || '',
      avatar_url: null,
      role: state.user.user_metadata?.role || 'customer',
      language: state.lang,
      theme: state.theme
    };
    await db.from('profiles').upsert(state.profile).then(() => {});
  }
  if (state.profile.language && I18N[state.profile.language]) {
    state.lang = state.profile.language;
    applyLanguage();
  }
  if (state.profile.theme) { state.theme = state.profile.theme; applyTheme(); }
  const name = state.profile.full_name || 'IG User';
  $('headerGreeting').textContent = `${t('auth.welcome')}, ${name.split(' ')[0]}`;
  $('headerAvatar').innerHTML = state.profile.avatar_url
    ? `<img src="${esc(state.profile.avatar_url)}" alt="">`
    : esc(initials(name));
}
async function ensureDriverProfile(user) {
  if (!user || !user.id || user.user_metadata?.role !== 'driver') return;
  const { data, error } = await db.from('drivers').select('*').eq('user_id', user.id).maybeSingle();
  if (error) { console.warn('driver check', error); return; }
  if (data) { state.driver = data; return; }
  const { data: created, error: insErr } = await db.from('drivers').insert({
    user_id: user.id,
    full_name: user.user_metadata?.full_name || '',
    phone: user.user_metadata?.phone || '',
    service_type: user.user_metadata?.service_type || 'taxi',
    vehicle_description: user.user_metadata?.vehicle_description || '',
    approval_status: 'pending',
    is_online: false
  }).select().maybeSingle();
  if (insErr) console.warn('driver create', insErr);
  state.driver = created || null;
}
async function checkAdmin() {
  try {
    const { data, error } = await db.rpc('igakeen_is_admin');
    if (error) throw error;
    state.isAdmin = data === true;
  } catch (err) {
    console.warn('Admin RPC unavailable, UI fallback only.', err);
    state.isAdmin = state.user?.id === ADMIN_UID;
  }
}
async function loadDriver() {
  if (!state.user?.id) return;
  const { data } = await db.from('drivers').select('*').eq('user_id', state.user.id).maybeSingle();
  state.driver = data || null;
}

/* =========================================================
   NAVIGATION & RENDER
   ========================================================= */
function buildNav() {
  const nav = $('bottomNav');
  const items = state.role === 'admin'
    ? [['home', '▦', t('nav.dashboard')], ['admin-orders', '🧾', t('nav.orders')], ['admin-drivers', '🚕', t('nav.drivers')], ['admin-fees', '💳', t('nav.fees')], ['admin-settings', '⚙', t('nav.settings')]]
    : state.role === 'driver'
      ? [['home', '▦', t('nav.home')], ['orders', '🧾', t('nav.orders')], ['chat-list', '💬', t('nav.chat')], ['notifications', '🔔', t('nav.notifications')], ['account', '◉', t('nav.account')]]
      : [['home', '▦', t('nav.home')], ['orders', '🧾', t('nav.orders')], ['community', '◎', t('nav.community')], ['notifications', '🔔', t('nav.notifications')], ['account', '◉', t('nav.account')]];
  nav.innerHTML = items.map(([id, ico, label]) =>
    `<button class="nav-item ${state.screen === id ? 'active' : ''}" onclick="App.navigate('${id}')"><span class="nav-ico">${ico}</span><span>${esc(label)}</span></button>`
  ).join('');
}
function navigate(screen, param = null) {
  state.screen = screen;
  state.screenParam = param;
  $('screen').scrollTop = 0;
  buildNav();
  render();
}
async function render() {
  if (!state.user) return;
  const fn = {
    home: state.role === 'admin' ? renderAdminDashboard : state.role === 'driver' ? renderDriverHome : renderCustomerHome,
    orders: renderCustomerOrders,
    community: renderCommunity,
    notifications: renderNotifications,
    account: renderAccount,
    'driver-home': renderDriverHome,
    'chat-list': renderChatList,
    chat: renderChat,
    'order-detail': renderOrderDetail,
    'create-order': renderCreateOrder,
    'admin-dashboard': renderAdminDashboard,
    'admin-orders': renderAdminOrders,
    'admin-drivers': renderAdminDrivers,
    'admin-fees': renderAdminFees,
    'admin-community': renderCommunity,
    'admin-notifications': renderAdminNotifications,
    'admin-settings': renderAdminSettings,
    profile: renderProfileView
  }[state.screen] || renderCustomerHome;
  
  $('screen').innerHTML = `<div class="skeleton" style="height:120px;margin-bottom:12px"></div><div class="skeleton" style="height:220px"></div>`;
  
  try { 
    await fn(state.screenParam); 
  } catch (err) { 
    console.error('RENDER ERROR:', err); 
    $('screen').innerHTML = `
      <div class="empty" style="border: 1px solid var(--danger)">
        <div class="empty-ico">⚠️</div>
        <h4>${t('common.error')}</h4>
        <p style="color:var(--danger); font-size:12px; margin-bottom:14px">${esc(err.message || err.details || 'Unknown error')}</p>
        <button class="btn btn-secondary" onclick="App.navigate('home')">${t('common.back')}</button>
      </div>`; 
  }
}

/* =========================================================
   CUSTOMER HOME
   ========================================================= */
async function renderCustomerHome() {
  const uid = state.user?.id;
  if (!uid) return;

  const { data: orders } = await db.from('orders').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(3);
  const { data: notices } = await db.from('app_notices').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3);
  const services = ['taxi', 'bajaaj', 'delivery', 'safar'];
  
  $('screen').innerHTML = `
    <div class="hero">
      <h2>${t('home.heroTitle')}</h2>
      <p>${t('home.heroSub')}</p>
    </div>
    ${notices?.length ? `<div class="card" style="margin-bottom:16px;background:var(--card-2)">
      <p class="card-title" style="font-size:13px">📢 ${esc(notices[0].title || 'Ogeysiis')}</p>
      <p class="card-sub">${esc(notices[0].body || '')}</p>
    </div>` : ''}
    <div class="section-row"><h3>${t('home.services')}</h3></div>
    <div class="service-grid">
      ${services.map(s => { const [ico, title, desc] = serviceInfo(s); return `
        <button class="service-card" onclick="App.startOrder('${s}')">
          <div class="service-ico">${ico}</div>
          <strong>${esc(title)}</strong>
          <span>${esc(desc)}</span>
        </button>`; }).join('')}
    </div>
    <div class="card" style="background:var(--brand);color:var(--brand-text);border:0">
      <p class="card-title" style="color:inherit">IGA KEEN</p>
      <p class="card-sub" style="color:inherit;opacity:.72">Adeeggaaga meel kasta. Dalab degdeg ah, darawal la hubiyay.</p>
    </div>
    <div class="section-row"><h3>${t('home.recent')}</h3><button onclick="App.navigate('orders')">${t('home.viewAll')}</button></div>
    ${orders?.length ? orders.map(orderCard).join('') : emptyBox('🧾', t('common.empty'), 'Dalabkaaga ugu horreeya halkan ayuu ka soo muuqan doonaa.')}
  `;
}
function orderCard(o) {
  return `<div class="card order-card" onclick="App.openOrder('${o.id}')">
    <div class="order-top">
      <span class="order-num">#${esc(o.order_number || o.id.slice(0, 8))}</span>
      ${statusPill(o.status)}
    </div>
    <div class="order-route">
      <div class="route-row"><span class="route-dot"></span><span>${esc(o.pickup_address || '—')}</span></div>
      <div class="route-row"><span class="route-dot dest"></span><span>${esc(o.destination_address || '—')}</span></div>
    </div>
    <div class="order-meta">
      <span class="badge-pill">${esc(serviceInfo(o.service_type)[1])}</span>
      <span class="badge-pill">${fmtDate(o.created_at)}</span>
      ${o.customer_fee ? `<span class="badge-pill">${fmtMoney(o.customer_fee, o.currency)}</span>` : ''}
    </div>
  </div>`;
}
function emptyBox(ico, title, sub) {
  return `<div class="empty"><div class="empty-ico">${ico}</div><h4>${esc(title)}</h4><p>${esc(sub)}</p></div>`;
}

/* =========================================================
   ORDER CREATION
   ========================================================= */
function startOrder(service) {
  state.orderService = service;
  navigate('create-order');
}
async function renderCreateOrder() {
  const s = state.orderService;
  const [ico, title] = serviceInfo(s);
  const { data: fee } = await db.from('service_fees').select('*').eq('service_type', s).maybeSingle();
  const isSafar = s === 'safar';
  const isDelivery = s === 'delivery';
  $('screen').innerHTML = `
    <button class="link-btn" style="text-align:left;padding:0;margin-bottom:12px" onclick="App.navigate('home')">← ${t('common.back')}</button>
    <div class="page-head"><h2>${ico} ${esc(title)}</h2><p>${esc(serviceInfo(s)[2])}</p></div>
    <form id="orderForm" class="card" onsubmit="App.submitOrder(event)" style="display:grid;gap:14px">
      <label class="field"><span>${isSafar ? t('order.departure') : t('order.pickup')}</span>
        <input id="pickupAddress" required placeholder="Cinwaanka goobta" />
      </label>
      <label class="field"><span>${t('order.destination')}</span><input id="destinationAddress" required placeholder="Cinwaanka goobta" /></label>
      <div class="card" style="padding:12px;background:var(--bg);box-shadow:none">
        <div style="display:flex;gap:8px;align-items:center;justify-content:space-between">
          <span style="font-size:12px;color:var(--text-2)" id="locStatus">${t('location.manual')}</span>
          <button type="button" class="btn btn-sm btn-secondary" onclick="App.useLocation()">📍 ${t('location.current')}</button>
        </div>
      </div>
      <input type="hidden" id="pickupLat" /><input type="hidden" id="pickupLng" />
      <input type="hidden" id="destLat" /><input type="hidden" id="destLng" />
      ${isDelivery ? `<label class="field"><span>${t('order.receiver')}</span><input id="receiver" placeholder="Magaca iyo telefoonka qaataha" /></label>` : ''}
      <label class="field"><span>${t('order.phone')}</span><input id="orderPhone" type="tel" required value="${esc(state.profile?.phone || '')}" placeholder="+252..." /></label>
      ${!isDelivery ? `<label class="field"><span>${t('order.passengers')}</span><input id="passengers" type="number" min="1" max="20" value="1" /></label>` : ''}
      ${isSafar ? `<label class="field"><span>${t('order.scheduled')}</span><input id="scheduledAt" type="datetime-local" /></label>` : ''}
      <label class="field"><span>${t('order.notes')}</span><textarea id="orderNotes" placeholder="Faahfaahin dheeraad ah..."></textarea></label>
      ${fee ? `<div class="badge-pill" style="align-self:start">${t('order.feeRequired')}: ${fmtMoney(fee.customer_fee, fee.currency)}</div>` : ''}
      <button class="btn btn-primary btn-block" type="submit">${t('order.submit')}</button>
    </form>
  `;
}
function useLocation() {
  const st = $('locStatus');
  if (!navigator.geolocation) { st.textContent = t('location.denied'); return; }
  st.textContent = t('location.locating');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      $('pickupLat').value = pos.coords.latitude;
      $('pickupLng').value = pos.coords.longitude;
      st.textContent = `✅ ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
    },
    () => { st.textContent = t('location.denied'); toast(t('location.denied'), 'error'); },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
  );
}
async function submitOrder(e) {
  e.preventDefault();
  showLoading();
  try {
    if (!state.user?.id) throw new Error('Fadlan mar kale gal (Login).');
    const service = state.orderService;
    const { data: fee } = await db.from('service_fees').select('*').eq('service_type', service).maybeSingle();
    const receiver = $('receiver')?.value?.trim() || '';
    let notes = $('orderNotes').value.trim();
    if (receiver) notes = `${notes}\nQaataha: ${receiver}`.trim();
    const payload = {
      service_type: service,
      customer_name: state.profile?.full_name || state.user.email,
      customer_phone: $('orderPhone').value.trim(),
      pickup_address: $('pickupAddress').value.trim(),
      destination_address: $('destinationAddress').value.trim(),
      pickup_latitude: $('pickupLat').value ? Number($('pickupLat').value) : null,
      pickup_longitude: $('pickupLng').value ? Number($('pickupLng').value) : null,
      destination_latitude: $('destLat').value ? Number($('destLat').value) : null,
      destination_longitude: $('destLng').value ? Number($('destLng').value) : null,
      notes: notes || null,
      passengers: $('passengers') ? Number($('passengers').value || 1) : null,
      scheduled_at: $('scheduledAt')?.value ? new Date($('scheduledAt').value).toISOString() : null,
      status: 'new',
      user_id: state.user.id,
      driver_id: null,
      customer_fee: fee?.customer_fee ?? 0,
      provider_fee: fee?.provider_fee ?? 0,
      currency: fee?.currency || 'USD'
    };
    const { data, error } = await db.from('orders').insert(payload).select().maybeSingle();
    if (error) throw error;
    toast('Dalabka waa la diray. Waan ku xiriirinaynaa darawal.', 'success');
    if (data) navigate('order-detail', data.id);
    else navigate('orders');
  } catch (err) { toast(friendlyError(err), 'error'); }
  finally { showLoading(false); }
}

/* =========================================================
   CUSTOMER ORDERS
   ========================================================= */
async function renderCustomerOrders() {
  const uid = state.user?.id;
  if (!uid) return;
  const { data, error } = await db.from('orders').select('*').eq('user_id', uid).order('created_at', { ascending: false });
  if (error) throw error;
  state.orders = data || [];
  $('screen').innerHTML = `
    <div class="page-head"><h2>${t('nav.orders')}</h2><p>${t('home.recent')}</p></div>
    <div class="segmented" id="orderFilter">
      <button class="active" onclick="App.filterCustomerOrders('all', this)">${t('common.all')}</button>
      <button onclick="App.filterCustomerOrders('active', this)">${t('common.active')}</button>
      <button onclick="App.filterCustomerOrders('completed', this)">${t('common.completed')}</button>
    </div>
    <div id="ordersList">${state.orders.length ? state.orders.map(orderCard).join('') : emptyBox('🧾', t('common.empty'), 'Ma jiraan dalabyo.')}</div>
  `;
}
function filterCustomerOrders(filter, btn) {
  document.querySelectorAll('#orderFilter button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const activeStatuses = ['new', 'contacted', 'confirmed', 'in_progress'];
  const list = state.orders.filter(o => filter === 'all' ? true : filter === 'completed' ? ['completed', 'cancelled'].includes(o.status) : activeStatuses.includes(o.status));
  $('ordersList').innerHTML = list.length ? list.map(orderCard).join('') : emptyBox('🧾', t('common.empty'), 'Ma jiraan dalabyo ku habboon.')
}

/* =========================================================
   ORDER DETAIL
   ========================================================= */
async function openOrder(id) { 
  if (!id) return toast('Khalad: Dalabka ID-ga maqan yahay.', 'error');
  navigate('order-detail', id); 
}
async function renderOrderDetail(id) {
  if (!id) {
    toast('Dalabka lama helin.', 'error');
    return navigate('orders');
  }
  const { data: o, error } = await db.from('orders').select('*').eq('id', id).maybeSingle();
  if (error || !o) throw error || new Error('Order not found');
  state.currentOrder = o;
  const isDriver = state.driver && o.driver_id === state.driver.id;
  const canChat = o.driver_id && (o.user_id === state.user.id || isDriver);
  const feeStatus = o.provider_fee_status || 'unpaid';
  $('screen').innerHTML = `
    <button class="link-btn" style="text-align:left;padding:0;margin-bottom:12px" onclick="App.navigate('${isDriver ? 'orders' : 'orders'}')">← ${t('common.back')}</button>
    <div class="page-head"><h2>${t('order.detail')}</h2><p>#${esc(o.order_number || o.id.slice(0, 8))}</p></div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:12px">
        <span class="badge-pill">${esc(serviceInfo(o.service_type)[1])}</span>${statusPill(o.status)}
      </div>
      <div class="order-route">
        <div class="route-row"><span class="route-dot"></span><span>${esc(o.pickup_address || '—')}</span></div>
        <div class="route-row"><span class="route-dot dest"></span><span>${esc(o.destination_address || '—')}</span></div>
      </div>
      ${o.notes ? `<p class="card-sub" style="margin-top:12px">📝 ${esc(o.notes)}</p>` : ''}
      <p class="card-sub" style="margin-top:8px">📞 ${esc(o.customer_phone || '—')}</p>
      <p class="card-sub">🕒 ${fmtDate(o.created_at)}</p>
      ${o.scheduled_at ? `<p class="card-sub">📅 ${fmtDate(o.scheduled_at)}</p>` : ''}
    </div>
    <div class="card">
      <p class="card-title">${t('driver.feeStatus')}</p>
      <p class="card-sub">${feeStatus === 'confirmed' ? '✅ ' + t('order.feeConfirmed') : feeStatus === 'submitted' ? '⏳ ' + t('order.feeSubmitted') : '💰 ' + t('order.feeRequired') + ': ' + fmtMoney(o.provider_fee, o.currency)}</p>
      ${isDriver && feeStatus !== 'confirmed' ? `<button class="btn btn-secondary btn-block btn-sm" style="margin-top:12px" onclick="App.openFeeModal('${o.id}')">${t('order.feePay')}</button>` : ''}
      ${isDriver && o.status === 'new' && feeStatus === 'confirmed' ? `<button class="btn btn-primary btn-block btn-sm" style="margin-top:12px" onclick="App.acceptOrder('${o.id}')">${t('order.accept')}</button>` : ''}
    </div>
    ${o.driver_id ? `<div class="card"><p class="card-title">Darawalka</p><p class="card-sub">✅ La xiriir: ${esc(o.driver_id.slice(0, 8))}…</p></div>` : `<div class="card"><p class="card-sub">${t('order.noDriver')}</p></div>`}
    ${canChat ? `<button class="btn btn-primary btn-block" style="margin-top:14px" onclick="App.openChat('${o.id}')">💬 ${t('order.chat')}</button>` : ''}
  `;
}

/* =========================================================
   DRIVER DASHBOARD
   ========================================================= */
async function renderDriverHome() {
  await loadDriver();
  const approved = state.driver?.approval_status === 'approved';
  const online = !!state.driver?.is_online;
  let available = [], assigned = [], completed = [];
  if (approved) {
    const { data: av } = await db.from('orders').select('*').eq('status', 'new').is('driver_id', null).eq('service_type', state.driver.service_type).order('created_at', { ascending: false }).limit(10);
    available = av || [];
    const { data: asg } = await db.from('orders').select('*').eq('driver_id', state.driver.id).in('status', ['confirmed', 'in_progress']).order('created_at', { ascending: false });
    assigned = asg || [];
    const { data: cmp } = await db.from('orders').select('*').eq('driver_id', state.driver.id).eq('status', 'completed').order('created_at', { ascending: false }).limit(10);
    completed = cmp || [];
  }
  $('screen').innerHTML = `
    <div class="page-head"><h2>${t('driver.dashboard')}</h2><p>${esc(state.profile?.full_name || '')}</p></div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
        <div><p class="card-title">${t('driver.status')}</p><p class="card-sub">${approved ? (online ? '🟢 ' + t('common.online') : '⚫ ' + t('common.offline')) : (state.driver?.approval_status === 'rejected' ? '🔴 ' + t('driver.rejectedMsg') : '🟡 ' + t('driver.pendingMsg'))}</p></div>
        ${approved ? `<button class="btn btn-sm ${online ? 'btn-secondary' : 'btn-primary'}" onclick="App.toggleOnline()">${online ? t('driver.becomeOffline') : t('driver.becomeOnline')}</button>` : ''}
      </div>
    </div>
    ${!approved ? `<div class="card" style="margin-top:12px"><p class="card-sub">${state.driver?.approval_status === 'rejected' ? t('driver.rejectedMsg') : t('driver.pendingMsg')}</p></div>` : `
      <div class="stat-grid" style="margin-top:12px">
        <div class="stat-card"><span>${t('driver.assigned')}</span><strong>${assigned.length}</strong></div>
        <div class="stat-card"><span>${t('driver.completed')}</span><strong>${completed.length}</strong></div>
      </div>
      <div class="section-row"><h3>${t('driver.available')}</h3></div>
      ${available.length ? available.map(orderCard).join('') : emptyBox('🚕', t('common.empty'), 'Weli dalabyo la heli karo ma jiraan.')}
      <div class="section-row"><h3>${t('driver.assigned')}</h3></div>
      ${assigned.length ? assigned.map(orderCard).join('') : emptyBox('📋', t('common.empty'), 'Ma jiraan dalabyo lagu qoondeeyay.')}
    `}
  `;
}
async function toggleOnline() {
  if (!state.driver) return;
  showLoading();
  try {
    const next = !state.driver.is_online;
    try {
      const { error } = await db.rpc('igakeen_set_driver_online', { p_online: next });
      if (error) throw error;
    } catch {
      const { error } = await db.from('drivers').update({ is_online: next }).eq('id', state.driver.id);
      if (error) throw error;
    }
    state.driver.is_online = next;
    toast(next ? t('common.online') : t('common.offline'), 'success');
    renderDriverHome();
  } catch (err) { toast(friendlyError(err), 'error'); }
  finally { showLoading(false); }
}
async function acceptOrder(orderId) {
  if (!orderId) return;
  showLoading();
  try {
    const { error } = await db.rpc('igakeen_accept_order', { p_order_id: orderId });
    if (error) throw error;
    toast('Dalabka waa la aqbalay.', 'success');
    navigate('order-detail', orderId);
  } catch (err) {
    console.error(err);
    toast('Dalabka lama aqbalin. Hubi fee-ga ama xaaladda dalabka.', 'error');
  } finally { showLoading(false); }
}

/* =========================================================
   FEE PAYMENT
   ========================================================= */
function openFeeModal(orderId) {
  if (!orderId) return toast('Dalab khaldan.', 'error');
  const o = state.currentOrder;
  openModal(`
    <div class="modal-head"><h3>${t('driver.feeModal')}</h3><button class="modal-close" onclick="App.closeModal()">×</button></div>
    <div class="card" style="background:var(--bg);box-shadow:none;margin-bottom:14px">
      <p class="card-sub">${t('order.feeRequired')}: <strong>${fmtMoney(o?.provider_fee, o?.currency)}</strong></p>
    </div>
    <form onsubmit="App.submitFee(event, '${orderId}')" class="auth-form">
      <label class="field"><span>${t('driver.reference')}</span><input id="feeRef" required placeholder="Tusaale: EVC-123456" /></label>
      <label class="field"><span>${t('driver.paymentNote')}</span><textarea id="feeNote" placeholder="Faahfaahin lacagta..."></textarea></label>
      <button class="btn btn-primary btn-block" type="submit">${t('order.feePay')}</button>
    </form>
  `);
}
async function submitFee(e, orderId) {
  e.preventDefault();
  if (!orderId) return toast('Dalab khaldan.', 'error');
  showLoading();
  try {
    if (!state.driver) throw new Error('Driver profile missing');
    const o = state.currentOrder;
    const { error } = await db.from('driver_fee_payments').insert({
      order_id: orderId,
      driver_id: state.driver.id,
      submitted_by: state.user.id,
      amount: Number(o?.provider_fee || 0),
      currency: o?.currency || 'USD',
      payment_reference: $('feeRef').value.trim(),
      payment_note: $('feeNote').value.trim(),
      status: 'pending'
    });
    if (error) throw error;
    closeModal();
    toast(t('order.feeSubmitted'), 'success');
    navigate('order-detail', orderId);
  } catch (err) { toast(friendlyError(err), 'error'); }
  finally { showLoading(false); }
}

/* =========================================================
   CHAT
   ========================================================= */
async function renderChatList() {
  let orders = [];
  if (state.role === 'driver' && state.driver) {
    const { data } = await db.from('orders').select('*').eq('driver_id', state.driver.id).in('status', ['confirmed', 'in_progress', 'completed']).order('updated_at', { ascending: false });
    orders = data || [];
  } else {
    const { data } = await db.from('orders').select('*').eq('user_id', state.user.id).not('driver_id', 'is', null).order('updated_at', { ascending: false });
    orders = data || [];
  }
  $('screen').innerHTML = `
    <div class="page-head"><h2>${t('nav.chat')}</h2><p>${t('order.chat')}</p></div>
    ${orders.length ? orders.map(o => `
      <div class="card order-card" onclick="App.openChat('${o.id}')">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
          <div><p class="card-title">#${esc(o.order_number || o.id.slice(0, 8))}</p><p class="card-sub">${esc(o.pickup_address || '')} → ${esc(o.destination_address || '')}</p></div>
          ${statusPill(o.status)}
        </div>
      </div>`).join('') : emptyBox('💬', t('common.empty'), 'Weli sheeko ma jirto.')}
  `;
}
async function openChat(orderId) {
  if (!orderId) return toast('Sheekadan lama helin.', 'error');
  const { data: o, error } = await db.from('orders').select('*').eq('id', orderId).maybeSingle();
  if (error || !o) return toast(friendlyError(error), 'error');
  const isCustomer = o.user_id === state.user.id;
  const isDriver = state.driver && o.driver_id === state.driver.id;
  if (!isCustomer && !isDriver) return toast(t('error.permission'), 'error');
  if (!o.driver_id) return toast(t('order.noDriver'), 'error');
  state.chatOrder = o;
  state.chatMessages = [];
  navigate('chat', orderId);
  await fetchChatMessages(orderId);
  subscribeChat(orderId);
}
async function fetchChatMessages(orderId) {
  if (!orderId) return;
  const { data, error } = await db.from('order_messages').select('*').eq('order_id', orderId).order('created_at', { ascending: true });
  if (error) { console.error(error); return; }
  state.chatMessages = data || [];
  renderChatMessages();
  await db.from('order_messages').update({ read_at: new Date().toISOString() }).eq('order_id', orderId).eq('recipient_id', state.user.id).is('read_at', null);
}
async function renderChat(orderId) {
  if (!orderId) {
    toast('Sheekadan lama helin.', 'error');
    return navigate('chat-list');
  }
  const o = state.chatOrder || (await db.from('orders').select('*').eq('id', orderId).maybeSingle()).data;
  if (!o) throw new Error('Order missing');
  const otherName = o.user_id === state.user.id ? 'Darawalka' : (o.customer_name || 'Macmiil');
  $('screen').innerHTML = `
    <div class="chat-screen">
      <div class="chat-head">
        <button class="icon-btn" onclick="App.leaveChat()">←</button>
        <div><p class="card-title">${esc(otherName)}</p><p class="card-sub">#${esc(o.order_number || o.id.slice(0, 8))}</p></div>
      </div>
      <div class="chat-body" id="chatBody"></div>
      <form class="chat-input-row" onsubmit="App.sendMessage(event, '${orderId}')">
        <textarea id="chatInput" rows="1" placeholder="Qor fariin..." required></textarea>
        <button class="send-btn" type="submit">➤</button>
      </form>
    </div>
  `;
  renderChatMessages();
}
function renderChatMessages() {
  const body = $('chatBody');
  if (!body) return;
  body.innerHTML = state.chatMessages.length ? state.chatMessages.map(m => {
    const mine = m.sender_id === state.user.id;
    return `<div class="msg ${mine ? 'me' : 'them'}">${esc(m.body)}<span class="msg-time">${fmtDate(m.created_at)}${mine ? (m.read_at ? ' · ✓✓' : ' · ✓') : ''}</span></div>`;
  }).join('') : `<div class="empty" style="border:0"><div class="empty-ico">💬</div><h4>${t('common.empty')}</h4><p>Qor fariintaada ugu horreysa.</p></div>`;
  body.scrollTop = body.scrollHeight;
}
function subscribeChat(orderId) {
  if (!orderId) return;
  if (state.chatChannel) db.removeChannel(state.chatChannel);
  state.chatChannel = db.channel(`chat-${orderId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_messages', filter: `order_id=eq.${orderId}` }, async (payload) => {
      state.chatMessages.push(payload.new);
      renderChatMessages();
      if (payload.new.recipient_id === state.user.id) {
        await db.from('order_messages').update({ read_at: new Date().toISOString() }).eq('id', payload.new.id);
      }
    })
    .subscribe();
}
function leaveChat() {
  if (state.chatChannel) { db.removeChannel(state.chatChannel); state.chatChannel = null; }
  state.chatOrder = null;
  navigate('chat-list');
}
async function sendMessage(e, orderId) {
  e.preventDefault();
  if (!orderId || !state.chatOrder) return;
  const input = $('chatInput');
  const body = input.value.trim();
  if (!body) return;
  const o = state.chatOrder;
  const recipient = o.user_id === state.user.id ? o.driver_id : o.user_id;
  input.value = '';
  const { error } = await db.from('order_messages').insert({ order_id: orderId, sender_id: state.user.id, recipient_id: recipient, body });
  if (error) toast(friendlyError(error), 'error');
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */
async function refreshUnread() {
  if (!state.user?.id) return;
  const { count } = await db.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', state.user.id).is('read_at', null);
  setBadge(count || 0);
}
function subscribeNotifications() {
  const uid = state.user?.id || FALLBACK_UUID;
  if (state.notifChannel) db.removeChannel(state.notifChannel);
  state.notifChannel = db.channel(`notif-${uid}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, (payload) => {
      setBadge(state.unread + 1);
      toast(payload.new.title || 'Ogeysiis cusub');
      if (state.screen === 'notifications') renderNotifications();
    })
    .subscribe();
}
function subscribeOrders() {
  const uid = state.user?.id || FALLBACK_UUID;
  if (state.orderChannel) db.removeChannel(state.orderChannel);
  const filter = state.role === 'driver' && state.driver ? `driver_id=eq.${state.driver.id}` : `user_id=eq.${uid}`;
  state.orderChannel = db.channel(`orders-${uid}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter }, () => {
      if (['orders', 'order-detail', 'home', 'driver-home'].includes(state.screen)) render();
    })
    .subscribe();
}
async function renderNotifications() {
  if (!state.user?.id) return;
  const { data, error } = await db.from('notifications').select('*').eq('user_id', state.user.id).order('created_at', { ascending: false }).limit(60);
  if (error) throw error;
  $('screen').innerHTML = `
    <div class="page-head" style="display:flex;justify-content:space-between;align-items:start">
      <div><h2>${t('notif.title')}</h2><p>${t('common.unread')}: ${state.unread}</p></div>
      <button class="btn btn-sm btn-secondary" onclick="App.markAllRead()">${t('notif.markAll')}</button>
    </div>
    ${data?.length ? data.map(n => `
      <div class="card" style="${n.read_at ? '' : 'border-color:var(--line-strong)'}">
        <div style="display:flex;justify-content:space-between;gap:8px">
          <p class="card-title" style="font-size:14px">${esc(n.title || 'Ogeysiis')}</p>
          ${!n.read_at ? '<span class="badge-pill new">●</span>' : ''}
        </div>
        <p class="card-sub">${esc(n.body || '')}</p>
        <p class="card-sub" style="font-size:11px;margin-top:8px">${fmtDate(n.created_at)}</p>
      </div>`).join('') : emptyBox('🔔', t('common.empty'), 'Ma jiraan ogeysiisyo.')}
  `;
  if (state.unread > 0) {
    await db.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', state.user.id).is('read_at', null);
    setBadge(0);
  }
}
async function markAllRead() {
  if (!state.user?.id) return;
  showLoading();
  try {
    const { error } = await db.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', state.user.id).is('read_at', null);
    if (error) throw error;
    setBadge(0);
    renderNotifications();
  } catch (err) { toast(friendlyError(err), 'error'); }
  finally { showLoading(false); }
}

/* =========================================================
   COMMUNITY (Using specific columns)
   ========================================================= */
async function renderCommunity() {
  let posts = [];
  let comments = [];

  try {
    const { data: pData, error: pErr } = await db.from('community_posts').select('*').order('created_at', { ascending: false }).limit(40);
    if (pErr) throw pErr;
    posts = pData || [];

    if (posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const { data: cData, error: cErr } = await db.from('community_comments').select('*').in('post_id', postIds);
      if (!cErr) comments = cData || [];
    }
  } catch (err) {
    console.error('Cilad Bulsho:', err);
  }

  $('screen').innerHTML = `
    <div class="page-head" style="display:flex;justify-content:space-between;align-items:start">
      <div><h2>${t('nav.community')}</h2><p>IGA KEEN Community</p></div>
      <button class="btn btn-sm btn-primary" onclick="App.openNewPost()">+ ${t('community.newPost')}</button>
    </div>
    ${posts.length ? posts.map(p => {
      const authorName = p.author_name || 'IG User';
      const likesCount = p.likes_count || 0;
      const cCount = comments.filter(c => c.post_id === p.id).length;

      return `<div class="card post-card">
        <div class="post-head">
          <div class="post-avatar">${esc(initials(authorName))}</div>
          <div class="post-meta"><strong>${esc(authorName)}</strong><span>${fmtDate(p.created_at)}</span></div>
        </div>
        ${p.body ? `<p class="post-body">${esc(p.body)}</p>` : ''}
        ${p.image_url ? `<img class="post-image" src="${esc(p.image_url)}" alt="Post image" loading="lazy">` : ''}
        <div class="post-actions">
          <button class="post-action" onclick="App.toggleLike('${p.id}', ${likesCount})">♥ ${likesCount}</button>
          <button class="post-action" onclick="App.openComments('${p.id}')">💬 ${cCount}</button>
        </div>
      </div>`;
    }).join('') : emptyBox('◎', t('community.noPosts'), 'Qor postkaaga ugu horreeya.')}
  `;
}
function openNewPost() {
  openModal(`
    <div class="modal-head"><h3>${t('community.newPost')}</h3><button class="modal-close" onclick="App.closeModal()">×</button></div>
    <form onsubmit="App.createPost(event)" class="auth-form">
      <label class="field"><span>${t('community.newPost')}</span><textarea id="postBody" placeholder="Maxaad la wadaagaysaa?" required></textarea></label>
      <label class="field"><span>Image (ikhtiyaari)</span><input type="file" id="postImage" accept="image/*" /></label>
      <button class="btn btn-primary btn-block" type="submit">${t('community.post')}</button>
    </form>
  `);
}
async function createPost(e) {
  e.preventDefault();
  if (!state.user?.id) return toast('Fadlan mar kale gal (Login).', 'error');
  showLoading();
  
  try {
    let imageUrl = null;
    const file = $('postImage').files[0];
    if (file) {
      try {
        imageUrl = await uploadFile('community', `${state.user.id}/${Date.now()}-${file.name}`, file);
      } catch (err) {
        console.warn('Image upload failed:', err);
        toast('Sawirka lama soo gelin karin. (Hubi Storage-ka Supabase)', 'error');
      }
    }

    const payload = {
      user_id: state.user.id,
      author_name: state.profile?.full_name || state.user.email?.split('@')[0] || 'IG User',
      body: $('postBody').value.trim(),
      image_url: imageUrl,
      likes_count: 0
    };

    const { error } = await db.from('community_posts').insert(payload);
    if (error) throw error;
    
    closeModal();
    toast('Post waa la daabacay.', 'success');
    renderCommunity();
  } catch (err) { 
    toast(friendlyError(err), 'error'); 
  } finally { 
    showLoading(false); 
  }
}
async function toggleLike(postId, currentLikes) {
  if (!postId) return;
  try {
    const { error } = await db.from('community_posts').update({ likes_count: currentLikes + 1 }).eq('id', postId);
    if (error) throw error;
    renderCommunity();
  } catch (err) {
    console.error('Like failed:', err);
  }
}

async function openComments(postId) {
  if (!postId) return;

  let comments = [];

  try {
    const { data, error } = await db
      .from('community_comments')
      .select('id, post_id, author_id, body, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    comments = data || [];

    const authorIds = [
      ...new Set(comments.map(c => c.author_id).filter(Boolean))
    ];

    if (authorIds.length) {
      const { data: profiles, error: profileError } = await db
        .from('profiles')
        .select('id, full_name')
        .in('id', authorIds);

      if (profileError) throw profileError;

      const names = new Map(
        (profiles || []).map(p => [p.id, p.full_name])
      );

      comments = comments.map(c => ({
        ...c,
        author_name: names.get(c.author_id) || 'IG User'
      }));
    }
  } catch (err) {
    console.error('Comments fetch error:', err);
    return toast(
      'Faallooyinka lama soo dejin karin. Mar kale isku day.',
      'error'
    );
  }

  openModal(`
    <div class="modal-head">
      <h3>${t('community.comment')}</h3>
      <button class="modal-close" onclick="App.closeModal()">×</button>
    </div>

    <div style="max-height:40dvh;overflow:auto;margin-bottom:12px">
      ${
        comments.length
          ? comments.map(c => `
            <div class="list-item">
              <div class="post-avatar">
                ${esc(initials(c.author_name))}
              </div>
              <div class="list-main">
                <strong>${esc(c.author_name)}</strong>
                <p>${esc(c.body)}</p>
                <p style="font-size:10px">${fmtDate(c.created_at)}</p>
              </div>
            </div>
          `).join('')
          : emptyBox(
              '💬',
              t('common.empty'),
              'Qor faalladaada ugu horreysa.'
            )
      }
    </div>

    <form onsubmit="App.createComment(event, '${postId}')" class="auth-form">
      <label class="field">
        <span>${t('community.comment')}</span>
        <input
          id="commentBody"
          required
          maxlength="2000"
          placeholder="${t('community.writeComment')}"
        />
      </label>
      <button class="btn btn-primary btn-block" type="submit">
        ${t('common.send')}
      </button>
    </form>
  `);
}

async function createComment(e, postId) {
  e.preventDefault();

  if (!postId || !state.user?.id) {
    return toast('Fadlan marka hore gal akoonkaaga.', 'error');
  }

  const input = $('commentBody');
  const body = input?.value.trim();

  if (!body) return;
  if (body.length > 2000) {
    return toast('Faalladu kama badnaan karto 2000 xaraf.', 'error');
  }

  showLoading();

  try {
    const { error } = await db
      .from('community_comments')
      .insert({
        post_id: postId,
        author_id: state.user.id,
        body
      });

    if (error) throw error;

    closeModal();
    toast('Faallo waa la daray.', 'success');
    await renderCommunity();
  } catch (err) {
    console.error('Comment insert error:', err);
    toast(friendlyError(err), 'error');
  } finally {
    showLoading(false);
  }
}

/* =========================================================
   ACCOUNT / PROFILE
   ========================================================= */
async function renderAccount() {
  const p = state.profile || {};
  $('screen').innerHTML = `
    <div class="page-head"><h2>${t('account.profile')}</h2><p>${esc(p.role || state.role)}</p></div>
    <div class="card" style="text-align:center">
      <div class="logo-mark" style="margin-bottom:10px">${p.avatar_url ? `<img src="${esc(p.avatar_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">` : esc(initials(p.full_name))}</div>
      <p class="card-title">${esc(p.full_name || 'IG User')}</p>
      <p class="card-sub">${esc(p.phone || '—')}</p>
      <p class="card-sub" style="font-size:11px">${esc(state.user?.email || '')}</p>
      <button class="btn btn-secondary btn-block btn-sm" style="margin-top:14px" onclick="App.openEditProfile()">${t('account.edit')}</button>
    </div>
    <div class="card">
      <div class="list-item"><div class="list-main"><strong>${t('account.language')}</strong><p>Soomaali / English / العربية</p></div>
        <select onchange="App.setLanguage(this.value)" style="border:1px solid var(--line);background:var(--bg);border-radius:10px;padding:8px">
          <option value="so" ${state.lang === 'so' ? 'selected' : ''}>Soomaali</option>
          <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
          <option value="ar" ${state.lang === 'ar' ? 'selected' : ''}>العربية</option>
        </select>
      </div>
      <div class="list-item"><div class="list-main"><strong>${t('account.theme')}</strong><p>${state.theme === 'dark' ? t('account.dark') : t('account.light')}</p></div>
        <button class="btn btn-sm btn-secondary" onclick="App.toggleTheme()">${state.theme === 'dark' ? '☀' : '☾'}</button>
      </div>
    </div>
    ${state.driver ? `<div class="card"><p class="card-title">${t('role.driver')}</p><p class="card-sub">${esc(state.driver.service_type)} · ${esc(state.driver.approval_status)}</p></div>` : ''}
    <button class="btn btn-danger btn-block" style="margin-top:14px" onclick="App.logout()">${t('account.logout')}</button>
  `;
}
function openEditProfile() {
  const p = state.profile || {};
  openModal(`
    <div class="modal-head"><h3>${t('account.edit')}</h3><button class="modal-close" onclick="App.closeModal()">×</button></div>
    <form onsubmit="App.saveProfile(event)" class="auth-form">
      <label class="field"><span>${t('auth.fullName')}</span><input id="editName" required value="${esc(p.full_name || '')}" /></label>
      <label class="field"><span>${t('auth.phone')}</span><input id="editPhone" type="tel" value="${esc(p.phone || '')}" /></label>
      <label class="field"><span>Avatar</span><input type="file" id="editAvatar" accept="image/*" /></label>
      <button class="btn btn-primary btn-block" type="submit">${t('common.save')}</button>
    </form>
  `);
}
async function saveProfile(e) {
  e.preventDefault();
  if (!state.user?.id) return;
  showLoading();
  try {
    let avatar_url = state.profile?.avatar_url || null;
    const file = $('editAvatar').files[0];
    if (file) avatar_url = await uploadFile('avatars', `${state.user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`, file);
    const { error } = await db.from('profiles').update({ full_name: $('editName').value.trim(), phone: $('editPhone').value.trim(), avatar_url }).eq('id', state.user.id);
    if (error) throw error;
    closeModal();
    await loadProfile();
    toast(t('account.saved'), 'success');
    renderAccount();
  } catch (err) { toast(friendlyError(err), 'error'); }
  finally { showLoading(false); }
}
async function renderProfileView(userId) {
  if (!userId) {
    toast('Akoonka lama helin.', 'error');
    return navigate('community');
  }
  const { data: p } = await db.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (!p) throw new Error('Profile not found');
  const { data: posts } = await db.from('community_posts').select('*').eq('author_id', userId).order('created_at', { ascending: false }).limit(20);
  $('screen').innerHTML = `
    <button class="link-btn" style="text-align:left;padding:0;margin-bottom:12px" onclick="App.navigate('community')">← ${t('common.back')}</button>
    <div class="card" style="text-align:center">
      <div class="logo-mark">${p.avatar_url ? `<img src="${esc(p.avatar_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">` : esc(initials(p.full_name))}</div>
      <p class="card-title">${esc(p.full_name)}</p>
      <p class="card-sub">${esc(p.role)} · ${fmtDate(p.created_at)}</p>
    </div>
    <div class="section-row"><h3>Posts</h3></div>
    ${(posts || []).length ? posts.map(x => `<div class="card"><p class="post-body">${esc(x.body || '')}</p><p class="card-sub">${fmtDate(x.created_at)}</p></div>`).join('') : emptyBox('◎', t('common.empty'), 'Ma jiraan posts.')}
  `;
}

/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */
async function renderAdminDashboard() {
  if (!state.isAdmin) {
    $('screen').innerHTML = `<div class="empty"><div class="empty-ico">⛔</div><h4>Ma haysato fasax</h4><p>Boggan waa maamulka kaliya.</p></div>`;
    return;
  }

  const safeCount = async (table, apply) => {
    try {
      let q = db.from(table).select('*', { count: 'exact', head: true });
      if (apply) q = apply(q);
      const { count, error } = await q;
      if (error) return 0;
      return count || 0;
    } catch (err) {
      return 0;
    }
  };

  const [total, news, active, completed, pendingDrivers, pendingFees, customers, approvedDrivers] = await Promise.all([
    safeCount('orders'), 
    safeCount('orders', q => q.eq('status', 'new')), 
    safeCount('orders', q => q.in('status', ['confirmed', 'in_progress'])),
    safeCount('orders', q => q.eq('status', 'completed')), 
    safeCount('drivers', q => q.eq('approval_status', 'pending')),
    safeCount('driver_fee_payments', q => q.eq('status', 'pending')), 
    safeCount('profiles', q => q.eq('role', 'customer')),
    safeCount('drivers', q => q.eq('approval_status', 'approved'))
  ]);

  const cards = [
    [t('admin.totalOrders'), total], [t('admin.newOrders'), news],
    [t('admin.activeOrders'), active], [t('admin.completedOrders'), completed],
    [t('admin.pendingDrivers'), pendingDrivers], [t('admin.pendingFees'), pendingFees],
    [t('admin.customersCount'), customers], [t('admin.approvedDrivers'), approvedDrivers]
  ];
  
  $('screen').innerHTML = `
    <div class="page-head"><h2>${t('nav.dashboard')}</h2><p>IGA KEEN Admin</p></div>
    <div class="stat-grid">${cards.map(([label, val]) => `<div class="stat-card"><span>${esc(label)}</span><strong>${val || 0}</strong></div>`).join('')}</div>
    <div class="section-row"><h3>Quick actions</h3></div>
    <div class="card" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <button class="btn btn-secondary" onclick="App.navigate('admin-drivers')">🚕 ${t('admin.drivers')}</button>
      <button class="btn btn-secondary" onclick="App.navigate('admin-fees')">💳 ${t('admin.fees')}</button>
      <button class="btn btn-secondary" onclick="App.navigate('admin-orders')">🧾 ${t('admin.orders')}</button>
      <button class="btn btn-secondary" onclick="App.navigate('admin-settings')">⚙ ${t('admin.settings')}</button>
    </div>
  `;
}
async function renderAdminOrders() {
  if (!state.isAdmin) return;
  let data = [];
  try {
    const res = await db.from('orders').select('*').order('created_at', { ascending: false }).limit(80);
    if (!res.error) data = res.data || [];
  } catch (err) {}
  $('screen').innerHTML = `
    <div class="page-head"><h2>${t('admin.orders')}</h2><p>Dhammaan dalabyada</p></div>
    ${data.length ? data.map(orderCard).join('') : emptyBox('🧾', t('common.empty'), 'Ma jiraan dalabyo ama lama heli karin xogta.')}
  `;
}
async function renderAdminDrivers() {
  if (!state.isAdmin) return;
  let data = [];
  try {
    const res = await db.from('drivers').select('*').order('created_at', { ascending: false });
    if (!res.error) data = res.data || [];
  } catch (err) {}
  
  $('screen').innerHTML = `
    <div class="page-head"><h2>${t('admin.drivers')}</h2><p>${t('admin.pendingDrivers')}: ${data.filter(d => d.approval_status === 'pending').length}</p></div>
    ${data.length ? data.map(d => `
      <div class="card">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:start">
          <div><p class="card-title">${esc(d.full_name || 'Driver')}</p><p class="card-sub">${esc(d.service_type)} · ${esc(d.phone || '—')}</p><p class="card-sub">${esc(d.vehicle_description || '')}</p></div>
          <span class="badge-pill ${d.approval_status === 'approved' ? 'active' : d.approval_status === 'rejected' ? 'cancel' : 'warn'}">${esc(d.approval_status)}</span>
        </div>
        ${d.approval_status === 'pending' ? `<div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-sm btn-success" onclick="App.adminDriverDecision('${d.id}','approved')">${t('admin.approve')}</button>
          <button class="btn btn-sm btn-danger" onclick="App.adminDriverDecision('${d.id}','rejected')">${t('admin.reject')}</button>
        </div>` : ''}
      </div>`).join('') : emptyBox('🚕', t('common.empty'), 'Ma jiraan darawalo.')}
  `;
}
async function adminDriverDecision(driverId, status) {
  if (!driverId) return;
  showLoading();
  try {
    const { error } = await db.rpc('igakeen_admin_set_driver_approval', { p_driver_id: driverId, p_status: status });
    if (error) throw error;
    toast(status === 'approved' ? 'Darawalka waa la ansixiyay.' : 'Darawalka waa la diiday.', 'success');
    renderAdminDrivers();
  } catch (err) { toast(friendlyError(err), 'error'); }
  finally { showLoading(false); }
}
async function renderAdminFees() {
  if (!state.isAdmin) return;
  let data = [];
  try {
    const res = await db.from('driver_fee_payments').select('*').order('created_at', { ascending: false }).limit(80);
    if (!res.error) data = res.data || [];
  } catch (err) {}

  $('screen').innerHTML = `
    <div class="page-head"><h2>${t('admin.fees')}</h2><p>${t('admin.pendingFees')}: ${data.filter(f => f.status === 'pending').length}</p></div>
    ${data.length ? data.map(f => `
      <div class="card">
        <div style="display:flex;justify-content:space-between;gap:8px">
          <div><p class="card-title">${fmtMoney(f.amount, f.currency)}</p><p class="card-sub">${esc(f.payment_reference || '—')}</p><p class="card-sub">${esc(f.payment_note || '')}</p><p class="card-sub" style="font-size:11px">${fmtDate(f.created_at)}</p></div>
          <span class="badge-pill ${f.status === 'confirmed' ? 'active' : f.status === 'rejected' ? 'cancel' : 'warn'}">${esc(f.status)}</span>
        </div>
        ${f.status === 'pending' ? `<div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-sm btn-success" onclick="App.adminFeeDecision('${f.id}','confirmed')">${t('admin.confirmFee')}</button>
          <button class="btn btn-sm btn-danger" onclick="App.adminFeeDecision('${f.id}','rejected')">${t('admin.rejectFee')}</button>
        </div>` : ''}
      </div>`).join('') : emptyBox('💳', t('common.empty'), 'Ma jiraan fee payments.')}
  `;
}
async function adminFeeDecision(paymentId, decision) {
  if (!paymentId) return;
  showLoading();
  try {
    const { error } = await db.rpc('igakeen_review_provider_fee', { p_payment_id: paymentId, p_decision: decision, p_review_note: null });
    if (error) throw error;
    toast(decision === 'confirmed' ? 'Fee waa la xaqiijiyay.' : 'Fee waa la diiday.', 'success');
    renderAdminFees();
  } catch (err) { toast(friendlyError(err), 'error'); }
  finally { showLoading(false); }
}
async function renderAdminSettings() {
  if (!state.isAdmin) return;
  const { data: fees } = await db.from('service_fees').select('*').order('service_type');
  $('screen').innerHTML = `
    <div class="page-head"><h2>${t('admin.settings')}</h2><p>${t('admin.serviceFees')}</p></div>
    ${(fees || []).map(f => `
      <div class="card">
        <p class="card-title">${esc(serviceInfo(f.service_type)[1])}</p>
        <form onsubmit="App.saveFee(event, '${f.id}')" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
          <label class="field"><span>Customer fee</span><input id="cf-${f.id}" type="number" step="0.01" value="${Number(f.customer_fee || 0)}" /></label>
          <label class="field"><span>Provider fee</span><input id="pf-${f.id}" type="number" step="0.01" value="${Number(f.provider_fee || 0)}" /></label>
          <button class="btn btn-sm btn-primary" style="grid-column:1/-1" type="submit">${t('common.save')}</button>
        </form>
      </div>`).join('') || emptyBox('⚙', t('common.empty'), 'Service fees ma jiraan.')}
    <div class="section-row"><h3>${t('admin.notifications')}</h3></div>
    <button class="btn btn-secondary btn-block" onclick="App.navigate('admin-notifications')">${t('admin.publishNotice')}</button>
  `;
}
async function saveFee(e, feeId) {
  e.preventDefault();
  if (!feeId) return;
  showLoading();
  try {
    const { error } = await db.from('service_fees').update({
      customer_fee: Number($(`cf-${feeId}`).value || 0),
      provider_fee: Number($(`pf-${feeId}`).value || 0),
      updated_at: new Date().toISOString()
    }).eq('id', feeId);
    if (error) throw error;
    toast(t('account.saved'), 'success');
  } catch (err) { toast(friendlyError(err), 'error'); }
  finally { showLoading(false); }
}
async function renderAdminNotifications() {
  if (!state.isAdmin) return;
  const { data: notices } = await db.from('app_notices').select('*').order('created_at', { ascending: false }).limit(20);
  $('screen').innerHTML = `
    <div class="page-head"><h2>${t('admin.notifications')}</h2><p>${t('admin.publishNotice')}</p></div>
    <form class="card" onsubmit="App.publishNotice(event)" style="display:grid;gap:12px">
      <label class="field"><span>Title</span><input id="noticeTitle" required /></label>
      <label class="field"><span>Body</span><textarea id="noticeBody" required></textarea></label>
      <label class="field"><span>${t('admin.audience')}</span><select id="noticeAudience">
        <option value="all">${t('admin.audienceAll')}</option>
        <option value="customers">${t('admin.audienceCustomers')}</option>
        <option value="drivers">${t('admin.audienceDrivers')}</option>
      </select></label>
      <label class="field"><span>Image (ikhtiyaari)</span><input type="file" id="noticeImage" accept="image/*" /></label>
      <button class="btn btn-primary btn-block" type="submit">${t('admin.publishNotice')}</button>
    </form>
    <div class="section-row"><h3>Published notices</h3></div>
    ${(notices || []).length ? notices.map(n => `<div class="card"><p class="card-title">${esc(n.title)}</p><p class="card-sub">${esc(n.body)}</p><p class="card-sub" style="font-size:11px">${fmtDate(n.created_at)} · ${esc(n.audience || 'all')}</p></div>`).join('') : emptyBox('📢', t('common.empty'), 'Ma jiraan notices.')}
  `;
}
async function publishNotice(e) {
  e.preventDefault();
  showLoading();
  try {
    let imageUrl = null;
    const file = $('noticeImage').files[0];
    if (file) imageUrl = await uploadFile('notifications', `${state.user.id}/${Date.now()}-${file.name}`, file);
    const { error } = await db.rpc('igakeen_publish_notice', {
      p_title: $('noticeTitle').value.trim(),
      p_body: $('noticeBody').value.trim(),
      p_audience: $('noticeAudience').value,
      p_image_url: imageUrl
    });
    if (error) throw error;
    toast('Ogeysiiska waa la daabacay.', 'success');
    renderAdminNotifications();
  } catch (err) { toast(friendlyError(err), 'error'); }
  finally { showLoading(false); }
}

/* =========================================================
   STORAGE
   ========================================================= */
async function uploadFile(bucket, path, file) {
  const { error } = await db.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: true });
  if (error) throw error;
  const { data } = db.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/* =========================================================
   MODAL
   ========================================================= */
function openModal(html, cls = '') {
  const root = $('modalRoot');
  root.innerHTML = `<div class="modal-backdrop" onclick="if(event.target===this)App.closeModal()"><div class="modal-sheet ${cls}">${html}</div></div>`;
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  $('modalRoot').innerHTML = '';
  document.body.style.overflow = '';
}

/* =========================================================
   OFFLINE / ONLINE
   ========================================================= */
window.addEventListener('offline', () => toast(t('offline'), 'error'));
window.addEventListener('online', () => toast(t('online'), 'success'));

/* =========================================================
   AUTH STATE LISTENER
   ========================================================= */
db.auth.onAuthStateChange(async (event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    state.recoveryMode = true;
    openUpdatePassword();
    return;
  }
  if (event === 'SIGNED_OUT') {
    state.user = null; state.profile = null; state.driver = null; state.isAdmin = false;
    $('authScreen').classList.remove('hidden');
    $('appShell').classList.add('hidden');
    closeModal();
    return;
  }
  await handleSession(session);
});

/* =========================================================
   BOOT
   ========================================================= */
(function boot() {
  applyTheme();
  applyLanguage();
  signupRole('customer');
  authTab('login');
  db.auth.getSession().then(({ data: { session } }) => handleSession(session));
})();

/* =========================================================
   GLOBAL APP API (used by inline handlers)
   ========================================================= */
window.App = {
  toggleTheme, cycleLanguage, setLanguage, authTab, signupRole, login, signup,
  openForgot, sendReset, updatePassword, logout, navigate, render,
  startOrder, submitOrder, useLocation,
  openOrder, filterCustomerOrders, openChat, leaveChat, sendMessage,
  toggleOnline, acceptOrder, openFeeModal, submitFee,
  renderNotifications, markAllRead,
  renderCommunity, openNewPost, createPost, toggleLike, openComments, createComment,
  renderAccount, openEditProfile, saveProfile, renderProfileView,
  renderAdminDashboard, renderAdminOrders, renderAdminDrivers, adminDriverDecision,
  renderAdminFees, adminFeeDecision, renderAdminSettings, saveFee,
  renderAdminNotifications, publishNotice,
  openModal, closeModal
};