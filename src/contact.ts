import './style.css';
import type { NowLocation } from './mapTools';
import { getNowLocation } from './mapTools';

const ADDRESS_ELEMENT_ID = 'contact-address-text';

export function renderContactPage(): void {
    const app = document.querySelector<HTMLDivElement>('#app');
    if (!app) return;

    app.innerHTML = `
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
                    <p class="location-name" id="${ADDRESS_ELEMENT_ID}">取得中…</p>
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
    `;
}

renderContactPage();
void initializeContactPage();

async function initializeContactPage(): Promise<void> {
    setupCallActions();
    await updateCurrentAddress();
}

function setupCallActions(): void {
    const callTargets = [
        document.getElementById('contact-call-button'),
        document.querySelector<HTMLButtonElement>('[data-footer-action="call"]'),
    ];

    callTargets.forEach((target) => {
        target?.addEventListener('click', () => {
            window.location.href = 'tel:119';
        });
    });

    const aidButton = document.querySelector<HTMLButtonElement>('[data-footer-action="aid"]');
    aidButton?.addEventListener('click', () => {
        window.open('https://www.fdma.go.jp/mission/enrichment/appropriate/', '_blank');
    });

    const homeButton = document.querySelector<HTMLButtonElement>('[data-footer-action="map"]');
    homeButton?.addEventListener('click', () => {
        window.location.href = `${import.meta.env.BASE_URL}`;
    });
}

async function updateCurrentAddress(): Promise<void> {
    setAddressText('現在地を取得しています…');

    try {
        const nowLocation = await getNowLocation();
        await setReverseGeocodedAddress(nowLocation);
    } catch (error) {
        console.error('現在地取得エラー:', error);
        setAddressText('現在地を取得できませんでした。通信環境や位置情報設定をご確認ください。');
    }
}

async function setReverseGeocodedAddress(nowLocation: NowLocation): Promise<void> {
    try {
        const params = new URLSearchParams({
            format: 'jsonv2',
            lat: String(nowLocation.latitude),
            lon: String(nowLocation.longitude),
            zoom: '18',
            'accept-language': 'ja',
        });

        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Reverse geocoding failed with status ${response.status}`);
        }

        const data: { display_name?: string } = await response.json();
        const displayName = data.display_name;
        setAddressText(displayName ? displayName : '住所情報を取得できませんでした。');
    } catch (error) {
        console.error('住所取得エラー:', error);
        setAddressText('住所の取得に失敗しました。');
    }
}

function setAddressText(text: string): void {
    const addressEl = document.getElementById(ADDRESS_ELEMENT_ID);
    if (addressEl) {
        addressEl.textContent = text;
    }
}
