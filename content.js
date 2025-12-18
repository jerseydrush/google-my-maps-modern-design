// content.js

// ===== УСТАНОВКА ЛОГОТИПА =====
function setPatakaLogo() {
    // Создаем стиль с переменной
    const style = document.createElement('style');
    style.id = 'pataka-logo-style';
    style.textContent = `
        :root {
            --pataka-logo: url(${PATAKA_BASE64}) !important;
        }
    `;
    document.head.appendChild(style);
}

// Устанавливаем логотип
setPatakaLogo();

// Функции определения типа страницы
function getPageType() {
    const url = window.location.href;
    if (url.includes('/viewer?')) return 'viewer';
    if (url.includes('/edit?')) return 'edit';
    return 'other';
}

// Функции для стилизации чекбоксов
function styleCheckboxesSafely() {
    try {
        const allCheckboxes = document.querySelectorAll('.HzV7m-pbTTYe-PGTmtf.N2RpBe');
        if (!allCheckboxes.length) return;

        allCheckboxes.forEach(checkbox => {
            if (checkbox?.style) {
                checkbox.style.borderColor = '#cccccc';
                checkbox.style.transition = 'border-color 0.2s ease';
            }
        });

        let checkedCheckboxes = [];

        try {
            const ariaChecked = document.querySelectorAll('.HzV7m-pbTTYe-PGTmtf.N2RpBe[aria-checked="true"]');
            if (ariaChecked?.length) checkedCheckboxes = Array.from(ariaChecked);
        } catch (e) { }

        allCheckboxes.forEach(checkbox => {
            if (checkbox && !checkedCheckboxes.includes(checkbox)) {
                const isChecked = checkbox.getAttribute('aria-checked') === 'true' ||
                    checkbox.classList.contains('N2RpBe-HzV7m-Aql3ge') ||
                    checkbox.getAttribute('data-checked') === 'true';

                if (isChecked && !checkedCheckboxes.includes(checkbox)) {
                    checkedCheckboxes.push(checkbox);
                }
            }
        });

        checkedCheckboxes.forEach(checkbox => {
            if (checkbox?.style) {
                checkbox.style.borderColor = '#7a7a7a';
                const innerCheck = checkbox.querySelector('.PkgjBf');
                if (innerCheck?.style) {
                    innerCheck.style.backgroundColor = '#7a7a7a';
                    innerCheck.style.transition = 'background-color 0.2s ease';
                }
            }
        });

    } catch (error) { }
}

// Функции для слайдеров
function enhanceSlidersWithProgress() {
    const sliders = document.querySelectorAll('.VIpgJd-SxecR');

    sliders.forEach(slider => {
        if (slider.classList.contains('enhanced-slider')) return;
        slider.classList.add('enhanced-slider');

        const sliderId = slider.id;
        const currentValue = parseInt(slider.getAttribute('aria-valuenow') || '0');
        const maxValue = parseInt(slider.getAttribute('aria-valuemax') || '100');
        const minValue = parseInt(slider.getAttribute('aria-valuemin') || '0');

        let step = 1;
        let unit = '%';
        let displayDivider = 1;

        if (sliderId === 'stylepopup-borderwidth') {
            step = 100;
            unit = 'px';
            displayDivider = 100;
        } else if (sliderId === 'stylepopup-linewidth') {
            step = 1000;
            unit = 'px';
            displayDivider = 1000;
        }

        const progress = maxValue > minValue ? ((currentValue - minValue) / (maxValue - minValue)) * 100 : 0;
        slider.style.setProperty('--slider-progress', `${progress}%`);

        const track = slider.querySelector('.VIpgJd-SxecR-skjTt');
        if (track) {
            const oldBar = track.querySelector('.slider-progress');
            if (oldBar) oldBar.remove();

            const progressBar = document.createElement('div');
            progressBar.className = 'slider-progress';
            progressBar.style.cssText = `
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                background: linear-gradient(90deg, #848484ff, #5f5f5fff);
                border-radius: 2px;
                width: ${progress}%;
                transition: width 0.15s ease;
                z-index: 1;
            `;
            track.appendChild(progressBar);
        }

        const handle = slider.querySelector('.VIpgJd-SxecR-PFprWc');
        if (handle) {
            handle.style.left = `${progress}%`;

            const oldDisplay = handle.querySelector('.slider-value');
            if (oldDisplay) oldDisplay.remove();

            const valueDisplay = document.createElement('div');
            valueDisplay.className = 'slider-value';

            let displayText;
            if (sliderId === 'stylepopup-borderwidth' || sliderId === 'stylepopup-linewidth') {
                const pixels = currentValue / displayDivider;
                displayText = `${Math.round(pixels)} ${unit}`;
            } else {
                displayText = `${currentValue}%`;
            }

            valueDisplay.textContent = displayText;
            handle.appendChild(valueDisplay);

            handle.addEventListener('mouseenter', () => valueDisplay.style.opacity = '1');
            handle.addEventListener('mouseleave', () => valueDisplay.style.opacity = '0');
            slider.addEventListener('focus', () => valueDisplay.style.opacity = '1');
            slider.addEventListener('blur', () => valueDisplay.style.opacity = '0');

            if (sliderId === 'stylepopup-borderwidth' || sliderId === 'stylepopup-linewidth') {
                let isDragging = false;

                const updatePosition = (clientX) => {
                    const rect = slider.getBoundingClientRect();
                    const x = clientX - rect.left;
                    const width = rect.width;
                    let position = Math.max(0, Math.min(1, x / width));

                    const totalSteps = Math.floor((maxValue - minValue) / step);
                    const stepPosition = Math.round(position * totalSteps);
                    const steppedValue = minValue + (stepPosition * step);
                    const finalValue = Math.max(minValue, Math.min(maxValue, steppedValue));

                    slider.setAttribute('aria-valuenow', finalValue);
                    const newProgress = ((finalValue - minValue) / (maxValue - minValue)) * 100;
                    handle.style.left = `${newProgress}%`;

                    slider.dispatchEvent(new Event('input', { bubbles: true }));
                    slider.dispatchEvent(new Event('change', { bubbles: true }));
                };

                handle.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    updatePosition(e.clientX);
                    e.preventDefault();
                });

                document.addEventListener('mousemove', (e) => {
                    if (isDragging) updatePosition(e.clientX);
                });

                document.addEventListener('mouseup', () => isDragging = false);
            }
        }

        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === 'aria-valuenow') {
                    const newValue = parseInt(slider.getAttribute('aria-valuenow'));
                    const newProgress = maxValue > minValue ? ((newValue - minValue) / (maxValue - minValue)) * 100 : 0;

                    slider.style.setProperty('--slider-progress', `${newProgress}%`);

                    const progressBar = track?.querySelector('.slider-progress');
                    if (progressBar) progressBar.style.width = `${newProgress}%`;

                    if (handle) handle.style.left = `${newProgress}%`;

                    const valueDisplay = handle?.querySelector('.slider-value');
                    if (valueDisplay) {
                        let displayText;
                        if (sliderId === 'stylepopup-borderwidth' || sliderId === 'stylepopup-linewidth') {
                            const pixels = newValue / (sliderId === 'stylepopup-borderwidth' ? 100 : 1000);
                            displayText = `${Math.round(pixels)} px`;
                        } else {
                            displayText = `${newValue}%`;
                        }

                        valueDisplay.textContent = displayText;

                        if (!slider.matches(':hover') && !slider.matches(':focus')) {
                            valueDisplay.style.opacity = '1';
                            setTimeout(() => {
                                if (!slider.matches(':hover') && !slider.matches(':focus')) {
                                    valueDisplay.style.opacity = '0';
                                }
                            }, 1000);
                        }
                    }
                }
            });
        });

        observer.observe(slider, {
            attributes: true,
            attributeFilter: ['aria-valuenow', 'style']
        });
    });
}

function initSliders() {
    enhanceSlidersWithProgress();
    setTimeout(enhanceSlidersWithProgress, 100);
    setTimeout(enhanceSlidersWithProgress, 500);
}

const sliderObserver = new MutationObserver(() => {
    if (document.querySelector('.VIpgJd-SxecR:not(.enhanced-slider)')) {
        enhanceSlidersWithProgress();
    }
});

if (document.body) {
    sliderObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Функции стилизации страниц
function applyViewerStyles() {
    console.log('Применяем стили для страницы просмотра');

    const headerElements = document.querySelectorAll('.HzV7m-tJHJj, .HzV7m-tJHJj .i4ewOd-r4nke');
    headerElements.forEach(element => {
        if (element?.style) element.style.backgroundColor = '#7a7a7a';
    });

    styleCheckboxesSafely();

    const infoBlocks = document.querySelectorAll('.mU4ghb-X9G3K-tJHJj');
    infoBlocks.forEach(block => {
        if (block?.style) {
            block.style.margin = '12px';
            block.style.padding = '16px 20px';
            block.style.borderRadius = '12px';
            block.style.border = '1px solid #e0e0e0';
            block.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            block.style.backgroundColor = '#ffffff';
        }
    });

    const editButtons = document.querySelectorAll('.b0t70b-haAclf');
    editButtons.forEach(button => {
        if (button?.style) {
            button.style.borderRadius = '10px';
            button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        }
    });

    const ksElements = document.querySelectorAll('div.XKSfm-Sx9Kwc');
    ksElements.forEach(element => {
        if (element?.style) {
            element.style.borderRadius = '10px';
            element.style.overflow = 'hidden';
            element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            element.style.border = '1px solid #e0e0e0';
        }
    });
}

function applyEditStyles() {
    console.log('Применяем стили для страницы редактирования');

    const ksElements = document.querySelectorAll('div.XKSfm-Sx9Kwc');
    ksElements.forEach(element => {
        if (element?.style) {
            element.style.borderRadius = '10px';
            element.style.overflow = 'hidden';
            element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            element.style.border = '1px solid #e0e0e0';
        }
    });
}

function applyCommonStyles() {
    console.log('Применяем общие стили');

    const zoomControls = document.querySelectorAll('.nJjxad-bMcfAe-haAclf');
    zoomControls.forEach(control => {
        if (control?.style) control.style.borderRadius = '10px';
    });

    const zoomInButtons = document.querySelectorAll('.nJjxad-bEDTcc-LgbsSe');
    const zoomOutButtons = document.querySelectorAll('.nJjxad-m9bMae-LgbsSe');

    zoomInButtons.forEach(button => {
        if (button?.style) button.style.borderRadius = '10px 10px 0 0';
    });

    zoomOutButtons.forEach(button => {
        if (button?.style) button.style.borderRadius = '0 0 10px 10px';
    });
}

function applyAllStyles() {
    const pageType = getPageType();
    console.log(`My Maps Modern Design: применяем стили для страницы ${pageType}`);

    if (pageType === 'viewer') applyViewerStyles();
    if (pageType === 'edit') applyEditStyles();
    applyCommonStyles();
    initSliders();
}

function observeChanges() {
    try {
        const observer = new MutationObserver(function (mutations) {
            let shouldReapply = false;

            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function (node) {
                        if (node.nodeType === 1) {
                            const selectors = [
                                '.HzV7m-tJHJj',
                                '.nJjxad-bMcfAe-haAclf',
                                '.mU4ghb-X9G3K-tJHJj',
                                '.JPdR6b',
                                '.b0t70b-haAclf',
                                '.G0jgYd-ZMv3u',
                                '.VIpgJd-INgbqf',
                                '.nJjxad-bEDTcc-LgbsSe',
                                '.nJjxad-m9bMae-LgbsSe',
                                'div.XKSfm-Sx9Kwc'
                            ];

                            const hasTargetElement = selectors.some(selector =>
                                (node.querySelector && node.querySelector(selector)) ||
                                (node.classList && node.classList.contains(selector.replace('.', ''))) ||
                                (node.matches && node.matches(selector))
                            );

                            if (hasTargetElement) shouldReapply = true;
                        }
                    });
                }
            });

            if (shouldReapply) {
                console.log('Обнаружены изменения DOM, применяем стили...');
                setTimeout(applyAllStyles, 100);
                setTimeout(styleCheckboxesSafely, 150);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return observer;
    } catch (error) {
        console.error('Ошибка в observeChanges:', error);
        return null;
    }
}

function safeInit() {
    try {
        const pageType = getPageType();
        console.log(`My Maps Modern Design: начал работу (${pageType} страница)`);

        applyAllStyles();
        observeChanges();

        setTimeout(applyAllStyles, 2000);
        setTimeout(styleCheckboxesSafely, 2500);

    } catch (error) {
        console.error('Ошибка при инициализации:', error);
    }
}

function init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInit);
    } else {
        safeInit();
    }
}

init();

// Обработчики сообщений
try {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        try {
            if (request.action === "applyStyles") {
                applyAllStyles();
                styleCheckboxesSafely();
                sendResponse({
                    success: true,
                    pageType: getPageType(),
                    message: `Стили применены для ${getPageType()} страницы`
                });
            }

            if (request.action === "getPageInfo") {
                sendResponse({
                    pageType: getPageType(),
                    url: window.location.href
                });
            }
        } catch (error) {
            console.error('Ошибка в обработчике сообщений:', error);
            sendResponse({
                success: false,
                error: error.message
            });
        }
        return true;
    });
} catch (error) {
    console.error('Ошибка при подключении слушателя сообщений:', error);
}

if (typeof document !== 'undefined') {
    document.addEventListener('error', function (e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    }, true);
}