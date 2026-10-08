import { test, expect } from '@playwright/experimental-ct-react';
import { CodePreviewFixture } from './fixtures/CodePreviewFixture';

test('representative existing lesson layouts still render in the sandboxed preview', async ({ mount }) => {
    const component = await mount(
        <div>
            <section id="box-model">
                <CodePreviewFixture
                    html={`<div class="waku"><p class="shirushi">おすすめ</p><h2>チョコドーナツ</h2><p>ふんわり生地にチョコがけ。</p><p class="nedan">180円</p></div>`}
                    css={`
                        .waku {
                            width: 300px;
                            height: 220px;
                            border: 2px solid #7a4b2a;
                            padding: 20px;
                            background-color: #fff7ed;
                        }
                        .shirushi {
                            border: 1px solid #c2410c;
                            padding: 4px;
                            background-color: #fed7aa;
                            color: #7c2d12;
                        }
                        .nedan {
                            border: 2px solid #c2410c;
                            padding: 8px;
                            background-color: #ffedd5;
                            color: #7c2d12;
                        }
                    `}
                    htmlVisible={false}
                    cssVisible={false}
                />
            </section>

            <section id="flexbox">
                <CodePreviewFixture
                    html={`<header class="head"><div class="logo">🛒 SHOP</div><nav class="navi"><a href="#">ホーム</a><a href="#">商品</a><a href="#">お問い合わせ</a></nav><div class="menu"><span>カート</span><span>ログイン</span></div></header>`}
                    css={`
                        body {
                            margin: 0;
                            font-family: sans-serif;
                        }
                        .head {
                            background: #1976d2;
                            color: #fff;
                            padding: 16px 24px;
                            display: flex;
                            justify-content: space-between;
                            gap: 16px;
                        }
                        .navi,
                        .menu {
                            display: flex;
                            gap: 20px;
                        }
                        .navi a {
                            color: #fff;
                            text-decoration: none;
                        }
                    `}
                    htmlVisible={false}
                    cssVisible={false}
                />
            </section>

            <section id="positioning">
                <CodePreviewFixture
                    html={`<header class="header"><span>📰 NEWS SITE</span></header><main style="padding-top: 72px"><article class="news-card"><span class="badge">NEW</span><h2>新製品が発表されました</h2></article></main>`}
                    css={`
                        body {
                            margin: 0;
                            font-family: sans-serif;
                        }
                        .header {
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 56px;
                            background: #1976d2;
                            color: #fff;
                            display: flex;
                            align-items: center;
                            padding: 0 16px;
                            z-index: 100;
                        }
                        .news-card {
                            position: relative;
                            margin: 16px;
                            padding: 32px;
                            border: 1px solid #ddd;
                        }
                        .badge {
                            position: absolute;
                            top: 8px;
                            right: 8px;
                        }
                    `}
                    htmlVisible={false}
                    cssVisible={false}
                />
            </section>

            <section id="layout-summary">
                <CodePreviewFixture
                    sourceId="ex1"
                    html={`<div class="card"><h2 class="card-title">自己紹介</h2><p class="card-text">Webデザインの勉強中です。</p><p class="card-text">レイアウトが少し苦手なので練習します。</p></div>`}
                    css={`
                        .card {
                            width: 320px;
                            margin: auto;
                        }
                        .card-title {
                            text-align: center;
                        }
                    `}
                    htmlVisible={true}
                    cssVisible={false}
                />
                <div id="layout-summary-shared">
                    <CodePreviewFixture sourceId="ex1" />
                </div>
            </section>
        </div>
    );

    const boxModel = component.locator('#box-model iframe').contentFrame();
    await expect(boxModel.locator('.waku')).toHaveCSS('width', '300px');
    await expect(boxModel.locator('.waku')).toHaveCSS('height', '220px');
    await expect(boxModel.locator('.shirushi')).toHaveCSS('background-color', 'rgb(254, 215, 170)');

    const flexbox = component.locator('#flexbox iframe').contentFrame();
    await expect(flexbox.locator('.head')).toHaveCSS('display', 'flex');
    const firstLink = await flexbox.locator('.navi a').nth(0).boundingBox();
    const secondLink = await flexbox.locator('.navi a').nth(1).boundingBox();
    if (!firstLink || !secondLink) throw new Error('flexbox lesson links are not visible');
    expect(secondLink.x).toBeGreaterThan(firstLink.x);

    const positioning = component.locator('#positioning iframe').contentFrame();
    await expect(positioning.locator('.header')).toHaveCSS('position', 'fixed');
    await expect(positioning.locator('.badge')).toHaveCSS('position', 'absolute');

    const sharedPreview = component.locator('#layout-summary-shared iframe').contentFrame();
    await expect(sharedPreview.locator('.card-title')).toHaveText('自己紹介');
    await expect(sharedPreview.locator('.card-title')).toHaveCSS('text-align', 'center');
});
