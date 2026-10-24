
/* =====================================================
   IGA KEEN V2
   HTML + CSS + VANILLA JAVASCRIPT + SUPABASE
===================================================== */

/*
  FIIRO GAAR AH:
  1. Supabase URL iyo publishable key waa kuwa project-ka.
  2. Ha gelin service_role key gudaha browser-ka.
  3. Supabase tables iyo RLS policies waa inay diyaar yihiin.
  4. Fee submission ma xaqiijinayo lacag-bixin.
*/

const SUPABASE_URL = "https://zywwypqddnvslgqztnep.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_fDRyejheqSBrLQcBe8KpQw_L76yFtp8";

const ADMIN_USER_ID = "85282aac-7813-442f-a51b-6d43e3eccf1e";

const db = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/* =========================
   STATE
========================= */

let currentUser = null;
let currentProfile = null;
let currentDriver = null;
let currentView = "home";
let currentAuthMode = "login";
let currentOrderFilter = "all";
let currentChatOrder = null;
let currentChatRecipient = null;
let cachedOrders = [];
let cachedNotifications = [];
let toastTimer = null;
let chatSubscription = null;
let notificationSubscription = null;
let ordersSubscription = null;

/* =========================
   HELPERS
========================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[character];
  });
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value ?? "";
}

function setVisible(selector, visible) {
  const element = $(selector);
  if (element) element.classList.toggle("hidden", !visible);
}

function setError(selector, message = "") {
  setText(selector, message);
}

function formatDate(value) {
  if (!value) return "Lama cayimin";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Lama cayimin";

  return date.toLocaleString("so-SO", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function formatMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "$0.00";
  return `$${amount.toFixed(2)}`;
}

function normalizeStatus(status) {
  return String(status || "new").toLowerCase().replace(/\s+/g, "_");
}

function statusLabel(status) {
  const labels = {
    new: "Cusub",
    contacted: " lala xiriiray",
    confirmed: "La xaqiijiyey",
    in_progress: "Socda",
    completed: "Dhammaaday",
    cancelled: "La joojiyey",
    pending: "Sugaya",
    rejected: "La diiday",
    approved: "La ansixiyey"
  };

  return labels[normalizeStatus(status)] || status || "Lama yaqaan";
}

function serviceLabel(service) {
  const labels = {
    Taxi: "Taxi",
    Bajaaj: "Bajaaj",
    Delivery: "Delivery",
    Safar: "Safar"
  };
  return labels[service] || service || "Adeeg";
}

function getCustomerFee(service) {
  const fees = {
    Taxi: 0,
    Bajaaj: 0,
    Delivery: 0.15,
    Safar: 0
  };

  return fees[service] ?? 0;
}

function getProviderFee(service) {
  const fees = {
    Taxi: 0.30,
    Bajaaj: 0.20,
    Delivery: 0.20,
    Safar: 1.50
  };

  return fees[service] ?? 0;
}

function isAdmin() {
  return Boolean(currentUser && currentUser.id === ADMIN_USER_ID);
}

function isDriver() {
  return Boolean(currentDriver);
}

function requireLogin(message = "Fadlan marka hore gal akoonkaaga.") {
  if (currentUser) return true;

  showToast(message);
  navigateTo("account");
  return false;
}

function makeEmptyState(icon, title, description = "") {
  return `
    <div class="empty-state">
      <span>${escapeHTML(icon)}</span>
      <strong>${escapeHTML(title)}</strong>
      <p>${escapeHTML(description)}</p>
    </div>
  `;
}

function safeErrorMessage(error) {
  if (!error) return "Wax khalad ah ayaa dhacay.";
  return error.message || "Wax khalad ah ayaa dhacay.";
}

/* =========================
   NAVIGATION
========================= */

function navigateTo(viewName) {
  const view = $(`#${viewName}View`);

  if (!view) {
    console.warn("View lama helin:", viewName);
    return;
  }

  $$(".view").forEach((element) => {
    element.classList.remove("active");
  });

  view.classList.add("active");
  currentView = viewName;

  $$(".nav-item").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.view === viewName
    );
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (viewName === "orders") loadOrders();
  if (viewName === "notifications") loadNotifications();
  if (viewName === "driver") loadDriverDashboard();
  if (viewName === "account") refreshAccountUI();
}

function bindNavigation() {
  $$("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateTo(button.dataset.view);
    });
  });

  $("#notificationButton")?.addEventListener("click", () => {
    navigateTo("notifications");
  });

  $("#accountButton")?.addEventListener("click", () => {
    navigateTo("account");
  });

  $("#openDriverButton")?.addEventListener("click", () => {
    navigateTo("driver");
  });
}

/* =========================
   SUPABASE AUTH
========================= */

async function refreshSession() {
  if (!db) return;

  const { data, error } = await db.auth.getSession();

  if (error) {
    console.error("Session error:", error.message);
    return;
  }

  currentUser = data.session?.user || null;

  if (currentUser) {
    await loadCurrentProfile();
  } else {
    currentProfile = null;
    currentDriver = null;
  }

  refreshAccountUI();
}

async function loadCurrentProfile() {
  if (!db || !currentUser) return;

  currentProfile = {
    id: currentUser.id,
    email: currentUser.email || "",
    role: currentUser.id === ADMIN_USER_ID ? "admin" : "customer"
  };

  currentDriver = null;

  const { data, error } = await db
    .from("drivers")
    .select("*")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.warn("Driver profile lama akhrin karin:", error.message);
  }

  if (data) {
    currentDriver = data;
    currentProfile.role =
      currentUser.id === ADMIN_USER_ID ? "admin" : "driver";
  }
}

function refreshAccountUI() {
  const loggedIn = Boolean(currentUser);

  setVisible("#authPanel", !loggedIn);
  setVisible("#signedInPanel", loggedIn);

  if (loggedIn) {
    setText("#accountHeading", "Akoonkayga");
    setText("#signedInEmail", currentUser.email || "Akoon");
    setText(
      "#signedInRole",
      isAdmin()
        ? "Maamule"
        : isDriver()
          ? "Adeeg-bixiye / Darawal"
          : "Macmiil"
    );

    setVisible("#openDriverButton", !isAdmin());
  } else {
    setText("#accountHeading", "Gal akoonkaaga");
  }
}

function switchAuthMode(mode) {
  currentAuthMode = mode;

  $("#loginTab")?.classList.toggle("active", mode === "login");
  $("#signupTab")?.classList.toggle("active", mode === "signup");

  setVisible("#fullNameGroup", mode === "signup");

  const isDriverSignup =
    mode === "signup" && $("#driverSignupCheckbox")?.checked;

  setVisible("#driverSignupFields", Boolean(isDriverSignup));

  setText(
    "#authSubmitButton",
    mode === "login" ? "Gal" : "Samee akoon"
  );

  const password = $("#authPassword");
  if (password) {
    password.autocomplete =
      mode === "login" ? "current-password" : "new-password";
  }

  setError("#authError", "");
  setText("#authMessage", "");
}

function bindAuthTabs() {
  $("#loginTab")?.addEventListener("click", () => {
    switchAuthMode("login");
  });

  $("#signupTab")?.addEventListener("click", () => {
    switchAuthMode("signup");
  });

  $("#driverSignupCheckbox")?.addEventListener("change", () => {
    setVisible(
      "#driverSignupFields",
      currentAuthMode === "signup" &&
        $("#driverSignupCheckbox").checked
    );
  });

  $("#authForm")?.addEventListener("submit", handleAuthSubmit);

  $("#signOutButton")?.addEventListener("click", signOut);
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  if (!db) {
    setError("#authError", "Supabase ma xirmana. Hubi internetka iyo script-ka.");
    return;
  }

  setError("#authError", "");
  setText("#authMessage", "");

  const email = $("#authEmail").value.trim();
  const password = $("#authPassword").value;
  const submitButton = $("#authSubmitButton");

  if (!email || !password) {
    setError("#authError", "Geli email-ka iyo password-ka.");
    return;
  }

  submitButton.disabled = true;
  setText("#authSubmitButton", "Sug...");

  try {
    if (currentAuthMode === "login") {
      const { data, error } = await db.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      currentUser = data.user;
      await loadCurrentProfile();
      refreshAccountUI();
      await setupRealtimeSubscriptions();

      showToast("Waad gashay akoonkaaga.");
      navigateTo("home");
    } else {
      const fullName = $("#authFullName").value.trim();
      const wantsDriver = $("#driverSignupCheckbox").checked;
      const phone = $("#authPhone").value.trim();
      const serviceType = $("#driverServiceType").value;
      const vehicle = $("#vehicleDescription").value.trim();

      if (!fullName) {
        throw new Error("Fadlan geli magacaaga.");
      }

      if (wantsDriver && !phone) {
        throw new Error("Darawalku waa inuu geliyaa telefoonkiisa.");
      }

      const { data, error } = await db.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            account_type: wantsDriver ? "driver" : "customer"
          }
        }
      });

      if (error) throw error;

      const newUser = data.user;
      const sessionExists = Boolean(data.session);

      if (wantsDriver && newUser && sessionExists) {
        const { error: driverError } = await db.from("drivers").insert({
          user_id: newUser.id,
          full_name: fullName,
          phone,
          service_type: serviceType,
          vehicle_description: vehicle || null,
          is_available: false,
          approval_status: "pending"
        });

        if (driverError) {
          console.error("Driver profile creation error:", driverError.message);
          setText(
            "#authMessage",
            "Akoonka waa la sameeyey, laakiin xogta darawalka lama kaydin. Gal mar kale ama la xiriir maamulka."
          );
        }
      }

      if (sessionExists) {
        currentUser = data.user;
        await loadCurrentProfile();
        refreshAccountUI();
        await setupRealtimeSubscriptions();
        showToast("Akoonka waa la sameeyey.");
        navigateTo("home");
      } else {
        setText(
          "#authMessage",
          "Akoonka waa la sameeyey. Haddii email xaqiijin loo baahan yahay, ka xaqiiji email-kaaga kadibna gal."
        );
      }
    }
  } catch (error) {
    setError("#authError", safeErrorMessage(error));
  } finally {
    submitButton.disabled = false;
    setText(
      "#authSubmitButton",
      currentAuthMode === "login" ? "Gal" : "Samee akoon"
    );
  }
}

async function signOut() {
  if (!db) return;

  const { error } = await db.auth.signOut();

  if (error) {
    showToast("Ka bixiddu way fashilantay: " + error.message);
    return;
  }

  currentUser = null;
  currentProfile = null;
  currentDriver = null;
  cachedOrders = [];
  cachedNotifications = [];
  currentChatOrder = null;
  currentChatRecipient = null;

  removeRealtimeSubscriptions();
  refreshAccountUI();

  showToast("Waad ka baxday akoonka.");
  navigateTo("home");
}

/* =========================
   SERVICE ORDER FORM
========================= */

function openOrderForm(service) {
  const allowed = ["Taxi", "Bajaaj", "Delivery", "Safar"];

  if (!allowed.includes(service)) {
    showToast("Adeeggan lama aqoonsan.");
    return;
  }

  $("#serviceType").value = service;
  setText("#orderHeading", `Dalbo ${serviceLabel(service)}`);

  const customerFee = getCustomerFee(service);
  const feeText =
    customerFee > 0
      ? `Kharashka IGA KEEN ee macmiilka: ${formatMoney(customerFee)}. Qiimaha adeegga laftiisa adiga iyo adeeg-bixiyaha ayaad isla garanaysaan.`
      : "Macmiilka lagama qaadayo fee dalabkan. Qiimaha adeegga adiga iyo adeeg-bixiyaha ayaad isla garanaysaan.";

  setText("#customerFeeText", feeText);

  setVisible("#passengersGroup", service !== "Delivery");
  setVisible("#scheduleGroup", service === "Safar" || service === "Taxi");

  setError("#orderError", "");
  navigateTo("order");
}

function bindServiceCards() {
  $$(".service-card").forEach((button) => {
    button.addEventListener("click", () => {
      openOrderForm(button.dataset.service);
    });
  });

  $("#orderForm")?.addEventListener("submit", submitOrder);
  $("#getLocationButton")?.addEventListener("click", getCurrentLocation);
}

async function getCurrentLocation() {
  if (!navigator.geolocation) {
    showToast("Telefoonkaagu ma taageerayo GPS.");
    return;
  }

  const button = $("#getLocationButton");
  button.disabled = true;
  setText("#getLocationButton", "Sug...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      $("#pickupLatitude").value = position.coords.latitude;
      $("#pickupLongitude").value = position.coords.longitude;

      if (!$("#pickupAddress").value.trim()) {
        $("#pickupAddress").value = "Goobtayda hadda (GPS)";
      }

      button.disabled = false;
      setText("#getLocationButton", "GPS");
      showToast("Goobta GPS waa la helay.");
    },
    (error) => {
      button.disabled = false;
      setText("#getLocationButton", "GPS");

      const messages = {
        1: "Oggolow location-ka telefoonkaaga.",
        2: "Goobta GPS lama heli karo. Isku day mar kale.",
        3: "GPS-ku waqti ayuu qaatay. Isku day mar kale."
      };

      showToast(messages[error.code] || "GPS error.");
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000
    }
  );
}

async function submitOrder(event) {
  event.preventDefault();

  if (!db) {
    setError("#orderError", "Xiriirka database-ka ma shaqaynayo.");
    return;
  }

  if (!requireLogin("Si aad dalab u dirto, marka hore samee akoon ama gal.")) {
    return;
  }

  const button = $("#submitOrderButton");
  setError("#orderError", "");

  const service = $("#serviceType").value;
  const name = $("#customerName").value.trim();
  const phone = $("#customerPhone").value.trim();
  const pickup = $("#pickupAddress").value.trim();
  const destination = $("#destinationAddress").value.trim();
  const notes = $("#orderNotes").value.trim();

  if (!name || !phone || !pickup) {
    setError(
      "#orderError",
      "Magaca, telefoonka iyo goobta lagaa qaadayo waa muhiim."
    );
    return;
  }

  if (service === "Delivery" && !destination) {
    setError("#orderError", "Delivery-ga geli meesha alaabta la geynayo.");
    return;
  }

  if (service === "Safar" && !destination) {
    setError("#orderError", "Safarka geli magaalada ama meesha loo socdo.");
    return;
  }

  let scheduledAt = $("#scheduledAt").value || null;

  if (scheduledAt) {
    const date = new Date(scheduledAt);
    if (Number.isNaN(date.getTime())) {
      setError("#orderError", "Waqtiga safarka sax ma aha.");
      return;
    }
    scheduledAt = date.toISOString();
  }

  const passengers =
    service === "Delivery" ? null : Number($("#passengers").value || 1);

  const payload = {
    user_id: currentUser.id,
    service_type: service,
    customer_name: name,
    customer_phone: phone,
    pickup_address: pickup,
    destination_address: destination || null,
    pickup_latitude: $("#pickupLatitude").value
      ? Number($("#pickupLatitude").value)
      : null,
    pickup_longitude: $("#pickupLongitude").value
      ? Number($("#pickupLongitude").value)
      : null,
    destination_latitude: null,
    destination_longitude: null,
    notes: notes || null,
    passengers,
    scheduled_at: scheduledAt,
    status: "new",
    customer_fee: getCustomerFee(service),
    provider_fee: getProviderFee(service),
    currency: "USD"
  };

  button.disabled = true;
  setText("#submitOrderButton", "Diraya...");

  try {
    const { data, error } = await db
      .from("orders")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    cachedOrders.unshift(data);

    $("#orderForm").reset();
    $("#serviceType").value = "";

    $("#pickupLatitude").value = "";
    $("#pickupLongitude").value = "";

    showToast("Dalabkaaga waa la diray.");
    navigateTo("orders");
    await loadOrders();
  } catch (error) {
    console.error("Order insert error:", error);
    setError(
      "#orderError",
      "Dalabka lama dirin. " + safeErrorMessage(error)
    );
  } finally {
    button.disabled = false;
    setText("#submitOrderButton", "Dir dalabka");
  }
}

/* =========================
   LOAD CUSTOMER ORDERS
========================= */

function isOrderActive(order) {
  return !["completed", "cancelled"].includes(normalizeStatus(order.status));
}

async function loadOrders() {
  const container = $("#ordersList");
  if (!container) return;

  if (!currentUser) {
    container.innerHTML = makeEmptyState(
      "🔐",
      "Gal akoonkaaga",
      "Dalabyadaadu waxay u baahan yihiin akoon."
    );
    return;
  }

  container.innerHTML = makeEmptyState("⏳", "Waa la soo rarayaa...");

  try {
    let query = db
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (isAdmin()) {
      // Admin-ku wuxuu arki karaa dalabyada haddii RLS policy oggolaato.
    } else if (isDriver()) {
      query = query.eq("driver_id", currentDriver.id);
    } else {
      query = query.eq("user_id", currentUser.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    cachedOrders = data || [];
    renderOrders();
  } catch (error) {
    console.error("Load orders error:", error);
    container.innerHTML = makeEmptyState(
      "⚠️",
      "Dalabyada lama soo rari karin",
      safeErrorMessage(error)
    );
  }
}

function renderOrders() {
  const container = $("#ordersList");
  if (!container) return;

  let orders = [...cachedOrders];

  if (currentOrderFilter === "active") {
    orders = orders.filter(isOrderActive);
  } else if (currentOrderFilter === "completed") {
    orders = orders.filter(
      (order) => normalizeStatus(order.status) === "completed"
    );
  }

  if (!orders.length) {
    container.innerHTML = makeEmptyState(
      "📋",
      "Dalabyo ma jiraan",
      "Dalabyada ku habboon qaybtan halkan ayay ka muuqan doonaan."
    );
    return;
  }

  container.innerHTML = orders.map((order) => {
    const status = normalizeStatus(order.status);

    return `
      <article class="order-card">
        <div class="order-card-top">
          <div>
            <h3>${escapeHTML(serviceLabel(order.service_type))}</h3>
            <p>Dalab #${escapeHTML(order.order_number ?? order.id)}</p>
          </div>
          <span class="status-badge status-${escapeHTML(status)}">
            ${escapeHTML(statusLabel(status))}
          </span>
        </div>

        <div class="order-details">
          <p><strong>Macmiil:</strong> ${escapeHTML(order.customer_name || "—")}</p>
          <p><strong>Telefoon:</strong> ${escapeHTML(order.customer_phone || "—")}</p>
          <p><strong>Laga qaadayo:</strong> ${escapeHTML(order.pickup_address || "—")}</p>
          <p><strong>Loo socdo:</strong> ${escapeHTML(order.destination_address || "—")}</p>
          <p><strong>La sameeyey:</strong> ${escapeHTML(formatDate(order.created_at))}</p>
        </div>

        <div class="order-actions">
          <button
            type="button"
            class="secondary-button"
            data-open-chat="${escapeHTML(order.id)}">
            Fariin
          </button>

          ${
            isDriver() && !order.driver_id && status === "new"
              ? `<button type="button" class="primary-button"
                  data-request-order="${escapeHTML(order.id)}">
                  Codso dalabkan
                </button>`
              : ""
          }
        </div>
      </article>
    `;
  }).join("");

  container.querySelectorAll("[data-open-chat]").forEach((button) => {
    button.addEventListener("click", () => {
      openChatForOrder(button.dataset.openChat);
    });
  });

  container.querySelectorAll("[data-request-order]").forEach((button) => {
    button.addEventListener("click", () => {
      requestOrder(button.dataset.requestOrder);
    });
  });
}

function bindOrderFilters() {
  $$("[data-order-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      currentOrderFilter = button.dataset.orderFilter;

      $$("[data-order-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      renderOrders();
    });
  });

  $("#refreshOrdersButton")?.addEventListener("click", loadOrders);
}

/* =========================
   DRIVER DASHBOARD
========================= */

async function loadDriverDashboard() {
  const container = $("#availableOrdersList");
  const profileCard = $("#driverProfileCard");

  if (!currentUser) {
    profileCard.innerHTML = `
      <strong>Gal akoonkaaga</strong>
      <p class="muted">Waxaad u baahan tahay akoon si aad u isticmaasho qaybta darawalka.</p>
      <button type="button" class="primary-button full-width" id="driverLoginButton">
        Gal akoonka
      </button>
    `;

    $("#driverLoginButton")?.addEventListener("click", () => {
      navigateTo("account");
    });

    container.innerHTML = makeEmptyState(
      "🔐",
      "Gal akoonkaaga",
      "Si aad u aragto dalabyada darawalka, marka hore gal."
    );
    return;
  }

  if (!isDriver() && !isAdmin()) {
    profileCard.innerHTML = `
      <strong>Ma lihid profile darawal oo la aqoonsaday.</strong>
      <p class="muted">Ka bax akoonka macmiilka oo iska diiwaangeli adigoo dooranaya adeeg-bixiye/darawal.</p>
      <button type="button" class="secondary-button full-width" id="driverSignupButton">
        Iska diiwaangeli darawal
      </button>
    `;

    $("#driverSignupButton")?.addEventListener("click", () => {
      navigateTo("account");
      switchAuthMode("signup");
      $("#driverSignupCheckbox").checked = true;
      setVisible("#driverSignupFields", true);
    });

    container.innerHTML = makeEmptyState(
      "🚘",
      "Profile darawal lama helin",
      "Profile-ka darawalku waa inuu ku jiraa database-ka."
    );
    return;
  }

  if (isAdmin()) {
    profileCard.innerHTML = `
      <strong>Maamule</strong>
      <p class="muted">Waxaad maamuli kartaa xogta adiga oo adeegsanaya siyaasadaha maamulka ee Supabase.</p>
    `;
  } else {
    const approved = currentDriver.approval_status === "approved";

    profileCard.innerHTML = `
      <strong>${escapeHTML(currentDriver.full_name || "Darawal")}</strong>
      <p class="muted">${escapeHTML(serviceLabel(currentDriver.service_type))}</p>
      <p class="muted">Xaaladda: ${escapeHTML(statusLabel(currentDriver.approval_status))}</p>
      ${
        !approved
          ? `<p class="form-message">Akoonkaaga darawal wuxuu sugayaa ansixinta maamulka.</p>`
          : ""
      }
    `;
  }

  container.innerHTML = makeEmptyState("⏳", "Dalabyada waa la soo rarayaa...");

  try {
    let query = db
      .from("orders")
      .select("*")
      .eq("status", "new")
      .is("driver_id", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!isAdmin() && currentDriver?.service_type) {
      query = query.eq("service_type", currentDriver.service_type);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data?.length) {
      container.innerHTML = makeEmptyState(
        "🚘",
        "Dalabyo kuu bannaan ma jiraan",
        "Marka dalab cusub yimaado, halkan ayuu ka soo muuqan karaa."
      );
      return;
    }

    container.innerHTML = data.map((order) => `
      <article class="order-card">
        <div class="order-card-top">
          <div>
            <h3>${escapeHTML(serviceLabel(order.service_type))}</h3>
            <p>Dalab #${escapeHTML(order.order_number ?? order.id)}</p>
          </div>
          <span class="status-badge status-new">Cusub</span>
        </div>

        <div class="order-details">
          <p><strong>Goobta:</strong> ${escapeHTML(order.pickup_address || "—")}</p>
          <p><strong>Meesha loo socdo:</strong> ${escapeHTML(order.destination_address || "—")}</p>
          <p><strong>Fee-ga adeeg-bixiyaha:</strong> ${formatMoney(order.provider_fee)}</p>
          <p><strong>Waqtiga:</strong> ${escapeHTML(formatDate(order.created_at))}</p>
        </div>

        <div class="order-actions">
          <button type="button" class="primary-button"
            data-request-order="${escapeHTML(order.id)}">
            Codso dalabkan
          </button>
        </div>
      </article>
    `).join("");

    container.querySelectorAll("[data-request-order]").forEach((button) => {
      button.addEventListener("click", () => {
        requestOrder(button.dataset.requestOrder);
      });
    });
  } catch (error) {
    console.error("Driver dashboard error:", error);

    container.innerHTML = makeEmptyState(
      "⚠️",
      "Dalabyada lama soo rari karin",
      safeErrorMessage(error)
    );
  }
}

/*
  MUHIIM:
  Function-kan si ula kac ah uma qoondeeyo darawal dalab si toos ah.
  Qoondeynta saxda ahi waa inay ku dhacdaa secure Supabase RPC
  ama backend leh transaction iyo hubin darawal/fee.
*/
async function requestOrder(orderId) {
  if (!requireLogin()) return;

  if (!isDriver() && !isAdmin()) {
    showToast("Qaybtan waxaa isticmaali kara darawal la diiwaangeliyey.");
    return;
  }

  if (!isAdmin() && currentDriver?.approval_status !== "approved") {
    showToast("Akoonka darawalkaaga wali lama ansixin.");
    return;
  }

  const order = cachedOrders.find((item) => item.id === orderId);

  const confirmed = window.confirm(
    "Ma rabtaa inaad codsato dalabkan? Codsigu ma xaqiijinayo in dalabka laguu qoondeeyey."
  );

  if (!confirmed) return;

  /*
    Ilaa secure RPC la diyaariyo, codsiga halkan laguma
    qoondeynayo orders.driver_id. Tani waxay ka hortagaysaa
    in darawallo badan isku mar qabsadaan dalab ama ay dhaafaan
    habka xaqiijinta fee-ga.
  */

  if (order) {
    $("#feeOrderId").value = order.id;
    $("#feeAmount").value = Number(order.provider_fee || 0).toFixed(2);
  }

  showToast(
    "Dalabka waa la doortay. Qoondeyn rasmi ah waxay u baahan tahay RPC ammaan ah oo Supabase ah."
  );
}

/* =========================
   IN-APP CHAT
========================= */

async function openChatForOrder(orderId) {
  if (!requireLogin()) return;

  const order =
    cachedOrders.find((item) => item.id === orderId) ||
    await fetchOrderById(orderId);

  if (!order) {
    showToast("Dalabka lama helin.");
    return;
  }

  currentChatOrder = order;
  currentChatRecipient = null;

  if (order.user_id === currentUser.id) {
    if (order.driver_id) {
      const { data: driver, error } = await db
        .from("drivers")
        .select("user_id,full_name")
        .eq("id", order.driver_id)
        .maybeSingle();

      if (!error && driver?.user_id) {
        currentChatRecipient = driver.user_id;
      }
    }
  } else if (currentDriver && order.driver_id === currentDriver.id) {
    currentChatRecipient = order.user_id;
  } else if (isAdmin()) {
    currentChatRecipient = order.user_id;
  }

  setText(
    "#chatOrderInfo",
    `${serviceLabel(order.service_type)} — Dalab #${order.order_number ?? order.id}`
  );

  navigateTo("chat");
  await loadChatMessages();
  subscribeToChat();
}

async function fetchOrderById(orderId) {
  if (!db) return null;

  const { data, error } = await db
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("Fetch order error:", error.message);
    return null;
  }

  return data;
}

async function loadChatMessages() {
  const container = $("#chatMessages");

  if (!currentUser || !currentChatOrder) {
    container.innerHTML = makeEmptyState(
      "💬",
      "Dooro dalab",
      "Wada sheekaysigu wuxuu ku xiran yahay dalab."
    );
    return;
  }

  container.innerHTML = makeEmptyState("⏳", "Fariimaha waa la soo rarayaa...");

  try {
    const { data, error } = await db
      .from("order_messages")
      .select("*")
      .eq("order_id", currentChatOrder.id)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) throw error;

    renderChatMessages(data || []);
  } catch (error) {
    console.error("Load chat error:", error);

    container.innerHTML = makeEmptyState(
      "⚠️",
      "Fariimaha lama soo rari karin",
      "Hubi in order_messages table iyo RLS policies ay sax yihiin. " +
      safeErrorMessage(error)
    );
  }
}

function renderChatMessages(messages) {
  const container = $("#chatMessages");

  if (!messages.length) {
    container.innerHTML = makeEmptyState(
      "💬",
      "Wadahadalku waa cusub yahay",
      "Markaad dirto fariin, halkan ayay ka muuqan doontaa."
    );
    return;
  }

  container.innerHTML = messages.map((message) => {
    const mine = message.sender_id === currentUser?.id;

    return `
      <div class="chat-bubble ${mine ? "mine" : "theirs"}">
        <p>${escapeHTML(message.body)}</p>
        <time>${escapeHTML(formatDate(message.created_at))}</time>
      </div>
    `;
  }).join("");

  container.scrollTop = container.scrollHeight;
}

function subscribeToChat() {
  if (!db || !currentChatOrder) return;

  if (chatSubscription) {
    db.removeChannel(chatSubscription);
    chatSubscription = null;
  }

  chatSubscription = db
    .channel(`chat-${currentChatOrder.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "order_messages",
        filter: `order_id=eq.${currentChatOrder.id}`
      },
      () => {
        loadChatMessages();
      }
    )
    .subscribe();
}

async function sendChatMessage(event) {
  event.preventDefault();

  if (!requireLogin()) return;

  if (!currentChatOrder) {
    setError("#chatError", "Marka hore fur dalab.");
    return;
  }

  const body = $("#chatInput").value.trim();

  if (!body) return;

  if (!currentChatRecipient) {
    setError(
      "#chatError",
      "Wada sheekaysigu ma bilaaban karo ilaa darawal ama macmiil kale loo qoondeeyo dalabka."
    );
    return;
  }

  setError("#chatError", "");

  const button = $("#sendChatButton");
  button.disabled = true;

  try {
    const { error } = await db.from("order_messages").insert({
      order_id: currentChatOrder.id,
      sender_id: currentUser.id,
      recipient_id: currentChatRecipient,
      body
    });

    if (error) throw error;

    $("#chatInput").value = "";
    await loadChatMessages();
  } catch (error) {
    console.error("Send message error:", error);

    setError(
      "#chatError",
      "Fariinta lama dirin. Hubi RLS policies-ka order_messages. " +
      safeErrorMessage(error)
    );
  } finally {
    button.disabled = false;
  }
}

function bindChat() {
  $("#chatForm")?.addEventListener("submit", sendChatMessage);
}

/* =========================
   NOTIFICATIONS
========================= */

async function loadNotifications() {
  const container = $("#notificationsList");

  if (!currentUser) {
    container.innerHTML = makeEmptyState(
      "🔐",
      "Gal akoonkaaga",
      "Ogeysiisyada waxay ku xiran yihiin akoonkaaga."
    );
    updateNotificationBadge(0);
    return;
  }

  container.innerHTML = makeEmptyState("⏳", "Ogeysiisyada waa la soo rarayaa...");

  try {
    const { data, error } = await db
      .from("notifications")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    cachedNotifications = data || [];
    renderNotifications();
  } catch (error) {
    console.error("Notifications error:", error);

    container.innerHTML = makeEmptyState(
      "⚠️",
      "Ogeysiisyada lama soo rari karin",
      safeErrorMessage(error)
    );
  }
}

function renderNotifications() {
  const container = $("#notificationsList");

  const unread = cachedNotifications.filter(
    (notification) => !notification.read_at
  ).length;

  updateNotificationBadge(unread);

  if (!cachedNotifications.length) {
    container.innerHTML = makeEmptyState(
      "🔔",
      "Ogeysiis ma jiro",
      "Marka ogeysiis cusub yimaado halkan ayuu ka muuqan doonaa."
    );
    return;
  }

  container.innerHTML = cachedNotifications.map((notification) => `
    <article class="notification-card ${notification.read_at ? "" : "unread"}">
      <div class="notification-icon">🔔</div>
      <div>
        <strong>${escapeHTML(notification.title || "Ogeysiis")}</strong>
        <p>${escapeHTML(notification.body || "")}</p>
        <time>${escapeHTML(formatDate(notification.created_at))}</time>
      </div>
    </article>
  `).join("");
}

function updateNotificationBadge(count) {
  const badge = $("#notificationBadge");
  if (!badge) return;

  badge.textContent = count > 99 ? "99+" : String(count);
  badge.classList.toggle("hidden", count < 1);
}

async function markNotificationsRead() {
  if (!requireLogin()) return;

  const unread = cachedNotifications.filter(
    (notification) => !notification.read_at
  );

  if (!unread.length) {
    showToast("Ogeysiisyada oo dhan waa la akhriyey.");
    return;
  }

  try {
    const ids = unread.map((item) => item.id);

    const { error } = await db
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", ids)
      .eq("user_id", currentUser.id);

    if (error) throw error;

    showToast("Ogeysiisyada waa la calaamadeeyey.");
    await loadNotifications();
  } catch (error) {
    showToast("Ogeysiisyada lama cusboonaysiin: " + safeErrorMessage(error));
  }
}

function subscribeToNotifications() {
  if (!db || !currentUser) return;

  if (notificationSubscription) {
    db.removeChannel(notificationSubscription);
    notificationSubscription = null;
  }

  notificationSubscription = db
    .channel(`notifications-${currentUser.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${currentUser.id}`
      },
      () => {
        loadNotifications();
      }
    )
    .subscribe();
}

/* =========================
   DRIVER FEE SUBMISSION
========================= */

function bindFeeForm() {
  $("#feeForm")?.addEventListener("submit", submitFeeEvidence);
}

async function submitFeeEvidence(event) {
  event.preventDefault();

  if (!requireLogin()) return;

  if (!isDriver()) {
    setError("#feeError", "Fee-ga darawalka waxaa gudbin kara akoon darawal oo sax ah.");
    return;
  }

  const orderId = $("#feeOrderId").value.trim();
  const amount = Number($("#feeAmount").value);
  const reference = $("#feeReference").value.trim();
  const note = $("#feeNote").value.trim();

  if (!orderId) {
    setError("#feeError", "Geli ID-ga dalabka.");
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    setError("#feeError", "Geli qaddar fee oo sax ah.");
    return;
  }

  setError("#feeError", "");

  const button = $("#submitFeeButton");
  button.disabled = true;
  setText("#submitFeeButton", "Waa la gudbinayaa...");

  try {
    const { data: order, error: orderError } = await db
      .from("orders")
      .select("id,driver_id,provider_fee,service_type")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) throw orderError;

    if (!order) {
      throw new Error("Dalabkaas lama helin ama ma lihid oggolaanshaha aad ku arki karto.");
    }

    if (order.driver_id && order.driver_id !== currentDriver.id) {
      throw new Error("Dalabkan darawal kale ayaa loo qoondeeyey.");
    }

    if (Math.abs(Number(order.provider_fee) - amount) > 0.009) {
      throw new Error(
        `Fee-ga dalabkan waa ${formatMoney(order.provider_fee)}. Hubi qaddarka saxda ah.`
      );
    }

    const { error } = await db.from("driver_fee_payments").insert({
      order_id: order.id,
      driver_id: currentDriver.id,
      submitted_by: currentUser.id,
      amount,
      currency: "USD",
      payment_reference: reference || null,
      payment_note: note || null,
      status: "pending"
    });

    if (error) throw error;

    $("#feeForm").reset();

    showToast(
      "Caddeynta waa la gudbiyey. Maamulka ayaa dib u eegaya; tani ma aha xaqiijin lacag-bixin."
    );
  } catch (error) {
    console.error("Fee submission error:", error);
    setError("#feeError", safeErrorMessage(error));
  } finally {
    button.disabled = false;
    setText("#submitFeeButton", "Gudbi caddeynta fee-ga");
  }
}

/* =========================
   REALTIME SUBSCRIPTIONS
========================= */

async function setupRealtimeSubscriptions() {
  if (!db || !currentUser) return;

  removeRealtimeSubscriptions();

  subscribeToNotifications();

  ordersSubscription = db
    .channel(`orders-user-${currentUser.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders"
      },
      () => {
        if (currentView === "orders") loadOrders();
        if (currentView === "driver") loadDriverDashboard();
      }
    )
    .subscribe();
}

function removeRealtimeSubscriptions() {
  if (!db) return;

  if (chatSubscription) {
    db.removeChannel(chatSubscription);
    chatSubscription = null;
  }

  if (notificationSubscription) {
    db.removeChannel(notificationSubscription);
    notificationSubscription = null;
  }

  if (ordersSubscription) {
    db.removeChannel(ordersSubscription);
    ordersSubscription = null;
  }
}

/* =========================
   INITIALIZATION
========================= */

async function initializeApp() {
  if (!db) {
    showToast("Supabase lama helin. Hubi internetka iyo Supabase script-ka.");
    return;
  }

  bindNavigation();
  bindAuthTabs();
  bindServiceCards();
  bindOrderFilters();
  bindChat();
  bindFeeForm();

  $("#markNotificationsReadButton")?.addEventListener(
    "click",
    markNotificationsRead
  );

  switchAuthMode("login");

  try {
    await refreshSession();

    if (currentUser) {
      await setupRealtimeSubscriptions();
    }
  } catch (error) {
    console.error("App initialization error:", error);
    showToast("App-ku wuu furmay, laakiin qaar ka mid ah xogta lama soo rarin.");
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);

window.addEventListener("beforeunload", () => {
  removeRealtimeSubscriptions();
});
