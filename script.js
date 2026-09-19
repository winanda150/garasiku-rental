// ==============================================================================
// RESET SCROLL: Pastikan selalu kembali ke paling atas saat halaman di-refresh
// ==============================================================================
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

window.addEventListener('pageshow', () => {
    if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});

// Interaktivitas Header, Mobile Navigation, dan Smooth Scroll - Garasiku
document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNavMenu = document.getElementById('mobileNavMenu');
    const mobileBackdrop = document.getElementById('mobileBackdrop');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const desktopLinks = document.querySelectorAll('.nav-link');
    const allHashLinks = document.querySelectorAll('a[href^="#"]');

    if (mobileNavMenu) {
        // Pastikan menu tertutup memiliki atribut inert pada awal render
        mobileNavMenu.setAttribute('inert', '');
    }

    // Buka Menu Mobile
    const openMobileMenu = () => {
        if (!hamburgerBtn || !mobileNavMenu || !mobileBackdrop) return;
        hamburgerBtn.classList.add('active');
        mobileNavMenu.classList.add('open');
        mobileBackdrop.classList.add('open');

        hamburgerBtn.setAttribute('aria-expanded', 'true');
        mobileNavMenu.removeAttribute('inert');
        mobileNavMenu.scrollTop = 0;
        document.body.style.overflow = 'hidden';
    };

    // Tutup Menu Mobile
    const closeMobileMenu = () => {
        if (!hamburgerBtn || !mobileNavMenu || !mobileBackdrop) return;

        // Kembalikan fokus ke hamburger jika elemen di dalam menu sedang fokus
        if (mobileNavMenu.contains(document.activeElement)) {
            hamburgerBtn.focus();
        }

        hamburgerBtn.classList.remove('active');
        mobileNavMenu.classList.remove('open');
        mobileBackdrop.classList.remove('open');

        hamburgerBtn.setAttribute('aria-expanded', 'false');
        mobileNavMenu.setAttribute('inert', '');
        document.body.style.overflow = '';
    };

    // Toggle Menu Mobile
    const toggleMobileMenu = () => {
        if (!hamburgerBtn) return;
        const isOpen = hamburgerBtn.classList.contains('active');
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    };

    // Event Listener Klik Hamburger
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        });
    }

    // Event Listener Klik Backdrop Overlay
    if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', () => {
            closeMobileMenu();
        });
    }

    // Smooth Scroll untuk semua tautan internal anchor (#)
    allHashLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // Jika menu mobile sedang terbuka, tutup terlebih dahulu
                if (hamburgerBtn && hamburgerBtn.classList.contains('active')) {
                    closeMobileMenu();
                }

                // Smooth scroll ke elemen tujuan
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Perbarui URL hash tanpa memicu jump seketika
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }
            }
        });
    });

    // ==========================================================================
    // SISTEM AKTIF NAVBAR SAAT SCROLLING (Scroll Spy)
    // Sesuai permintaan: Saat user scroll ke bawah melewati konten section 'bantuan'
    // (misalnya masuk ke section sewa/CTA atau footer hingga paling bawah),
    // nav link 'Bantuan' tetap dipertahankan aktif di header dan tidak menghilang.
    // ==========================================================================
    const setActiveNav = (targetId) => {
        // Jika targetId adalah #sewa atau user melewati #bantuan ke bawah,
        // tetap biarkan nav link 'Bantuan' yang aktif
        const effectiveId = (targetId === '#sewa') ? '#bantuan' : targetId;

        desktopLinks.forEach(link => {
            if (link.getAttribute('href') === effectiveId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        mobileLinks.forEach(link => {
            if (link.getAttribute('href') === effectiveId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // Daftar section navigasi utama secara berurutan
    const navSectionList = [
        document.getElementById('beranda'),
        document.getElementById('tentang'),
        document.getElementById('unit-garasi'),
        document.getElementById('fasilitas'),
        document.getElementById('cara-sewa'),
        document.getElementById('bantuan')
    ].filter(Boolean);

    const updateActiveNavOnScroll = () => {
        const scrollPosition = window.scrollY || window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const headerHeight = 85; // Menyesuaikan tinggi sticky header

        // 1. Jika posisi scroll paling atas, aktifkan 'Beranda'
        if (scrollPosition < 60) {
            setActiveNav('#beranda');
            return;
        }

        // 2. Jika user scroll sampai ke ujung bawah halaman (melewati konten bantuan ke section sewa/footer)
        if (scrollPosition + windowHeight >= documentHeight - 60) {
            setActiveNav('#bantuan');
            return;
        }

        // 3. Khusus section 'Bantuan':
        // Jika user telah mencapai atau melewati awal section bantuan ke bawah,
        // pertahankan status aktif 'Bantuan' (tidak akan menghilang walaupun user berada di section sewa)
        const bantuanEl = document.getElementById('bantuan');
        if (bantuanEl) {
            const bantuanTop = bantuanEl.offsetTop - headerHeight;
            if (scrollPosition >= bantuanTop) {
                setActiveNav('#bantuan');
                return;
            }
        }

        // 4. Untuk section lainnya (cara-sewa, fasilitas, unit-garasi, beranda)
        for (let i = navSectionList.length - 1; i >= 0; i--) {
            const section = navSectionList[i];
            const sectionTop = section.offsetTop - headerHeight;
            if (scrollPosition >= sectionTop - 40) {
                setActiveNav('#' + section.id);
                return;
            }
        }
    };

    // Jalankan pengecekan posisi aktif saat event scroll dengan requestAnimationFrame
    let isScrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!isScrollTicking) {
            window.requestAnimationFrame(() => {
                updateActiveNavOnScroll();
                isScrollTicking = false;
            });
            isScrollTicking = true;
        }
    }, { passive: true });

    // Inisialisasi status aktif pertama kali
    updateActiveNavOnScroll();

    // Tutup saat tombol ESC ditekan
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && hamburgerBtn && hamburgerBtn.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Otomatis tutup menu jika ukuran layar kembali membesar ke Desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 991 && hamburgerBtn && hamburgerBtn.classList.contains('active')) {
            closeMobileMenu();
        }
    });


    // ==========================================================================
    // UPDATE TAHUN HAK CIPTA OTOMATIS (Sesuai tahun saat ini)
    // ==========================================================================
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }


    // ==========================================================================
    // INTERAKTIVITAS DENAH SLOT (Klik slot untuk tanya langsung via WhatsApp)
    // ==========================================================================
    const allSlotItems = document.querySelectorAll('.slot-item');
    allSlotItems.forEach(slot => {
        slot.addEventListener('click', () => {
            const status = slot.getAttribute('data-status');
            const garage = slot.getAttribute('data-garage') === 'garasi-1' ? 'Garasi 1' : 'Garasi 2';
            const slotName = slot.querySelector('.slot-number') ? slot.querySelector('.slot-number').textContent : 'Slot';

            if (status === 'kosong') {
                const message = encodeURIComponent(`Halo Pak Wayan, saya ingin menanyakan ketersediaan ${slotName} di ${garage}. Apakah masih kosong?`);
                const waUrl = `https://wa.me/6281916783714?text=${message}`;
                window.open(waUrl, '_blank');
            }
        });
    });
});

// ==============================================================================
// FIREBASE READY: GARASIKU SLOT MANAGER
// Objek global untuk memudahkan sinkronisasi realtime dengan Firebase
// ==============================================================================
window.GarasikuSlotManager = {
    /**
     * Memperbarui status 1 slot spesifik.
     * @param {string} garageId - 'garasi-1' atau 'garasi-2'
     * @param {string|number} slotNumber - Nomor slot (contoh: '01' atau 1)
     * @param {string} status - 'kosong' (available) atau 'terisi' (occupied)
     */
    setSlotStatus: function (garageId, slotNumber, status) {
        const gPrefix = (garageId === 'garasi-1' || garageId === '1') ? 'g1' : 'g2';
        const formattedSlot = String(slotNumber).padStart(2, '0');
        const slotEl = document.getElementById(`slot-${gPrefix}-${formattedSlot}`);

        if (!slotEl) {
            console.warn(`[GarasikuSlotManager] Slot #slot-${gPrefix}-${formattedSlot} tidak ditemukan.`);
            return;
        }

        const isKosong = (status === 'kosong' || status === 'available' || status === true);
        const newStatus = isKosong ? 'kosong' : 'terisi';
        const labelText = isKosong ? 'Kosong' : 'Terisi';

        slotEl.setAttribute('data-status', newStatus);
        slotEl.className = `slot-item status-${newStatus}`;

        const pill = slotEl.querySelector('.slot-status-pill');
        if (pill) {
            pill.textContent = labelText;
        }

        this.recalculateCounters(garageId);
    },

    /**
     * Memperbarui banyak slot sekaligus dari objek data Firebase.
     * @param {string} garageId - 'garasi-1' atau 'garasi-2'
     * @param {Object} slotsData - Contoh: { "01": "kosong", "02": "terisi", ... }
     */
    updateAllSlots: function (garageId, slotsData) {
        if (!slotsData || typeof slotsData !== 'object') return;

        Object.keys(slotsData).forEach(slotNum => {
            this.setSlotStatus(garageId, slotNum, slotsData[slotNum]);
        });

        this.recalculateCounters(garageId);
    },

    /**
     * Menghitung ulang jumlah slot kosong dan terisi, lalu memperbarui badge counter.
     * @param {string} garageId - 'garasi-1' atau 'garasi-2'
     */
    recalculateCounters: function (garageId) {
        const isG1 = (garageId === 'garasi-1' || garageId === '1');
        const gridId = isG1 ? 'gridGarasi1' : 'gridGarasi2';
        const availId = isG1 ? 'g1-avail-count' : 'g2-avail-count';
        const occId = isG1 ? 'g1-occ-count' : 'g2-occ-count';

        const gridEl = document.getElementById(gridId);
        if (!gridEl) return;

        const kosongCount = gridEl.querySelectorAll('.slot-item.status-kosong').length;
        const terisiCount = gridEl.querySelectorAll('.slot-item.status-terisi').length;

        const availBadge = document.getElementById(availId);
        const occBadge = document.getElementById(occId);

        if (availBadge) availBadge.textContent = kosongCount;
        if (occBadge) occBadge.textContent = terisiCount;
    }
};

/* ==============================================================================
 * CONTOH INTEGRASI KE FIREBASE (Firestore / Realtime Database) NANTINYA:
 * ==============================================================================
 *
 * Contoh dengan Cloud Firestore:
 * ----------------------------------------------------
 * import { getFirestore, doc, onSnapshot } from "firebase/firestore";
 * const db = getFirestore();
 *
 * // Dengarkan perubahan realtime Garasi 1:
 * onSnapshot(doc(db, "garasi", "garasi-1"), (docSnap) => {
 *     if (docSnap.exists()) {
 *         // Misalnya struktur data document: { slots: { "01": "kosong", "02": "terisi", ... } }
 *         window.GarasikuSlotManager.updateAllSlots("garasi-1", docSnap.data().slots);
 *     }
 * });
 *
 * // Dengarkan perubahan realtime Garasi 2:
 * onSnapshot(doc(db, "garasi", "garasi-2"), (docSnap) => {
 *     if (docSnap.exists()) {
 *         window.GarasikuSlotManager.updateAllSlots("garasi-2", docSnap.data().slots);
 *     }
 * });
 *
 * Contoh dengan Realtime Database:
 * ----------------------------------------------------
 * import { getDatabase, ref, onValue } from "firebase/database";
 * const rtdb = getDatabase();
 *
 * onValue(ref(rtdb, 'garasi/garasi-1/slots'), (snapshot) => {
 *     window.GarasikuSlotManager.updateAllSlots("garasi-1", snapshot.val());
 * });
 * ============================================================================== */

