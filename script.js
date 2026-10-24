
/* =========================================================
   IGA KEEN V2 — COMPLETE SCRIPT
   HTML5 + CSS3 + Vanilla JavaScript + Supabase
   ========================================================= */

"use strict";

/* 1. CONFIGURATION */

const SUPABASE_URL = "https://zywwypqddnvslgqztnep.supabase.co";
const SUPABASE_KEY = "sb_publishable_fDRyejheqSBrLQcBe8KpQw_L76yFtp8";
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

/* 2. APPLICATION STATE */

let currentUser = null;
let currentSession = null;
let currentProfile = null;
let currentDriver = null;
let selectedService = "taxi";
let currentChatOrderId = null;
let currentChatRecipientId = null;
let activeRealtimeChannels = [];
let gpsCoordinates = null;
let signupMode = false;
let orderFilter = "all";
let appInitialized = false;

/* 3. HELPERS */

function $(id) {
  return document.getElementById(id);
}

function getValue(id) {
  const el = $(id);
  return el ? String(el.value || "").trim() : "";
}

function setValue(id, value) {
  const el = $(id);
  if (el) el.value = value ?? "";
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value ?? "";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[c]);
}

function normalizeService(value) {
  const service = String(value || "").trim().toLowerCase();
  return Object.hasOwn(SERVICE_FEES, service) ? service : null;
}

function displayService(value) {
  const service = normalizeService(value);
  return service ? SERVICE_NAMES[service] : String(value || "");
}

function money(value) {
  return "$" + Number(value || 0).toFixed(2);
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
  console[type === "error" ? "error" : "log"]("[IGA KEEN]", message);

  const toast = $("toast");
  if (toast) {
    toast.textContent = message;
    toast.dataset.type = type;
    toast.classList.add("show");
    toast.hidden = false;
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 4500);
  } else {
    alert(message);
  }
}

function handleError(error, fallback = "Waxbaa khaldamay.") {
  console.error("[IGA KEEN ERROR]", error);
  notify(error?.message || fallback, "error");
}

function requireLogin() {
  if (currentUser) return true;

  notify("Fadlan marka hore gal akoonkaaga.", "error");
  navigateTo("account");
  return false;
}

function isAdmin() {
  return Boolean(currentUser && currentUser.id === ADMIN_UID);
}

function isDriver() {
  return Boolean(
    currentDriver &&
    currentUser &&
    currentDriver.user_id === currentUser.id &&
    currentDriver.approval_status === "approved"
  );
}

function getStatusLabel(status) {
  return ORDER_STATUSES[status] || status || "Lama yaqaan";
}

function stopRealtimeChannels() {
  activeRealtimeChannels.forEach(channel => {
    try {
      supabaseClient?.removeChannel(channel);
    } catch (error) {
      console.warn("Realtime channel cleanup:", error);
    }
  });
  activeRealtimeChannels = [];
}

/* 4. NAVIGATION — MATCHES index.html */

function navigateTo(page) {
  const routes = {
    home: "homeView",
    order: "orderView",
    orders: "ordersView",
    chat: "chatView",
    driver: "driverView",
    notifications: "notificationsView",
    account: "accountView"
  };

  const target = String(page || "home").toLowerCase();
  const viewId = routes[target] || routes.home;

  document.querySelectorAll(".view").forEach(view => {
    view.classList.toggle("active", view.id === viewId);
  });

  document.querySelectorAll(".nav-item[data-view]").forEach(button => {
    button.classList.toggle("active", button.dataset.view === target);
  });

  if (target === "orders") loadOrders();
  if (target === "driver") loadDriverDashboard();
  if (target === "notifications") loadNotifications();
  if (target === "account") updateAuthUI();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectService(value) {
  const service = normalizeService(value);

  if (!service) {
    notify("Dooro adeeg sax ah.", "error");
    return;
  }

  selectedService = service;
  setValue("serviceType", service);

  const heading = $("orderHeading");
  if (heading) heading.textContent = "Dalbo " + SERVICE_NAMES[service];

  const destination = $("destinationAddress");
  const passengers = $("passengersGroup");
  const schedule = $("scheduleGroup");

  if (destination) {
    destination.required = service !== "delivery";
    destination.placeholder = service === "delivery"
      ? "Meesha alaabta loo geynayo"
      : "Geli meesha loo socdo";
  }

  if (passengers) {
    passengers.hidden = !["taxi", "safar"].includes(service);
  }

  if (schedule) schedule.hidden = false;

  const fee = SERVICE_FEES[service];
  setText(
    "customerFeeText",
    fee.customer > 0
      ? "Kharashka IGA KEEN ee macmiilka: " + money(fee.customer) +
        ". Qiimaha adeegga waxaa si gaar ah loola heshiinayaa adeeg-bixiyaha."
      : "Macmiilka fee-ga IGA KEEN waa $0.00. Qiimaha adeegga waxaa loola heshiinayaa adeeg-bixiyaha."
  );

  navigateTo("order");
}

/* 5. AUTHENTICATION */

async function signUp(event) {
  if (event) event.preventDefault();
  if (!supabaseClient) return notify("Supabase lama helin.", "error");

  const email = getValue("authEmail");
  const password = getValue("authPassword");
  const fullName = getValue("authFullName");
  const phone = getValue("authPhone");
  const wantsDriver = Boolean($("driverSignupCheckbox")?.checked);
  const service = normalizeService(getValue("driverServiceType") || "taxi");
  const vehicle = getValue("vehicleDescription");

  if (!email || !password) {
    notify("Geli email iyo password.", "error");
    return;
  }

  if (password.length < 6) {
    notify("Password-ku ha ahaado ugu yaraan 6 xaraf.", "error");
    return;
  }

  if (!fullName) {
    notify("Geli magacaaga.", "error");
    return;
  }

  if (wantsDriver && !phone) {
    notify("Geli telefoonkaaga si aad darawal u noqoto.", "error");
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null
        }
      }
    });

    if (error) throw error;

    if (data.user && data.session && wantsDriver) {
      const { error: driverError } = await supabaseClient
        .from("drivers")
        .insert({
          user_id: data.user.id,
          full_name: fullName,
          phone,
          service_type: service,
          vehicle_description: vehicle || null,
          is_available: false,
          approval_status: "pending"
        });

      if (driverError) {
        console.error("Driver signup:", driverError);
        notify(
          "Akoonka waa la sameeyey, laakiin codsiga darawalnimada lama dhammaystirin. Gal akoonka kadib isku day mar kale.",
          "error"
        );
        return;
      }
    }

    if (data.session) {
      currentSession = data.session;
      currentUser = data.user;
      await loadUserProfile();
      await afterLogin();
      notify("Akoonka waa la sameeyey.");
      navigateTo("home");
    } else {
      notify("Akoonka waa la sameeyey. Hubi email-kaaga si aad u xaqiijiso.");
      setAuthMode(false);
    }
  } catch (error) {
    handleError(error, "Diiwaangelintu way fashilantay.");
  }
}

async function signIn(event) {
  if (event) event.preventDefault();
  if (!supabaseClient) return notify("Supabase lama helin.", "error");

  const email = getValue("authEmail");
  const password = getValue("authPassword");

  if (!email || !password) {
    notify("Geli email iyo password.", "error");
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    currentSession = data.session;
    currentUser = data.user;

    await loadUserProfile();
    await afterLogin();

    notify("Waad soo gashay.");
    navigateTo("home");
  } catch (error) {
    handleError(error, "Gelitaanka akoonka wuu fashilmay.");
  }
}

async function signOut() {
  if (!supabaseClient) return;

  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;

    currentSession = null;
    currentUser = null;
    currentProfile = null;
    currentDriver = null;
    currentChatOrderId = null;
    currentChatRecipientId = null;

    stopRealtimeChannels();
    updateAuthUI();
    navigateTo("home");
    notify("Waad ka baxday akoonka.");
  } catch (error) {
    handleError(error, "Ka bixidda akoonka way fashilantay.");
  }
}

function setAuthMode(isSignup) {
  signupMode = Boolean(isSignup);

  $("fullNameGroup")?.classList.toggle("hidden", !signupMode);
  $("driverSignupFields")?.classList.toggle(
    "hidden",
    !signupMode || !$("driverSignupCheckbox")?.checked
  );

  $("loginTab")?.classList.toggle("active", !signupMode);
  $("signupTab")?.classList.toggle("active", signupMode);

  setText("authSubmitButton", signupMode ? "Is diiwaangeli" : "Gal");
  setText("accountHeading", signupMode ? "Samee akoon" : "Gal akoonkaaga");
  setText("authError", "");
  setText("authMessage", "");
}

async function loadUserProfile() {
  if (!currentUser || !supabaseClient) return;

  currentProfile = {
    full_name: currentUser.user_metadata?.full_name || "",
    phone: currentUser.user_metadata?.phone || ""
  };

  try {
    const { data, error } = await supabaseClient
      .from("drivers")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (error) throw error;
    currentDriver = data || null;

    if (currentDriver) {
      currentProfile.full_name =
        currentDriver.full_name || currentProfile.full_name;
      currentProfile.phone =
        currentDriver.phone || currentProfile.phone;
    }
  } catch (error) {
    console.warn("Profile/driver lookup:", error.message);
    currentDriver = null;
  }

  updateAuthUI();
}

function updateAuthUI() {
  const loggedIn = Boolean(currentUser);

  $("signedInPanel")?.classList.toggle("hidden", !loggedIn);
  $("authPanel")?.classList.toggle("hidden", loggedIn);

  setText("signedInEmail", currentUser?.email || "");
  setText(
    "signedInRole",
    isAdmin() ? "Maamule" :
    currentDriver ? "Adeeg-bixiye: " + currentDriver.approval_status :
    "Macmiil"
  );

  if (currentDriver) {
    const card = $("driverProfileCard");
    if (card) {
      card.innerHTML = `
        <strong>${escapeHTML(currentDriver.full_name || "Darawal")}</strong>
        <p class="muted">Adeeg: ${escapeHTML(displayService(currentDriver.service_type))}</p>
        <p class="muted">Xaaladda: ${escapeHTML(currentDriver.approval_status || "pending")}</p>
        <p class="muted">Telefoon: ${escapeHTML(currentDriver.phone || "Lama gelin")}</p>
      `;
    }
  }

  setText("notificationBadge", "");
  $("notificationBadge")?.classList.add("hidden");

  if (loggedIn) {
    loadNotifications();
  }
}

async function afterLogin() {
  await loadUserProfile();
  updateAuthUI();
  await loadOrders();
  await loadNotifications();
  await loadDriverDashboard();
  subscribeToRealtime();
}

/* 6. GPS LOCATION */

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

      setValue("pickupLatitude", gpsCoordinates.latitude);
      setValue("pickupLongitude", gpsCoordinates.longitude);
      notify("Goobta GPS-ka waa la helay.");
    },
    error => {
      console.error("GPS error:", error);
      notify(
        "Goobta lama helin. Oggolow Location-ka ama gacanta ku qor cinwaanka.",
        "error"
      );
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  );
}

/* 7. CREATE ORDER */

async function createOrder(event) {
  event?.preventDefault();

  if (!requireLogin() || !supabaseClient) return;

  const service = normalizeService(getValue("serviceType") || selectedService);
  const customerName = getValue("customerName") ||
    currentProfile?.full_name || "";
  const customerPhone = getValue("customerPhone") ||
    currentProfile?.phone || "";
  const pickup = getValue("pickupAddress");
  const destination = getValue("destinationAddress");
  const notes = getValue("orderNotes");
  const passengers = parseInt(getValue("passengers") || "1", 10);
  const scheduledValue = getValue("scheduledAt");

  if (!service) return notify("Dooro adeegga.", "error");
  if (!customerName || !customerPhone || !pickup) {
    return notify("Geli magaca, telefoonka iyo goobta lagaa qaadayo.", "error");
  }
  if (service !== "delivery" && !destination) {
    return notify("Geli meesha loo socdo.", "error");
  }

  let scheduledAt = null;
  if (scheduledValue) {
    const parsed = new Date(scheduledValue);
    if (Number.isNaN(parsed.getTime())) {
      return notify("Waqtiga safarka sax ma aha.", "error");
    }
    scheduledAt = parsed.toISOString();
  }

  const fee = SERVICE_FEES[service];

  const orderData = {
    service_type: service,
    customer_name: customerName,
    customer_phone: customerPhone,
    pickup_address: pickup,
    destination_address: destination || "",
    pickup_latitude: gpsCoordinates?.latitude ?? null,
    pickup_longitude: gpsCoordinates?.longitude ?? null,
    destination_latitude: null,
    destination_longitude: null,
    notes: notes || null,
    passengers: ["taxi", "safar"].includes(service)
      ? Math.max(1, passengers || 1)
      : null,
    scheduled_at: scheduledAt,
    status: "new",
    customer_fee: fee.customer,
    provider_fee: fee.provider,
    currency: "USD",
    user_id: currentUser.id,
    provider_fee_status: "unpaid"
  };

  const button = $("submitOrderButton");
  if (button) button.disabled = true;
  setText("orderError", "");

  try {
    const { data, error } = await supabaseClient
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;

    $("orderForm")?.reset();
    setValue("serviceType", service);
    gpsCoordinates = null;

    notify("Dalabka waa la diray. Lambarka: " + (data.order_number ?? data.id));
    await loadOrders();
    await loadNotifications();
    navigateTo("orders");
  } catch (error) {
    setText("orderError", error.message || "Dalabka lama dirin.");
    handleError(error, "Dalabka lama diiwaangelin.");
  } finally {
    if (button) button.disabled = false;
  }
}

/* 8. CUSTOMER ORDERS */

async function loadOrders() {
  if (!currentUser || !supabaseClient) return [];

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
  const filtered = orders.filter(order => {
    if (orderFilter === "completed") return order.status === "completed";
    if (orderFilter === "active") {
      return !["completed", "cancelled"].includes(order.status);
    }
    return true;
  });

  const container = $("ordersList");
  if (!container) return;

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span>📋</span>
        <strong>Weli dalab ma jiro</strong>
        <p>Markaad adeeg dalbato, halkan ayuu ka muuqan doonaa.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(order => {
    const mine = order.user_id === currentUser?.id;
    const assigned = order.driver_id && order.driver_id === currentDriver?.id;
    const canChat = mine || assigned || isAdmin();

    return `
      <article class="order-card">
        <div class="order-card-top">
          <h3>${escapeHTML(displayService(order.service_type))}</h3>
          <span class="status-badge status-${escapeHTML(order.status)}">
            ${escapeHTML(getStatusLabel(order.status))}
          </span>
        </div>
        <div class="order-details">
          <p><strong>Lambarka:</strong> ${escapeHTML(order.order_number ?? order.id)}</p>
          <p><strong>Laga qaadayo:</strong> ${escapeHTML(order.pickup_address)}</p>
          <p><strong>Loo socdo:</strong> ${escapeHTML(order.destination_address || "Lama cayimin")}</p>
          <p><strong>La sameeyey:</strong> ${escapeHTML(formatDate(order.created_at))}</p>
          <p><strong>Fee macmiilka:</strong> ${money(order.customer_fee)}</p>
          <p><strong>Fee adeeg-bixiyaha:</strong> ${money(order.provider_fee)}</p>
          <p><strong>Xaaladda fee-ga:</strong> ${escapeHTML(order.provider_fee_status || "unpaid")}</p>
        </div>
        <div class="order-actions">
          ${canChat ? `<button class="secondary-button" type="button" data-action="open-chat" data-id="${escapeHTML(order.id)}">Fariin</button>` : ""}
        </div>
      </article>`;
  }).join("");
}

/* 9. DRIVER DASHBOARD */

async function loadDriverDashboard() {
  const container = $("availableOrdersList");
  if (!container) return;

  if (!currentUser) {
    container.innerHTML = '<p class="empty-state">Gal akoonkaaga si aad u isticmaasho qaybta darawalka.</p>';
    return;
  }

  if (!currentDriver) {
    container.innerHTML = `
      <div class="empty-state">
        <span>🚘</span>
        <strong>Weli darawal ma tihid</strong>
        <p>Ka dooro Akoon → Is diiwaangeli, kadib calaamadee inaad adeeg-bixiye tahay.</p>
        <button type="button" class="primary-button" data-view="account">Gal / Is diiwaangeli</button>
      </div>`;
    return;
  }

  const card = $("driverProfileCard");
  if (card) {
    card.innerHTML = `
      <strong>${escapeHTML(currentDriver.full_name || "Darawal")}</strong>
      <p class="muted">Adeeg: ${escapeHTML(displayService(currentDriver.service_type))}</p>
      <p class="muted">Xaaladda codsiga: ${escapeHTML(currentDriver.approval_status || "pending")}</p>
      ${currentDriver.approval_status !== "approved"
        ? '<p class="form-message">Codsigaagu wuxuu sugayaa oggolaanshaha maamulka.</p>'
        : '<p class="form-message">Akoonka darawalka waa la oggolaaday.</p>'}
    `;
  }

  if (!isDriver()) {
    container.innerHTML = '<p class="empty-state">Marka maamulka kuu oggolaado darawalnimada ayaad dalabyada aqbali kartaa.</p>';
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("orders")
      .select("*")
      .or(`driver_id.eq.${currentDriver.id},and(status.eq.new,driver_id.is.null)`)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    renderDriverOrders(data || []);
  } catch (error) {
    handleError(error, "Dalabyada darawalka lama soo qaadi karin.");
  }
}

function renderDriverOrders(orders) {
  const container = $("availableOrdersList");
  if (!container) return;

  if (!orders.length) {
    container.innerHTML = '<p class="empty-state">Hadda dalab diyaar ah ma jiro.</p>';
    return;
  }

  container.innerHTML = orders.map(order => {
    const available = order.status === "new" && !order.driver_id;
    const assignedToMe = order.driver_id === currentDriver?.id;

    return `
      <article class="order-card">
        <div class="order-card-top">
          <h3>${escapeHTML(displayService(order.service_type))}</h3>
          <span class="status-badge">${escapeHTML(getStatusLabel(order.status))}</span>
        </div>
        <div class="order-details">
          <p><strong>Laga qaadayo:</strong> ${escapeHTML(order.pickup_address)}</p>
          <p><strong>Loo socdo:</strong> ${escapeHTML(order.destination_address || "Lama cayimin")}</p>
          <p><strong>Fee-gaaga:</strong> ${money(order.provider_fee)}</p>
          <p><strong>Xaaladda fee-ga:</strong> ${escapeHTML(order.provider_fee_status || "unpaid")}</p>
        </div>
        <div class="order-actions">
          ${available ? `<button class="secondary-button" type="button" data-action="submit-fee" data-id="${escapeHTML(order.id)}">Gudbi fee-ga</button>` : ""}
          ${available ? `<button class="primary-button" type="button" data-action="accept-order" data-id="${escapeHTML(order.id)}">Aqbal dalabka</button>` : ""}
          ${assignedToMe ? `<button class="secondary-button" type="button" data-action="open-chat" data-id="${escapeHTML(order.id)}">La hadal macmiilka</button>` : ""}
        </div>
      </article>`;
  }).join("");
}

/* 10. DRIVER FEE PAYMENT */

async function submitProviderFee(orderId) {
  if (!requireLogin()) return;

  if (!isDriver()) {
    notify("Darawal la oggolaaday oo keliya ayaa gudbin kara fee.", "error");
    return;
  }

  try {
    const { data: order, error } = await supabaseClient
      .from("orders")
      .select("id,provider_fee,status,driver_id,provider_fee_status")
      .eq("id", orderId)
      .maybeSingle();

    if (error) throw error;
    if (!order || order.status !== "new" || order.driver_id) {
      notify("Dalabkan hadda lama aqbali karo.", "error");
      return;
    }

    if (order.provider_fee_status === "confirmed") {
      notify("Fee-ga hore ayaa loo xaqiijiyey.");
      return;
    }

    const reference = prompt("Geli tixraaca lacag-bixinta (ikhtiyaari):") || "";
    const note = prompt("Faahfaahin dheeraad ah (ikhtiyaari):") || "";

    const { data: existing, error: findError } = await supabaseClient
      .from("driver_fee_payments")
      .select("id,status")
      .eq("order_id", orderId)
      .eq("driver_id", currentDriver.id)
      .maybeSingle();

    if (findError) throw findError;

    if (existing?.status === "confirmed") {
      notify("Fee-ga hore ayaa loo xaqiijiyey.");
      return;
    }

    if (existing?.status === "pending") {
      notify("Fee-gaaga wuxuu sugayaa maamulka.");
      return;
    }

    const payment = {
      order_id: orderId,
      driver_id: currentDriver.id,
      submitted_by: currentUser.id,
      amount: Number(order.provider_fee),
      currency: "USD",
      payment_reference: reference || null,
      payment_note: note || null,
      status: "pending",
      submitted_at: new Date().toISOString()
    };

    let result;

    if (existing?.id) {
      result = await supabaseClient
        .from("driver_fee_payments")
        .update(payment)
        .eq("id", existing.id);
    } else {
      result = await supabaseClient
        .from("driver_fee_payments")
        .insert(payment);
    }

    if (result.error) throw result.error;

    notify("Caddeynta fee-ga waa la gudbiyey. Sug xaqiijinta maamulka.");
    await loadDriverDashboard();
  } catch (error) {
    handleError(error, "Fee-ga lama gudbin.");
  }
}

async function acceptOrder(orderId) {
  if (!requireLogin()) return;

  if (!isDriver()) {
    notify("Darawal la oggolaaday oo keliya ayaa aqbali kara dalab.", "error");
    return;
  }

  try {
    const { error } = await supabaseClient.rpc(
      "igakeen_accept_order",
      { p_order_id: orderId }
    );

    if (error) throw error;

    notify("Dalabka waa la aqbalay.");
    await loadOrders();
    await loadDriverDashboard();
    await loadNotifications();
  } catch (error) {
    handleError(
      error,
      "Dalabka lama aqbalin. Hubi in fee-ga la xaqiijiyey."
    );
  }
}

/* 11. ADMIN FEE REVIEW */

async function loadAdminDashboard() {
  if (!isAdmin()) return;

  try {
    const { data, error } = await supabaseClient
      .from("driver_fee_payments")
      .select("*")
      .eq("status", "pending")
      .order("submitted_at", { ascending: true });

    if (error) throw error;

    const container = $("adminFeeList");
    if (!container) return;

    container.innerHTML = (data || []).map(payment => `
      <article class="order-card">
        <h3>Fee: ${money(payment.amount)}</h3>
        <p>Dalab: ${escapeHTML(payment.order_id)}</p>
        <p>Tixraac: ${escapeHTML(payment.payment_reference || "Ma jiro")}</p>
        <button type="button" class="primary-button" data-action="confirm-fee" data-id="${escapeHTML(payment.id)}">Xaqiiji</button>
        <button type="button" class="secondary-button" data-action="reject-fee" data-id="${escapeHTML(payment.id)}">Diid</button>
      </article>
    `).join("") || '<p class="empty-state">Fee sugaya ma jiro.</p>';
  } catch (error) {
    handleError(error, "Fee-yada lama soo qaadi karin.");
  }
}

async function reviewProviderFee(paymentId, decision) {
  if (!isAdmin()) {
    notify("Maamulka oo keliya ayaa xaqiijin kara fee-ga.", "error");
    return;
  }

  const note = decision === "rejected"
    ? prompt("Sababta loo diiday (ikhtiyaari):") || null
    : null;

  try {
    const { error } = await supabaseClient.rpc(
      "igakeen_review_provider_fee",
      {
        p_payment_id: paymentId,
        p_decision: decision,
        p_review_note: note
      }
    );

    if (error) throw error;

    notify(decision === "confirmed" ? "Fee-ga waa la xaqiijiyey." : "Fee-ga waa la diiday.");
    await loadAdminDashboard();
    await loadOrders();
    await loadNotifications();
  } catch (error) {
    handleError(error, "Fee-ga lama cusboonaysiin.");
  }
}

/* 12. IN-APP CHAT */

async function openChat(orderId) {
  if (!requireLogin()) return;

  try {
    const { data: order, error } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (error) throw error;
    if (!order) return notify("Dalabkan lama helin.", "error");

    const customer = order.user_id === currentUser.id;
    const assignedDriver = Boolean(
      currentDriver && order.driver_id === currentDriver.id
    );

    if (!customer && !assignedDriver && !isAdmin()) {
      return notify("Ma lihid oggolaansho wadahadalkan.", "error");
    }

    let recipient = null;

    if (customer && order.driver_id) {
      const { data: driver, error: driverError } = await supabaseClient
        .from("drivers")
        .select("user_id")
        .eq("id", order.driver_id)
        .maybeSingle();

      if (driverError) throw driverError;
      recipient = driver?.user_id || null;
    } else if (assignedDriver) {
      recipient = order.user_id;
    }

    currentChatOrderId = order.id;
    currentChatRecipientId = recipient;

    setText(
      "chatOrderInfo",
      "Wadahadalka dalabka #" + (order.order_number ?? order.id) +
      (recipient ? "" : " — Darawal weli looma qoondeyn.")
    );

    navigateTo("chat");
    await loadChatMessages();

    const input = $("chatInput");
    input?.focus();
  } catch (error) {
    handleError(error, "Wadahadalka lama furi karin.");
  }
}

async function loadChatMessages() {
  if (!currentChatOrderId || !currentUser) return;

  const container = $("chatMessages");
  if (!container) return;

  try {
    const { data, error } = await supabaseClient
      .from("order_messages")
      .select("*")
      .eq("order_id", currentChatOrderId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) throw error;

    container.innerHTML = (data || []).map(message => {
      const mine = message.sender_id === currentUser.id;
      return `
        <article class="chat-bubble ${mine ? "mine" : "theirs"}">
          <p>${escapeHTML(message.body)}</p>
          <time>${escapeHTML(formatDate(message.created_at))}</time>
        </article>`;
    }).join("") || '<p class="empty-state">Weli fariin ma jirto.</p>';

    container.scrollTop = container.scrollHeight;
  } catch (error) {
    handleError(error, "Fariimaha lama soo qaadi karin.");
  }
}

async function sendChatMessage(event) {
  event?.preventDefault();

  if (!requireLogin()) return;
  if (!currentChatOrderId) {
    notify("Marka hore fur wada sheekaysiga dalab.", "error");
    return;
  }

  const body = getValue("chatInput");
  if (!body) return;

  if (!currentChatRecipientId) {
    notify("Wadahadalku wuxuu furmi doonaa marka darawal loo qoondeeyo dalabka.", "error");
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

    setValue("chatInput", "");
    await loadChatMessages();
  } catch (error) {
    handleError(error, "Fariinta lama dirin.");
  }
}

/* 13. NOTIFICATIONS */

async function loadNotifications() {
  if (!currentUser || !supabaseClient) return [];

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
    console.warn("Notifications:", error.message);
    return [];
  }
}

function renderNotifications(items) {
  const container = $("notificationsList");
  const unread = items.filter(item => !item.read_at).length;

  const badge = $("notificationBadge");
  if (badge) {
    badge.textContent = String(unread);
    badge.classList.toggle("hidden", unread === 0);
  }

  if (!container) return;

  container.innerHTML = items.map(item => `
    <article class="notification-card ${item.read_at ? "" : "unread"}">
      <div>
        <strong>${escapeHTML(item.title || "Ogeysiis")}</strong>
        <p>${escapeHTML(item.body || "")}</p>
        <time>${escapeHTML(formatDate(item.created_at))}</time>
        ${!item.read_at ? `<button class="secondary-button" type="button" data-action="read-notification" data-id="${escapeHTML(item.id)}">Akhris ahaan u calaamadee</button>` : ""}
      </div>
    </article>
  `).join("") || '<p class="empty-state">Ogeysiis cusub ma jiro.</p>';
}

async function markNotificationRead(id) {
  if (!currentUser) return;

  try {
    const { error } = await supabaseClient
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", currentUser.id);

    if (error) throw error;
    await loadNotifications();
  } catch (error) {
    handleError(error, "Ogeysiiska lama cusboonaysiin.");
  }
}

/* 14. EVENT BINDINGS — MATCHES index.html */

function bindEvents() {
  $("authForm")?.addEventListener("submit", event => {
    if (signupMode) signUp(event);
    else signIn(event);
  });

  $("orderForm")?.addEventListener("submit", createOrder);
  $("chatForm")?.addEventListener("submit", sendChatMessage);
  $("signOutButton")?.addEventListener("click", signOut);
  $("getLocationButton")?.addEventListener("click", getCurrentLocation);
  $("refreshOrdersButton")?.addEventListener("click", loadOrders);

  $("notificationButton")?.addEventListener("click", () => {
    navigateTo("notifications");
  });

  $("accountButton")?.addEventListener("click", () => {
    navigateTo("account");
  });

  $("openDriverButton")?.addEventListener("click", () => {
    navigateTo("driver");
  });

  $("loginTab")?.addEventListener("click", () => setAuthMode(false));
  $("signupTab")?.addEventListener("click", () => setAuthMode(true));

  $("driverSignupCheckbox")?.addEventListener("change", event => {
    $("driverSignupFields")?.classList.toggle(
      "hidden",
      !signupMode || !event.target.checked
    );
  });

  $("markNotificationsReadButton")?.addEventListener("click", async () => {
    if (!currentUser) return requireLogin();

    try {
      const { error } = await supabaseClient
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", currentUser.id)
        .is("read_at", null);

      if (error) throw error;
      await loadNotifications();
      notify("Ogeysiisyada waa la calaamadeeyey.");
    } catch (error) {
      handleError(error, "Ogeysiisyada lama cusboonaysiin.");
    }
  });

  document.addEventListener("click", event => {
    const target = event.target.closest(
      "[data-view], [data-service], [data-action], [data-order-filter]"
    );

    if (!target) return;

    if (target.dataset.service) {
      event.preventDefault();
      selectService(target.dataset.service);
      return;
    }

    if (target.dataset.view) {
      event.preventDefault();
      navigateTo(target.dataset.view);
      return;
    }

    if (target.dataset.orderFilter) {
      event.preventDefault();
      orderFilter = target.dataset.orderFilter;

      document.querySelectorAll("[data-order-filter]").forEach(button => {
        button.classList.toggle("active", button === target);
      });

      loadOrders();
      return;
    }

    const id = target.dataset.id;
    switch (target.dataset.action) {
      case "open-chat":
        openChat(id);
        break;
      case "submit-fee":
        submitProviderFee(id);
        break;
      case "accept-order":
        acceptOrder(id);
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
    }
  });
}

/* 15. REALTIME */

function subscribeToRealtime() {
  if (!currentUser || !supabaseClient) return;

  stopRealtimeChannels();

  const ordersChannel = supabaseClient
    .channel("igakeen-orders-" + currentUser.id)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "orders"
    }, () => {
      loadOrders();
      if (isDriver()) loadDriverDashboard();
    })
    .subscribe();

  activeRealtimeChannels.push(ordersChannel);

  const notificationChannel = supabaseClient
    .channel("igakeen-notifications-" + currentUser.id)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "notifications",
      filter: "user_id=eq." + currentUser.id
    }, loadNotifications)
    .subscribe();

  activeRealtimeChannels.push(notificationChannel);

  const messagesChannel = supabaseClient
    .channel("igakeen-messages-" + currentUser.id)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "order_messages"
    }, () => {
      if (currentChatOrderId) loadChatMessages();
    })
    .subscribe();

  activeRealtimeChannels.push(messagesChannel);
}

/* 16. START APP */

async function initializeApp() {
  if (appInitialized) return;
  appInitialized = true;

  bindEvents();

  if (!supabaseClient) {
    notify("Supabase lama bilaabin. Hubi internet-ka iyo CDN-ga.", "error");
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;

    currentSession = data.session;
    currentUser = data.session?.user || null;

    if (currentUser) {
      await afterLogin();
    } else {
      updateAuthUI();
    }

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
      navigateTo("home");
    }
  });
}

/* Compatibility access for debugging and future HTML actions */
window.IGA_KEEN = {
  navigateTo,
  selectService,
  signUp,
  signIn,
  signOut,
  createOrder,
  getCurrentLocation,
  loadOrders,
  loadDriverDashboard,
  submitProviderFee,
  acceptOrder,
  openChat,
  sendChatMessage,
  loadNotifications
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
