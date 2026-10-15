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
        // Catatan: Tidak mengunci overflow body agar halaman utama tetap dapat di-scroll
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

    // Klik di luar menu mobile untuk menutup menu (dengan capture agar responsif tanpa menghalangi scroll)
    document.addEventListener('click', (e) => {
        if (hamburgerBtn && hamburgerBtn.classList.contains('active')) {
            if (mobileNavMenu && !mobileNavMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                closeMobileMenu();
            }
        }
    }, true);

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
        document.getElementById('galeri'),
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
    // MODAL LIGHTBOX PRATINJAU FOTO GALERI (Navigasi Next / Back)
    // ==========================================================================
    const galleryCards = document.querySelectorAll('.gallery-card');
    const galleryModal = document.getElementById('galleryModal');
    const galleryModalImg = document.getElementById('galleryModalImg');
    const galleryModalCounter = document.getElementById('galleryModalCounter');
    const galleryModalClose = document.getElementById('galleryModalClose');
    const galleryModalPrev = document.getElementById('galleryModalPrev');
    const galleryModalNext = document.getElementById('galleryModalNext');
    const galleryModalBackdrop = document.getElementById('galleryModalBackdrop');

    if (galleryModal && galleryCards.length > 0) {
        let currentGalleryIndex = 0;

        const updateModalContent = (index) => {
            // Loop secara sirkular (dari foto terakhir ke pertama atau sebaliknya)
            if (index < 0) {
                index = galleryCards.length - 1;
            } else if (index >= galleryCards.length) {
                index = 0;
            }
            currentGalleryIndex = index;

            const card = galleryCards[currentGalleryIndex];
            const img = card.querySelector('img');

            if (img && galleryModalImg) {
                galleryModalImg.src = img.src;
                galleryModalImg.alt = img.alt || 'Foto Garasiku';
            }
            if (galleryModalCounter) {
                galleryModalCounter.textContent = `${currentGalleryIndex + 1} / ${galleryCards.length}`;
            }
        };

        const openGalleryModal = (index) => {
            updateModalContent(index);
            galleryModal.classList.add('active');
            galleryModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        };

        const closeGalleryModal = () => {
            galleryModal.classList.remove('active');
            galleryModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        const showNextPhoto = () => {
            updateModalContent(currentGalleryIndex + 1);
        };

        const showPrevPhoto = () => {
            updateModalContent(currentGalleryIndex - 1);
        };

        galleryCards.forEach((card, idx) => {
            card.addEventListener('click', () => openGalleryModal(idx));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openGalleryModal(idx);
                }
            });
        });

        if (galleryModalNext) {
            galleryModalNext.addEventListener('click', (e) => {
                e.stopPropagation();
                showNextPhoto();
            });
        }

        if (galleryModalPrev) {
            galleryModalPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                showPrevPhoto();
            });
        }

        if (galleryModalClose) {
            galleryModalClose.addEventListener('click', closeGalleryModal);
        }
        if (galleryModalBackdrop) {
            galleryModalBackdrop.addEventListener('click', closeGalleryModal);
        }

        // Navigasi Keyboard: Tombol Panah Kanan (Next), Panah Kiri (Back), dan Escape (Tutup)
        document.addEventListener('keydown', (e) => {
            if (!galleryModal.classList.contains('active')) return;

            if (e.key === 'Escape') {
                closeGalleryModal();
            } else if (e.key === 'ArrowRight') {
                showNextPhoto();
            } else if (e.key === 'ArrowLeft') {
                showPrevPhoto();
            }
        });

        // Swipe gesture untuk layar sentuh / mobile
        let touchStartX = 0;
        let touchEndX = 0;
        const imgWrap = galleryModal.querySelector('.gallery-modal-img-wrap');
        if (imgWrap) {
            imgWrap.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            imgWrap.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                if (touchStartX - touchEndX > 45) {
                    showNextPhoto();
                } else if (touchEndX - touchStartX > 45) {
                    showPrevPhoto();
                }
            }, { passive: true });
        }
    }
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

