export default function getRelativeTimestamp(date: Date) {
    const rtf = new Intl.RelativeTimeFormat(navigator.language, {
        numeric: "auto",
        style: "long",
    });

    const now = Date.now();
    const diff = now - date.getTime();

    const rawSeconds = diff / 1000;
    const rawMinutes = rawSeconds / 60;
    const rawHours = rawMinutes / 60;
    const rawDays = rawHours / 24;

    const seconds = Math.floor(rawSeconds);
    const minutes = Math.floor(rawMinutes);
    const hours = Math.floor(rawHours);
    const days = Math.floor(rawDays);

    // Approximates
    const months = Math.floor(rawDays / 30);
    const years = Math.floor(rawDays / 365);

    if (seconds < 60) {
        return rtf.format(-seconds, "seconds");
    } else if (minutes < 60) {
        return rtf.format(-minutes, "minutes");
    } else if (hours < 24) {
        return rtf.format(-hours, "hours");
    } else if (days < 28) {
        return rtf.format(-days, "days");
    } else if (years < 1) {
        return rtf.format(-months, "months");
    } else {
        return rtf.format(-years, "years");
    }
}
