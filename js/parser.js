function parseChat(text) {
  const lines = text.split("\n");

  const users = {};
  const hours = {};
  const days = {};
  let firstDate = null;
  let lastDate = null;
  let total = 0;

  // System messages to ignore (voice calls, video calls, etc.)
  const systemMessages = [
    "missed voice call",
    "missed video call",
    "voice call",
    "video call",
    "call ended",
    "you missed",
    "messages and calls are encrypted",
    "this message was deleted",
    "media omitted",
    "image omitted",
    "video omitted",
    "audio omitted",
    "sticker omitted",
    "document omitted",
    "contact card omitted",
    "location omitted",
    "poll ended",
    "changed the subject",
    "added",
    "removed",
    "left",
    "created group",
    "group icon",
    "security code changed",
    "end-to-end encrypted",
  ];

  lines.forEach((line) => {
    const msgMatch = line.match(/^(\d+\/\d+\/\d+), (\d+:\d+).* - (.*?):/);

    if (msgMatch) {
      const dateStr = msgMatch[1];
      const time = msgMatch[2];
      const user = msgMatch[3].trim();

      // Skip if username is empty or just numbers or too short
      if (!user || /^\d+$/.test(user) || user.length < 2) {
        return;
      }

      // Skip system messages (voice calls, video calls, etc.)
      if (
        systemMessages.some((msg) =>
          user.toLowerCase().includes(msg.toLowerCase()),
        )
      ) {
        return;
      }

      total++;

      // Parse date properly (MM/DD/YYYY format from WhatsApp)
      const [month, day, year] = dateStr.split("/");
      const dateObj = new Date(year, month - 1, day);

      // Track first and last dates
      if (!firstDate || dateObj < firstDate) firstDate = dateObj;
      if (!lastDate || dateObj > lastDate) lastDate = dateObj;

      users[user] = (users[user] || 0) + 1;

      const hour = time.split(":")[0];
      hours[hour] = (hours[hour] || 0) + 1;

      days[dateStr] = (days[dateStr] || 0) + 1;
    }
  });

  // Calculate chat duration in days
  let chatDurationDays = 0;
  if (firstDate && lastDate) {
    chatDurationDays = Math.floor(
      (lastDate - firstDate) / (1000 * 60 * 60 * 24),
    );
  }

  return {
    users,
    hours,
    days,
    total,
    firstDate: firstDate ? firstDate.toLocaleDateString() : null,
    lastDate: lastDate ? lastDate.toLocaleDateString() : null,
    chatDurationDays,
    userCount: Object.keys(users).length,
  };
}

export { parseChat };
