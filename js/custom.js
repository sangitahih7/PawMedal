/**
 * SMOOTH & EYE-CATCHING HERO BANNER & NEXT SECTION ENGINE
 * Inspired by Spylt (spylt-promptly.vercel.app)
 *
 * Features:
 * 1. Kinetic Staggered Reveal on Load (Blur-to-sharp entrance)
 * 2. Animated Luxury Gold Gradient Shimmer on Highlighted Text
 * 3. Dog Image Corners Out & Follows Cursor Responsively
 * 4. Spylt-Style Next Section Cursor Reveal & Floating Wave
 * 5. Stacked Sheet Scroll Transition & Card Parallax
 * 6. Top Bar Close & Back To Top Handlers
 */

(function () {
    'use strict';

    function initAll() {
        initBannerEntrance();
        initSmoothParallax();
        initSpyltNextSection();
        initChooseSection();
        initTopBarClose();
        initBackToTop();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    // ========================================================
    // 1. Kinetic Staggered Word Entrance
    // ========================================================
    function initBannerEntrance() {
        var banner = document.querySelector('.banner');
        if (!banner) return;

        var h1 = banner.querySelector('.bnr_content h1');
        if (h1 && !h1.dataset.splitDone) {
            h1.dataset.splitDone = 'true';

            var childNodes = Array.prototype.slice.call(h1.childNodes);
            var wordsArray = [];

            childNodes.forEach(function (node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    var words = node.textContent.trim().split(/\s+/);
                    words.forEach(function (w) {
                        if (w.length > 0) wordsArray.push({ text: w, isYellow: false });
                    });
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    var isYlw = node.classList.contains('ylwtxt');
                    var wordsInEl = node.textContent.trim().split(/\s+/);
                    wordsInEl.forEach(function (w) {
                        if (w.length > 0) wordsArray.push({ text: w, isYellow: isYlw });
                    });
                }
            });

            h1.innerHTML = '';
            wordsArray.forEach(function (item, index) {
                var wrap = document.createElement('span');
                wrap.className = 'word-wrap';

                var inner = document.createElement('span');
                inner.className = 'word-inner' + (item.isYellow ? ' ylwtxt' : '');
                inner.textContent = item.text;
                inner.style.transitionDelay = (index * 0.08 + 0.15).toFixed(2) + 's';

                wrap.appendChild(inner);
                h1.appendChild(wrap);
            });
        }

        // Trigger entrance
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                banner.classList.add('revealed');
            });
        });
    }

    // ========================================================
    // 2. Dog Image Cursor Follower & Reactive Parallax
    // ========================================================
    function initSmoothParallax() {
        var banner = document.querySelector('.banner');
        if (!banner) return;

        var bg = banner.querySelector('.bnr_bg');
        var content = banner.querySelector('.bnr_content');
        var pets = banner.querySelector('.bnr_pets');

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Reset entrance transition on pets so cursor tracking has direct, responsive control
        setTimeout(function () {
            if (pets) pets.style.transition = 'none';
        }, 1450);

        var rect = banner.getBoundingClientRect();
        function updateRect() {
            rect = banner.getBoundingClientRect();
        }
        window.addEventListener('resize', updateRect, { passive: true });
        window.addEventListener('scroll', updateRect, { passive: true });

        // Physics State (Linear Interpolation for smooth cursor follow)
        var state = {
            targetPetX: 0,
            targetPetY: 0,
            currPetX: 0,
            currPetY: 0,
            targetPetRotate: 0,
            currPetRotate: 0,
            targetPetScale: 1,
            currPetScale: 1,
            targetBgX: 0,
            targetBgY: 0,
            currBgX: 0,
            currBgY: 0,
            targetContentX: 0,
            targetContentY: 0,
            currContentX: 0,
            currContentY: 0,
            isHovered: false,
            isIdle: false,
            rafId: null
        };

        function lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        function render() {
            var ease = 0.075; // Silky cursor follow inertia

            state.currPetX = lerp(state.currPetX, state.targetPetX, ease);
            state.currPetY = lerp(state.currPetY, state.targetPetY, ease);
            state.currPetRotate = lerp(state.currPetRotate, state.targetPetRotate, ease);
            state.currPetScale = lerp(state.currPetScale, state.targetPetScale, ease);

            state.currBgX = lerp(state.currBgX, state.targetBgX, ease);
            state.currBgY = lerp(state.currBgY, state.targetBgY, ease);

            state.currContentX = lerp(state.currContentX, state.targetContentX, ease);
            state.currContentY = lerp(state.currContentY, state.targetContentY, ease);

            // Dog image cursor effect: extends, leans, and tracks the mouse from bottom right
            if (pets) {
                pets.style.transform = 'translate3d(' + state.currPetX.toFixed(2) + 'px, ' + state.currPetY.toFixed(2) + 'px, 0) rotate(' + state.currPetRotate.toFixed(2) + 'deg) scale(' + state.currPetScale.toFixed(3) + ')';
            }
            if (bg) {
                bg.style.transform = 'translate3d(' + state.currBgX.toFixed(2) + 'px, ' + state.currBgY.toFixed(2) + 'px, 0)';
            }
            if (content) {
                content.style.transform = 'translate3d(' + state.currContentX.toFixed(2) + 'px, ' + state.currContentY.toFixed(2) + 'px, 0)';
            }

            // Sleep when idle to conserve resources
            var delta = Math.abs(state.currPetX - state.targetPetX) +
                        Math.abs(state.currPetY - state.targetPetY) +
                        Math.abs(state.currPetRotate - state.targetPetRotate);

            if (!state.isHovered && delta < 0.005) {
                state.isIdle = true;
                state.rafId = null;
                return;
            }

            state.rafId = requestAnimationFrame(render);
        }

        function wakeUp() {
            if (state.isIdle || !state.rafId) {
                state.isIdle = false;
                state.rafId = requestAnimationFrame(render);
            }
        }

        wakeUp();

        // Mouse Move Listener on Banner
        banner.addEventListener('mousemove', function (e) {
            state.isHovered = true;
            wakeUp();

            var relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            var relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

            // Normalized coordinates (-1 to 1) from banner center
            var normX = (relX - 0.5) * 2;
            var normY = (relY - 0.5) * 2;

            // Cursor effect: As cursor moves across banner, the dog reaches, leans, and follows the pointer
            state.targetPetX = normX * 42;
            state.targetPetY = normY * 30;
            state.targetPetRotate = normX * 4.5;
            state.targetPetScale = 1 + (Math.abs(normX) * 0.02) + (relX > 0.6 ? 0.025 : 0);

            // Subtle counter-parallax on background & content
            state.targetBgX = -normX * 14;
            state.targetBgY = -normY * 9;

            state.targetContentX = -normX * 8;
            state.targetContentY = -normY * 6;
        }, { passive: true });

        // Mouse Leave - Smooth Return to Resting State
        banner.addEventListener('mouseleave', function () {
            state.isHovered = false;
            wakeUp();

            state.targetPetX = 0;
            state.targetPetY = 0;
            state.targetPetRotate = 0;
            state.targetPetScale = 1;

            state.targetBgX = 0;
            state.targetBgY = 0;
            state.targetContentX = 0;
            state.targetContentY = 0;
        });
    }

    // ========================================================
    // 3. Spylt-Style Next Section Cursor Moving & Sheet Transition
    // ========================================================
    function initSpyltNextSection() {
        var features = document.querySelector('.features');
        var banner = document.querySelector('.banner');
        if (!features) return;

        var items = features.querySelectorAll('.feature_item');
        if (!items || items.length === 0) return;

        // IntersectionObserver for entrance trigger
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        features.classList.add('in-view');
                        // Remove transition on items after entrance so cursor tracking is instantaneous
                        setTimeout(function () {
                            items.forEach(function (item) {
                                item.style.transition = 'background 0.35s ease';
                            });
                        }, 1200);
                        observer.unobserve(features);
                    }
                });
            }, { threshold: 0.15 });

            observer.observe(features);
        } else {
            features.classList.add('in-view');
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Card tracking physics states for each feature item
        var itemStates = [];
        items.forEach(function () {
            itemStates.push({
                targetX: 0,
                targetY: 0,
                currX: 0,
                currY: 0
            });
        });

        var sectionPeek = { targetY: 0, currY: 0 };
        var isCursorActive = false;
        var rafSectionId = null;

        function lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        function renderSection() {
            var ease = 0.08;

            // Section peek animation
            sectionPeek.currY = lerp(sectionPeek.currY, sectionPeek.targetY, ease);
            features.style.transform = 'translate3d(0, ' + sectionPeek.currY.toFixed(2) + 'px, 0)';

            // Wave motion across each feature item as cursor moves
            items.forEach(function (item, idx) {
                var s = itemStates[idx];
                s.currX = lerp(s.currX, s.targetX, ease);
                s.currY = lerp(s.currY, s.targetY, ease);

                item.style.transform = 'translate3d(' + s.currX.toFixed(2) + 'px, ' + s.currY.toFixed(2) + 'px, 0)';
            });

            // Check if settled
            var maxDelta = Math.abs(sectionPeek.currY - sectionPeek.targetY);
            items.forEach(function (item, idx) {
                maxDelta += Math.abs(itemStates[idx].currX - itemStates[idx].targetX);
            });

            if (!isCursorActive && maxDelta < 0.005) {
                rafSectionId = null;
                return;
            }

            rafSectionId = requestAnimationFrame(renderSection);
        }

        function wakeSection() {
            if (!rafSectionId) {
                rafSectionId = requestAnimationFrame(renderSection);
            }
        }

        // Global Cursor Motion Reaction (Spylt Style)
        window.addEventListener('mousemove', function (e) {
            isCursorActive = true;
            wakeSection();

            var winW = window.innerWidth;
            var winH = window.innerHeight;
            var normX = (e.clientX / winW - 0.5) * 2; // -1 to 1
            var normY = (e.clientY / winH - 0.5) * 2; // -1 to 1

            // Multipliers creating an accordion wave motion across the 4 cards
            var xFactors = [14, 7, -7, -14];
            var yFactors = [10, 12, 12, 10];

            items.forEach(function (item, idx) {
                itemStates[idx].targetX = normX * xFactors[idx];
                itemStates[idx].targetY = normY * yFactors[idx];
            });

            // Check if cursor is hovering near bottom of banner or inside features
            if (banner) {
                var bRect = banner.getBoundingClientRect();
                if (e.clientY > bRect.top + bRect.height * 0.65 && e.clientY < bRect.bottom + 150) {
                    // Peek next section up as cursor reaches toward it
                    var proximity = Math.min(1, Math.max(0, (e.clientY - (bRect.top + bRect.height * 0.65)) / (bRect.height * 0.35)));
                    sectionPeek.targetY = -14 * proximity;
                } else {
                    sectionPeek.targetY = 0;
                }
            }
        }, { passive: true });

        window.addEventListener('mouseleave', function () {
            isCursorActive = false;
            wakeSection();

            sectionPeek.targetY = 0;
            items.forEach(function (item, idx) {
                itemStates[idx].targetX = 0;
                itemStates[idx].targetY = 0;
            });
        });

        // Spylt-Style Scroll Parallax Sheet Reveal
        window.addEventListener('scroll', function () {
            if (!banner) return;
            var scrollY = window.pageYOffset || document.documentElement.scrollTop;
            var bannerH = banner.offsetHeight;

            if (scrollY <= bannerH) {
                var progress = scrollY / bannerH;
                var bannerScale = Math.max(0.95, 1 - progress * 0.05);
                var bannerShift = progress * 25;
                banner.style.transform = 'scale(' + bannerScale.toFixed(3) + ') translateY(' + bannerShift.toFixed(1) + 'px)';
                banner.style.borderRadius = (progress * 24).toFixed(1) + 'px';
            } else {
                banner.style.transform = 'scale(0.95) translateY(25px)';
            }
        }, { passive: true });
    }

    // ========================================================
    // 4. Choose Section: Mouse Scroll Reveal & Interactive Cursor Physics
    //    Inspired by Spylt, Cuberto & Kafe
    // ========================================================
    function initChooseSection() {
        var chooseSection = document.getElementById('chooseSection');
        if (!chooseSection) return;

        var cards = chooseSection.querySelectorAll('.choose_card');
        var buttons = chooseSection.querySelectorAll('.choose_btn');
        if (!cards || cards.length === 0) return;

        var hasEntered = false;

        // 1. Scroll-driven Entrance Reveal
        if ('IntersectionObserver' in window) {
            var scrollObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        chooseSection.classList.add('in-view');
                        // After entrance finishes (~1.3s), switch cards from CSS transitions
                        // to high-performance RAF lerp transforms for butter-smooth cursor tracking
                        setTimeout(function () {
                            hasEntered = true;
                            cards.forEach(function (card) {
                                card.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
                            });
                        }, 1350);
                        scrollObserver.unobserve(chooseSection);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

            scrollObserver.observe(chooseSection);
        } else {
            chooseSection.classList.add('in-view');
            hasEntered = true;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // 2. Physics States for Cards & Product Images
        // Card 1 (PawMedal Tag), Card 2 (PawMedal Finder - Featured), Card 3 (PawMedal Bundle)
        var cardStates = [];
        var imgWraps = [];

        cards.forEach(function (card) {
            var imgWrap = card.querySelector('.card_img_wrap');
            imgWraps.push(imgWrap);

            cardStates.push({
                currX: 0,
                targetX: 0,
                currY: 0,
                targetY: 0,
                currRotX: 0,
                targetRotX: 0,
                currRotY: 0,
                targetRotY: 0,
                currRotZ: 0,
                targetRotZ: 0,
                currScale: 1,
                targetScale: 1,

                // Inner image micro-parallax
                imgCurrX: 0,
                imgTargetX: 0,
                imgCurrY: 0,
                imgTargetY: 0
            });
        });

        var isCursorActive = false;
        var rafChooseId = null;

        function lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        function renderChoose() {
            if (!hasEntered) {
                rafChooseId = requestAnimationFrame(renderChoose);
                return;
            }

            var ease = 0.08;
            var maxDelta = 0;

            cards.forEach(function (card, idx) {
                var s = cardStates[idx];
                var imgWrap = imgWraps[idx];

                s.currX = lerp(s.currX, s.targetX, ease);
                s.currY = lerp(s.currY, s.targetY, ease);
                s.currRotX = lerp(s.currRotX, s.targetRotX, ease);
                s.currRotY = lerp(s.currRotY, s.targetRotY, ease);
                s.currRotZ = lerp(s.currRotZ, s.targetRotZ, ease);
                s.currScale = lerp(s.currScale, s.targetScale, ease);

                s.imgCurrX = lerp(s.imgCurrX, s.imgTargetX, ease);
                s.imgCurrY = lerp(s.imgCurrY, s.imgTargetY, ease);

                // Apply 3D spatial transform to card
                card.style.transform = 'perspective(1100px) translate3d(' +
                    s.currX.toFixed(2) + 'px, ' +
                    s.currY.toFixed(2) + 'px, 0) ' +
                    'rotateX(' + s.currRotX.toFixed(2) + 'deg) ' +
                    'rotateY(' + s.currRotY.toFixed(2) + 'deg) ' +
                    'rotateZ(' + s.currRotZ.toFixed(2) + 'deg) ' +
                    'scale(' + s.currScale.toFixed(3) + ')';

                // Apply micro-parallax to inner image
                if (imgWrap) {
                    imgWrap.style.transform = 'translate3d(' +
                        s.imgCurrX.toFixed(2) + 'px, ' +
                        s.imgCurrY.toFixed(2) + 'px, 0)';
                }

                maxDelta += Math.abs(s.currX - s.targetX) +
                    Math.abs(s.currY - s.targetY) +
                    Math.abs(s.currRotX - s.targetRotX) +
                    Math.abs(s.currRotY - s.targetRotY);
            });

            if (!isCursorActive && maxDelta < 0.005) {
                rafChooseId = null;
                return;
            }

            rafChooseId = requestAnimationFrame(renderChoose);
        }

        function wakeChoose() {
            if (!rafChooseId) {
                rafChooseId = requestAnimationFrame(renderChoose);
            }
        }

        // 3. Mouse Movement - Multi-Card Wave & 3D Spatial Tilt (Spylt & Cuberto style)
        window.addEventListener('mousemove', function (e) {
            isCursorActive = true;
            wakeChoose();

            var winW = window.innerWidth;
            var winH = window.innerHeight;
            var normX = (e.clientX / winW - 0.5) * 2; // -1 to 1
            var normY = (e.clientY / winH - 0.5) * 2; // -1 to 1

            // Proximity scaling
            var secRect = chooseSection.getBoundingClientRect();
            var isNearSection = (
                e.clientY >= secRect.top - 140 &&
                e.clientY <= secRect.bottom + 140
            );

            var intensity = isNearSection ? 1.0 : 0.4;

            if (cardStates[0]) {
                // Card 1 (Left: PawMedal Tag) - subtle tilt outward to the left
                cardStates[0].targetX = normX * 14 * intensity;
                cardStates[0].targetY = normY * 9 * intensity;
                cardStates[0].targetRotY = normX * 3.5 * intensity;
                cardStates[0].targetRotX = -normY * 2.8 * intensity;
                cardStates[0].targetRotZ = normX * 0.9 * intensity;
                cardStates[0].imgTargetX = -normX * 8 * intensity;
                cardStates[0].imgTargetY = -normY * 6 * intensity;
            }

            if (cardStates[1]) {
                // Card 2 (Center: PawMedal Finder - Featured) - elevated floating prominence
                cardStates[1].targetX = normX * 6 * intensity;
                cardStates[1].targetY = (normY * 11 - 6) * intensity;
                cardStates[1].targetRotY = normX * 1.8 * intensity;
                cardStates[1].targetRotX = -normY * 2.2 * intensity;
                cardStates[1].targetRotZ = 0;
                cardStates[1].imgTargetX = -normX * 6 * intensity;
                cardStates[1].imgTargetY = -normY * 8 * intensity;
            }

            if (cardStates[2]) {
                // Card 3 (Right: PawMedal Bundle) - subtle tilt outward to the right
                cardStates[2].targetX = normX * 14 * intensity;
                cardStates[2].targetY = normY * 9 * intensity;
                cardStates[2].targetRotY = normX * 3.5 * intensity;
                cardStates[2].targetRotX = -normY * 2.8 * intensity;
                cardStates[2].targetRotZ = -normX * 0.9 * intensity;
                cardStates[2].imgTargetX = -normX * 8 * intensity;
                cardStates[2].imgTargetY = -normY * 6 * intensity;
            }
        }, { passive: true });

        // Mouse Leave Window - Reset to Rest Position
        window.addEventListener('mouseleave', function () {
            isCursorActive = false;
            wakeChoose();

            cardStates.forEach(function (s) {
                s.targetX = 0;
                s.targetY = 0;
                s.targetRotX = 0;
                s.targetRotY = 0;
                s.targetRotZ = 0;
                s.targetScale = 1;
                s.imgTargetX = 0;
                s.imgTargetY = 0;
            });
        });

        // 4. Card Hover Spotlight & Specular Glare (Kafe inspiration)
        cards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', x + 'px');
                card.style.setProperty('--mouse-y', y + 'px');
            }, { passive: true });
        });

        // 5. Cuberto-Style Magnetic Buttons with Elastic Arrow Movement
        buttons.forEach(function (btn) {
            var arrow = btn.querySelector('i');

            btn.addEventListener('mousemove', function (e) {
                var rect = btn.getBoundingClientRect();
                var relX = e.clientX - rect.left - rect.width / 2;
                var relY = e.clientY - rect.top - rect.height / 2;

                // Magnetic attraction on button body
                btn.style.transform = 'translate(' + (relX * 0.22).toFixed(1) + 'px, ' + (relY * 0.22).toFixed(1) + 'px)';

                // Enhanced travel on arrow icon
                if (arrow) {
                    arrow.style.transform = 'translate(' + (relX * 0.15 + 4).toFixed(1) + 'px, ' + (relY * 0.12).toFixed(1) + 'px)';
                }
            });

            btn.addEventListener('mouseleave', function () {
                btn.style.transform = 'translate(0px, 0px)';
                if (arrow) {
                    arrow.style.transform = 'translate(0px, 0px)';
                }
            });
        });

        // 6. Smooth Mouse Scroll Depth Parallax
        window.addEventListener('scroll', function () {
            if (!chooseSection) return;
            var secRect = chooseSection.getBoundingClientRect();
            var winH = window.innerHeight;

            if (secRect.top < winH && secRect.bottom > 0) {
                var progress = (winH - secRect.top) / (winH + secRect.height);
                var shiftCenter = (progress - 0.5) * -16;
                if (hasEntered && cardStates[1]) {
                    cardStates[1].targetY = shiftCenter;
                    wakeChoose();
                }
            }
        }, { passive: true });
    }

    // ========================================================
    // 5. Top Bar Close Handler
    // ========================================================
    function initTopBarClose() {
        var topBarClose = document.getElementById('topBarClose');
        var topBar = document.getElementById('topBar');
        if (topBarClose && topBar) {
            topBarClose.addEventListener('click', function () {
                topBar.style.transition = 'all 0.4s ease';
                topBar.style.height = '0px';
                topBar.style.padding = '0px';
                topBar.style.opacity = '0';
                topBar.style.overflow = 'hidden';
            });
        }
    }

    // ========================================================
    // 5. Back To Top Handler
    // ========================================================
    function initBackToTop() {
        var btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', function () {
            if ((window.pageYOffset || document.documentElement.scrollTop) > 300) {
                btn.classList.add('show');
            } else {
                btn.classList.remove('show');
            }
        }, { passive: true });

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
