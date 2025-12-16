(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function a(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(e){if(e.ep)return;e.ep=!0;const s=a(e);fetch(e.href,s)}})();function r(){const t=document.querySelector("#app");t&&(t.innerHTML=`
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
  `)}r();
