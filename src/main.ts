import './style.css'
import { loadAEDDataFromCSV } from './csvLoader';
import { filterAvailableFacilities } from './filter';
import type { AEDFacility } from './filter';

function renderApp(): void {
  const app = document.querySelector<HTMLDivElement>('#app')
  const facilitiesPromise = loadAndFilterFacilities();
    facilitiesPromise.then(facilities => {
      console.log(`利用可能な施設の件数: ${facilities.length}`);
    });

  if (!app) return

  app.innerHTML = `
    <header class="header">
      <h1>さいたまIT・WEB専門学校までのルート</h1>
    </header>

    <main class="main-content">
      <div class="map-container">
        <button class="guidance-button">
          <div class="icon-circle">
            <i class="fa-solid fa-location-dot"></i>
          </div>
          <div class="text-box">
            <span class="main-text">リアルタイム案内</span>
            <span class="sub-text">を開始する</span>
          </div>
        </button>
      </div>

      <div class="next-location-bar">
        <div class="location-info">
          <p class="label">次に近い場所</p>
          <p class="dots">○○○○○○○○○○○○○○○○。</p>
        </div>
        <div class="refresh-icon">
          <i class="fa-solid fa-rotate"></i>
        </div>
      </div>

      <div class="info-section">
        <div class="info-row">
          <h2>利用可能時間</h2>
          <p class="time-text">朝9:00〜夜21:00</p>
        </div>
        <hr class="divider">
        <div class="info-row">
          <h2>補足</h2>
          <div class="supplement-text">
            <span>・月〜金使用可能</span>
            <span>・祝日使用不可</span><br>
            <span>・毎週土日使用不可</span>
          </div>
        </div>
      </div>
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
  `
}

async function loadAndFilterFacilities(): Promise<AEDFacility[]> {
  const facilities = await loadAEDDataFromCSV(`${import.meta.env.BASE_URL}/aed_data.csv`);
  const currentDate = new Date();
  const availableFacilities = filterAvailableFacilities(facilities, currentDate);
  return availableFacilities;
}

// アプリケーション起動
renderApp();
