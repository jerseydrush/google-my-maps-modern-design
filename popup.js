document.addEventListener('DOMContentLoaded', function () {
    const refreshBtn = document.getElementById('refreshStyles');
    const status = document.getElementById('status');
    const pageInfo = document.getElementById('pageInfo');
    const featuresTitle = document.getElementById('featuresTitle');
    const featuresList = document.getElementById('featuresList');
    const refreshText = document.getElementById('refreshText');
    const langButtons = document.querySelectorAll('.lang-btn');
    const langIndicator = document.getElementById('langIndicator');
    const githubLink = document.getElementById('githubLink');

    // Тексты для разных языков
    const translations = {
        en: {
            title: "🎨 My Maps Modern Design",
            loading: "Loading page information...",
            unknownPage: "Page information unavailable",
            notActivated: "Extension not activated on this page",
            notMyMaps: "❌ This is not a Google My Maps page",
            pageTypes: {
                'viewer': 'view',
                'edit': 'edit',
                'main': 'main (maps list)'
            },
            featuresTitle: "Applied improvements:",
            features: [
                "<strong>Updated windows:</strong> Added rounding, improved design",
                "<strong>Modern shadows:</strong> Depth and volume",
                "<strong>Smooth animations:</strong> Hover effects",
                "<strong>Improved panels:</strong> Search, tools, zoom and others",
                "<strong>Block design:</strong> Stylish blocks"
            ],
            refreshText: "Refresh styles",
            statusMessages: {
                success: "✅ Styles applied successfully",
                contentSuccess: "Styles reloaded successfully",
                error: "❌ Failed to apply styles. Reload the page.",
                noTab: "❌ Could not find active tab",
                injectSuccess: "✅ Styles injected and applied",
                wrongPage: "❌ This is not a Google My Maps page"
            }
        },
        ru: {
            title: "🎨 My Maps Modern Design",
            loading: "Загрузка информации о странице...",
            unknownPage: "Информация о странице недоступна",
            notActivated: "Расширение не активировано на этой странице",
            notMyMaps: "❌ Это не страница Google My Maps",
            pageTypes: {
                'viewer': 'просмотра',
                'edit': 'редактирования',
                'main': 'главная (список карт)'
            },
            featuresTitle: "Применённые улучшения:",
            features: [
                "<strong>Обновление окон:</strong> Добавлены скругления, улучшен дизайн",
                "<strong>Современные тени:</strong> Глубина и объём",
                "<strong>Плавные анимации:</strong> Эффекты при наведении",
                "<strong>Улучшенные панели:</strong> Поиск, инструменты, зум и другие",
                "<strong>Блочный дизайн:</strong> Стильные блоки"
            ],
            refreshText: "Обновить стили",
            statusMessages: {
                success: "✅ Стили успешно применены",
                contentSuccess: "Стили перезагружены успешно",
                error: "❌ Не удалось применить стили. Перезагрузите страницу.",
                noTab: "❌ Не удалось найти активную вкладку",
                injectSuccess: "✅ Стили успешно применены",
                wrongPage: "❌ Это не страница Google My Maps"
            }
        }
    };

    // Текущий язык
    let currentLang = 'en';

    // Проверка, является ли страница Google My Maps
    function isGoogleMyMapsUrl(url) {
        if (!url) return false;

        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();

            // Основные проверяемые домены
            const supportedDomains = [
                'www.google.com',
                'www.google.com.ua',
                'www.google.co.uk',
                'www.google.com.tr',
                'www.google.de',
                'www.google.fr',
                'www.google.pl',
                'www.google.ru'
            ];

            // Проверяем точное совпадение с поддерживаемыми доменами
            // ИЛИ проверяем по регулярному выражению для других доменов Google
            const isGoogleDomain = supportedDomains.includes(hostname) ||
                /^www\.google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(hostname);

            // Проверяем путь на соответствие Google My Maps
            return isGoogleDomain && urlObj.pathname.startsWith('/maps/d/');
        } catch (e) {
            return false;
        }
    }

    // Инициализация языка
    async function initLanguage() {
        try {
            // Пытаемся получить сохраненный язык из localStorage
            const result = await new Promise(resolve => {
                chrome.storage.local.get(['language'], resolve);
            });

            if (result.language && (result.language === 'en' || result.language === 'ru')) {
                currentLang = result.language;
            } else {
                // По умолчанию английский
                currentLang = 'en';
                await new Promise(resolve => {
                    chrome.storage.local.set({ language: 'en' }, resolve);
                });
            }

            updateLanguageUI();
            applyTranslations();

            // Только ПОСЛЕ применения переводов загружаем информацию о странице
            await loadPageInfo();

        } catch (error) {
            console.error('Language initialization error:', error);
            // В случае ошибки используем английский по умолчанию
            currentLang = 'en';
            applyTranslations();
            loadPageInfo();
        }
    }

    // Обновление UI переключателя языка
    function updateLanguageUI() {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });

        // Позиционируем индикатор
        const activeBtn = document.querySelector(`.lang-btn[data-lang="${currentLang}"]`);
        if (activeBtn && langIndicator) {
            const btnWidth = activeBtn.offsetWidth;
            const btnOffset = activeBtn.offsetLeft;
            langIndicator.style.width = `${btnWidth}px`;
            langIndicator.style.transform = `translateX(${btnOffset}px)`;
        }
    }

    // Применение переводов
    function applyTranslations() {
        const t = translations[currentLang];

        // Обновляем тексты
        document.querySelector('h3').textContent = t.title;
        pageInfo.textContent = t.loading;
        featuresTitle.textContent = t.featuresTitle;
        refreshText.textContent = t.refreshText;

        // Обновляем список улучшений
        featuresList.innerHTML = t.features.map(feature => `<li>${feature}</li>`).join('');

        // Обновляем ссылку GitHub в зависимости от языка
        if (githubLink) {
            githubLink.textContent = currentLang === 'en' ? 'GitHub' : 'GitHub';
        }
    }

    // Обработчик переключения языка
    langButtons.forEach(btn => {
        btn.addEventListener('click', async function () {
            const newLang = this.dataset.lang;
            if (newLang !== currentLang) {
                currentLang = newLang;

                // Сохраняем язык
                await new Promise(resolve => {
                    chrome.storage.local.set({ language: currentLang }, resolve);
                });

                updateLanguageUI();
                applyTranslations();

                // Обновляем информацию о странице при смене языка
                await loadPageInfo();
            }
        });
    });

    // Обработчик клика по ссылке GitHub (открываем в новой вкладке)
    if (githubLink) {
        githubLink.addEventListener('click', function (e) {
            // target="_blank" уже есть в HTML, но на всякий случай
            this.target = '_blank';
        });
    }

    refreshBtn.addEventListener('click', async function () {
        const t = translations[currentLang];
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tabs || !tabs[0]) {
            showStatus(t.statusMessages.noTab, 'error');
            return;
        }

        const currentUrl = tabs[0].url;

        // Проверяем, что это страница Google My Maps
        if (!isGoogleMyMapsUrl(currentUrl)) {
            showStatus(t.statusMessages.wrongPage, 'error');
            pageInfo.textContent = t.notMyMaps;
            return;
        }

        try {
            // Попробуем сначала отправить сообщение (если content script уже загружен)
            const response = await chrome.tabs.sendMessage(tabs[0].id, {
                action: "applyStyles"
            });

            if (response && response.success) {
                // Используем правильное сообщение в зависимости от языка
                const successMessage = t.statusMessages.contentSuccess;
                showStatus(`✅ ${successMessage}`, 'success');
                await loadPageInfo();
            } else {
                showStatus(t.statusMessages.error, 'error');
            }

        } catch (error) {
            // Если content script не загружен, выполняем его принудительно
            console.log('Content script not loaded, injecting...');

            // Двойная проверка перед инъекцией
            if (!isGoogleMyMapsUrl(currentUrl)) {
                showStatus(t.statusMessages.wrongPage, 'error');
                return;
            }

            try {
                // Внедряем стили и скрипт
                await injectStylesAndScript(tabs[0].id);
                showStatus(t.statusMessages.injectSuccess, 'success');
                await loadPageInfo();
            } catch (injectError) {
                console.error('Injection error:', injectError);
                showStatus(t.statusMessages.error, 'error');
            }
        }
    });

    async function injectStylesAndScript(tabId) {
        // Внедряем CSS
        await chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: ['styles.css']
        });

        // Внедряем JS
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });

        // Даем время на выполнение
        await new Promise(resolve => setTimeout(resolve, 500));

        // Отправляем сообщение о применении стилей
        return chrome.tabs.sendMessage(tabId, { action: "applyStyles" });
    }

    async function loadPageInfo() {
        const t = translations[currentLang];
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tabs || !tabs[0]) {
            pageInfo.textContent = t.unknownPage;
            return;
        }

        const currentUrl = tabs[0].url;

        // Проверяем, что это страница Google My Maps
        if (!isGoogleMyMapsUrl(currentUrl)) {
            pageInfo.textContent = t.notMyMaps;
            return;
        }

        try {
            const response = await chrome.tabs.sendMessage(tabs[0].id, {
                action: "getPageInfo"
            });

            if (response) {
                const pageTypeText = t.pageTypes[response.pageType] || 'unknown';
                pageInfo.textContent = currentLang === 'en'
                    ? `Current page: ${pageTypeText}`
                    : `Текущая страница: ${pageTypeText}`;
            } else {
                pageInfo.textContent = t.unknownPage;
            }
        } catch (error) {
            pageInfo.textContent = t.notActivated;
        }
    }

    function showStatus(message, type = 'success') {
        if (!status) return;

        status.textContent = message;
        status.className = `status show ${type === 'error' ? 'error' : ''}`;

        setTimeout(() => {
            status.classList.remove('show');
        }, 3000);
    }

    // Инициализируем язык при загрузке
    initLanguage();
});