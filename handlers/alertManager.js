const activeAlerts = new Map();

function scheduleTicketClosure(channel, duration, closeFn) {
  if (activeAlerts.has(channel.id)) {
    clearTimeout(activeAlerts.get(channel.id));
  }

  const timeout = setTimeout(async () => {
    activeAlerts.delete(channel.id);

    await closeFn();
  }, duration);

  activeAlerts.set(channel.id, timeout);
}

function cancelTicketClosure(channelId) {
  if (activeAlerts.has(channelId)) {
    clearTimeout(activeAlerts.get(channelId));
    activeAlerts.delete(channelId);
    return true;
  }
  return false;
}

module.exports = { scheduleTicketClosure, cancelTicketClosure };
