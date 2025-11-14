/* ================================== */
/*      GALLERY & SLIDER LOADER       */
/* ================================== */

function initGallery(appKey) {
    const slidesEl = document.getElementById('slides');
    const thumbsContainer = document.getElementById('thumbs');
    const sliderBg = document.getElementById('sliderBg');
    const skillPercentEl = document.getElementById('skillPercent');
    const progressBarEl = document.getElementById('progressBar');
    const nextBtn = document.getElementById('next');
    const prevBtn = document.getElementById('prev');

    if (!slidesEl || !thumbsContainer) {
        console.error("Slider elements not found!");
        return;
    }

    let galleryItems = [];
    let currentIndex = 0;

    // Fungsi untuk menghitung skill summary
    function calculateAndDisplaySummary() {
        const allUploads = getUploads();
        const appUploads = allUploads.filter(u => u.app === appKey);
        let average = 0;
        if (appUploads.length > 0) {
            const totalPercent = appUploads.reduce((sum, u) => sum + (u.totalPercent || 0), 0);
            average = Math.round(totalPercent / appUploads.length);
        }

        if (skillPercentEl && progressBarEl) {
            progressBarEl.style.width = average + '%';
            animateValue(skillPercentEl, 0, average, 900);
        }
    }

    // Fungsi untuk merender galeri
    function renderGallery() {
        const allUploads = getUploads();
        const myUploads = allUploads.filter(u => u.app === appKey);
        
        // Menggabungkan item statis (jika ada) dengan item dinamis
        const staticSlides = Array.from(slidesEl.querySelectorAll('img, video'));
        galleryItems = staticSlides.map((el, i) => ({
            id: `static_${i}`,
            isStatic: true,
            imageData: el.src,
            description: el.alt,
            app: appKey
        }));
        galleryItems = [...myUploads, ...galleryItems];

        slidesEl.innerHTML = '';
        thumbsContainer.innerHTML = '';

        if (galleryItems.length === 0) {
            slidesEl.innerHTML = '<p style="text-align:center; padding: 2rem; color: var(--muted);">Belum ada karya yang diunggah untuk kategori ini.</p>';
            nextBtn.style.display = 'none';
            prevBtn.style.display = 'none';
            return;
        }

        nextBtn.style.display = 'block';
        prevBtn.style.display = 'block';

        galleryItems.forEach((item, i) => {
            const isVideo = item.imageData.startsWith('data:video');
            const slideEl = document.createElement(isVideo ? 'video' : 'img');
            slideEl.src = item.imageData;
            if (isVideo) {
                slideEl.controls = true;
                slideEl.muted = true;
                slideEl.style.cssText = 'width:100%; height:520px; object-fit:contain;';
            }
            slidesEl.appendChild(slideEl);

            const thumbEl = document.createElement('img');
            thumbEl.src = isVideo ? 'https://via.placeholder.com/120x70.png?text=Video' : item.imageData;
            thumbEl.dataset.index = i;
            thumbEl.style.position = 'relative';
            thumbEl.addEventListener('click', () => {
                currentIndex = i;
                updateSlider();
            });
            thumbsContainer.appendChild(thumbEl);

            if (!item.isStatic) {
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '&times;';
                deleteBtn.title = 'Hapus karya ini';
                deleteBtn.style.cssText = 'position:absolute; top:-5px; right:-5px; background:#f44336; color:white; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer; z-index:10;';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (confirm('Anda yakin ingin menghapus karya ini?')) {
                        const currentUploads = getUploads();
                        const newUploads = currentUploads.filter(up => up.id !== item.id);
                        saveUploads(newUploads); // Simpan data baru
                        // Tidak perlu hitung ulang summary di sini, biarkan halaman utama yang melakukannya
                        renderAll(); // Render ulang semuanya
                    }
                };
                thumbEl.appendChild(deleteBtn);
            }
        });
    }

    function updateSlider() {
        if (galleryItems.length === 0) return;
        slidesEl.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        thumbsContainer.querySelectorAll('img').forEach(t => t.classList.remove('active'));
        const activeThumb = thumbsContainer.querySelector(`img[data-index='${currentIndex}']`);
        if (activeThumb) {
            activeThumb.classList.add('active');
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        if (sliderBg) {
            const currentItem = galleryItems[currentIndex];
            const isVideo = currentItem && currentItem.imageData.startsWith('data:video');
            sliderBg.style.backgroundImage = isVideo ? 'none' : `url('${currentItem.imageData}')`;
        }
    }

    function renderAll() {
        renderGallery();
        if (currentIndex >= galleryItems.length) {
            currentIndex = Math.max(0, galleryItems.length - 1);
        }
        updateSlider();
        calculateAndDisplaySummary();
    }

    // Event Listeners
    nextBtn.addEventListener('click', () => {
        if (galleryItems.length === 0) return;
        currentIndex = (currentIndex + 1) % galleryItems.length;
        updateSlider();
    });

    prevBtn.addEventListener('click', () => {
        if (galleryItems.length === 0) return;
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        updateSlider();
    });

    // Initial Load
    renderAll();

    // Listen for changes from other tabs
    window.addEventListener('storage', renderAll);
}