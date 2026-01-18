import"./modulepreload-polyfill-B5Qt9EMX.js";import{g as i}from"./mapTools-B90QuwtO.js";const s="contact-address-text";function r(){const t=document.querySelector("#app");t&&(t.innerHTML=`
        <header class="header contact-header">
            <h1>119番通報画面</h1>
        </header>

        <main class="main-content contact-main">
            <div class="content-area contact-call">
                <button class="emergency-call-btn" id="contact-call-button">
                    <i class="fa-solid fa-phone-volume"></i>
                    <span>119番通報</span>
                </button>
                <p class="instruction-text">
                    周囲の状況を確認し、落ち着いて通報してください。
                </p>
            </div>

            <div class="contact-location-bar">
                <div class="location-info">
                    <p class="label">現在地</p>
                    <p class="location-name" id="${s}">取得中…</p>
                </div>
            </div>

            <div class="info-section contact-info">
                <div class="info-row">
                    <h2>通報前の確認</h2>
                    <p class="supplement-text">
                        周囲の安全を確保し、必要であれば周囲の人に助けを求めてください。
                    </p>
                </div>
                <hr class="divider">
                <div class="info-row">
                    <h2>通報時のポイント</h2>
                    <p class="supplement-text">
                        落ち着いて場所・状況・意識や呼吸の有無を伝え、指示に従ってください。
                    </p>
                </div>
            </div>
        </main>

        <footer class="footer-actions">
        <button class="action-btn active" data-footer-action="call">
            <span class="iconify" data-icon="lucide:phone-call"></span>
            <span>救急連絡</span>
        </button>

        <button class="action-btn" data-footer-action="map">
            <span class="iconify" data-icon="material-symbols:map-outline-sharp"></span>
            <span>最短地図</span>
        </button>

        <button class="action-btn" data-footer-action="aid">
            <span class="iconify" data-icon="material-symbols:medical-services-outline-rounded"></span>
            <span>応急処置</span>
        </button>
        </footer>
    `)}r();l();async function l(){d(),await p()}function d(){[document.getElementById("contact-call-button"),document.querySelector('[data-footer-action="call"]')].forEach(e=>{e?.addEventListener("click",()=>{window.location.href="tel:119"})}),document.querySelector('[data-footer-action="aid"]')?.addEventListener("click",()=>{window.open("https://www.fdma.go.jp/mission/enrichment/appropriate/","_blank")}),document.querySelector('[data-footer-action="map"]')?.addEventListener("click",()=>{window.location.href="/aed-navigation"})}async function p(){o("現在地を取得しています…");try{const t=await i();await u(t)}catch(t){console.error("現在地取得エラー:",t),o("現在地を取得できませんでした。通信環境や位置情報設定をご確認ください。")}}async function u(t){try{const a=new URLSearchParams({format:"jsonv2",lat:String(t.latitude),lon:String(t.longitude),zoom:"18","accept-language":"ja"}),n=await fetch(`https://nominatim.openstreetmap.org/reverse?${a.toString()}`,{headers:{Accept:"application/json"}});if(!n.ok)throw new Error(`Reverse geocoding failed with status ${n.status}`);const c=(await n.json()).display_name;o(c||"住所情報を取得できませんでした。")}catch(a){console.error("住所取得エラー:",a),o("住所の取得に失敗しました。")}}function o(t){const a=document.getElementById(s);a&&(a.textContent=t)}
