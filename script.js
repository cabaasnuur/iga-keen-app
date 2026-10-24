
"use strict";

/* IGA KEEN V2 — Supabase JS v2 */

const SUPABASE_URL = "https://zywwypqddnvslgqztnep.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_fDRyejheqSBrLQcBe8KpQw_L76yFtp8";
const IGA_KEEN_WHATSAPP = "252907825640";

const $ = id => document.getElementById(id);
const views = [...document.querySelectorAll(".view")];
const navItems = [...document.querySelectorAll(".nav-item")];

const SERVICE_NAMES = {
  taxi: "Taxi",
  bajaaj: "Bajaaj",
  delivery: "Delivery",
  safar: "Safar"
};

const FEES = {
  taxi: { customer: 0, provider: 0.30 },
  bajaaj: { customer: 0, provider: 0.20 },
  delivery: { customer: 0.15, provider: 0.20 },
  safar: { customer: 0, provider: 1.50 }
};

const STATUS_NAMES = {
  pending: "Sugaya",
  new: "Cusub",
  accepted: "La aqbalay",
  assigned: "Darawal loo xilsaaray",
  confirmed: "La xaqiijiyey",
  in_progress: "Socda",
  completed: "Dhammaaday",
  cancelled: "La joojiyey",
  rejected: "La diiday"
};

let db = null;
let session = null;
let profile = null;
let gps = { latitude: null, longitude: null };
let currentChatOrder = null;
let currentChatRecipient = null;
let chatChannel = null;
let orderChannel = null;
let notificationChannel = null;
let authMode = "login";
let toastTimer = null;
let orderCache = [];
let driverCache = null;
let loadingOrders = false;

if (window.supabase?.createClient) {
  db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
}

function showView(id) {
  const target = $(id);
  if (!target) return;

  views.forEach(view => {
    view.classList.toggle("active", view.id === id);
  });

  navItems.forEach(item => {
    item.classList.toggle("active", item.dataset.view === id);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function notify(message) {
  const toast = $("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

function feedback(id, message, type = "info") {
  const element = $(id);
  if (!element) return;

  element.textContent = message;
  element.className = `feedback show ${type}`;
}

function clearFeedback(id) {
  const element = $(id);
  if (!element) return;

  element.textContent = "";
  element.className = "feedback";
}

function money(value) {
  return "$" + Number(value || 0).toFixed(2);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function serviceName(value) {
  return SERVICE_NAMES[String(value || "").toLowerCase()] ||
    String(value || "Adeeg");
}

function statusName(value) {
  return STATUS_NAMES[String(value || "").toLowerCase()] ||
    String(value || "Sugaya");
}

function setBusy(button, busy, busyText, normalText) {
  if (!button) return;
  button.disabled = busy;
  button.textContent = busy ? busyText : normalText;
}

function requireDatabase() {
  if (!db) {
    notify("Supabase lama xiriirin. Hubi internet-ka iyo configuration-ka.");
    return false;
  }
  return true;
}

function requireLogin() {
  if (!session?.user) {
    notify("Marka hore soo gal ama samee akoon.");
    showView("auth-view");
    return false;
  }
  return true;
}

function whatsappUrl(message) {
  return `https://wa.me/${IGA_KEEN_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
}

/* Navigation */

navItems.forEach(item => {
  item.addEventListener("click", async () => {
    const view = item.dataset.view;

    if (view === "order-view" && !session) {
      showView("auth-view");
      return;
    }

    if (view === "orders-view" && session) {
      showView(view);
      await loadOrders();
      return;
    }

    if (view === "notifications-view" && session) {
      showView(view);
      await loadNotifications();
      return;
    }

    if (view === "driver-view" && session) {
      showView(view);
      await loadDriverArea();
      return;
    }

    showView(view);
  });
});

$("home-order").addEventListener("click", () => {
  if (!requireLogin()) return;
  showView("order-view");
});

document.querySelectorAll("[data-service]").forEach(button => {
  button.addEventListener("click", () => {
    if (!requireLogin()) return;
    selectService(button.dataset.service);
  });
});

$("help-btn").addEventListener("click", () => showView("contact-view"));
$("header-notifications").addEventListener("click", async () => {
  if (!requireLogin()) return;
  showView("notifications-view");
  await loadNotifications();
});

$("account-order-btn").addEventListener("click", () => {
  if (!requireLogin()) return;
  showView("order-view");
});

$("account-driver-btn").addEventListener("click", async () => {
  if (!requireLogin()) return;
  showView("driver-view");
  await loadDriverArea();
});

$("account-login-btn").addEventListener("click", () => {
  authMode = "login";
  updateAuthMode();
  showView("auth-view");
});

$("refresh-orders").addEventListener("click", loadOrders);
$("refresh-notifications").addEventListener("click", loadNotifications);
$("refresh-driver").addEventListener("click", loadDriverArea);

$("contact-whatsapp").href = whatsappUrl(
  "Asc IGA KEEN, waxaan u baahanahay caawimaad."
);

$("year").textContent = new Date().getFullYear();

/* Authentication */

function updateAuthMode() {
  const signup = authMode === "signup";

  $("signup-fields").classList.toggle("hidden", !signup);
  $("auth-title").textContent = signup
    ? "Samee akoon cusub"
    : "Soo gal akoonkaaga";

  $("auth-desc").textContent = signup
    ? "Geli xogtaada si aad u samaysato akoon."
    : "Soo gal si aad u isticmaasho adeegyada IGA KEEN.";

  $("auth-submit").textContent = signup
    ? "Samee akoon →"
    : "Soo gal →";

  $("switch-caption").textContent = signup
    ? "Hore akoon ma u lahayd?"
    : "Akoon ma lihid?";

  $("switch-auth").textContent = signup
    ? "Soo gal"
    : "Samee akoon";

  $("password").autocomplete = signup
    ? "new-password"
    : "current-password";

  $("full-name").required = signup;
  $("auth-phone").required = signup;
}

$("switch-auth").addEventListener("click", () => {
  authMode = authMode === "login" ? "signup" : "login";
  clearFeedback("auth-feedback");
  updateAuthMode();
});

$("account-role").addEventListener("change", () => {
  $("provider-fields").classList.toggle(
    "hidden",
    $("account-role").value !== "provider"
  );
});

$("forgot-password").addEventListener("click", async () => {
  if (!requireDatabase()) return;

  const email = $("email").value.trim();
  if (!email) {
    feedback(
      "auth-feedback",
      "Marka hore geli email-kaaga.",
      "error"
    );
    return;
  }

  const { error } = await db.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.href.split("#")[0]
  });

  if (error) {
    feedback("auth-feedback", error.message, "error");
    return;
  }

  feedback(
    "auth-feedback",
    "Haddii email-kaasi akoon leeyahay, raac tilmaamaha password-ka dib loogu dejinayo.",
    "success"
  );
});

$("auth-form").addEventListener("submit", async event => {
  event.preventDefault();
  clearFeedback("auth-feedback");

  if (!requireDatabase()) return;

  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value;

  if (password.length < 8) {
    feedback(
      "auth-feedback",
      "Password-ku waa inuu ugu yaraan 8 xaraf noqdaa.",
      "error"
    );
    return;
  }

  const button = $("auth-submit");
  setBusy(button, true, "Sug...", authMode === "signup"
    ? "Samee akoon →"
    : "Soo gal →");

  try {
    if (authMode === "login") {
      const { error } = await db.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      feedback("auth-feedback", "Waad soo gashay.", "success");
      await syncSession();
      showView("home-view");
      notify("Soo dhawoow IGA KEEN.");
      return;
    }

    const fullName = $("full-name").value.trim();
    const phone = $("auth-phone").value.trim();
    const role = $("account-role").value;
    const providerService = $("provider-service").value;
    const vehicle = $("vehicle").value.trim();

    if (!fullName || !phone) {
      throw new Error("Geli magacaaga iyo telefoonkaaga.");
    }

    const metadata = {
      full_name: fullName,
      phone,
      role
    };

    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });

    if (error) throw error;

    if (data.user && data.session) {
      const { error: profileError } = await db
        .from("profiles")
        .upsert({
          id: data.user.id,
          full_name: fullName,
          phone,
          role
        }, { onConflict: "id" });

      if (profileError) {
        console.error("Profile setup:", profileError.message);
      }

      if (role === "provider") {
        // Provider approval and driver-table creation belong to
        // the trusted database/admin workflow.
        console.info("Provider registration requested:", {
          providerService,
          vehicle
        });
      }

      await syncSession();
      showView("account-view");
      notify("Akoonka waa la sameeyay.");
    } else {
      feedback(
        "auth-feedback",
        "Akoonka waa la sameeyay. Haddii email confirmation-ku shidan yahay, fur email-kaaga si aad u xaqiijiso akoonka.",
        "success"
      );
    }
  } catch (error) {
    feedback(
      "auth-feedback",
      error.message || "Akoonka lama samayn. Mar kale isku day.",
      "error"
    );
  } finally {
    button.disabled = false;
    button.textContent = authMode === "signup"
      ? "Samee akoon →"
      : "Soo gal →";
  }
});

$("logout-btn").addEventListener("click", async () => {
  if (!requireDatabase()) return;

  const { error } = await db.auth.signOut();

  if (error) {
    feedback("account-feedback", error.message, "error");
    return;
  }

  await syncSession();
  showView("home-view");
  notify("Waad ka baxday akoonka.");
});

async function syncSession() {
  if (!db) return;

  const { data } = await db.auth.getSession();
  session = data.session;
  profile = null;

  if (session?.user) {
    const { data: row, error } = await db
      .from("profiles")
      .select("id, full_name, phone, role, avatar_url")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!error) profile = row;
  }

  renderAccount();

  if (session?.user) {
    await loadNotificationCount();
    subscribeToNotifications();
  } else {
    $("notification-count").classList.add("hidden");
    unsubscribeRealtime();
    orderCache = [];
    driverCache = null;
  }
}

function renderAccount() {
  const user = session?.user;
  const name = profile?.full_name ||
    user?.user_metadata?.full_name ||
    "Isticmaale";

  $("account-name").textContent = user ? name : "Soo gal akoonkaaga";
  $("account-email").textContent = user?.email || "Akown lama gelin";
  $("account-role-label").textContent = user
    ? (profile?.role === "provider" || profile?.role === "driver"
      ? "Adeeg-bixiye"
      : profile?.role === "admin"
        ? "Maamule"
        : "Macmiil")
    : "";

  $("logout-btn").classList.toggle("hidden", !user);
  $("account-login-btn").classList.toggle("hidden", !!user);

  if (user) {
    $("customer-name").value = name === "Isticmaale" ? "" : name;
    $("customer-phone").value = profile?.phone || "";
  }
}

if (db) {
  db.auth.onAuthStateChange((_event, newSession) => {
    session = newSession;

    // Defer database work until after the auth callback completes.
    setTimeout(() => syncSession(), 0);
  });

  syncSession();
} else {
  notify("Supabase library ma furmin. Hubi internet-ka.");
}

/* Order form and GPS */

function selectService(service) {
  const normalized = String(service).toLowerCase();

  if (!SERVICE_NAMES[normalized]) return;

  $("service-type").value = normalized;
  $("passengers-label").classList.toggle(
    "hidden",
    normalized === "delivery"
  );
  $("delivery-fields").classList.toggle(
    "hidden",
    normalized !== "delivery"
  );

  const fee = FEES[normalized];
  $("order-fee").textContent =
    `Macmiilka: ${money(fee.customer)} · Adeeg-bixiyaha: ${money(fee.provider)}`;

  $("fee-explanation").textContent = normalized === "delivery"
    ? "Delivery: macmiilku wuxuu bixiyaa $0.15, adeeg-bixiyuhuna $0.20."
    : `Fee-ga adeeg-bixiyaha: ${money(fee.provider)}. Macmiilku fee ma bixinayo.`;

  clearFeedback("order-feedback");
  showView("order-view");
}

$("service-type").addEventListener("change", () => {
  selectService($("service-type").value);
});

$("gps-btn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    $("gps-message").textContent =
      "GPS lama taageero. Goobta gacanta ku qor.";
    return;
  }

  $("gps-btn").disabled = true;
  $("gps-message").textContent = "GPS ayaa la raadinayaa...";

  navigator.geolocation.getCurrentPosition(
    position => {
      gps.latitude = position.coords.latitude;
      gps.longitude = position.coords.longitude;

      $("gps-message").textContent =
        `Goobta waa la helay (${gps.latitude.toFixed(5)}, ${gps.longitude.toFixed(5)}).`;

      if (!$("pickup").value.trim()) {
        $("pickup").value = "Goobta GPS-kayga";
      }

      $("gps-btn").disabled = false;
    },
    error => {
      const messages = {
        1: "GPS waa la diiday. Oggolow Location-ka ama gacanta ku qor.",
        2: "Goobta lama helin. Hubi GPS-ka oo mar kale isku day.",
        3: "GPS-ku waqti ayuu qaatay. Mar kale isku day."
      };

      $("gps-message").textContent =
        messages[error.code] || "GPS lama helin.";
      $("gps-btn").disabled = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
    }
  );
});

$("order-form").addEventListener("submit", async event => {
  event.preventDefault();
  clearFeedback("order-feedback");

  if (!requireLogin() || !requireDatabase()) return;

  const button = $("submit-order");
  const service = $("service-type").value;
  const scheduled = $("scheduled-at").value;

  const payload = {
    user_id: session.user.id,
    service_type: service,
    customer_name: $("customer-name").value.trim(),
    customer_phone: $("customer-phone").value.trim(),
    pickup_address: $("pickup").value.trim(),
    destination_address: $("destination").value.trim(),
    notes: [
      service === "delivery"
        ? `Nooca alaabta: ${$("delivery-item").value}`
        : "",
      $("notes").value.trim()
    ].filter(Boolean).join("\n") || null,
    passengers: service === "delivery"
      ? null
      : Number.parseInt($("passengers").value, 10) || 1,
    pickup_latitude: gps.latitude,
    pickup_longitude: gps.longitude
  };

  if (scheduled) {
    const date = new Date(scheduled);

    if (Number.isNaN(date.getTime()) || date <= new Date()) {
      feedback(
        "order-feedback",
        "Waqtiga aad dooratay sax ma aha ama waa waqti hore.",
        "error"
      );
      return;
    }

    payload.scheduled_at = date.toISOString();
  }

  if (!payload.customer_name || !payload.customer_phone ||
      !payload.pickup_address || !payload.destination_address) {
    feedback(
      "order-feedback",
      "Buuxi magaca, telefoonka iyo labada goobood.",
      "error"
    );
    return;
  }

  setBusy(button, true, "Waa la kaydinayaa...", "Dir dalabka →");

  try {
    const { data, error } = await db
      .from("orders")
      .insert(payload)
      .select("id, service_type, status, created_at")
      .single();

    if (error) throw error;

    feedback(
      "order-feedback",
      "Dalabka waa la kaydiyey. Waxaad ka arki kartaa qaybta Dalabyo.",
      "success"
    );

    $("order-form").reset();
    gps = { latitude: null, longitude: null };
    $("gps-message").textContent = "Goobta gacanta ayaad sidoo kale u qori kartaa.";
    selectService(service);

    feedback(
      "order-feedback",
      `Dalabka waa la kaydiyey. Lambarka dalabka: ${data.id}.`,
      "success"
    );

    await loadOrders();
    showView("orders-view");
    notify("Dalabkaaga waa la gudbiyey.");
  } catch (error) {
    console.error("Order insert:", error);

    feedback(
      "order-feedback",
      `Dalabka lama kaydin: ${error.message || "Khalad ayaa dhacay."} Hubi columns-ka iyo RLS policies-ka Supabase.`,
      "error"
    );
  } finally {
    button.disabled = false;
    button.textContent = "Dir dalabka →";
  }
});

/* Customer order list */

async function loadOrders() {
  if (!requireLogin() || !requireDatabase() || loadingOrders) return;

  loadingOrders = true;
  $("orders-list").innerHTML =
    '<p class="empty">Dalabyada ayaa la soo qaadanayaa...</p>';

  try {
    const { data, error } = await db
      .from("orders")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    orderCache = data || [];
    renderOrders();
  } catch (error) {
    console.error("Load orders:", error);
    $("orders-list").innerHTML =
      `<p class="empty">${escapeHTML(error.message || "Dalabyada lama soo qaadan.")}</p>`;
  } finally {
    loadingOrders = false;
  }
}

function renderOrders() {
  if (!orderCache.length) {
    $("orders-list").innerHTML =
      '<p class="empty">Weli dalab ma lihid. Taabo Dalbo si aad u bilowdo.</p>';
    return;
  }

  $("orders-list").innerHTML = orderCache.map(order => {
    const status = String(order.status || "pending").toLowerCase();
    const canChat = Boolean(order.driver_id) &&
      !["cancelled", "rejected"].includes(status);

    return `
      <article class="order-card">
        <div class="card-top">
          <div>
            <h3>${escapeHTML(serviceName(order.service_type))}</h3>
            <small>Dalab #${escapeHTML(order.id)}</small>
          </div>
          <span class="status-pill">${escapeHTML(statusName(status))}</span>
        </div>
        <p><b>Laga qaadayo:</b> ${escapeHTML(order.pickup_address)}</p>
        <p><b>Loo socdo:</b> ${escapeHTML(order.destination_address)}</p>
        <p><b>Taariikh:</b> ${escapeHTML(
          order.created_at ? new Date(order.created_at).toLocaleString() : "—"
        )}</p>
        <div class="card-actions">
          ${canChat
            ? `<button class="primary-action" data-chat-order="${escapeHTML(order.id)}">La hadal darawalka</button>`
            : `<button data-chat-order="${escapeHTML(order.id)}">Fur chat-ka</button>`}
          ${order.pickup_latitude != null && order.pickup_longitude != null
            ? `<button data-map-order="${escapeHTML(order.id)}">Eeg goobta</button>`
            : ""}
        </div>
      </article>
    `;
  }).join("");

  $("orders-list").querySelectorAll("[data-chat-order]").forEach(button => {
    button.addEventListener("click", () => openOrderChat(button.dataset.chatOrder));
  });

  $("orders-list").querySelectorAll("[data-map-order]").forEach(button => {
    button.addEventListener("click", () => {
      const order = orderCache.find(
        item => String(item.id) === button.dataset.mapOrder
      );
      if (!order) return;

      const url = `https://maps.google.com/?q=${order.pickup_latitude},${order.pickup_longitude}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  });
}

/* In-app chat */

async function openOrderChat(orderId) {
  if (!requireLogin() || !requireDatabase()) return;

  const order = orderCache.find(
    item => String(item.id) === String(orderId)
  );

  if (!order) {
    notify("Dalabkan lama helin. Cusboonaysii liiska.");
    return;
  }

  currentChatOrder = order;
  currentChatRecipient = null;

  $("chat-panel").classList.remove("hidden");
  $("chat-title").textContent =
    `${serviceName(order.service_type)} · #${order.id}`;
  $("chat-list").innerHTML =
    '<p class="empty">Fariimaha ayaa la soo qaadanayaa...</p>';

  /*
   * This app expects orders.driver_id to contain the driver's
   * UUID from auth.users. If your schema uses a different mapping,
   * adjust this mapping and the corresponding RLS policy.
   */
  if (order.driver_id && order.user_id === session.user.id) {
    currentChatRecipient = order.driver_id;
  }

  await loadChatMessages();

  if (chatChannel) {
    await db.removeChannel(chatChannel);
    chatChannel = null;
  }

  chatChannel = db
    .channel(`iga-chat-${order.id}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "order_messages",
        filter: `order_id=eq.${order.id}`
      },
      () => loadChatMessages()
    )
    .subscribe();

  $("chat-panel").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

async function loadChatMessages() {
  if (!currentChatOrder || !session) return;

  try {
    const { data, error } = await db
      .from("order_messages")
      .select("id, order_id, sender_id, recipient_id, body, created_at")
      .eq("order_id", currentChatOrder.id)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) throw error;

    if (!data?.length) {
      $("chat-list").innerHTML =
        '<p class="empty">Weli fariin ma jirto. Haddii darawal loo xilsaaray, waxaad halkan ku wada hadli kartaan.</p>';
      return;
    }

    $("chat-list").innerHTML = data.map(message => {
      const mine = message.sender_id === session.user.id;

      return `
        <div class="chat-message ${mine ? "mine" : ""}">
          <p>${escapeHTML(message.body)}</p>
          <small>${mine ? "Adiga" : "Isticmaale kale"} · ${escapeHTML(
            message.created_at
              ? new Date(message.created_at).toLocaleString()
              : ""
          )}</small>
        </div>
      `;
    }).join("");

    $("chat-list").scrollTop = $("chat-list").scrollHeight;
  } catch (error) {
    console.error("Load chat:", error);
    $("chat-list").innerHTML =
      `<p class="empty">Fariimaha lama soo qaadan: ${escapeHTML(error.message)}</p>`;
  }
}

$("chat-form").addEventListener("submit", async event => {
  event.preventDefault();
  clearFeedback("chat-feedback");

  if (!requireLogin() || !requireDatabase() || !currentChatOrder) return;

  const body = $("chat-input").value.trim();
  if (!body) return;

  /*
   * A customer can message only the assigned driver.
   * A driver must message the customer who owns the order.
   * Database RLS must enforce this independently.
   */
  let recipientId = currentChatRecipient;

  if (currentChatOrder.driver_id === session.user.id) {
    recipientId = currentChatOrder.user_id;
  }

  if (!recipientId) {
    feedback(
      "chat-feedback",
      "Weli darawal looma xilsaarin dalabkan. Chat-ku wuxuu shaqaynayaa marka labada dhinac la isku xiro.",
      "error"
    );
    return;
  }

  const button = $("send-chat");
  setBusy(button, true, "Waa la dirayaa...", "Dir fariinta →");

  try {
    const { error } = await db.from("order_messages").insert({
      order_id: currentChatOrder.id,
      sender_id: session.user.id,
      recipient_id: recipientId,
      body
    });

    if (error) throw error;

    $("chat-input").value = "";
    feedback("chat-feedback", "Fariinta waa la diray.", "success");
    await loadChatMessages();
  } catch (error) {
    console.error("Send chat:", error);
    feedback(
      "chat-feedback",
      `Fariinta lama dirin: ${error.message || "Khalad ayaa dhacay."} Hubi RLS policies-ka iyo realtime settings-ka.`,
      "error"
    );
  } finally {
    button.disabled = false;
    button.textContent = "Dir fariinta →";
  }
});

$("close-chat").addEventListener("click", async () => {
  $("chat-panel").classList.add("hidden");
  currentChatOrder = null;
  currentChatRecipient = null;

  if (chatChannel && db) {
    await db.removeChannel(chatChannel);
    chatChannel = null;
  }
});

/* Notifications */

async function loadNotificationCount() {
  if (!session || !db) return;

  const { count, error } = await db
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.user.id)
    .is("read_at", null);

  if (error) {
    console.warn("Notification count:", error.message);
    return;
  }

  const badge = $("notification-count");
  badge.textContent = String(count || 0);
  badge.classList.toggle("hidden", !count);
}

async function loadNotifications() {
  if (!requireLogin() || !requireDatabase()) return;

  $("notifications-list").innerHTML =
    '<p class="empty">Ogeysiisyada ayaa la soo qaadanayaa...</p>';

  const { data, error } = await db
    .from("notifications")
    .select("id, title, body, notification_type, order_id, read_at, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    $("notifications-list").innerHTML =
      `<p class="empty">${escapeHTML(error.message)}</p>`;
    return;
  }

  if (!data?.length) {
    $("notifications-list").innerHTML =
      '<p class="empty">Weli ogeysiis ma jiro.</p>';
    return;
  }

  $("notifications-list").innerHTML = data.map(item => `
    <article class="notification-card">
      <div class="card-top">
        <h3>${escapeHTML(item.title)}</h3>
        <span class="status-pill">${item.read_at ? "La akhriyey" : "Cusub"}</span>
      </div>
      <p>${escapeHTML(item.body || "")}</p>
      <small class="muted">${escapeHTML(
        item.created_at ? new Date(item.created_at).toLocaleString() : ""
      )}</small>
    </article>
  `).join("");

  await loadNotificationCount();
}

$("mark-notifications-read").addEventListener("click", async () => {
  if (!requireLogin() || !requireDatabase()) return;

  const { error } = await db
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", session.user.id)
    .is("read_at", null);

  if (error) {
    notify(`Ogeysiisyada lama cusboonaysiin: ${error.message}`);
    return;
  }

  await loadNotifications();
  notify("Ogeysiisyada waa la akhriyey.");
});

function subscribeToNotifications() {
  if (!db || !session) return;

  if (notificationChannel) {
    db.removeChannel(notificationChannel);
    notificationChannel = null;
  }

  notificationChannel = db
    .channel(`iga-notifications-${session.user.id}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${session.user.id}`
      },
      () => {
        loadNotificationCount();
        notify("Ogeysiis cusub ayaa kuu yimid.");
      }
    )
    .subscribe();
}

/* Driver section */

async function loadDriverArea() {
  if (!requireLogin() || !requireDatabase()) return;

  $("driver-status").textContent = "Xogta adeeg-bixiyaha ayaa la hubinayaa...";
  $("available-orders").innerHTML =
    '<p class="empty">Dalabyada ayaa la soo qaadanayaa...</p>';

  try {
    const { data: driver, error: driverError } = await db
      .from("drivers")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (driverError) throw driverError;

    driverCache = driver;

    if (!driver) {
      $("driver-status").textContent =
        "Akoonkaaga darawal lama helin ama weli lama diiwaangelin. La xiriir maamulka IGA KEEN si laguu ansixiyo.";
      $("available-orders").innerHTML =
        '<p class="empty">Ma jiraan dalabyo kuu diyaar ah ilaa akoonka darawalka la xaqiijiyo.</p>';
      return;
    }

    const approved = driver.is_approved === true ||
      driver.status === "approved";

    if (!approved) {
      $("driver-status").textContent =
        "Akoonka darawalka weli lama ansixin. Ma aqbali kartid dalabyo ilaa maamulka ku ansixiyo.";
      $("available-orders").innerHTML =
        '<p class="empty">Sug ansixinta maamulka.</p>';
      return;
    }

    $("driver-status").textContent =
      `Akoonka darawalka waa la aqbalay. Adeegga: ${serviceName(
        driver.service_type || "taxi"
      )}.`;

    await loadAvailableOrders(driver);
  } catch (error) {
    console.error("Driver area:", error);
    $("driver-status").textContent =
      `Qaybta darawalka lama soo qaadan: ${error.message}. Hubi schema-ga drivers iyo RLS.`;
  }
}

async function loadAvailableOrders(driver) {
  const { data, error } = await db
    .from("orders")
    .select("*")
    .in("status", ["pending", "new"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    $("available-orders").innerHTML =
      `<p class="empty">${escapeHTML(error.message)}</p>`;
    return;
  }

  const service = String(driver.service_type || "").toLowerCase();

  const filtered = (data || []).filter(order =>
    String(order.service_type || "").toLowerCase() === service
  );

  if (!filtered.length) {
    $("available-orders").innerHTML =
      '<p class="empty">Weli ma jiraan dalabyo ku habboon adeeggaaga.</p>';
    return;
  }

  $("available-orders").innerHTML = filtered.map(order => `
    <article class="order-card">
      <div class="card-top">
        <h3>${escapeHTML(serviceName(order.service_type))}</h3>
        <span class="status-pill">${escapeHTML(statusName(order.status))}</span>
      </div>
      <p><b>Dalab:</b> #${escapeHTML(order.id)}</p>
      <p><b>Telefoon:</b> ${escapeHTML(order.customer_phone || "—")}</p>
      <p><b>Laga qaadayo:</b> ${escapeHTML(order.pickup_address)}</p>
      <p><b>Loo socdo:</b> ${escapeHTML(order.destination_address)}</p>
      <div class="card-actions">
        <button class="primary-action" data-accept-order="${escapeHTML(order.id)}">
          Codso aqbalidda
        </button>
      </div>
    </article>
  `).join("");

  $("available-orders").querySelectorAll("[data-accept-order]").forEach(button => {
    button.addEventListener("click", async () => {
      await requestOrderAcceptance(button.dataset.acceptOrder);
    });
  });
}

async function requestOrderAcceptance(orderId) {
  if (!driverCache || !session) return;

  /*
   * This is a database RPC call, not a direct status update.
   * The server must verify approval, fee payment, and availability.
   * The exact RPC argument names must match your deployed SQL function.
   */
  const button = document.querySelector(
    `[data-accept-order="${CSS.escape(String(orderId))}"]`
  );

  if (button) button.disabled = true;

  try {
    const { error } = await db.rpc("igakeen_accept_order", {
      p_order_id: orderId
    });

    if (error) throw error;

    notify("Codsiga aqbalidda waa la diray.");
    await loadDriverArea();
  } catch (error) {
    console.error("Accept order RPC:", error);
    notify(
      `Dalabka lama aqbalin: ${error.message}. Hubi magaca iyo parameters-ka RPC-ga igakeen_accept_order.`
    );
    if (button) button.disabled = false;
  }
}

/* Driver fee evidence submission */

$("fee-form").addEventListener("submit", async event => {
  event.preventDefault();
  clearFeedback("fee-feedback");

  if (!requireLogin() || !requireDatabase()) return;

  if (!driverCache?.id) {
    feedback(
      "fee-feedback",
      "Akoonka darawalka lama helin ama lama ansixin.",
      "error"
    );
    return;
  }

  const orderId = $("fee-order").value;
  const reference = $("fee-reference").value.trim();
  const note = $("fee-note").value.trim();

  if (!orderId || !reference) {
    feedback(
      "fee-feedback",
      "Dooro dalab oo geli tixraaca lacag-bixinta.",
      "error"
    );
    return;
  }

  const order = orderCache.find(
    item => String(item.id) === String(orderId)
  );

  const fee = FEES[String(order?.service_type || "").toLowerCase()];

  if (!fee) {
    feedback(
      "fee-feedback",
      "Fee-ga dalabkan lama xaqiijin karo. Cusboonaysii dalabyada.",
      "error"
    );
    return;
  }

  const button = $("fee-submit");
  setBusy(button, true, "Waa la gudbinayaa...", "Gudbi caddeynta →");

  try {
    const { error } = await db.from("driver_fee_payments").insert({
      order_id: orderId,
      driver_id: driverCache.id,
      submitted_by: session.user.id,
      amount: fee.provider,
      currency: "USD",
      payment_reference: reference,
      payment_note: note || null,
      status: "pending"
    });

    if (error) throw error;

    $("fee-form").reset();
    feedback(
      "fee-feedback",
      "Caddeynta waa la gudbiyey. Maamulka ayaa hubinaya; tani macnaheedu ma aha in lacag-bixinta la xaqiijiyey.",
      "success"
    );
  } catch (error) {
    console.error("Fee submission:", error);
    feedback(
      "fee-feedback",
      `Caddeynta lama gudbin: ${error.message}. Hubi schema-ga iyo RLS policies-ka driver_fee_payments.`,
      "error"
    );
  } finally {
    button.disabled = false;
    button.textContent = "Gudbi caddeynta →";
  }
});

/* Realtime cleanup */

function unsubscribeRealtime() {
  if (!db) return;

  [chatChannel, orderChannel, notificationChannel]
    .filter(Boolean)
    .forEach(channel => db.removeChannel(channel));

  chatChannel = null;
  orderChannel = null;
  notificationChannel = null;
}

window.addEventListener("online", () => {
  notify("Internet-ku wuu soo noqday.");
});

window.addEventListener("offline", () => {
  notify("Internet ma jiro. Hubi isku xirkaaga.");
});

window.addEventListener("beforeunload", () => {
  unsubscribeRealtime();
});

/* Initial state */

updateAuthMode();
selectService("taxi");
