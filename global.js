/* ================================== */
/*          GLOBAL HELPERS          */
/* ================================== */

// Fungsi untuk mengambil data dari localStorage
function getUploads() {
    try {
        return JSON.parse(localStorage.getItem('portfolio_uploads') || '[]');
    } catch (e) {
        console.error("Error parsing portfolio_uploads from localStorage", e);
        return [];
    }
}

// Fungsi untuk menyimpan data ke localStorage
function saveUploads(arr) {
    localStorage.setItem('portfolio_uploads', JSON.stringify(arr));
    // Kirim event agar tab lain bisa ikut update
    window.dispatchEvent(new Event('storage'));
}

// Fungsi untuk menganimasikan angka (misal: persentase skill)
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start) + '%';
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}