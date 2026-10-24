async function render() {
  if (!state.user) return;
  
  // Halkan waxaa laga beddelay [screen] oo laga dhigay [state.screen]
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
    await fn(); 
  } catch (err) { 
    console.error('RENDER ERROR:', err); 
    $('screen').innerHTML = `
      <div class="empty" style="border: 1px solid var(--danger)">
        <div class="empty-ico">⚠️</div>
        <h4>${t('common.error')}</h4>
        <p style="color:var(--danger); font-size:12px; margin-bottom:14px">${esc(err.message || err.details || 'Unknown error')}</p>
        <button class="btn btn-secondary" onclick="App.render()">${t('common.retry')}</button>
      </div>`; 
  }
}