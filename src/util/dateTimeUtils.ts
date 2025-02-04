//--./src/util/dateTimeUtils.ts--

export const getTime = (timestamp: Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) {
    return "Just now";
  }

  // Check if message is from previous day
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (!isToday) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  // 12-hour format with leading zero and AM/PM
  const rawHours = date.getHours();
  const hours12 = rawHours % 12 || 12; // Convert 0-23 to 12,1-11
  const hours = hours12.toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = rawHours >= 12 ? "PM" : "AM";

  return `${hours}:${minutes} ${ampm}`;
};
