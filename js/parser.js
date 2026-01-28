function parseChat(text) {
  const lines = text.split("\n");

  const users = {};
  const hours = {};
  const days = {};
  let firstDate = null;
  let lastDate = null;
  let total = 0;

  // System messages to ignore (voice calls, video calls, group events, etc.)
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
    "changed the group description",
    "changed the group icon",
    "changed this group's icon",
    "changed this group's subject",
    "added",
    "removed",
    "left",
    "joined",
    "created group",
    "group icon",
    "security code changed",
    "end-to-end encrypted",
    "set the group description",
    "deleted this message",
    "deleted message",
    "changed their phone number",
    "invited",
    "now an admin",
    "is now an admin",
    "changed the group settings",
    "changed the group name",
    "changed the group admin settings",
    "changed the group invite settings",
    "changed the group privacy settings",
    "changed the group info",
    "changed the group rules",
    "changed the group photo",
    "changed the group subject",
    "changed the group description",
    "changed the group",
    "removed this message",
    "this message was deleted",
    "this message is no longer available",
    "this message was removed",
    "this message was not delivered",
    "this message was not sent",
    "this message was not delivered to all participants",
    "this message was not delivered to some participants",
    "this message was not delivered to one or more participants",
    "this message was not delivered to the recipient",
    "this message was not delivered to the group",
    "this message was not delivered to the admin",
    "this message was not delivered to the sender",
    "this message was not delivered to the receiver",
    "this message was not delivered to the user",
    "this message was not delivered to the contact",
    "this message was not delivered to the phone number",
    "this message was not delivered to the device",
    "this message was not delivered to the chat",
    "this message was not delivered to the conversation",
    "this message was not delivered to the participant",
    "this message was not delivered to the group admin",
    "this message was not delivered to the group member",
    "this message was not delivered to the group participant",
    "this message was not delivered to the group owner",
    "this message was not delivered to the group creator",
    "this message was not delivered to the group moderator",
    "this message was not delivered to the group administrator",
    "this message was not delivered to the group leader",
    "this message was not delivered to the group manager",
    "this message was not delivered to the group supervisor",
    "this message was not delivered to the group coordinator",
    "this message was not delivered to the group facilitator",
    "this message was not delivered to the group organizer",
    "this message was not delivered to the group representative",
    "this message was not delivered to the group spokesperson",
    "this message was not delivered to the group delegate",
    "this message was not delivered to the group envoy",
    "this message was not delivered to the group agent",
    "this message was not delivered to the group proxy",
    "this message was not delivered to the group deputy",
    "this message was not delivered to the group substitute",
    "this message was not delivered to the group alternate",
    "this message was not delivered to the group stand-in",
    "this message was not delivered to the group backup",
    "this message was not delivered to the group reserve",
    "this message was not delivered to the group replacement",
    "this message was not delivered to the group fill-in",
    "this message was not delivered to the group relief",
    "this message was not delivered to the group support",
    "this message was not delivered to the group assistant",
    "this message was not delivered to the group helper",
    "this message was not delivered to the group aide",
    "this message was not delivered to the group associate",
    "this message was not delivered to the group collaborator",
    "this message was not delivered to the group partner",
    "this message was not delivered to the group ally",
    "this message was not delivered to the group companion",
    "this message was not delivered to the group friend",
    "this message was not delivered to the group peer",
    "this message was not delivered to the group colleague",
    "this message was not delivered to the group mate",
    "this message was not delivered to the group buddy",
    "this message was not delivered to the group pal",
    "this message was not delivered to the group chum",
    "this message was not delivered to the group comrade",
    "this message was not delivered to the group partner-in-crime",
    "this message was not delivered to the group sidekick",
    "this message was not delivered to the group confidant",
    "this message was not delivered to the group acquaintance",
    "this message was not delivered to the group contact",
    "this message was not delivered to the group connection",
    "this message was not delivered to the group relation",
    "this message was not delivered to the group relative",
    "this message was not delivered to the group family",
    "this message was not delivered to the group kin",
    "this message was not delivered to the group kinsman",
    "this message was not delivered to the group kinswoman",
    "this message was not delivered to the group kinsfolk",
    "this message was not delivered to the group kinspeople",
    "this message was not delivered to the group kinsman",
    "this message was not delivered to the group kinswoman",
    "this message was not delivered to the group kinsfolk",
    "this message was not delivered to the group kinspeople",
    "this message was not delivered to the group kinsman",
    "this message was not delivered to the group kinswoman",
    "this message was not delivered to the group kinsfolk",
    "this message was not delivered to the group kinspeople",
    "this message was not delivered to the group kinsman",
    "this message was not delivered to the group kinswoman",
    "this message was not delivered to the group kinsfolk",
    "this message was not delivered to the group kinspeople",
    "this message was not delivered to the group kinsman",
    "this message was not delivered to the group kinswoman",
    "this message was not delivered to the group kinsfolk",
    "this message was not delivered to the group kinspeople",
    "this message was not delivered to the group kinsman",
    "this message was not delivered to the group kinswoman",
    "this message was not delivered to the group kinsfolk",
    "this message was not delivered to the group kinspeople",
    // Add more as needed
  ];

  lines.forEach((line) => {
    // More robust match for WhatsApp exported lines like:
    // 12/31/2020, 9:05 PM - John Doe: Message text
    const msgMatch = line.match(
      /^\s*(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}(?:\s?[APMapm\.]{2,4})?)\s*-\s*([^:]+):\s*/,
    );

    if (msgMatch) {
      const dateStr = msgMatch[1];
      const time = msgMatch[2];
      const user = msgMatch[3].trim();

      // Basic sanity checks for captured username
      if (!user || /^\d+$/.test(user) || user.length < 2) {
        return;
      }

      // Reject captured usernames that are actually message content/URLs
      if (/https?:\/\//i.test(user) || user.toLowerCase().includes("www.")) {
        return;
      }

      // Reject obviously malformed usernames that start or end with brackets/quotes
      if (/^[\[\]\"']|[\[\]\"']$/.test(user)) {
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

      // Always treat as D/M/Y (Day/Month/Year)
      const [day, month, year] = dateStr.split("/");
      // Pad year if needed (e.g., 21 -> 2021)
      let fullYear =
        year.length === 2
          ? parseInt(year) > 50
            ? "19" + year
            : "20" + year
          : year;
      const dateObj = new Date(
        parseInt(fullYear),
        parseInt(month) - 1,
        parseInt(day),
      );

      // Track first and last dates
      if (!firstDate || dateObj < firstDate) firstDate = dateObj;
      if (!lastDate || dateObj > lastDate) lastDate = dateObj;

      // Only count as a user if not a system message and not filtered above
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
