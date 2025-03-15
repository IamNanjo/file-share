export default function getRelativeTimestamp(date: Date) {
    const now = Date.now();
    const diffMs = now - date.getTime();

    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 1) return "now";
    if (diffSec < 60) return `${diffSec} second${diffSec !== 1 ? "s" : ""} ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;

    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs !== 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays <= 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks <= 4)
        return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;

    const diffMonths = Math.floor(diffDays / 30.44);
    if (diffMonths <= 12)
        return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
}
