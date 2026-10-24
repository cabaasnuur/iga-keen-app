/* ==========================================================================
   IGA KEEN V3 — Application Core & Supabase Integration Engine
   ========================================================================== */

// 1. SUPABASE CLIENT CONFIGURATION
const SUPABASE_URL = "https://zywwypqddnvslgqztnep.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5d3d5cHFkZG52c2xncXp0bmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzg3OTMsImV4cCI6MjA1NjzgNDc5M30.4q4x8z4-q"; // Existing configured publishable key

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ADMIN_UID = "85282aac-7813-442f-a51b-6d43e3eccf1e";

// 2. INTERNATIONALIZATION (TRANSLATIONS)
const i18n = {
  so: {
    welcomeTitle: "Ku soo dhawaaw IGA KEEN",
    welcomeDesc: "Adeegga gaadiidka & delivery-ga ee ugu dhakhsaha badan",
    login: "Soo Gal",
    signup: "Is-diiwaangeli",
    email: "Email",
    password: "Password",
    userType: "Nooca Isticmaalaha",
    customer: "Macmiil",
    driver: "Darawal",
    fullName: "Magaca Buuxa",
    phone: "Telefoon",
    forgotPassword: "Haraw ka dhacday kalmada sirta?",
    navHome: "Guri",
    navOrders: "Dalabyada",
    navCommunity: "Bulshada",
    navNotif: "Ogeysiis",
    navAccount: "Akoon",
    servicesTitle: "Maxaad u baahan tahay?",
    taxiDesc: "Magaalada dhexdeeda si raaxo leh",
    bajaajDesc: "Dhaqso & qiimo jaban",
    deliveryDesc: "Package & waraaqahaaga",
    safarDesc: "Magalooyinka kale & gobollada",
    recentOrders: "Dalabyadii Ugu Dambeeyay",
    viewAll: "Dhammaan",
    availableOrders: "Dalabyada Banaan",
    myJobs: "Shaqooyinkeyga",
    payFee: "Bixi Ajarka IGA KEEN",
    submitFee: "Dhiib Fee-ga",
    paymentRef: "Tixraaca Lacag bixinta",
    offlineMsg: "Internet connection-ka waa go'an yahay.",
    servicePrice: "Qiimaha Adeegga:",
    agreedPrice: "Darawalka ayaad ku heshiinaysaan",
    igakeenFee: "Ajar IGA KEEN:",
    confirmOrder: "Xaqiiji Dalabka",
    active: "Socda",
    completed: "Dhameystiran",
    cancelled: "Kansal leh",
    logout: "Ka bax Akoonka",
    preferences: "Dookhyada App-ka",
    theme: "Muuqaalka (Theme)",
    language: "Luuqada / Language",
    account: "Akoonka",
    editProfile: "Wax ka baddal Profile",
    saveChanges: "Kaydi Baddalida",
    newPost: "Post Cusub",
    publishPost: "Faafi Post-ka",
    markRead: "Akhriyay Dhammaan"
  },
  en: {
    welcomeTitle: "Welcome to IGA KEEN",
    welcomeDesc: "The fastest local transport & delivery platform",
    login: "Log In",
    signup: "Sign Up",
    email: "Email",
    password: "Password",
    userType: "Account Type",
    customer: "Customer",
    driver: "Driver",
    fullName: "Full Name",
    phone: "Phone Number",
    forgotPassword: "Forgot Password?",
    navHome: "Home",
    navOrders: "Orders",
    navCommunity: "Community",
    navNotif: "Alerts",
    navAccount: "Account",
    servicesTitle: "What do you need?",
    taxiDesc: "Comfortable city rides",
    bajaajDesc: "Quick & affordable rickshaw",
    deliveryDesc: "Parcels & documents delivery",
    safarDesc: "Inter-city & long travel",
    recentOrders: "Recent Orders",
    viewAll: "View All",
    availableOrders: "Available Orders",
    myJobs: "My Jobs",
    payFee: "Pay IGA KEEN Fee",
    submitFee: "Submit Payment",
    paymentRef: "Payment Reference",
    offlineMsg: "No internet connection.",
    servicePrice: "Service Price:",
    agreedPrice: "Agreed with driver",
    igakeenFee: "IGA KEEN Fee:",
    confirmOrder: "Confirm Order",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    logout: "Log Out",
    preferences: "Preferences",
    theme: "Theme",
    language: "Language",
    account: "Account",
    editProfile: "Edit Profile",
    saveChanges: "Save Changes",
    newPost: "New Post",
    publishPost: "Publish Post",
    markRead: "Mark All Read"
  },
  ar: {
    welcomeTitle: "مرحباً بك في IGA KEEN",
    welcomeDesc: "أسرع منصة للنقل والتوصيل المحلي",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    userType: "نوع الحساب",
    customer: "عميل",
    driver: "سائق",
    fullName: "الاسم الكامل",
    phone: "رقم الهاتف",
    forgotPassword: "نسيت كلمة المرور؟",
    navHome: "الرئيسية",
    navOrders: "الطلبات",
    navCommunity: "المجتمع",
    navNotif: "الإشعارات",
    navAccount: "حسابي",
    servicesTitle: "ماذا تحتاج اليوم؟",
    taxiDesc: "تنقل مريح داخل المدينة",
    bajaajDesc: "تكتك سريع وبسعر مناسب",
    deliveryDesc: "توصيل الطرود والوثائق",
    safarDesc: "رحلات بين المدن والمحافظات",
    recentOrders: "أحدث الطلبات",
    viewAll: "عرض الكل",
    availableOrders: "الطلبات المتاحة",
    myJobs: "مهامي",
    payFee: "دفع رسوم IGA KEEN",
    submitFee: "تأكيد الدفع",
    paymentRef: "رقم المرجع والدفع",
    offlineMsg: "لا يوجد اتصال بالإنترنت.",
    servicePrice: "سعر الخدمة:",
    agreedPrice: "بالاتفاق مع السائق",
    igakeenFee: "رسوم IGA KEEN:",
    confirmOrder: "تأكيد الطلب",
    active: "نشط",
    completed: "مكتمل",
    cancelled: "ملغى",
    logout: "تسجيل الخروج",
    preferences: "التفضيلات",
    theme: "المظهر",
    language: "اللغة",
    account: "الحساب",
    editProfile: "تعديل الملف الشخصي",
    saveChanges: "حفظ التغييرات",
    newPost: "منشور جديد",
    publishPost: "نشر المنشور",
    markRead: "تحديد الكل كقراءة"
  }
};

// 3. GLOBAL STATE
let appState = {
  user: null,
  profile: null,
  driverProfile: null,
  role: 'customer', // customer, driver, admin
  language: localStorage.getItem('igakeen_lang') || 'so',
  theme: localStorage.getItem('igakeen_theme') || 'light',
  serviceFees: {
    taxi: { customer_fee: 0, provider_fee: 0.30 },
    bajaaj: { customer_fee: 0, provider_fee: 0.20 },
    delivery: { customer_fee: 0.15, provider_fee: 0.20 },
    safar: { customer_fee: 0, provider_fee: 1.50 }
  },
  activeChatOrderId: null,
  chatRealtimeSub: null
};

// 4. INITIALIZATION
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initLanguage();
  initNetworkListeners();
  await loadServiceFees();
  initAuthListener();
});

// Network Connection Handlers
function initNetworkListeners() {
  window.addEventListener('offline', () => {
    document.getElementById('offline-banner').classList.remove('hidden');
  });
  window.addEventListener('online', () => {
    document.getElementById('offline-banner').classList.add('hidden');
    showToast("Connection-ka waa soo noqday.");
  });
}

// Language Engine
function initLanguage() {
  const lang = appState.language;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.getElementById('setting-language').value = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][key]) {
      el.textContent = i18n[lang][key];
    }
  });
}

function changeLanguage(newLang) {
  appState.language = newLang;
  localStorage.setItem('igakeen_lang', newLang);
  initLanguage();
}

// Theme Engine
function initTheme() {
  const theme = appState.theme;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  document.getElementById('setting-theme').value = theme;
}

function changeTheme(newTheme) {
  appState.theme = newTheme;
  localStorage.setItem('igakeen_theme', newTheme);
  initTheme();
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// 5. SERVICE FEES LOADING
async function loadServiceFees() {
  try {
    const { data, error } = await supabaseClient.from('service_fees').select('*');
    if (!error && data && data.length > 0) {
      data.forEach(item => {
        if (appState.serviceFees[item.service_type]) {
          appState.serviceFees[item.service_type] = {
            customer_fee: parseFloat(item.customer_fee || 0),
            provider_fee: parseFloat(item.provider_fee || 0)
          };
          // Update Fee Badges UI
          const badge = document.getElementById(`fee-badge-${item.service_type}`);
          if (badge) {
            badge.textContent = `Fee: $${item.provider_fee}`;
          }
        }
      });
    }
  } catch (err) {
    console.error("Error loading service fees:", err);
  }
}

// 6. AUTHENTICATION & SESSION MANAGEMENT
function initAuthListener() {
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
      appState.user = session.user;
      await fetchUserProfile();
      setupMainUI();
      setupRealtimeSubscriptions();
    } else {
      appState.user = null;
      appState.profile = null;
      appState.driverProfile = null;
      showView('view-auth');
      document.getElementById('app-bottom-nav').classList.add('hidden');
    }
  });
}

async function fetchUserProfile() {
  if (!appState.user) return;
  const userId = appState.user.id;

  // Check Admin Status
  if (userId === ADMIN_UID) {
    appState.role = 'admin';
    document.getElementById('admin-entry-button').classList.remove('hidden');
  }

  // Fetch Driver Profile if exists
  const { data: driverData } = await supabaseClient
    .from('drivers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (driverData) {
    appState.driverProfile = driverData;
    if (appState.role !== 'admin') {
      appState.role = 'driver';
    }
  } else if (appState.role !== 'admin') {
    appState.role = 'customer';
  }

  // Update UI Header & Badges
  document.getElementById('user-role-badge').textContent = appState.role.toUpperCase();
  document.getElementById('profile-fullname-display').textContent = appState.user.email.split('@')[0];
  document.getElementById('profile-email-display').textContent = appState.user.email;
  document.getElementById('profile-role-tag').textContent = appState.role;
}

function setupMainUI() {
  document.getElementById('app-bottom-nav').classList.remove('hidden');

  if (appState.role === 'driver') {
    switchNav('home');
    renderDriverHomeView();
  } else if (appState.role === 'admin') {
    switchNav('admin');
  } else {
    switchNav('home');
    renderCustomerHomeView();
  }
}

// Auth Actions
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const btn = document.getElementById('btn-login-submit');
  btn.disabled = true;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  btn.disabled = false;

  if (error) {
    showToast("Soo galka waa ku guuldareystay: " + error.message, "danger");
  } else {
    showToast("Guul! Waad soo gashay.");
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const fullName = document.getElementById('signup-fullname').value;
  const phone = document.getElementById('signup-phone').value;
  const isDriver = document.querySelector('input[name="account_type"]:checked').value === 'driver';

  const btn = document.getElementById('btn-signup-submit');
  btn.disabled = true;

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone: phone, role: isDriver ? 'driver' : 'customer' }
    }
  });

  if (error) {
    btn.disabled = false;
    showToast("Is-diiwaangelintu waa ku guuldareysatay: " + error.message, "danger");
    return;
  }

  if (isDriver && data.user) {
    const serviceType = document.getElementById('signup-driver-service').value;
    const vehicleDesc = document.getElementById('signup-driver-vehicle').value;

    await supabaseClient.from('drivers').insert({
      user_id: data.user.id,
      full_name: fullName,
      phone: phone,
      service_type: serviceType,
      vehicle_description: vehicleDesc,
      approval_status: 'pending'
    });
  }

  btn.disabled = false;
  showToast("Akoonkaaga waa la abuuray!");
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
  showToast("Waad ka baxday akoonka.");
}

function switchAuthTab(tab) {
  if (tab === 'login') {
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-signup').classList.remove('active');
    document.getElementById('form-login').classList.remove('hidden');
    document.getElementById('form-signup').classList.add('hidden');
  } else {
    document.getElementById('tab-signup').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('form-signup').classList.remove('hidden');
    document.getElementById('form-login').classList.add('hidden');
  }
}

function toggleDriverSignupFields(show) {
  const fields = document.getElementById('driver-signup-fields');
  if (show) fields.classList.remove('hidden');
  else fields.classList.add('hidden');
}

// 7. NAVIGATION SYSTEM
function switchNav(targetView) {
  document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

  const navBtn = document.getElementById(`nav-btn-${targetView}`);
  if (navBtn) navBtn.classList.add('active');

  if (targetView === 'home') {
    if (appState.role === 'driver') {
      showView('view-driver-home');
      renderDriverHomeView();
    } else {
      showView('view-customer-home');
      renderCustomerHomeView();
    }
  } else if (targetView === 'orders') {
    showView('view-orders');
    renderOrdersList();
  } else if (targetView === 'community') {
    showView('view-community');
    renderCommunityFeed();
  } else if (targetView === 'notifications') {
    showView('view-notifications');
    renderNotificationsList();
  } else if (targetView === 'account') {
    showView('view-account');
  } else if (targetView === 'admin') {
    showView('view-admin');
    renderAdminDashboard();
  }
}

function showView(viewId) {
  document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
  document.getElementById(viewId).classList.remove('hidden');
}

// 8. CUSTOMER HOME & ORDER CREATION
async function renderCustomerHomeView() {
  if (!appState.user) return;
  document.getElementById('home-user-name').textContent = appState.user.email.split('@')[0];

  // Render recent orders summary
  const { data: orders } = await supabaseClient
    .from('orders')
    .select('*')
    .eq('user_id', appState.user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  const container = document.getElementById('customer-active-orders-summary');
  if (!orders || orders.length === 0) {
    container.innerHTML = `<p class="text-sm text-muted text-center p-3">Ma jiraan dalabyo dhowaan samaysay.</p>`;
    return;
  }

  container.innerHTML = orders.map(ord => renderOrderCardHTML(ord)).join('');
}

function openOrderModal(serviceType) {
  document.getElementById('ord-service-type').value = serviceType;
  document.getElementById('order-modal-title').textContent = `Dalbo ${serviceType.toUpperCase()}`;

  const safarDateTime = document.getElementById('field-safar-datetime');
  if (serviceType === 'safar') {
    safarDateTime.classList.remove('hidden');
  } else {
    safarDateTime.classList.add('hidden');
  }

  const fees = appState.serviceFees[serviceType] || { customer_fee: 0, provider_fee: 0.20 };
  document.getElementById('ord-calculated-fee').textContent = `$${fees.provider_fee.toFixed(2)}`;

  document.getElementById('modal-order-create').classList.remove('hidden');
}

async function submitNewOrder(e) {
  e.preventDefault();
  const serviceType = document.getElementById('ord-service-type').value;
  const pickup = document.getElementById('ord-pickup-address').value;
  const destination = document.getElementById('ord-destination-address').value;
  const phone = document.getElementById('ord-customer-phone').value;
  const passengers = parseInt(document.getElementById('ord-passengers').value || '1');
  const notes = document.getElementById('ord-notes').value;
  const scheduledAt = document.getElementById('ord-scheduled-at').value;

  const btn = document.getElementById('btn-submit-order');
  btn.disabled = true;

  const fees = appState.serviceFees[serviceType] || { customer_fee: 0, provider_fee: 0.20 };
  const orderNumber = "IK-" + Math.floor(100000 + Math.random() * 900000);

  const payload = {
    order_number: orderNumber,
    service_type: serviceType,
    customer_name: appState.user.email.split('@')[0],
    customer_phone: phone,
    pickup_address: pickup,
    destination_address: destination,
    passengers: passengers,
    notes: notes,
    status: 'new',
    customer_fee: fees.customer_fee,
    provider_fee: fees.provider_fee,
    currency: 'USD',
    user_id: appState.user.id,
    scheduled_at: scheduledAt || new Date().toISOString()
  };

  const { error } = await supabaseClient.from('orders').insert(payload);
  btn.disabled = false;

  if (error) {
    showToast("Dalabka lama diri karin. Fadlan mar kale isku day.", "danger");
  } else {
    showToast("Dalabkaaga waa la diray si guul leh!");
    closeModal('modal-order-create');
    switchNav('orders');
  }
}

// Geolocation Support
function fetchCurrentGeolocation(fieldPrefix) {
  if (!navigator.geolocation) {
    showToast("GPS-ka ma taageero browser-kaaga. Geli ciwaanka gacanta.", "danger");
    return;
  }

  showToast("Laga soo helayo goobtaada...");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      document.getElementById(`${fieldPrefix}-lat`).value = pos.coords.latitude;
      document.getElementById(`${fieldPrefix}-lng`).value = pos.coords.longitude;
      document.getElementById(`${fieldPrefix}-address`).value = `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`;
      showToast("Goobtaada waa la helay!");
    },
    (err) => {
      showToast("Lama heli karin GPS-ka. Fadlan qor ciwaanka gacanta.", "danger");
    }
  );
}

// 9. DRIVER DASHBOARD LOGIC
async function renderDriverHomeView() {
  if (!appState.driverProfile) return;

  const drv = appState.driverProfile;
  document.getElementById('driver-display-name').textContent = drv.full_name;
  document.getElementById('driver-vehicle-info').textContent = `${drv.service_type.toUpperCase()} • ${drv.vehicle_description || 'No Vehicle Info'}`;

  const banner = document.getElementById('driver-approval-banner');
  const txt = document.getElementById('driver-approval-text');

  if (drv.approval_status === 'approved') {
    banner.className = 'status-alert alert-approved mt-2';
    txt.textContent = "Akoonkaaga waa la ansixiyay! Waad aqbali kartaa dalabyada.";
  } else if (drv.approval_status === 'rejected') {
    banner.className = 'status-alert alert-rejected mt-2';
    txt.textContent = "Aan la ansixin. Fadlan la xiriir maamulka IGA KEEN.";
  }

  switchDriverOrdersTab('available');
}

async function switchDriverOrdersTab(type) {
  document.getElementById('driver-tab-available').classList.toggle('active', type === 'available');
  document.getElementById('driver-tab-assigned').classList.toggle('active', type === 'assigned');

  const container = document.getElementById('driver-orders-container');

  if (type === 'available') {
    const { data: orders } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('status', 'new')
      .order('created_at', { ascending: false });

    if (!orders || orders.length === 0) {
      container.innerHTML = `<p class="text-sm text-muted text-center p-3">Hadda ma jiraan dalabyo cusub oo banaan.</p>`;
      return;
    }
    container.innerHTML = orders.map(ord => renderDriverOrderCardHTML(ord)).join('');
  } else {
    const { data: orders } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('driver_id', appState.driverProfile.id)
      .order('created_at', { ascending: false });

    if (!orders || orders.length === 0) {
      container.innerHTML = `<p class="text-sm text-muted text-center p-3">Ma haysatid shaqooyin adiga kuu gaar ah.</p>`;
      return;
    }
    container.innerHTML = orders.map(ord => renderDriverOrderCardHTML(ord)).join('');
  }
}

// Driver Order Acceptance & Provider Fee Trigger
function promptDriverAcceptance(orderId, requiredFee) {
  if (!appState.driverProfile || appState.driverProfile.approval_status !== 'approved') {
    showToast("Kaliya darawallada la ansixiyay ayaa aqbali kara dalabyada.", "danger");
    return;
  }

  document.getElementById('fee-order-id').value = orderId;
  document.getElementById('fee-modal-amount').textContent = parseFloat(requiredFee || 0).toFixed(2);
  document.getElementById('modal-submit-fee').classList.remove('hidden');
}

async function handleFeePaymentSubmit(e) {
  e.preventDefault();
  const orderId = document.getElementById('fee-order-id').value;
  const ref = document.getElementById('fee-payment-ref').value;
  const note = document.getElementById('fee-payment-note').value;

  const { error } = await supabaseClient.from('driver_fee_payments').insert({
    order_id: orderId,
    driver_id: appState.driverProfile.id,
    submitted_by: appState.user.id,
    amount: parseFloat(document.getElementById('fee-modal-amount').textContent),
    currency: 'USD',
    payment_reference: ref,
    payment_note: note,
    status: 'pending'
  });

  if (error) {
    showToast("Lacag bixinta lama gudbin karin: " + error.message, "danger");
  } else {
    showToast("Ajarkii waad gudbisay! Maamulka ayaa dib-u-eegaya xaqiijinta.");
    closeModal('modal-submit-fee');
    // Call existing secure RPC function if database supports direct assignment
    try {
      await supabaseClient.rpc('igakeen_accept_order', { p_order_id: orderId });
    } catch (err) {
      console.log("RPC fallback logic handled backend side.");
    }
    switchDriverOrdersTab('assigned');
  }
}

// 10. ORDERS VIEW & RENDERING HELPER
async function renderOrdersList(filter = 'active') {
  const container = document.getElementById('orders-full-list');
  let query = supabaseClient.from('orders').select('*').order('created_at', { ascending: false });

  if (appState.role === 'customer') {
    query = query.eq('user_id', appState.user.id);
  } else if (appState.role === 'driver' && appState.driverProfile) {
    query = query.eq('driver_id', appState.driverProfile.id);
  }

  if (filter === 'active') {
    query = query.in('status', ['new', 'contacted', 'confirmed', 'in_progress']);
  } else {
    query = query.eq('status', filter);
  }

  const { data: orders } = await query;

  if (!orders || orders.length === 0) {
    container.innerHTML = `<p class="text-sm text-muted text-center p-4">Ma jiraan dalabyo laga helay qaybtan.</p>`;
    return;
  }

  container.innerHTML = orders.map(ord => renderOrderCardHTML(ord)).join('');
}

function renderOrderCardHTML(ord) {
  return `
    <div class="order-card" onclick="openOrderDetailModal('${ord.id}')">
      <div class="order-card-header">
        <span class="order-num">#${ord.order_number || ord.id.slice(0, 8)}</span>
        <span class="status-badge status-${ord.status}">${ord.status}</span>
      </div>
      <div class="order-route">
        <div class="route-step">
          <i class="fa-solid fa-circle text-accent"></i>
          <span>${ord.pickup_address}</span>
        </div>
        <div class="route-step">
          <i class="fa-solid fa-location-dot text-danger"></i>
          <span>${ord.destination_address}</span>
        </div>
      </div>
      <div class="flex justify-between items-center text-xs text-muted mt-2">
        <span>${ord.service_type.toUpperCase()} • $${ord.provider_fee} Fee</span>
        <span>${new Date(ord.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  `;
}

function renderDriverOrderCardHTML(ord) {
  return `
    <div class="order-card">
      <div class="order-card-header">
        <span class="order-num">#${ord.order_number || ord.id.slice(0, 8)}</span>
        <span class="status-badge status-${ord.status}">${ord.status}</span>
      </div>
      <div class="order-route">
        <div class="route-step">
          <i class="fa-solid fa-circle text-accent"></i>
          <span>${ord.pickup_address}</span>
        </div>
        <div class="route-step">
          <i class="fa-solid fa-location-dot text-danger"></i>
          <span>${ord.destination_address}</span>
        </div>
      </div>
      <div class="mt-2 flex gap-2">
        ${ord.status === 'new' ? `
          <button class="btn btn-sm btn-primary w-full" onclick="promptDriverAcceptance('${ord.id}', '${ord.provider_fee}')">
            Aqbal Dalabka (Fee: $${ord.provider_fee})
          </button>
        ` : `
          <button class="btn btn-sm btn-primary w-full" onclick="openInAppChat('${ord.id}', '${ord.customer_name}')">
            <i class="fa-solid fa-comments"></i> Chat Macmiilka
          </button>
        `}
      </div>
    </div>
  `;
}

// 11. IN-APP REALTIME CHAT ENGINE
async function openInAppChat(orderId, peerName) {
  appState.activeChatOrderId = orderId;
  document.getElementById('chat-peer-name').textContent = peerName || "Macmiil/Darawal";
  document.getElementById('chat-order-number').textContent = `Order #${orderId.slice(0, 8)}`;
  document.getElementById('view-chat-modal').classList.remove('hidden');

  await loadChatMessages(orderId);
  subscribeToOrderChatRealtime(orderId);
}

function closeChatModal() {
  document.getElementById('view-chat-modal').classList.add('hidden');
  appState.activeChatOrderId = null;
  if (appState.chatRealtimeSub) {
    supabaseClient.removeChannel(appState.chatRealtimeSub);
  }
}

async function loadChatMessages(orderId) {
  const { data: messages } = await supabaseClient
    .from('order_messages')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  const box = document.getElementById('chat-messages-box');
  if (!messages || messages.length === 0) {
    box.innerHTML = `<p class="text-xs text-muted text-center my-auto">Bilow wada hadalka tooska ah...</p>`;
    return;
  }

  box.innerHTML = messages.map(msg => {
    const isMine = msg.sender_id === appState.user.id;
    return `
      <div class="chat-bubble ${isMine ? 'mine' : 'peer'}">
        <div>${msg.body}</div>
        <div class="chat-time">${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    `;
  }).join('');

  box.scrollTop = box.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input-field');
  const body = input.value.trim();
  if (!body || !appState.activeChatOrderId) return;

  input.value = '';

  const { error } = await supabaseClient.from('order_messages').insert({
    order_id: appState.activeChatOrderId,
    sender_id: appState.user.id,
    body: body
  });

  if (error) {
    showToast("Fariinta lama diri karin.", "danger");
  }
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter') sendChatMessage();
}

function subscribeToOrderChatRealtime(orderId) {
  if (appState.chatRealtimeSub) {
    supabaseClient.removeChannel(appState.chatRealtimeSub);
  }

  appState.chatRealtimeSub = supabaseClient
    .channel(`public:order_messages:order_id=eq.${orderId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_messages', filter: `order_id=eq.${orderId}` }, payload => {
      loadChatMessages(orderId);
    })
    .subscribe();
}

// 12. COMMUNITY SOCIAL FEED ENGINE
async function renderCommunityFeed() {
  const container = document.getElementById('community-feed');
  const { data: posts, error } = await supabaseClient
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !posts || posts.length === 0) {
    container.innerHTML = `<p class="text-sm text-muted text-center p-4">Ma jiraan boosasho bulsho oo dhowaan la soo dhigay.</p>`;
    return;
  }

  container.innerHTML = posts.map(post => `
    <div class="post-card">
      <div class="post-author">
        <div class="post-author-img">${(post.author_name || 'U')[0]}</div>
        <div>
          <h5 class="font-bold text-sm">${post.author_name || 'Xubinta Bulshada'}</h5>
          <span class="text-xs text-muted">${new Date(post.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="post-body">${post.body}</div>
      ${post.image_url ? `<img src="${post.image_url}" class="post-media" alt="Post media" />` : ''}
      <div class="post-actions">
        <button class="post-action-btn" onclick="togglePostLike('${post.id}')">
          <i class="fa-solid fa-heart"></i>
          <span>${post.likes_count || 0} Likes</span>
        </button>
      </div>
    </div>
  `).join('');
}

function openNewPostModal() {
  document.getElementById('modal-new-post').classList.remove('hidden');
}

async function handleNewPostSubmit(e) {
  e.preventDefault();
  const body = document.getElementById('post-body-text').value;
  const imageUrl = document.getElementById('post-image-url').value;

  const { error } = await supabaseClient.from('community_posts').insert({
    user_id: appState.user.id,
    author_name: appState.user.email.split('@')[0],
    body: body,
    image_url: imageUrl || null
  });

  if (error) {
    showToast("Post-ka lama daabuci karin: " + error.message, "danger");
  } else {
    showToast("Post-kaaga waa la faafiyay!");
    closeModal('modal-new-post');
    renderCommunityFeed();
  }
}

// 13. NOTIFICATIONS ENGINE
async function renderNotificationsList() {
  const container = document.getElementById('notifications-list');
  const { data: notifs } = await supabaseClient
    .from('notifications')
    .select('*')
    .eq('user_id', appState.user.id)
    .order('created_at', { ascending: false });

  if (!notifs || notifs.length === 0) {
    container.innerHTML = `<p class="text-sm text-muted text-center p-4">Ma haysatid wax ogeysiis ah.</p>`;
    return;
  }

  container.innerHTML = notifs.map(n => `
    <div class="settings-item">
      <div class="settings-label">
        <i class="fa-solid fa-bell text-accent"></i>
        <div>
          <div class="font-bold text-sm">${n.title || 'Ogeysiis'}</div>
          <div class="text-xs text-muted">${n.message || n.body}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// 14. ADMIN DASHBOARD CONTROLLER
async function renderAdminDashboard() {
  if (appState.role !== 'admin') {
    showToast("Access Denied.", "danger");
    switchNav('home');
    return;
  }

  // Fetch Summary Metrics
  const { count: totalOrders } = await supabaseClient.from('orders').select('*', { count: 'exact', head: true });
  const { count: pendingDrivers } = await supabaseClient.from('drivers').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending');
  const { count: pendingFees } = await supabaseClient.from('driver_fee_payments').select('*', { count: 'exact', head: true }).eq('status', 'pending');

  document.getElementById('adm-stat-total-orders').textContent = totalOrders || 0;
  document.getElementById('adm-stat-pending-drivers').textContent = pendingDrivers || 0;
  document.getElementById('adm-stat-pending-fees').textContent = pendingFees || 0;

  switchAdminTab('drivers');
}

async function switchAdminTab(tab) {
  document.querySelectorAll('.scrollable-tabs .segment-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`adm-tab-${tab}`).classList.add('active');

  const content = document.getElementById('admin-tab-content');

  if (tab === 'drivers') {
    const { data: pending } = await supabaseClient.from('drivers').select('*').eq('approval_status', 'pending');
    if (!pending || pending.length === 0) {
      content.innerHTML = `<p class="text-sm text-muted text-center p-3">Ma jiraan darawallo ka dhowrayo ansixin.</p>`;
      return;
    }
    content.innerHTML = pending.map(drv => `
      <div class="settings-item mb-2">
        <div>
          <div class="font-bold">${drv.full_name}</div>
          <div class="text-xs text-muted">${drv.service_type} • ${drv.phone}</div>
        </div>
        <div class="flex gap-1">
          <button class="btn btn-sm btn-primary" onclick="adminApproveDriver('${drv.id}', 'approved')">Ansixi</button>
          <button class="btn btn-sm btn-danger" onclick="adminApproveDriver('${drv.id}', 'rejected')">Diid</button>
        </div>
      </div>
    `).join('');
  } else if (tab === 'fees') {
    const { data: fees } = await supabaseClient.from('driver_fee_payments').select('*').eq('status', 'pending');
    if (!fees || fees.length === 0) {
      content.innerHTML = `<p class="text-sm text-muted text-center p-3">Ma jiraan lacag bixinno fee oo la xaqiijinayo.</p>`;
      return;
    }
    content.innerHTML = fees.map(f => `
      <div class="settings-item mb-2">
        <div>
          <div class="font-bold">Fee: $${f.amount}</div>
          <div class="text-xs text-muted">Ref: ${f.payment_reference}</div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="adminConfirmFee('${f.id}')">Xaqiiji Fee-ga</button>
      </div>
    `).join('');
  }
}

async function adminApproveDriver(driverId, status) {
  const { error } = await supabaseClient
    .from('drivers')
    .update({ approval_status: status })
    .eq('id', driverId);

  if (!error) {
    showToast(`Darawalka status-kiisa waxaa laga dhigay: ${status}`);
    renderAdminDashboard();
  }
}

async function adminConfirmFee(paymentId) {
  const { error } = await supabaseClient
    .from('driver_fee_payments')
    .update({ status: 'confirmed' })
    .eq('id', paymentId);

  if (!error) {
    showToast("Fee payment confirmed!");
    renderAdminDashboard();
  }
}

// 15. GLOBAL REALTIME SUBSCRIPTIONS
function setupRealtimeSubscriptions() {
  supabaseClient
    .channel('public:notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
      if (payload.new.user_id === appState.user.id) {
        showToast("Ogeysiis cusub: " + payload.new.title);
      }
    })
    .subscribe();
}

// Utility Modal Closers
function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function openResetModal() {
  document.getElementById('modal-reset-password').classList.remove('hidden');
}

async function handlePasswordResetSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('reset-pwd-email').value;
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
  if (error) {
    showToast("Lama diri karin link-ga dib u habaynta.", "danger");
  } else {
    showToast("Link-ga dib u habaynta waxaa loo diray email-kaaga.");
    closeModal('modal-reset-password');
  }
}