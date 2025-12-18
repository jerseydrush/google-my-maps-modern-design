document.addEventListener('DOMContentLoaded', function () {
    const refreshBtn = document.getElementById('refreshStyles');
    const status = document.getElementById('status');
    const pageInfo = document.getElementById('pageInfo');

    if (githubLink) {
        githubLink.addEventListener('click', function (e) {
            e.preventDefault();
            chrome.tabs.create({
                url: 'https://github.com/Bubliktgg/google-my-maps-modern-design'
            });
        });
    }

    loadPageInfo();

    refreshBtn.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (!tabs || !tabs[0]) {
                showStatus('❌ Не удалось найти активную вкладку', 'error');
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, {
                action: "applyStyles"
            }, function (response) {
                if (chrome.runtime.lastError) {
                    showStatus('❌ Ошибка: ' + chrome.runtime.lastError.message, 'error');
                    return;
                }

                if (response && response.success) {
                    showStatus(`✅ ${response.message}`, 'success');
                    loadPageInfo();
                } else {
                    showStatus('❌ Ошибка применения стилей', 'error');
                }
            });
        });
    });

    function loadPageInfo() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (!tabs || !tabs[0]) {
                pageInfo.textContent = 'Информация о странице недоступна';
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, {
                action: "getPageInfo"
            }, function (response) {
                if (chrome.runtime.lastError) {
                    pageInfo.textContent = 'Расширение не активировано на этой странице';
                    return;
                }

                if (response) {
                    const pageTypeText = response.pageType === 'viewer' ? 'просмотра' :
                        response.pageType === 'edit' ? 'редактирования' : 'неизвестная';
                    pageInfo.textContent = `Текущая страница: ${pageTypeText}`;
                } else {
                    pageInfo.textContent = 'Информация о странице недоступна';
                }
            });
        });
    }

    function showStatus(message, type = 'success') {
        if (!status) return;

        status.textContent = message;
        status.className = `status show ${type === 'error' ? 'error' : ''}`;

        setTimeout(() => {
            status.classList.remove('show');
        }, 3000);
    }
});