import './style.css';

export function renderContactPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  // Content from contact.html
  app.innerHTML = `
        <header class="header contact-header">
            <a href="#/" class="back-btn">
                <i class="fa-solid fa-right-from-bracket"></i>
            </a>
            <h1>119番通報画面</h1>
        </header>

        <main class="main-content contact-main">
            <div class="content-area">
                <button class="emergency-call-btn">
                    <i class="fa-solid fa-phone-volume"></i>
                    <span>119番通報</span>
                </button>
                <p class="instruction-text">
                    周囲の状況を確認し、落ち着いて通報してください。
                </p>
            </div>

            <div class="current-location-bar">
                <div class="location-info">
                    <p class="location-label">現在位置</p>
                    <p class="address-text">埼玉県さいたま市大宮区仲町3丁目100-2付近です。</p>
                </div>
            </div>
            <div class="map-container"></div>
        </main>

        <footer class="footer-actions">
            <button class="action-btn">
                <i class="fa-solid fa-phone-volume"></i>
                <span>救急連絡</span>
            </button>
            <button class="action-btn">
                <i class="fa-solid fa-kit-medical"></i>
                <span>応急処置</span>
            </button>
        </footer>
  `;
}

renderContactPage();
