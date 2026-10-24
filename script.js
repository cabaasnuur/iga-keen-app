function $(id) {
  const aliases = {
    "order-form": "orderForm",
    "auth-form": "authForm",
    "chat-form": "chatForm",
    "driver-form": "driverSignupFields",
    "get-location": "getLocationButton",
    "gps-button": "getLocationButton",
    "submit-order": "submitOrderButton",
    "orders-list": "ordersList",
    "driver-orders-list": "availableOrdersList",
    "available-orders": "availableOrdersList",
    "chat-messages": "chatMessages",
    "chat-message": "chatInput",
    "notifications-list": "notificationsList",
    "notification-list": "notificationsList",
    "customer-name": "customerName",
    "customer-phone": "customerPhone",
    "pickup-address": "pickupAddress",
    "destination-address": "destinationAddress",
    "order-notes": "orderNotes",
    "service-type": "serviceType",
    "scheduled-at": "scheduledAt",
    "pickup-latitude": "pickupLatitude",
    "pickup-longitude": "pickupLongitude",
    "auth-email": "authEmail",
    "auth-password": "authPassword",
    "auth-full-name": "authFullName",
    "auth-phone": "authPhone",
    "driver-service": "driverServiceType",
    "vehicle-description": "vehicleDescription",
    "logout-button": "signOutButton",
    "signout-button": "signOutButton"
  };

  return document.getElementById(aliases[id] || id);
}