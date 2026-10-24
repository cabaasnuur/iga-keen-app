
/* =========================================================
   IGA KEEN V2
   HTML5 + CSS3 + Vanilla JavaScript + Supabase
   Services: Taxi, Bajaaj, Delivery, Safar
   ========================================================= */

"use strict";

/* -------------------- 1. CONFIGURATION -------------------- */

const SUPABASE_URL = "https://zywwypqddnvslgqztnep.supabase.co";
const SUPABASE_KEY = "sb_publishable_fDRyejheqSBrLQcBe8KpQw_L76yFtp8";

const APP_URL = "https://cabaasnuur.github.io/iga-keen-app/";

const ADMIN_UID = "85282aac-7813-442f-a51b-6d43e3eccf1e";

const SERVICE_FEES = {
  taxi: { customer: 0, provider: 0.30 },
  bajaaj: { customer: 0, provider: 0.20 },
  delivery: { customer: 0.15, provider: 0.20 },
  safar: { customer: 0, provider: 1.50 }
};

const SERVICE_NAMES = {
  taxi: "Taxi",
  bajaaj: "Bajaaj",
  delivery: "Delivery",
  safar: "Safar"
};

const ORDER_STATUSES = {
  new: "Cusub",
  contacted: " lala xiriiray",
  confirmed: "La aqbalay",
  in_progress: "Socda",
  completed: "Dhammaystiran",
  cancelled: "La joojiyey"
};

const supabaseClient = window.supabase?.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

if (!supabaseClient) {
  console.error(
    "Supabase lama helin. Hubi in supabase-js CDN la geliyey ka hor script.js."
  );
}

/* -------------------- 2. APPLICATION STATE -------------------- */

let currentUser = null;
let currentSession = null;
let currentProfile = null;
let currentDriver = null;
let selectedService = "taxi";
let currentChatOrderId = null;
let currentChatRecipientId = null;
let activeRealtimeChannels = [];
let appInitialized = false;
let gpsCoordinates = null;

/* -------------------- 3. GENERAL HELPERS -------------------- */

function $(id) {
  return document.getElementById(id);
}

function getValue(id) {
  const element = $(id);
  return element ? String(element.value || "").trim() : "";
}

function setValue(id, value) {
  const element = $(id);
  if (element) element.value = value ?? "";
}

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = value ?? "";
}

function showElement(id, visible = true) {
  const element = $(id);
  if (element) element.hidden = !visible;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function normalizeService(service) {
  const value = String(service || "")
    .trim()
    .toLowerCase();

  return Object.prototype.hasOwnProperty.call(SERVICE_FEES, value)
    ? value
    : null;
}

function displayService(service) {
  const normalized = normalizeService(service);
  return normalized ? SERVICE_NAMES[normalized] : String(service || "");
}

function money(amount) {
  return "$" + Number(amount || 0).toFixed(2);
}

function formatDate(value) {
  if (!value) return "Waqti lama cayimin";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("so-SO", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function notify(message, type = "info") {
  console[type === "error" ? "error" : "log"](
    "[IGA KEEN] " + message
  );

  const container =
    $("toast") ||
    $("notification-message") ||
    $("app-message");

  if (container) {
    container.textContent = message;
    container.dataset.type = type;
    container.hidden = false;

    if (type === "error") {
      container.setAttribute("role", "alert");
    } else {
      container.setAttribute("role", "status");
    }
  } else {
    alert(message);
  }
}

function handleError(error, fallback = "Waxbaa khaldamay.") {
  console.error("[IGA KEEN ERROR]", error);

  const message = error?.message || fallback;
  notify(message, "error");
}

function requireLogin() {
  if (!currentUser) {
    notify("Fadlan marka hore gal akoonkaaga.", "error");
    return false;
  }

  return true;
}

function isAdmin() {
  return Boolean(currentUser && currentUser.id === ADMIN_UID);
}

function isDriver() {
  return Boolean(
    currentDriver &&
    currentDriver.user_id === currentUser?.id &&
    currentDriver.approval_status === "approved"
  );
}

function getServiceFees(service) {
  const normalized = normalizeService(service);
  return normalized ? SERVICE_FEES[normalized] : null;
}

function getStatusLabel(status) {
  return ORDER_STATUSES[status] || status || "Lama yaqaan";
}

function stopRealtimeChannels() {
  for (const channel of activeRealtimeChannels) {
    try {
      supabaseClient.removeChannel(channel);
    } catch (error) {
      console.warn("Realtime channel lama joojin karin:", error);
    }
  }

  activeRealtimeChannels = [];
}

/* -------------------- 4. NAVIGATION -------------------- */

function navigateTo(page) {
  const target = String(page || "home").toLowerCase();

  document.querySelectorAll("[data-page]").forEach(element => {
    element.hidden = element.dataset.page !== target;
  });

  document.querySelectorAll("[data-nav]").forEach(element => {
    const active = element.dataset.nav === target;

    element.classList.toggle("active", active);

    if (active) {
      element.setAttribute("aria-current", "page");
    } else {
      element.removeAttribute("aria-current");
    }
  });

  const legacyPages = {
    home: ["home-page", "page-home"],
    services: ["services-page", "page-services"],
    orders: ["orders-page", "page-orders"],
    chat: ["chat-page", "page-chat"],
    profile: ["profile-page", "page-profile"],
    driver: ["driver-page", "page-driver"],
    admin: ["admin-page", "page-admin"],
    auth: ["auth-page", "page-auth"]
  };

  Object.entries(legacyPages).forEach(([name, ids]) => {
    ids.forEach(id => {
      const element = $(id);
      if (element) {
        element.hidden = name !== target;
      }
    });
  });

  if (target === "orders") loadOrders();
  if (target === "driver") loadDriverDashboard();
  if (target === "admin") loadAdminDashboard();
  if (target === "profile") renderProfile();
}

function selectService(service) {
  const normalized = normalizeService(service);

  if (!normalized) {
    notify("Adeeggan lama aqoonsana.", "error");
    return;
  }

  selectedService = normalized;

  setValue("service-type", normalized);
  setValue("order-service", normalized);

  document.querySelectorAll("[data-service]").forEach(element => {
    const active =
      normalizeService(element.dataset.service) === normalized;

    element.classList.toggle("active", active);

    if (active) {
      element.setAttribute("aria-pressed", "true");
    } else {
      element.setAttribute("aria-pressed", "false");
    }
  });

  const fees = getServiceFees(normalized);

  setText("selected-service-name", displayService(normalized));
  setText("customer-fee", money(fees.customer));
  setText("provider-fee", money(fees.provider));

  const customerFeeElement = $("customer-fee");
  if (customerFeeElement) {
    customerFeeElement.textContent = money(fees.customer);
  }

  const serviceTitle = $("service-title");
  if (serviceTitle) {
    serviceTitle.textContent = displayService(normalized);
  }

  const passengersField = $("passengers");
  if (passengersField) {
    passengersField.hidden = normalized !== "taxi" &&
      normalized !== "safar";
  }

  navigateTo("orders");

  const orderForm = $("order-form");
  if (orderForm) {
    orderForm.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

/* -------------------- 5. AUTHENTICATION -------------------- */

async function signUp(event) {
  if (event) event.preventDefault();

  if (!supabaseClient) return;

  const email = getValue("auth-email").toLowerCase();
  const password = getValue("auth-password");
  const fullName = getValue("auth-full-name");
  const phone = getValue("auth-phone");

  if (!email || !password) {
    notify("Geli email-ka iyo password-ka.", "error");
    return;
  }

  if (password.length < 6) {
    notify("Password-ku waa inuu ugu yaraan 6 xaraf ahaadaa.", "error");
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: APP_URL,
        data: {
          full_name: fullName,
          phone
        }
      }
    });

    if (error) throw error;

    if (data.session) {
      currentSession = data.session;
      currentUser = data.user;

      await loadUserProfile();
      await afterLogin();

      notify("Akawnka waa la sameeyey.");
    } else {
      notify(
        "Isdiiwaangelintu way dhammaatay. Haddii email xaqiijin loo baahan yahay, fur email-kaaga oo xaqiiji akoonka."
      );
    }
  } catch (error) {
    handleError(error, "Isdiiwaangelintu ma suurtagelin.");
  }
}

async function signIn(event) {
  if (event) event.preventDefault();

  if (!supabaseClient) return;

  const email = getValue("auth-email").toLowerCase();
  const password = getValue("auth-password");

  if (!email || !password) {
    notify("Geli email-ka iyo password-ka.", "error");
    return;
  }

  try {
    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) throw error;

    currentSession = data.session;
    currentUser = data.user;

    await loadUserProfile();
    await afterLogin();

    notify("Waad soo gashay akoonkaaga.");
  } catch (error) {
    handleError(error, "Login-ku ma suurtagelin.");
  }
}

async function signOut() {
  if (!supabaseClient) return;

  try {
    stopRealtimeChannels();

    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;

    currentUser = null;
    currentSession = null;
    currentProfile = null;
    currentDriver = null;
    currentChatOrderId = null;
    currentChatRecipientId = null;

    updateAuthUI();
    navigateTo("home");

    notify("Waad ka baxday akoonkaaga.");
  } catch (error) {
    handleError(error, "Ka bixitaanka akoonka ma suurtagelin.");
  }
}

async function loadUserProfile() {
  currentProfile = null;
  currentDriver = null;

  if (!currentUser) return;

  const { data: driver, error: driverError } =
    await supabaseClient
      .from("drivers")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle();

  if (driverError) {
    console.warn("Driver profile lama helin:", driverError.message);
  } else if (driver) {
    currentDriver = driver;
  }

  currentProfile = {
    id: currentUser.id,
    email: currentUser.email,
    full_name:
      currentUser.user_metadata?.full_name ||
      currentUser.email ||
      "Isticmaale",
    phone: currentUser.user_metadata?.phone || "",
    driver_id: currentDriver?.id || null,
    approval_status: currentDriver?.approval_status || null,
    role: isAdmin()
      ? "admin"
      : currentDriver
        ? "driver"
        : "customer"
  };
}

async function afterLogin() {
  updateAuthUI();

  try {
    await loadNotifications();
    await loadOrders();

    if (isDriver()) {
      await loadDriverDashboard();
    }

    if (isAdmin()) {
      await loadAdminDashboard();
    }

    subscribeToRealtime();
  } catch (error) {
    console.error("Xogta akoonka qayb ka mid ah lama soo qaadi karin:", error);
  }

  navigateTo("home");
}

function updateAuthUI() {
  const loggedIn = Boolean(currentUser);

  showElement("auth-form", !loggedIn);
  showElement("login-section", !loggedIn);
  showElement("logout-button", loggedIn);
  showElement("profile-section", loggedIn);

  setText(
    "current-user-name",
    currentProfile?.full_name || currentUser?.email || ""
  );

  setText("current-user-email", currentUser?.email || "");

  document.querySelectorAll("[data-auth-only]").forEach(element => {
    element.hidden = !loggedIn;
  });

  document.querySelectorAll("[data-guest-only]").forEach(element => {
    element.hidden = loggedIn;
  });

  document.querySelectorAll("[data-driver-only]").forEach(element => {
    element.hidden = !isDriver();
  });

  document.querySelectorAll("[data-admin-only]").forEach(element => {
    element.hidden = !isAdmin();
  });
}

function renderProfile() {
  setText("profile-name", currentProfile?.full_name || "Isticmaale");
  setText("profile-email", currentUser?.email || "");
  setText("profile-phone", currentProfile?.phone || "");
  setText(
    "profile-role",
    isAdmin() ? "Maamule" : isDriver() ? "Darawal" : "Macmiil"
  );

  if (currentDriver && currentDriver.approval_status !== "approved") {
    setText(
      "driver-approval-status",
      "Xaaladda codsiga darawalnimada: " +
        currentDriver.approval_status
    );
  }
}

/* -------------------- 6. GPS / LOCATION -------------------- */

function getCurrentLocation() {
  if (!navigator.geolocation) {
    notify("Telefoonkaagu ma taageerayo GPS.", "error");
    return;
  }

  notify("Goobtaada ayaa la raadinayaa...");

  navigator.geolocation.getCurrentPosition(
    position => {
      gpsCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setValue("pickup-latitude", gpsCoordinates.latitude);
      setValue("pickup-longitude", gpsCoordinates.longitude);

      setValue("pickup_latitude", gpsCoordinates.latitude);
      setValue("pickup_longitude", gpsCoordinates.longitude);

      notify("Goobta GPS-ka waa la helay.");
    },
    error => {
      console.error("GPS error:", error);

      notify(
        "Goobta lama helin. Hubi oggolaanshaha Location-ka, ama gacanta ku qor cinwaanka.",
        "error"
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
    }
  );
}

/* -------------------- 7. CREATE ORDER -------------------- */

async function createOrder(event) {
  if (event) event.preventDefault();

  if (!requireLogin()) return;
  if (!supabaseClient) return;

  const service = normalizeService(
    getValue("service-type") ||
    getValue("order-service") ||
    selectedService
  );

  if (!service) {
    notify("Dooro nooca adeegga.", "error");
    return;
  }

  const fees = getServiceFees(service);

  if (!fees) {
    notify("Fee-ga adeeggan lama helin.", "error");
    return;
  }

  const customerName =
    getValue("customer-name") ||
    currentProfile?.full_name ||
    currentUser.email;

  const customerPhone =
    getValue("customer-phone") ||
    currentProfile?.phone ||
    "";

  const pickup = getValue("pickup-address");
  const destination = getValue("destination-address");
  const notes = getValue("order-notes") || getValue("notes");
  const passengers = parseInt(getValue("passengers") || "1", 10);

  if (!customerName || !customerPhone || !pickup) {
    notify(
      "Fadlan geli magaca, telefoonka iyo goobta laga qaadayo.",
      "error"
    );
    return;
  }

  if (service !== "delivery" && !destination) {
    notify("Fadlan geli meesha loo socdo.", "error");
    return;
  }

  const scheduledValue =
    getValue("scheduled-at") ||
    getValue("scheduled_at");

  const scheduledAt = scheduledValue
    ? new Date(scheduledValue).toISOString()
    : null;

  const pickupLatitude =
    Number(getValue("pickup-latitude") ||
      getValue("pickup_latitude")) ||
    gpsCoordinates?.latitude ||
    null;

  const pickupLongitude =
    Number(getValue("pickup-longitude") ||
      getValue("pickup_longitude")) ||
    gpsCoordinates?.longitude ||
    null;

  const destinationLatitude =
    Number(getValue("destination-latitude") ||
      getValue("destination_latitude")) || null;

  const destinationLongitude =
    Number(getValue("destination-longitude") ||
      getValue("destination_longitude")) || null;

  const orderData = {
    service_type: service,
    customer_name: customerName,
    customer_phone: customerPhone,
    pickup_address: pickup,
    destination_address: destination || "",
    pickup_latitude: pickupLatitude,
    pickup_longitude: pickupLongitude,
    destination_latitude: destinationLatitude,
    destination_longitude: destinationLongitude,
    notes: notes || null,
    passengers:
      service === "taxi" || service === "safar"
        ? Math.max(1, passengers || 1)
        : null,
    scheduled_at: scheduledAt,
    status: "new",
    customer_fee: fees.customer,
    provider_fee: fees.provider,
    currency: "USD",
    user_id: currentUser.id,
    provider_fee_status: "unpaid"
  };

  const submitButton =
    $("submit-order") ||
    document.querySelector('#order-form button[type="submit"]');

  if (submitButton) submitButton.disabled = true;

  try {
    const { data, error } = await supabaseClient
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;

    notify(
      "Dalabka waa la diray. Lambarka dalabka: " +
        (data.order_number ?? data.id)
    );

    const form = $("order-form");
    if (form) form.reset();

    gpsCoordinates = null;
    selectedService = service;

    setValue("service-type", service);
    setValue("order-service", service);

    await loadOrders();
    await loadNotifications();

    navigateTo("orders");
  } catch (error) {
    handleError(error, "Dalabka lama diiwaangelin.");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

/* -------------------- 8. LOAD AND DISPLAY ORDERS -------------------- */

async function loadOrders() {
  if (!supabaseClient || !currentUser) return [];

  try {
    let query = supabaseClient
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!isAdmin()) {
      if (isDriver() && currentDriver) {
        query = query.or(
          `user_id.eq.${currentUser.id},driver_id.eq.${currentDriver.id},and(status.eq.new,driver_id.is.null)`
        );
      } else {
        query = query.eq("user_id", currentUser.id);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    renderOrders(data || []);
    return data || [];
  } catch (error) {
    handleError(error, "Dalabyada lama soo qaadi karin.");
    return [];
  }
}

function renderOrders(orders) {
  const container =
    $("orders-list") ||
    $("my-orders") ||
    $("orders-container");

  if (!container) return;

  if (!orders.length) {
    container.innerHTML =
      '<p class="empty-state">Weli dalab ma jiro.</p>';
    return;
  }

  container.innerHTML = orders.map(order => {
    const isOwner = order.user_id === currentUser?.id;
    const isAssignedDriver =
      order.driver_id && order.driver_id === currentDriver?.id;

    const canChat =
      isOwner || isAssignedDriver || isAdmin();

    const canSubmitFee =
      isDriver() &&
      order.status === "new" &&
      !order.driver_id &&
      order.provider_fee_status !== "confirmed";

    const canAccept =
      isDriver() &&
      order.status === "new" &&
      !order.driver_id;

    return `
      <article class="order-card" data-order-id="${escapeHTML(order.id)}">
        <h3>${escapeHTML(displayService(order.service_type))}</h3>
        <p><strong>Lambarka:</strong> ${escapeHTML(order.order_number ?? order.id)}</p>
        <p><strong>Qaab:</strong> ${escapeHTML(getStatusLabel(order.status))}</p>
        <p><strong>Meesha laga qaadayo:</strong> ${escapeHTML(order.pickup_address)}</p>
        <p><strong>Meesha loo socdo:</strong> ${escapeHTML(order.destination_address || "Lama cayimin")}</p>
        <p><strong>Waqtiga:</strong> ${escapeHTML(formatDate(order.scheduled_at || order.created_at))}</p>
        <p><strong>Fee-ga macmiilka:</strong> ${money(order.customer_fee)}</p>
        <p><strong>Fee-ga adeeg-bixiyaha:</strong> ${money(order.provider_fee)}</p>
        <p><strong>Xaaladda fee-ga:</strong> ${escapeHTML(order.provider_fee_status || "unpaid")}</p>
        ${
          canSubmitFee
            ? `<button type="button" data-action="submit-fee" data-id="${escapeHTML(order.id)}">Gudbi fee-ga</button>`
            : ""
        }
        ${
          canAccept
            ? `<button type="button" data-action="accept-order" data-id="${escapeHTML(order.id)}">Aqbal dalabka</button>`
            : ""
        }
        ${
          canChat
            ? `<button type="button" data-action="open-chat" data-id="${escapeHTML(order.id)}">Fariin gudaha app-ka</button>`
            : ""
        }
      </article>
    `;
  }).join("");
}

/* -------------------- 9. DRIVER PROFILE / DASHBOARD -------------------- */

async function registerAsDriver(event) {
  if (event) event.preventDefault();

  if (!requireLogin()) return;

  const fullName = getValue("driver-full-name") ||
    currentProfile?.full_name ||
    "";

  const phone = getValue("driver-phone") ||
    currentProfile?.phone ||
    "";

  const service = normalizeService(
    getValue("driver-service") || "taxi"
  );

  const vehicle = getValue("vehicle-description");

  if (!fullName || !phone || !service) {
    notify("Geli magaca, telefoonka iyo adeegga aad bixiso.", "error");
    return;
  }

  try {
    const { data: existing, error: findError } = await supabaseClient
      .from("drivers")
      .select("id")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (findError) throw findError;

    let result;

    if (existing) {
      result = await supabaseClient
        .from("drivers")
        .update({
          full_name: fullName,
          phone,
          service_type: service,
          vehicle_description: vehicle || null
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      result = await supabaseClient
        .from("drivers")
        .insert({
          user_id: currentUser.id,
          full_name: fullName,
          phone,
          service_type: service,
          vehicle_description: vehicle || null,
          is_available: false,
          approval_status: "pending"
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    await loadUserProfile();
    updateAuthUI();

    notify(
      "Codsiga darawalnimada waa la gudbiyey. Sug oggolaanshaha maamulka."
    );
  } catch (error) {
    handleError(error, "Codsiga darawalnimada lama gudbin.");
  }
}

async function loadDriverDashboard() {
  if (!currentUser || !currentDriver) return;

  setText("driver-name", currentDriver.full_name || "");
  setText("driver-status", currentDriver.approval_status || "pending");

  const container =
    $("driver-orders-list") ||
    $("available-orders");

  if (!container) return;

  try {
    const { data, error } = await supabaseClient
      .from("orders")
      .select("*")
      .or(
        `driver_id.eq.${currentDriver.id},and(status.eq.new,driver_id.is.null)`
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    renderDriverOrders(data || []);
  } catch (error) {
    handleError(error, "Dalabyada darawalka lama soo qaadi karin.");
  }
}

function renderDriverOrders(orders) {
  const container =
    $("driver-orders-list") ||
    $("available-orders");

  if (!container) return;

  if (!orders.length) {
    container.innerHTML =
      '<p class="empty-state">Hadda dalab diyaar ah ma jiro.</p>';
    return;
  }

  container.innerHTML = orders.map(order => {
    const assignedToMe = order.driver_id === currentDriver?.id;
    const available = order.status === "new" && !order.driver_id;

    return `
      <article class="order-card">
        <h3>${escapeHTML(displayService(order.service_type))}</h3>
        <p><strong>Qaado:</strong> ${escapeHTML(order.pickup_address)}</p>
        <p><strong>U gee:</strong> ${escapeHTML(order.destination_address || "Lama cayimin")}</p>
        <p><strong>Fee-gaaga:</strong> ${money(order.provider_fee)}</p>
        <p><strong>Xaaladda fee-ga:</strong> ${escapeHTML(order.provider_fee_status || "unpaid")}</p>
        ${
          available
            ? `<button type="button" data-action="submit-fee" data-id="${escapeHTML(order.id)}">Gudbi fee-ga</button>
               <button type="button" data-action="accept-order" data-id="${escapeHTML(order.id)}">Aqbal dalabka</button>`
            : ""
        }
        ${
          assignedToMe
            ? `<button type="button" data-action="open-chat" data-id="${escapeHTML(order.id)}">La hadal macmiilka</button>`
            : ""
        }
      </article>
    `;
  }).join("");
}

/* -------------------- 10. PROVIDER FEE SUBMISSION -------------------- */

async function submitProviderFee(orderId) {
  if (!requireLogin()) return;

  if (!isDriver() || !currentDriver) {
    notify("Shaqadan waxaa isticmaali kara darawal la oggolaaday oo keliya.", "error");
    return;
  }

  const reference =
    prompt("Geli tixraaca lacag-bixinta (haddii uu jiro):") || "";

  const paymentNote =
    prompt("Qoraal dheeraad ah (ikhtiyaari):") || "";

  try {
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("id,provider_fee,status,driver_id,provider_fee_status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) throw orderError;

    if (!order || order.status !== "new" || order.driver_id) {
      notify("Dalabkan lama gudbin karo; waxaa laga yaabaa in hore loo aqbalay.", "error");
      return;
    }

    if (order.provider_fee_status === "confirmed") {
      notify("Fee-ga dalabkan hore ayaa loo xaqiijiyey.");
      return;
    }

    const { data: existing, error: existingError } = await supabaseClient
      .from("driver_fee_payments")
      .select("id,status")
      .eq("order_id", orderId)
      .eq("driver_id", currentDriver.id)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing?.status === "confirmed") {
      notify("Fee-gaaga hore ayaa loo xaqiijiyey.");
      return;
    }

    if (existing?.status === "pending") {
      notify("Fee-gaaga ayaa sugaya xaqiijinta maamulka.");
      return;
    }

    const paymentData = {
      order_id: orderId,
      driver_id: currentDriver.id,
      submitted_by: currentUser.id,
      amount: Number(order.provider_fee),
      currency: "USD",
      payment_reference: reference || null,
      payment_note: paymentNote || null,
      status: "pending",
      submitted_at: new Date().toISOString()
    };

    let result;

    if (existing?.id) {
      result = await supabaseClient
        .from("driver_fee_payments")
        .update(paymentData)
        .eq("id", existing.id);
    } else {
      result = await supabaseClient
        .from("driver_fee_payments")
        .insert(paymentData);
    }

    if (result.error) throw result.error;

    notify("Fee-ga waa la gudbiyey. Sug xaqiijinta maamulka.");

    await loadOrders();
    await loadDriverDashboard();
  } catch (error) {
    handleError(error, "Fee-ga lama gudbin.");
  }
}

/* -------------------- 11. ACCEPT ORDER AFTER FEE APPROVAL -------------------- */

async function acceptOrder(orderId) {
  if (!requireLogin()) return;

  if (!isDriver() || !currentDriver) {
    notify("Darawal la oggolaaday oo keliya ayaa aqbali kara dalab.", "error");
    return;
  }

  try {
    const { data, error } = await supabaseClient.rpc(
      "igakeen_accept_order",
      { p_order_id: orderId }
    );

    if (error) throw error;

    notify("Dalabka waa la aqbalay.");

    await loadOrders();
    await loadDriverDashboard();
    await loadNotifications();

    return data;
  } catch (error) {
    handleError(
      error,
      "Dalabka lama aqbalin. Hubi in fee-ga la xaqiijiyey iyo in dalabku weli bannaan yahay."
    );
  }
}

/* -------------------- 12. ADMIN: REVIEW PROVIDER FEES -------------------- */

async function loadAdminDashboard() {
  if (!isAdmin()) return;

  const container =
    $("admin-fee-list") ||
    $("pending-fees-list");

  if (!container) return;

  try {
    const { data, error } = await supabaseClient
      .from("driver_fee_payments")
      .select("*")
      .eq("status", "pending")
      .order("submitted_at", { ascending: true });

    if (error) throw error;

    renderAdminFees(data || []);
  } catch (error) {
    handleError(error, "Fee-yada sugaya lama soo qaadi karin.");
  }
}

function renderAdminFees(payments) {
  const container =
    $("admin-fee-list") ||
    $("pending-fees-list");

  if (!container) return;

  if (!payments.length) {
    container.innerHTML =
      '<p class="empty-state">Ma jiraan fee-yo sugaya xaqiijin.</p>';
    return;
  }

  container.innerHTML = payments.map(payment => `
    <article class="fee-card">
      <h3>Fee: ${money(payment.amount)}</h3>
      <p><strong>Order ID:</strong> ${escapeHTML(payment.order_id)}</p>
      <p><strong>Driver ID:</strong> ${escapeHTML(payment.driver_id)}</p>
      <p><strong>Tixraac:</strong> ${escapeHTML(payment.payment_reference || "Ma jiro")}</p>
      <p><strong>Qoraal:</strong> ${escapeHTML(payment.payment_note || "Ma jiro")}</p>
      <p><strong>La soo gudbiyey:</strong> ${escapeHTML(formatDate(payment.submitted_at))}</p>
      <button type="button" data-action="confirm-fee" data-id="${escapeHTML(payment.id)}">Xaqiiji fee-ga</button>
      <button type="button" data-action="reject-fee" data-id="${escapeHTML(payment.id)}">Diid fee-ga</button>
    </article>
  `).join("");
}

async function reviewProviderFee(paymentId, decision) {
  if (!isAdmin()) {
    notify("Maamulka oo keliya ayaa xaqiijin kara fee-ga.", "error");
    return;
  }

  if (!["confirmed", "rejected"].includes(decision)) {
    notify("Go'aanka fee-ga ma saxna.", "error");
    return;
  }

  let reviewNote = null;

  if (decision === "rejected") {
    reviewNote = prompt("Sababta loo diiday (ikhtiyaari):") || null;
  }

  try {
    const { error } = await supabaseClient.rpc(
      "igakeen_review_provider_fee",
      {
        p_payment_id: paymentId,
        p_decision: decision,
        p_review_note: reviewNote
      }
    );

    if (error) throw error;

    notify(
      decision === "confirmed"
        ? "Fee-ga waa la xaqiijiyey. Darawalku hadda wuu aqbali karaa dalabka."
        : "Fee-ga waa la diiday."
    );

    await loadAdminDashboard();
    await loadOrders();
    await loadNotifications();
  } catch (error) {
    handleError(error, "Xaqiijinta fee-ga way fashilantay.");
  }
}

/* -------------------- 13. IN-APP CHAT -------------------- */

async function openChat(orderId) {
  if (!requireLogin()) return;

  try {
    const { data: order, error } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (error) throw error;

    if (!order) {
      notify("Dalabkan lama helin.", "error");
      return;
    }

    const isCustomer = order.user_id === currentUser.id;
    const isAssignedDriver =
      Boolean(currentDriver && order.driver_id === currentDriver.id);

    if (!isCustomer && !isAssignedDriver && !isAdmin()) {
      notify("Ma lihid oggolaansho aad uga qayb gasho sheekadan.", "error");
      return;
    }

    let recipientId = null;

    if (isCustomer && order.driver_id) {
      const { data: driver, error: driverError } = await supabaseClient
        .from("drivers")
        .select("user_id")
        .eq("id", order.driver_id)
        .maybeSingle();

      if (driverError) throw driverError;
      recipientId = driver?.user_id || null;
    } else if (isAssignedDriver) {
      recipientId = order.user_id;
    }

    currentChatOrderId = order.id;
    currentChatRecipientId = recipientId;

    setText(
      "chat-title",
      "Wadahadalka dalabka #" + (order.order_number ?? order.id)
    );

    setText(
      "chat-status",
      recipientId
        ? "Farriimaha waxay ku socdaan gudaha IGA KEEN."
        : "Darawal weli looma xirin dalabkan."
    );

    navigateTo("chat");

    await loadChatMessages(order.id);
    subscribeToChat(order.id);

    const input = $("chat-message");
    if (input) input.focus();
  } catch (error) {
    handleError(error, "Wadahadalka lama furi karin.");
  }
}

async function loadChatMessages(orderId = currentChatOrderId) {
  if (!orderId || !currentUser) return;

  const container =
    $("chat-messages") ||
    $("messages-list");

  if (!container) return;

  try {
    const { data, error } = await supabaseClient
      .from("order_messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) throw error;

    container.innerHTML = (data || []).map(message => {
      const mine = message.sender_id === currentUser.id;

      return `
        <article class="chat-message ${mine ? "mine" : "theirs"}">
          <p>${escapeHTML(message.body)}</p>
          <small>${escapeHTML(formatDate(message.created_at))}</small>
        </article>
      `;
    }).join("");

    container.scrollTop = container.scrollHeight;

    const unreadIds = (data || [])
      .filter(message =>
        message.recipient_id === currentUser.id &&
        !message.read_at
      )
      .map(message => message.id);

    if (unreadIds.length) {
      await supabaseClient
        .from("order_messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", unreadIds);
    }
  } catch (error) {
    handleError(error, "Farriimaha lama soo qaadi karin.");
  }
}

async function sendChatMessage(event) {
  if (event) event.preventDefault();

  if (!requireLogin()) return;

  if (!currentChatOrderId) {
    notify("Marka hore fur dalab aad ka sheekaysanayso.", "error");
    return;
  }

  const input =
    $("chat-message") ||
    $("message-input");

  const body = String(input?.value || "").trim();

  if (!body) return;

  if (!currentChatRecipientId && !isAdmin()) {
    notify("Darawal ama macmiil kale weli looma xirin dalabkan.", "error");
    return;
  }

  try {
    const { error } = await supabaseClient
      .from("order_messages")
      .insert({
        order_id: currentChatOrderId,
        sender_id: currentUser.id,
        recipient_id: currentChatRecipientId,
        body
      });

    if (error) throw error;

    if (input) input.value = "";

    await loadChatMessages();
  } catch (error) {
    handleError(error, "Farriinta lama dirin.");
  }
}

function subscribeToChat(orderId) {
  const channel = supabaseClient
    .channel("igakeen-chat-" + orderId)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "order_messages",
        filter: "order_id=eq." + orderId
      },
      () => {
        loadChatMessages(orderId);
      }
    )
    .subscribe();

  activeRealtimeChannels.push(channel);
}

/* -------------------- 14. NOTIFICATIONS -------------------- */

async function loadNotifications() {
  if (!currentUser) return [];

  try {
    const { data, error } = await supabaseClient
      .from("notifications")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    renderNotifications(data || []);
    return data || [];
  } catch (error) {
    console.warn("Notifications lama soo qaadi karin:", error.message);
    return [];
  }
}

function renderNotifications(notifications) {
  const container =
    $("notifications-list") ||
    $("notification-list");

  const unread = notifications.filter(item => !item.read_at).length;

  setText("notification-count", unread ? String(unread) : "");
  setText("unread-notification-count", String(unread));

  if (!container) return;

  if (!notifications.length) {
    container.innerHTML =
      '<p class="empty-state">Ogeysiis cusub ma jiro.</p>';
    return;
  }

  container.innerHTML = notifications.map(item => `
    <article class="notification-item ${item.read_at ? "read" : "unread"}">
      <strong>${escapeHTML(item.title || "Ogeysiis")}</strong>
      <p>${escapeHTML(item.body || "")}</p>
      <small>${escapeHTML(formatDate(item.created_at))}</small>
      ${
        !item.read_at
          ? `<button type="button" data-action="read-notification" data-id="${escapeHTML(item.id)}">Akhris ahaan u calaamadee</button>`
          : ""
      }
    </article>
  `).join("");
}

async function markNotificationRead(notificationId) {
  if (!currentUser) return;

  try {
    const { error } = await supabaseClient
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", currentUser.id);

    if (error) throw error;

    await loadNotifications();
  } catch (error) {
    handleError(error, "Ogeysiiska lama cusboonaysiin.");
  }
}

/* -------------------- 15. REALTIME SUBSCRIPTIONS -------------------- */

function subscribeToRealtime() {
  if (!currentUser || !supabaseClient) return;

  stopRealtimeChannels();

  const ordersChannel = supabaseClient
    .channel("igakeen-orders-" + currentUser.id)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders"
      },
      () => {
        loadOrders();

        if (isDriver()) loadDriverDashboard();
        if (isAdmin()) loadAdminDashboard();
      }
    )
    .subscribe();

  activeRealtimeChannels.push(ordersChannel);

  const notificationsChannel = supabaseClient
    .channel("igakeen-notifications-" + currentUser.id)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: "user_id=eq." + currentUser.id
      },
      () => loadNotifications()
    )
    .subscribe();

  activeRealtimeChannels.push(notificationsChannel);
}

/* -------------------- 16. BUTTON / FORM EVENT BINDINGS -------------------- */

function bindEvents() {
  const signupForm =
    $("signup-form") ||
    $("register-form");

  if (signupForm) {
    signupForm.addEventListener("submit", signUp);
  }

  const loginForm =
    $("auth-form") ||
    $("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", signIn);
  }

  const orderForm = $("order-form");
  if (orderForm) {
    orderForm.addEventListener("submit", createOrder);
  }

  const driverForm = $("driver-form");
  if (driverForm) {
    driverForm.addEventListener("submit", registerAsDriver);
  }

  const chatForm =
    $("chat-form") ||
    $("message-form");

  if (chatForm) {
    chatForm.addEventListener("submit", sendChatMessage);
  }

  const logoutButton =
    $("logout-button") ||
    $("signout-button");

  if (logoutButton) {
    logoutButton.addEventListener("click", signOut);
  }

  const locationButton =
    $("get-location") ||
    $("gps-button");

  if (locationButton) {
    locationButton.addEventListener("click", getCurrentLocation);
  }

  document.addEventListener("click", event => {
    const target = event.target.closest(
      "[data-action], [data-service], [data-nav]"
    );

    if (!target) return;

    if (target.dataset.service) {
      event.preventDefault();
      selectService(target.dataset.service);
      return;
    }

    if (target.dataset.nav) {
      event.preventDefault();
      navigateTo(target.dataset.nav);
      return;
    }

    const action = target.dataset.action;
    const id = target.dataset.id;

    if (!action) return;

    event.preventDefault();

    switch (action) {
      case "sign-out":
        signOut();
        break;

      case "get-location":
        getCurrentLocation();
        break;

      case "submit-fee":
        submitProviderFee(id);
        break;

      case "accept-order":
        acceptOrder(id);
        break;

      case "open-chat":
        openChat(id);
        break;

      case "confirm-fee":
        reviewProviderFee(id, "confirmed");
        break;

      case "reject-fee":
        reviewProviderFee(id, "rejected");
        break;

      case "read-notification":
        markNotificationRead(id);
        break;

      case "load-orders":
        loadOrders();
        break;

      case "load-driver-dashboard":
        loadDriverDashboard();
        break;

      case "load-admin-dashboard":
        loadAdminDashboard();
        break;

      default:
        console.warn("Action aan la aqoonsan:", action);
    }
  });
}

/* -------------------- 17. INITIALIZE APP -------------------- */

async function initializeApp() {
  if (appInitialized) return;
  appInitialized = true;

  bindEvents();

  if (!supabaseClient) {
    notify(
      "Supabase lama bilaabin. Hubi CDN-ga supabase-js ee HTML-ka.",
      "error"
    );
    return;
  }

  try {
    const {
      data: { session },
      error
    } = await supabaseClient.auth.getSession();

    if (error) throw error;

    currentSession = session;
    currentUser = session?.user || null;

    if (currentUser) {
      await loadUserProfile();
      await afterLogin();
    } else {
      updateAuthUI();
    }

    selectService("taxi");

    // Soo celi bogga hore haddii HTML-kaagu leeyahay navigation gaar ah.
    navigateTo("home");
  } catch (error) {
    handleError(error, "App-ka lama bilaabi karin.");
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    currentSession = session;
    currentUser = session?.user || null;

    if (event === "SIGNED_OUT") {
      currentProfile = null;
      currentDriver = null;
      stopRealtimeChannels();
      updateAuthUI();
      return;
    }

    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      // Ka fogow hawl culus gudaha auth callback-ka.
      setTimeout(async () => {
        if (!currentUser) return;

        try {
          await loadUserProfile();
          updateAuthUI();
        } catch (error) {
          console.error("Auth refresh error:", error);
        }
      }, 0);
    }
  });
}

/* -------------------- 18. GLOBAL FUNCTIONS FOR HTML -------------------- */

window.IGA_KEEN = {
  signUp,
  signIn,
  signOut,
  navigateTo,
  selectService,
  createOrder,
  getCurrentLocation,
  loadOrders,
  registerAsDriver,
  loadDriverDashboard,
  submitProviderFee,
  acceptOrder,
  loadAdminDashboard,
  reviewProviderFee,
  openChat,
  loadChatMessages,
  sendChatMessage,
  loadNotifications,
  markNotificationRead
};

// Waxa kale oo la heli karaa haddii HTML-ka hore u isticmaalo onclick.
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.navigateTo = navigateTo;
window.selectService = selectService;
window.createOrder = createOrder;
window.getCurrentLocation = getCurrentLocation;
window.loadOrders = loadOrders;
window.registerAsDriver = registerAsDriver;
window.loadDriverDashboard = loadDriverDashboard;
window.submitProviderFee = submitProviderFee;
window.acceptOrder = acceptOrder;
window.loadAdminDashboard = loadAdminDashboard;
window.reviewProviderFee = reviewProviderFee;
window.openChat = openChat;
window.sendChatMessage = sendChatMessage;
window.loadNotifications = loadNotifications;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
