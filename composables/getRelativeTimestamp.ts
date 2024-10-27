export default function getRelativeTimestamp(date: Date) {
    const now = Date.now();
    const diffMs = now - date.getTime(); // Difference in milliseconds
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffSec < 60) return `${diffSec} second${diffSec !== 1 ? "s" : ""} ago`;
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

    return date.toLocaleDateString(navigator.language); // Fallback for dates over a week
}
