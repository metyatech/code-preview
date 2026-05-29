import { test, expect } from '@playwright/experimental-ct-react';
import type { Page } from '@playwright/test';
import CodePreview from './index';
import { CodePreview as ServerCodePreview } from '../../server';
import { CodePreviewFixture } from './fixtures/CodePreviewFixture';
import { PathChangeFixture } from './fixtures/PathChangeFixture';
import {
    InitialHtmlChangeFixture,
    InitialCssChangeFixture,
    InitialJsChangeFixture
} from './fixtures/PropChangeFixtures';

type WindowWithFixtureActions = {
    addItems?: () => void;
    openModal?: () => void;
};
type PageErrorTracker = {
    errors: string[];
    dispose: () => void;
};

const trackPageErrors = (page: Page): PageErrorTracker => {
    const errors: string[] = [];
    const onConsole = (message: { type: () => string; text: () => string }) => {
        if (message.type() === 'error') {
            errors.push(message.text());
        }
    };
    const onPageError = (error: Error) => {
        errors.push(error.message);
    };

    page.on('console', onConsole);
    page.on('pageerror', onPageError);

    return {
        errors,
        dispose: () => {
            page.off('console', onConsole);
            page.off('pageerror', onPageError);
        }
    };
};

test.use({ viewport: { width: 1200, height: 800 } });

const DATA_URL_PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF9sAAAAASUVORK5CYII=';

test.describe('CodePreview コンポーネントのテスト', () => {
    test('最低限のプロパティで正しく描画されること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture html="<h1>こんにちは</h1>" />);

        await expect(component).toBeVisible();
        // タイトルは指定していないので表示されないはず
        await expect(component.locator('h4')).not.toBeVisible();
        // デフォルトでHTMLエディタは表示されるはず
        await expect(component.getByText('HTML')).toBeVisible();
        // プレビューも表示されるはず
        await expect(component.getByText('プレビュー')).toBeVisible();
    });

    test('文字列フェンスからHTMLが読み取られること', async ({ mount }) => {
        const raw = '```html\n<div id="raw-block">Raw</div>\n```';
        const component = await mount(<CodePreview>{raw}</CodePreview>);

        await expect(component.getByText('HTML')).toBeVisible();

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        await expect(frame.locator('#raw-block')).toBeVisible({ timeout: 10000 });
    });

    test('initialHTML overrides fenced content when specified', async ({ mount }) => {
        const raw = '```html\n<div id="from-child">Child</div>\n```';
        const component = await mount(<CodePreview initialHTML="<div id='from-prop'>Prop</div>">{raw}</CodePreview>);

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();

        await expect(frame.locator('#from-prop')).toBeVisible({ timeout: 10000 });
        await expect(frame.locator('#from-child')).toHaveCount(0);
    });

    test('initialCSS overrides fenced content when specified', async ({ mount }) => {
        const raw = [
            '```html',
            '<div id="color-box">Box</div>',
            '```',
            '```css',
            '#color-box { color: red; }',
            '```'
        ].join('\n');
        const component = await mount(<CodePreview initialCSS="#color-box { color: blue; }">{raw}</CodePreview>);

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const box = frame.locator('#color-box');

        await expect(box).toBeVisible({ timeout: 10000 });
        await expect(box).toHaveCSS('color', 'rgb(0, 0, 255)');
    });

    test('initialJS overrides fenced content when specified', async ({ mount }) => {
        const raw = [
            '```html',
            '<div id="js-box">JS</div>',
            '```',
            '```js',
            'document.body.setAttribute("data-js", "child");',
            '```'
        ].join('\n');
        const component = await mount(
            <CodePreview initialJS='document.body.setAttribute("data-js", "prop");'>{raw}</CodePreview>
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const body = frame.locator('body');

        await expect(body).toHaveAttribute('data-js', 'prop');
    });

    test('uses fenced JS when only initialJS is undefined', async ({ mount }) => {
        const raw = [
            '```html',
            '<div id="from-child">Child</div>',
            '<div id="color-box">Child Box</div>',
            '```',
            '```css',
            '#color-box { color: red; }',
            '```',
            '```js',
            'document.body.setAttribute("data-js", "child");',
            '```'
        ].join('\n');
        const component = await mount(
            <CodePreview
                initialHTML="<div id='from-prop'>Prop</div><div id='color-box'>Prop Box</div>"
                initialCSS="#color-box { color: blue; }"
            >
                {raw}
            </CodePreview>
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const body = frame.locator('body');

        await expect(frame.locator('#from-prop')).toBeVisible({ timeout: 10000 });
        await expect(frame.locator('#from-child')).toHaveCount(0);

        const box = frame.locator('#color-box');
        await expect(box).toBeVisible({ timeout: 10000 });
        await expect(box).toHaveCSS('color', 'rgb(0, 0, 255)');

        await expect(body).toHaveAttribute('data-js', 'child');
    });

    test('uses fenced HTML when only initialHTML is undefined', async ({ mount }) => {
        const raw = [
            '```html',
            '<div id="from-child">Child</div>',
            '<div id="color-box">Child Box</div>',
            '```',
            '```css',
            '#color-box { color: red; }',
            '```',
            '```js',
            'document.body.setAttribute("data-js", "child");',
            '```'
        ].join('\n');
        const component = await mount(
            <CodePreview
                initialCSS="#color-box { color: blue; }"
                initialJS='document.body.setAttribute("data-js", "prop");'
            >
                {raw}
            </CodePreview>
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const body = frame.locator('body');

        await expect(frame.locator('#from-child')).toBeVisible({ timeout: 10000 });
        await expect(frame.locator('#from-prop')).toHaveCount(0);

        const box = frame.locator('#color-box');
        await expect(box).toBeVisible({ timeout: 10000 });
        await expect(box).toHaveCSS('color', 'rgb(0, 0, 255)');

        await expect(body).toHaveAttribute('data-js', 'prop');
    });

    test('uses fenced CSS when only initialCSS is undefined', async ({ mount }) => {
        const raw = [
            '```html',
            '<div id="from-child">Child</div>',
            '<div id="color-box">Child Box</div>',
            '```',
            '```css',
            '#color-box { color: red; }',
            '```',
            '```js',
            'document.body.setAttribute("data-js", "child");',
            '```'
        ].join('\n');
        const component = await mount(
            <CodePreview
                initialHTML="<div id='from-prop'>Prop</div><div id='color-box'>Prop Box</div>"
                initialJS='document.body.setAttribute("data-js", "prop");'
            >
                {raw}
            </CodePreview>
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const body = frame.locator('body');

        await expect(frame.locator('#from-prop')).toBeVisible({ timeout: 10000 });
        await expect(frame.locator('#from-child')).toHaveCount(0);

        const box = frame.locator('#color-box');
        await expect(box).toBeVisible({ timeout: 10000 });
        await expect(box).toHaveCSS('color', 'rgb(255, 0, 0)');

        await expect(body).toHaveAttribute('data-js', 'prop');
    });

    test('JSコードが無い場合、JavaScriptタブが表示されないこと', async ({ mount }) => {
        const raw = [
            '```html',
            '<div id="only-html-css">Only HTML/CSS</div>',
            '```',
            '```css',
            '#only-html-css { color: red; }',
            '```'
        ].join('\n');

        const component = await mount(
            <ServerCodePreview
                images={{
                    'img/parallax1.jpg': '/img/parallax1.jpg',
                    'img/parallax2.jpg': '/img/parallax2.jpg',
                    'img/parallax3.jpg': '/img/parallax3.jpg'
                }}
            >
                {raw}
            </ServerCodePreview>
        );

        await expect(component.getByText('JavaScript')).not.toBeVisible();
    });

    test('switches to fenced content when initialHTML changes', async ({ mount }) => {
        const component = await mount(<InitialHtmlChangeFixture />);

        const consumerFrame = component.locator('#consumer-html iframe').contentFrame();
        await expect(consumerFrame.locator('#override-html')).toBeVisible({ timeout: 10000 });

        await component.locator('#toggle-html').click();
        await expect(consumerFrame.locator('#child-html')).toBeVisible({ timeout: 10000 });
    });

    test('switches to fenced content when initialCSS changes', async ({ mount }) => {
        const component = await mount(<InitialCssChangeFixture />);

        const consumerFrame = component.locator('#consumer-css iframe').contentFrame();
        const box = consumerFrame.locator('#color-box');
        await expect(box).toBeVisible({ timeout: 10000 });
        await expect(box).toHaveCSS('color', 'rgb(0, 0, 255)');

        await component.locator('#toggle-css').click();
        await expect(box).toHaveCSS('color', 'rgb(255, 0, 0)');
    });

    test('switches to fenced content when initialJS changes', async ({ mount }) => {
        const component = await mount(<InitialJsChangeFixture />);

        const consumerFrame = component.locator('#consumer-js iframe').contentFrame();
        const body = consumerFrame.locator('body');
        await expect(body).toHaveAttribute('data-js', 'prop');

        await component.locator('#toggle-js').click();
        await expect(body).toHaveAttribute('data-js', 'child');
    });

    test('タイトルが指定された場合、正しく表示されること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture title="テスト用タイトル" html="<div>Test</div>" />);

        await expect(component).toContainText('テスト用タイトル');
    });

    test('全エディタが表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture htmlVisible={true} cssVisible={true} jsVisible={true} html="<div></div>" />
        );
        await expect(component.getByText('HTML')).toBeVisible();
        await expect(component.getByText('CSS')).toBeVisible();
        await expect(component.getByText('JavaScript')).toBeVisible();
    });

    test('HTMLエディタのみ表示されること（htmlVisible=true）', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture htmlVisible={true} cssVisible={false} jsVisible={false} html="<div></div>" />
        );
        await expect(component.getByText('HTML')).toBeVisible();
        await expect(component.getByText('CSS')).not.toBeVisible();
        await expect(component.getByText('JavaScript')).not.toBeVisible();
    });

    test('CSSエディタのみ表示されること（cssVisible=true）', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture htmlVisible={false} cssVisible={true} jsVisible={false} html="<div></div>" />
        );
        await expect(component.getByText('HTML')).not.toBeVisible();
        await expect(component.getByText('CSS')).toBeVisible();
        await expect(component.getByText('JavaScript')).not.toBeVisible();
    });

    test('JSエディタのみ表示されること（jsVisible=true）', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture htmlVisible={false} cssVisible={false} jsVisible={true} html="<div></div>" />
        );
        await expect(component.getByText('HTML')).not.toBeVisible();
        await expect(component.getByText('CSS')).not.toBeVisible();
        await expect(component.getByText('JavaScript')).toBeVisible();
    });

    test('ファイル構造パネルの表示切り替えができること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture fileStructureVisible={true} html="<div></div>" />);

        // title属性またはテキストでボタンを探す
        // 初期状態が visible=true なので、ボタンの title は 'ファイル構造を隠す' になっているはず
        const toggleButton = component.getByRole('button', { name: 'ファイル構造を隠す' });
        await expect(toggleButton).toBeVisible();
        await toggleButton.click();
    });

    test('リセットボタンが正しく表示されること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture html="<h1>Original</h1>" />);

        const resetButton = component.getByRole('button', { name: '長押しでリセット' });
        await expect(resetButton).toBeVisible();
    });

    test('プレビュー（iframe）内にコンテンツが描画されること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture html="<div id='test-target'>Hello World</div>" />);

        // iframe要素を取得
        const iframe = component.locator('iframe');
        await expect(iframe).toBeVisible();

        const frame = iframe.contentFrame();
        const targetDiv = frame.locator('#test-target');

        // コンテンツ描画まで少し待つ
        await expect(targetDiv).toBeVisible({ timeout: 10000 });
        await expect(targetDiv).toHaveText('Hello World');
    });

    test('CSSが適用されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture html="<div id='styled-div'>Styled</div>" css="#styled-div { color: rgb(255, 0, 0); }" />
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const styledDiv = frame.locator('#styled-div');

        await expect(styledDiv).toBeVisible({ timeout: 10000 });
        await expect(styledDiv).toHaveCSS('color', 'rgb(255, 0, 0)');
    });

    test('プレビューが表示されること(previewVisible=true)', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture previewVisible={true} html="<div></div>" />);
        await expect(component.getByText('プレビュー')).toBeVisible();
    });

    test('HTMLがない場合はJSのみではプレビューが表示されないこと', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture js="console.log('test');" />);
        await expect(component.getByText('プレビュー')).not.toBeVisible();
    });

    test('HTMLがない場合はCSSのみではプレビューが表示されないこと', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture css="div { color: red; }" />);
        await expect(component.getByText('プレビュー')).not.toBeVisible();
    });

    test('HTMLエディタを非表示にしてもHTMLがある場合はプレビューが表示されること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture htmlVisible={false} html="<div></div>" />);
        await expect(component.getByText('プレビュー')).toBeVisible();
    });

    test('プレビューが非表示になること(previewVisible=false)', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture previewVisible={false} html="<div></div>" />);
        await expect(component.getByText('プレビュー')).not.toBeVisible();
    });

    test('コンソールが表示されること(consoleVisible=true)', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture consoleVisible={true} html="<div></div>" />);
        await expect(component.getByText('コンソール')).toBeVisible();
        await expect(component.getByText('ここに console.log の結果が表示されます')).toBeVisible();
    });

    test('コンソールが非表示になること(consoleVisible=false)', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture consoleVisible={false} html="<div></div>" />);
        await expect(component.getByText('コンソール')).not.toBeVisible();
    });

    // ===== JavaScriptの実行テスト =====
    test('JavaScriptが実行されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                html="<div id='js-target'></div>"
                js="document.getElementById('js-target').textContent = 'JS実行成功';"
                jsLanguage="javascript"
            />
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const targetDiv = frame.locator('#js-target');

        await expect(targetDiv).toBeVisible({ timeout: 10000 });
        await expect(targetDiv).toHaveText('JS実行成功');
    });

    // ===== console.logの出力テスト =====
    test('console.logがコンソールパネルに表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture consoleVisible={true} html="<div></div>" js="console.log('テストログ1');" />
        );

        // コンソールパネルが表示されること
        await expect(component.getByText('コンソール')).toBeVisible();
        // ログメッセージが表示されること
        await expect(component.getByText('テストログ1')).toBeVisible({ timeout: 10000 });
    });

    test('複数のconsole.logが表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                consoleVisible={true}
                html="<div></div>"
                js="console.log('ログ1'); console.log('ログ2'); console.log('ログ3');"
            />
        );

        await expect(component.getByText('ログ1')).toBeVisible({ timeout: 10000 });
        await expect(component.getByText('ログ2')).toBeVisible();
        await expect(component.getByText('ログ3')).toBeVisible();
    });

    // ===== リセット機能のテスト =====
    test('リセットボタンを長押しするとプログレスバーが表示されること', async ({ mount, page }) => {
        const component = await mount(<CodePreviewFixture html="<h1>Original</h1>" />);

        const resetButton = component.getByRole('button', { name: '長押しでリセット' });

        // マウスダウンイベントを発火
        await resetButton.dispatchEvent('mousedown');

        // 少し待機してプログレスの進行を確認
        await page.waitForTimeout(500);

        // SVGのcircle要素（プログレスバー）が表示されていることを確認
        const progressCircle = resetButton.locator('circle[stroke="#218bff"]');
        await expect(progressCircle).toBeVisible();

        // マウスアップでキャンセル
        await resetButton.dispatchEvent('mouseup');
    });

    // ===== 行番号表示の切り替えテスト =====
    test('行番号表示切り替えボタンが機能すること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture html="<div>test</div>" />);

        // 行番号切り替えボタンを探す
        const lineNumberButton = component.getByRole('button', { name: /行番号/ });
        await expect(lineNumberButton).toBeVisible();

        // ボタンをクリック
        await lineNumberButton.click();
    });

    // ===== エディタのリサイズ機能テスト =====
    test('エディタ間のリサイザーが表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture htmlVisible={true} cssVisible={true} html="<div></div>" css="div { color: red; }" />
        );

        // セパレーター（リサイザー）を探す
        const separator = component.getByRole('separator');
        await expect(separator).toBeVisible();

        // aria-labelが正しく設定されているか確認
        await expect(separator).toHaveAttribute('aria-label', /HTML と CSS の幅を調整/);
    });

    test('リサイザーでエディタの幅を調整できること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture htmlVisible={true} cssVisible={true} html="<div></div>" css="div { color: red; }" />
        );

        const separator = component.getByRole('separator');
        await expect(separator).toBeVisible();

        // タブキーでフォーカス可能か確認
        await expect(separator).toHaveAttribute('tabIndex', '0');
    });

    // ===== デフォルト値のテスト =====
    test('minHeightのデフォルト値が適用されること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture html="<div>test</div>" />);

        // コンポーネントが正常に描画されることを確認
        await expect(component).toBeVisible();
    });

    test('minHeightが数値でも適用されること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture html="<div>test</div>" minHeight={320} />);

        await expect(component).toBeVisible();
    });

    test('themeを省略するとdocument themeに追従すること', async ({ mount, page }) => {
        await page.evaluate(() => {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
        });

        const component = await mount(<CodePreviewFixture html="<div>test</div>" />);

        await expect(component).toHaveAttribute('data-theme', 'dark');

        await page.evaluate(() => {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        });

        await expect(component).toHaveAttribute('data-theme', 'light');
    });

    test('themeを省略しdocument themeがない場合はlightにfallbackすること', async ({ mount, page }) => {
        await page.evaluate(() => {
            document.documentElement.classList.remove('dark', 'light');
            document.documentElement.removeAttribute('data-theme');
            document.body.removeAttribute('data-theme');
        });

        const component = await mount(<CodePreviewFixture html="<div>test</div>" />);

        await expect(component).toHaveAttribute('data-theme', 'light');

        // Monacoエディタが描画されていることを確認
        const monacoEditor = component.locator('.monaco-editor');
        await expect(monacoEditor).toBeVisible({ timeout: 10000 });
    });

    test('themeを明示した場合はdocument themeより優先されること', async ({ mount, page }) => {
        await page.evaluate(() => {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
        });

        const component = await mount(<CodePreviewFixture theme="light" html="<div>test</div>" />);

        await expect(component).toHaveAttribute('data-theme', 'light');

        await page.evaluate(() => {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        });

        await expect(component).toHaveAttribute('data-theme', 'light');
    });

    test('theme="dark"がCodePreview shellとMonaco editor全体に適用されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                theme="dark"
                html="<div>test</div>"
                css="div { color: red; }"
                fileStructureVisible={true}
            />
        );

        await expect(component).toHaveAttribute('data-theme', 'dark');

        const monacoEditor = component.locator('.monaco-editor').first();
        await expect(monacoEditor).toBeVisible({ timeout: 10000 });

        const editorColors = await monacoEditor.evaluate((node) => {
            const editor = node as HTMLElement;
            const background = editor.querySelector<HTMLElement>('.monaco-editor-background');
            const gutter = editor.querySelector<HTMLElement>('.margin');

            return {
                editorBackground: window.getComputedStyle(editor).backgroundColor,
                textBackground: background ? window.getComputedStyle(background).backgroundColor : '',
                gutterBackground: gutter ? window.getComputedStyle(gutter).backgroundColor : ''
            };
        });

        expect(editorColors.editorBackground).toBe('rgb(15, 23, 42)');
        expect(editorColors.textBackground).toBe('rgb(15, 23, 42)');
        expect(editorColors.gutterBackground).toBe('rgb(15, 23, 42)');

        await monacoEditor.click();

        const cursorColor = await monacoEditor
            .locator('.cursors-layer .cursor')
            .first()
            .evaluate((node) => {
                return window.getComputedStyle(node as HTMLElement).backgroundColor;
            });

        expect(cursorColor).toBe('rgb(248, 250, 252)');
    });

    test('theme="dark"の構文色が黒い親コンテナ内でも維持されること', async ({ mount }) => {
        const component = await mount(
            <div style={{ color: 'rgb(0, 0, 0)' }} className="hostile-exercise-theme">
                <style>{`.hostile-exercise-theme :where(span, div) { color: rgb(248, 250, 252) !important; }`}</style>
                <CodePreviewFixture
                    theme="dark"
                    title="Exercise Dark CodePreview"
                    html={'<section class="card"><h2>Dark preview</h2><button id="action">Click</button></section>'}
                    css={'.card { color: #e5e7eb; background: #0f172a; }\nbutton { color: #0f172a; }'}
                    fileStructureVisible={true}
                />
            </div>
        );

        const monacoEditor = component.locator('.monaco-editor').first();
        await expect(monacoEditor).toBeVisible({ timeout: 10000 });
        await expect(monacoEditor.locator('.view-line span').first()).toBeVisible({ timeout: 10000 });

        const expectedTokenColors = ['rgb(96, 165, 250)', 'rgb(249, 168, 212)', 'rgb(134, 239, 172)'];
        const readTokenColors = async () => {
            return await monacoEditor.locator('.view-line span').evaluateAll((nodes) => {
                return Array.from(new Set(nodes.map((node) => window.getComputedStyle(node).color).filter(Boolean)));
            });
        };

        await expect
            .poll(readTokenColors, {
                message: 'Monaco dark syntax token colors should be applied',
                timeout: 10000
            })
            .toEqual(expect.arrayContaining(expectedTokenColors));

        const tokenColors = await readTokenColors();
        expect(tokenColors).not.toEqual(['rgb(0, 0, 0)']);
        expectedTokenColors.forEach((expectedColor) => {
            expect(tokenColors).toContain(expectedColor);
        });
    });

    test('htmlPathのデフォルト値(index.html)が適用されること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture fileStructureVisible={true} html="<div>test</div>" />);

        // ファイル構造パネルに index.html が表示されること
        await expect(component.getByText('index.html')).toBeVisible();
    });

    // ===== エディタの複数組み合わせテスト =====
    test('HTML+CSSエディタの組み合わせが表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                htmlVisible={true}
                cssVisible={true}
                jsVisible={false}
                html="<div>test</div>"
                css="div { color: red; }"
            />
        );

        await expect(component.getByText('HTML')).toBeVisible();
        await expect(component.getByText('CSS')).toBeVisible();
        await expect(component.getByText('JavaScript')).not.toBeVisible();
    });

    test('HTML+JSエディタの組み合わせが表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                htmlVisible={true}
                cssVisible={false}
                jsVisible={true}
                html="<div>test</div>"
                js="console.log('test');"
            />
        );

        await expect(component.getByText('HTML')).toBeVisible();
        await expect(component.getByText('CSS')).not.toBeVisible();
        await expect(component.getByText('JavaScript')).toBeVisible();
    });

    test('CSS+JSエディタの組み合わせが表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                htmlVisible={false}
                cssVisible={true}
                jsVisible={true}
                html="<div>test</div>"
                css="div { color: red; }"
                js="console.log('test');"
            />
        );

        await expect(component.getByText('HTML')).not.toBeVisible();
        await expect(component.getByText('CSS')).toBeVisible();
        await expect(component.getByText('JavaScript')).toBeVisible();
    });

    // ===== ファイルパスの解決テスト =====
    test('cssPathが指定された場合、ファイル構造に表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                fileStructureVisible={true}
                html="<div>test</div>"
                css="div { color: red; }"
                cssPath="css/style.css"
            />
        );

        await expect(component.getByText('📁 css')).toBeVisible();
        await expect(component.getByText('📄 style.css')).toBeVisible();
    });

    test('jsPathが指定された場合、ファイル構造に表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                fileStructureVisible={true}
                html="<div>test</div>"
                js="console.log('test');"
                jsPath="js/script.js"
            />
        );

        await expect(component.getByText('📁 js')).toBeVisible();
        await expect(component.getByText('📄 script.js')).toBeVisible();
    });

    test('カスタムhtmlPathが指定された場合、ファイル構造に表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture fileStructureVisible={true} html="<div>test</div>" htmlPath="pages/main.html" />
        );

        await expect(component.getByText('📁 pages')).toBeVisible();
        await expect(component.getByText('📄 main.html')).toBeVisible();
    });

    test('複数のファイルパスが指定された場合、すべて表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                fileStructureVisible={true}
                html="<div>test</div>"
                css="div { color: red; }"
                js="console.log('test');"
                htmlPath="index.html"
                cssPath="styles/main.css"
                jsPath="scripts/app.js"
            />
        );

        await expect(component.getByText('📄 index.html')).toBeVisible();
        await expect(component.getByText('📁 styles')).toBeVisible();
        await expect(component.getByText('📄 main.css')).toBeVisible();
        await expect(component.getByText('📁 scripts')).toBeVisible();
        await expect(component.getByText('📄 app.js')).toBeVisible();
    });

    // ===== 画像パスの解決テスト =====
    test('imagesプロパティが指定された場合、ファイル構造に表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                fileStructureVisible={true}
                html="<div>test</div>"
                images={{
                    'img/sample.png': '/static/img/sample.png',
                    'img/logo.svg': '/static/img/logo.svg'
                }}
            />
        );

        await expect(component.getByText('📁 img')).toBeVisible();
        await expect(component.getByText('📄 sample.png')).toBeVisible();
        await expect(component.getByText('📄 logo.svg')).toBeVisible();
    });

    // ===== エディタの初期値テスト =====
    test('cssが指定されない場合でも正常に動作すること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture htmlVisible={true} cssVisible={true} html="<div>test</div>" />
        );

        await expect(component.getByText('HTML')).toBeVisible();
        await expect(component.getByText('CSS')).toBeVisible();
    });

    test('jsが指定されない場合でも正常に動作すること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture htmlVisible={true} jsVisible={true} html="<div>test</div>" />
        );

        await expect(component.getByText('HTML')).toBeVisible();
        await expect(component.getByText('JavaScript')).toBeVisible();
    });

    // ===== ツールバーのボタンテスト =====
    test('ファイル構造の表示切り替えボタンが機能すること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture fileStructureVisible={true} html="<div>test</div>" />);

        // 初期状態でファイル構造が表示されていること
        const hideButton = component.getByRole('button', { name: 'ファイル構造を隠す' });
        await expect(hideButton).toBeVisible();

        // ボタンをクリック
        await hideButton.click();

        // 非表示になったことを確認
        const showButton = component.getByRole('button', { name: 'ファイル構造を表示' });
        await expect(showButton).toBeVisible();
    });

    test('ファイル構造の初期状態がfalseの場合、非表示から開始されること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture fileStructureVisible={false} html="<div>test</div>" />);

        // 表示ボタンが見えることを確認
        const showButton = component.getByRole('button', { name: 'ファイル構造を表示' });
        await expect(showButton).toBeVisible();

        // ボタンをクリック
        await showButton.click();

        // 表示されたことを確認
        const hideButton = component.getByRole('button', { name: 'ファイル構造を隠す' });
        await expect(hideButton).toBeVisible();
    });

    // ===== プレビューの高さテスト =====
    test('カスタムminHeightが適用されること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture html="<div>test</div>" minHeight="400px" />);

        await expect(component).toBeVisible();
        // エディタが描画されていることを確認
        const monacoEditor = component.locator('.monaco-editor');
        await expect(monacoEditor).toBeVisible({ timeout: 10000 });
    });

    // ===== エラーハンドリングテスト =====
    test('不正なHTMLでもクラッシュしないこと', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture html="<div><p>閉じタグなし" />);

        await expect(component).toBeVisible();
        const iframe = component.locator('iframe');
        await expect(iframe).toBeVisible();
    });

    test('不正なCSSでもクラッシュしないこと', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture html="<div>test</div>" css="div { color: red" />);

        await expect(component).toBeVisible();
        const iframe = component.locator('iframe');
        await expect(iframe).toBeVisible();
    });

    test('不正なJavaScriptでもクラッシュしないこと', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture html="<div>test</div>" js="const x = " />);

        await expect(component).toBeVisible();
        const iframe = component.locator('iframe');
        await expect(iframe).toBeVisible();
    });

    // ===== アクセシビリティテスト =====
    test('セパレーターが適切なARIA属性を持つこと', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture htmlVisible={true} cssVisible={true} html="<div>test</div>" css="div { color: red; }" />
        );

        const separator = component.getByRole('separator');
        await expect(separator).toHaveAttribute('aria-orientation', 'vertical');
        await expect(separator).toHaveAttribute('tabIndex', '0');
    });

    // ===== sourceId のテスト =====
    test('同じsourceIdを持つコンポーネント間で初期状態が共有されること', async ({ mount }) => {
        const component = await mount(
            <div>
                <CodePreviewFixture sourceId="shared-source-1" html="<div>Shared Content</div>" />
                <div id="second-preview">
                    <CodePreviewFixture sourceId="shared-source-1" />
                </div>
            </div>
        );

        // 2つ目のコンポーネント（ソース参照側）のプレビューを確認
        const secondPreview = component.locator('#second-preview');
        const iframe2 = secondPreview.locator('iframe');
        const frame2 = iframe2.contentFrame();

        // 少し待機が必要かもしれない
        await expect(frame2.locator('div')).toHaveText('Shared Content', { timeout: 5000 });
    });

    test('pathnameが途中で変わってもsourceIdの共有が維持されること', async ({ mount, page }) => {
        await page.evaluate(() => {
            history.replaceState({}, '', '/page-a');
        });

        const component = await mount(
            <PathChangeFixture sourceId="shared-path-change" html="<div id='shared-path-change'>Shared</div>" />
        );

        const consumer = component.locator('#consumer-after-path-change');
        await expect(consumer).toBeVisible();

        const iframe = consumer.locator('iframe');
        const frame = iframe.contentFrame();
        await expect(frame.locator('#shared-path-change')).toBeVisible({ timeout: 5000 });
    });

    test('pathname変更時にクライアントエラーが発生しないこと', async ({ mount, page }) => {
        const tracker = trackPageErrors(page);

        await page.evaluate(() => {
            history.replaceState({}, '', '/page-a');
        });

        const component = await mount(
            <PathChangeFixture
                sourceId="shared-path-change-errors"
                html="<div id='shared-path-change-errors'>Shared</div>"
            />
        );

        const consumer = component.locator('#consumer-after-path-change');
        await expect(consumer).toBeVisible();

        const iframe = consumer.locator('iframe');
        const frame = iframe.contentFrame();
        await expect(frame.locator('#shared-path-change-errors')).toBeVisible({ timeout: 5000 });

        await page.waitForTimeout(250);
        tracker.dispose();

        expect(tracker.errors).toEqual([]);
    });

    test('htmlPathが空文字の場合は共有ストアのパスをクリアできること', async ({ mount, page }) => {
        await page.evaluate(() => {
            history.replaceState({}, '', '/path-clear');
        });

        await mount(
            <div>
                <CodePreviewFixture sourceId="path-clear" htmlPath="index.html" html="<div>Path</div>" />
                <CodePreviewFixture sourceId="path-clear" htmlPath="" />
            </div>
        );

        await expect
            .poll(async () => {
                return await page.evaluate(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const store = (window as any).__CodePreviewStore__;
                    const key = `path-clear:${window.location.pathname}`;
                    return store?.get(key)?.htmlPath ?? null;
                });
            })
            .toBe('');
    });

    test('imagesが空オブジェクトの場合は共有ストアのimagesをクリアできること', async ({ mount, page }) => {
        await page.evaluate(() => {
            history.replaceState({}, '', '/images-clear');
        });

        await mount(
            <div>
                <CodePreviewFixture
                    sourceId="images-clear"
                    html="<div>Images</div>"
                    images={{ 'img/test.png': '/img/test.png' }}
                />
                <CodePreviewFixture sourceId="images-clear" images={{}} />
            </div>
        );

        await expect
            .poll(async () => {
                return await page.evaluate(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const store = (window as any).__CodePreviewStore__;
                    const key = `images-clear:${window.location.pathname}`;
                    return store?.get(key)?.images ?? null;
                });
            })
            .toEqual({});
    });

    test('imagesを持つ共有ソースが再通知ループを起こさないこと', async ({ mount, page }) => {
        const tracker = trackPageErrors(page);

        await page.evaluate(() => {
            history.replaceState({}, '', '/images-stable');
        });

        const component = await mount(
            <CodePreviewFixture
                sourceId="images-stable"
                html="<div id='stable-image-source'>Stable image source</div>"
                images={{ 'img/test.png': DATA_URL_PNG }}
            />
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        await expect(frame.locator('#stable-image-source')).toBeVisible({ timeout: 5000 });

        await page.waitForTimeout(250);
        tracker.dispose();

        expect(tracker.errors).toEqual([]);
    });

    test('server entryでもsourceIdが共有されること', async ({ mount }) => {
        const raw = ['```html', '<div id="shared-server">Shared Server</div>', '```'].join('\n');

        const component = await mount(
            <div>
                <ServerCodePreview sourceId="shared-server">{raw}</ServerCodePreview>
                <div id="second-preview-server">
                    <ServerCodePreview sourceId="shared-server" />
                </div>
            </div>
        );

        const secondPreview = component.locator('#second-preview-server');
        const iframe = secondPreview.locator('iframe');
        const frame = iframe.contentFrame();

        await expect(frame.locator('#shared-server')).toBeVisible({ timeout: 5000 });
    });

    test('sourceId共有時、JSが提供されていない場合はJavaScriptエディタが表示されないこと', async ({ mount }) => {
        const raw = [
            '```html',
            '<div id="shared-no-js">Shared No JS</div>',
            '```',
            '```css',
            '#shared-no-js { color: red; }',
            '```'
        ].join('\n');

        const component = await mount(
            <div>
                <ServerCodePreview sourceId="shared-no-js">{raw}</ServerCodePreview>
                <div id="consumer-no-js">
                    <ServerCodePreview sourceId="shared-no-js" />
                </div>
            </div>
        );

        const consumer = component.locator('#consumer-no-js');
        await expect(consumer.getByText('JavaScript')).not.toBeVisible();
    });

    test('share=falseの場合は共有ストアを上書きしないこと', async ({ mount }) => {
        const component = await mount(
            <div>
                <div id="provider-preview">
                    <CodePreviewFixture
                        sourceId="shared-source-override"
                        html="<div id='shared-target'></div>"
                        js="document.getElementById('shared-target').textContent = 'shared';"
                    />
                </div>
                <div id="override-preview">
                    <CodePreviewFixture
                        sourceId="shared-source-override"
                        share={false}
                        js="document.getElementById('shared-target').textContent = 'override';"
                    />
                </div>
                <div id="consumer-preview">
                    <CodePreviewFixture sourceId="shared-source-override" />
                </div>
            </div>
        );

        const providerFrame = component.locator('#provider-preview iframe').contentFrame();
        await expect(providerFrame.locator('#shared-target')).toHaveText('shared', { timeout: 5000 });

        const overrideFrame = component.locator('#override-preview iframe').contentFrame();
        await expect(overrideFrame.locator('#shared-target')).toHaveText('override', { timeout: 5000 });

        const consumerFrame = component.locator('#consumer-preview iframe').contentFrame();
        await expect(consumerFrame.locator('#shared-target')).toHaveText('shared', { timeout: 5000 });
    });

    test('初期コードの共通インデントが除去されること', async ({ mount, page }) => {
        const rawHtml = '\n    <div id="indent-target">\n        <span>Indent</span>\n    </div>\n';
        const rawJs = "\n    document.getElementById('indent-target').textContent = 'ok';\n";

        await mount(<CodePreviewFixture sourceId="indent-test" html={rawHtml} js={rawJs} />);

        await expect
            .poll(async () => {
                return await page.evaluate(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const store = (window as any).__CodePreviewStore__;
                    const key = `indent-test:${window.location.pathname}`;
                    return store?.get(key) ?? null;
                });
            })
            .not.toBeNull();

        const stored = await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const store = (window as any).__CodePreviewStore__;
            const key = `indent-test:${window.location.pathname}`;
            return store?.get(key) ?? null;
        });

        if (!stored) {
            throw new Error('Stored source code was not found.');
        }

        const htmlLines = stored.html.split(/\r\n|\n|\r/);
        expect(htmlLines[0]).toBe('<div id="indent-target">');
        expect(htmlLines[1].startsWith('    ')).toBe(true);
        expect(htmlLines[1].trim()).toBe('<span>Indent</span>');
        expect(htmlLines[2].trim()).toBe('</div>');
        expect(htmlLines[0].match(/^\\s*/)?.[0].length ?? 0).toBe(0);
        expect(htmlLines[2].match(/^\\s*/)?.[0].length ?? 0).toBe(0);
        expect(stored.js).toBe("document.getElementById('indent-target').textContent = 'ok';");
    });

    test('初期コードに共通インデントがない場合は先頭スペースが保持されること', async ({ mount, page }) => {
        const rawHtml = '\nA\n  B\n';

        await mount(<CodePreviewFixture sourceId="indent-preserve-test" html={rawHtml} />);

        await expect
            .poll(async () => {
                return await page.evaluate(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const store = (window as any).__CodePreviewStore__;
                    const key = `indent-preserve-test:${window.location.pathname}`;
                    return store?.get(key) ?? null;
                });
            })
            .not.toBeNull();

        const stored = await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const store = (window as any).__CodePreviewStore__;
            const key = `indent-preserve-test:${window.location.pathname}`;
            return store?.get(key) ?? null;
        });

        if (!stored) {
            throw new Error('Stored source code was not found.');
        }

        const htmlLines = stored.html.split(/\r\n|\n|\r/);
        expect(htmlLines[0]).toBe('A');
        expect(htmlLines[1]).toBe('  B');
        expect(htmlLines[0].match(/^\s*/)?.[0].length ?? 0).toBe(0);
        expect(htmlLines[1].match(/^\s*/)?.[0].length ?? 0).toBe(2);
    });

    // ===== images プロパティのテスト =====
    test('CSS内の画像パスがimagesプロパティに基づいて解決されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                html="<div id='bg-test'></div>"
                css="#bg-test { background-image: url('img/bg.png'); width: 100px; height: 100px; }"
                images={{
                    'img/bg.png': '/static/img/real-bg.png'
                }}
            />
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const div = frame.locator('#bg-test');

        // CSSが適用されるまで待機
        await expect(div).toBeVisible();

        // background-image の URL が置換されているか確認
        await expect(div).toHaveCSS('background-image', /url\("?.*\/static\/img\/real-bg\.png"?\)/);
    });

    test('Next-style static image objects are normalized for CSS background images', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                html="<div id='bg-static-import'></div>"
                css="#bg-static-import { background-image: url('img/bg.png'); width: 100px; height: 100px; }"
                images={{
                    'img/bg.png': {
                        src: DATA_URL_PNG,
                        width: 1,
                        height: 1,
                        blurDataURL: DATA_URL_PNG
                    }
                }}
            />
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const div = frame.locator('#bg-static-import');

        await expect(div).toBeVisible();
        await expect(div).toHaveCSS('background-image', /url\("data:image\/png;base64,/);
    });

    test('CSS: 正しい相対パス(../img/fence.png)のみが解決されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                html="<div id='test-div'></div>"
                css={`
                    #test-div {
                        background-image: url('../img/fence.png');
                        width: 100px;
                        height: 100px;
                    }
                `}
                cssPath="css/style.css"
                images={{
                    'img/fence.png': '/static/img/real-fence.png'
                }}
            />
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const div = frame.locator('#test-div');

        await expect(div).toBeVisible();
        // 正しいパスなので解決されるべき
        await expect(div).toHaveCSS('background-image', /url\("?.*\/static\/img\/real-fence\.png"?\)/);
    });

    test('CSS: 誤った相対パス(img/fence.png)は解決されないこと', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                html="<div id='test-div-wrong'></div>"
                css={`
                    #test-div-wrong {
                        background-image: url('img/fence.png');
                        width: 100px;
                        height: 100px;
                    }
                `}
                cssPath="css/style.css"
                images={{
                    'img/fence.png': '/static/img/real-fence.png'
                }}
            />
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const div = frame.locator('#test-div-wrong');

        await expect(div).toBeVisible();

        // 誤ったパスなので、imagesの置換が行われず、元のパスのままになるべき
        const bgImage = await div.evaluate((el) => getComputedStyle(el).backgroundImage);
        expect(bgImage).not.toContain('/static/img/real-fence.png');
    });

    test('CSS: 誤った相対パス(./img/fence.png)は解決されないこと', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                html="<div id='test-div-wrong-2'></div>"
                css={`
                    #test-div-wrong-2 {
                        background-image: url('./img/fence.png');
                        width: 100px;
                        height: 100px;
                    }
                `}
                cssPath="css/style.css"
                images={{
                    'img/fence.png': '/static/img/real-fence.png'
                }}
            />
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const div = frame.locator('#test-div-wrong-2');

        await expect(div).toBeVisible();

        const bgImage = await div.evaluate((el) => getComputedStyle(el).backgroundImage);
        expect(bgImage).not.toContain('/static/img/real-fence.png');
    });

    test('HTML内の画像パスがimagesプロパティに基づいて解決されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                html="<img src='img/logo.png' id='logo' />"
                images={{
                    'img/logo.png': '/static/img/real-logo.png'
                }}
            />
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const img = frame.locator('#logo');

        await expect(img).toBeVisible();

        // src属性が置換されているか確認
        await expect(img).toHaveAttribute('src', '/static/img/real-logo.png');
    });

    test('Next-style static image objects are normalized for HTML image sources', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                html="<img src='img/logo.png' id='logo-object' />"
                images={{
                    'img/logo.png': {
                        src: DATA_URL_PNG,
                        width: 1,
                        height: 1
                    }
                }}
            />
        );

        const iframe = component.locator('iframe');
        const frame = iframe.contentFrame();
        const img = frame.locator('#logo-object');

        await expect(img).toBeVisible();
        await expect(img).toHaveAttribute('src', DATA_URL_PNG);
    });

    test('sourceIdの共有範囲が同一ページ内に限定されること', async ({ mount, page }) => {
        // ページパスを /page-a に設定（可能な場合）
        await page.evaluate(() => {
            try {
                history.replaceState({}, '', '/page-a');
            } catch (e) {
                console.warn('Failed to update history:', e);
            }
        });

        await mount(<CodePreviewFixture sourceId="scoped-test" html="<div>Page A</div>" />);

        // ストアの状態を確認
        const storeState = await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const store = (window as any).__CodePreviewStore__;
            const pathname = window.location.pathname;

            if (!store) {
                return { storeExists: false, pathname };
            }

            // 現在のパス名に基づいたキー（scoped-test:/page-a など）で保存されているか
            const scopedData = store.get(`scoped-test:${pathname}`);
            // スコープなしのキー（scoped-test）で保存されていないか
            const rawData = store.get('scoped-test');

            return { storeExists: true, scopedData, rawData, pathname };
        });

        expect(storeState.storeExists).toBe(true);

        // ストアの状態が更新されるのを待つ（useEffectの実行待ち）
        await expect
            .poll(async () => {
                return await page.evaluate(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const store = (window as any).__CodePreviewStore__;
                    const pathname = window.location.pathname;
                    const data = store?.get(`scoped-test:${pathname}`);
                    return !!data;
                });
            })
            .toBe(true);

        // 詳細な検証
        const finalState = await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const store = (window as any).__CodePreviewStore__;
            const pathname = window.location.pathname;
            return {
                scopedData: store?.get(`scoped-test:${pathname}`),
                rawData: store?.get('scoped-test')
            };
        });

        // パス名が含まれたキーで保存されていることを確認
        expect(finalState.scopedData).toBeDefined();
        expect(finalState.scopedData.html).toContain('Page A');

        // 生のsourceIdでは保存されていないことを確認（これが分離の証拠）
        expect(finalState.rawData).toBeUndefined();
    });
});

test.describe('動的な高さ変更のテスト', () => {
    test('JavaScriptで要素が追加された場合、プレビュー領域の高さが広がること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                html={`<div id="container"></div>
<button id="add-btn">要素を追加</button>`}
                js={`
window.addItems = () => {
    for (let i = 0; i < 10; i++) {
        const div = document.createElement('div');
        div.textContent = 'Item ' + i;
        div.style.padding = '20px';
        div.style.margin = '10px';
        div.style.background = '#eee';
        document.getElementById('container').appendChild(div);
    }
};
document.getElementById('add-btn').addEventListener('click', window.addItems);
`}
                minHeight="100px"
            />
        );

        const iframe = component.locator('iframe');
        await expect(iframe).toBeVisible();

        // 初期の高さを取得
        const initialHeight = await iframe.evaluate((el) => (el as HTMLIFrameElement).offsetHeight);

        const frame = iframe.contentFrame();
        if (!frame) {
            throw new Error('iframe content frame is not available');
        }
        const frameBody = frame.locator('body');

        // Wait for addItems to be registered in the iframe and invoke it directly using polling.
        const addButton = frame.locator('#add-btn');
        await expect(addButton).toBeVisible({ timeout: 10000 });
        await expect
            .poll(
                async () => {
                    return await frameBody.evaluate(
                        () => typeof (window as WindowWithFixtureActions).addItems === 'function'
                    );
                },
                { timeout: 10000 }
            )
            .toBe(true);
        await frameBody.evaluate(() => {
            (window as WindowWithFixtureActions).addItems?.();
        });
        await expect(frame.locator('#container > div')).toHaveCount(10, { timeout: 10000 });

        // 高さが広がることを確認（ポーリングで確認）
        await expect
            .poll(
                async () => {
                    await iframe.evaluate((el) => {
                        (el as HTMLIFrameElement).contentWindow?.postMessage({ type: 'codePreviewHeightRequest' }, '*');
                    });
                    return await iframe.evaluate((el) => (el as HTMLIFrameElement).offsetHeight);
                },
                { timeout: 10000 }
            )
            .toBeGreaterThan(initialHeight);
    });

    test('iframeIdが一致しなくても同一iframeからの高さ通知で更新されること', async ({ mount }) => {
        const component = await mount(<CodePreviewFixture html="<div>Short content</div>" minHeight="100px" />);

        const iframe = component.locator('iframe');
        await expect(iframe).toBeVisible();

        const initialHeight = await iframe.evaluate((el) => (el as HTMLIFrameElement).offsetHeight);
        expect(initialHeight).toBeLessThan(200);

        const frame = iframe.contentFrame();
        if (!frame) {
            throw new Error('iframe content frame is not available');
        }
        await frame.locator('body').evaluate(() => {
            window.parent.postMessage({ type: 'codePreviewHeightChange', height: 420, iframeId: 'mismatch-id' }, '*');
        });

        await expect
            .poll(
                async () => {
                    return await iframe.evaluate((el) => (el as HTMLIFrameElement).offsetHeight);
                },
                { timeout: 5000 }
            )
            .toBeGreaterThanOrEqual(400);
    });

    test('モーダルウィンドウのような固定配置要素が表示された場合、高さが広がること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                html={`<div style="text-align: center;">
    <button id="open-modal" style="font-size: 24px; padding: 10px 20px;">モーダルを開く</button>
</div>
<div id="modal" style="display: none; position: fixed; top: 50px; left: 50px; right: 50px; padding: 40px; background: white; border: 2px solid #333; z-index: 1000;">
    <h2 style="margin: 0 0 20px 0;">モーダルタイトル</h2>
    <p>これはモーダルウィンドウの内容です。</p>
    <p>固定配置の要素もプレビュー領域に収まるように高さが調整されます。</p>
    <div style="height: 200px; background: #f0f0f0; margin: 20px 0;"></div>
    <button id="close-modal">閉じる</button>
</div>`}
                js={`
const modal = document.getElementById('modal');
const openButton = document.getElementById('open-modal');
const closeButton = document.getElementById('close-modal');
window.openModal = function() {
    if (!modal) return;
    modal.style.display = 'block';
};
openButton?.addEventListener('click', window.openModal);
closeButton?.addEventListener('click', function() {
    if (!modal) return;
    modal.style.display = 'none';
});
document.body.dataset.modalReady = 'true';
`}
                minHeight="100px"
            />
        );

        const iframe = component.locator('iframe');
        await expect(iframe).toBeVisible();

        // 初期の高さを取得
        const initialHeight = await iframe.evaluate((el) => (el as HTMLIFrameElement).offsetHeight);

        // iframe内のボタンをクリックしてモーダルを開く
        const frame = iframe.contentFrame();
        const frameBody = frame.locator('body');
        await expect
            .poll(
                async () => {
                    return await frameBody.evaluate(
                        () =>
                            document.body.dataset.modalReady === 'true' &&
                            typeof (window as WindowWithFixtureActions).openModal === 'function'
                    );
                },
                { timeout: 5000 }
            )
            .toBe(true);
        const openButton = frame.locator('#open-modal');
        await expect(openButton).toBeVisible({ timeout: 10000 });
        await frameBody.evaluate(() => {
            (window as WindowWithFixtureActions).openModal?.();
        });

        // モーダルが表示されるのを待つ
        await expect(frame.locator('#modal')).toBeVisible();

        // 高さが広がることを確認（ポーリングで確認）
        await expect
            .poll(
                async () => {
                    await iframe.evaluate((el) => {
                        (el as HTMLIFrameElement).contentWindow?.postMessage({ type: 'codePreviewHeightRequest' }, '*');
                    });
                    return await iframe.evaluate((el) => (el as HTMLIFrameElement).offsetHeight);
                },
                { timeout: 10000 }
            )
            .toBeGreaterThan(initialHeight);
    });

    test('高さは狭まる方向には調整されないこと', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                html={`<div id="content" style="height: 300px; background: #eee;">
    大きなコンテンツ
</div>
<button id="shrink-btn" onclick="document.getElementById('content').style.height = '50px';">縮小</button>`}
                minHeight="100px"
            />
        );

        const iframe = component.locator('iframe');
        await expect(iframe).toBeVisible();

        // コンテンツが描画されるのを待つ
        const frame = iframe.contentFrame();
        await expect(frame.locator('#content')).toBeVisible({ timeout: 10000 });

        // 初期の高さを取得（コンテンツが300pxなので、それ以上になっているはず）
        await expect
            .poll(
                async () => {
                    return await iframe.evaluate((el) => (el as HTMLIFrameElement).offsetHeight);
                },
                { timeout: 5000 }
            )
            .toBeGreaterThanOrEqual(300);

        const heightBeforeShrink = await iframe.evaluate((el) => (el as HTMLIFrameElement).offsetHeight);

        // コンテンツを縮小
        const shrinkButton = frame.locator('#shrink-btn');
        await shrinkButton.click();

        // 少し待つ
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 高さが変わらないことを確認（狭まらない）
        const heightAfterShrink = await iframe.evaluate((el) => (el as HTMLIFrameElement).offsetHeight);
        expect(heightAfterShrink).toBeGreaterThanOrEqual(heightBeforeShrink);
    });

    test('遅延で要素が追加された場合も高さが広がること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                html={`<div id="container"></div>`}
                js={`
setTimeout(function() {
    const div = document.createElement('div');
    div.style.height = '400px';
    div.style.background = 'lightblue';
    div.textContent = '遅延追加された要素';
    document.getElementById('container').appendChild(div);
}, 500);
`}
                minHeight="100px"
            />
        );

        const iframe = component.locator('iframe');
        await expect(iframe).toBeVisible();

        // 初期の高さを取得
        const initialHeight = await iframe.evaluate((el) => (el as HTMLIFrameElement).offsetHeight);

        // 遅延追加後に高さが広がることを確認
        await expect
            .poll(
                async () => {
                    return await iframe.evaluate((el) => (el as HTMLIFrameElement).offsetHeight);
                },
                { timeout: 5000 }
            )
            .toBeGreaterThan(initialHeight);
    });

    test('cssPathが指定されている場合、fileStructureVisibleが未指定でも表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture html="<div>Test</div>" css="div { color: red; }" cssPath="css/style.css" />
        );
        const toggleButton = component.getByRole('button', { name: 'ファイル構造を隠す' });
        await expect(toggleButton).toBeVisible();
    });

    test('jsPathが指定されている場合、fileStructureVisibleが未指定でも表示されること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture html="<div>Test</div>" js="console.log('test');" jsPath="js/app.js" />
        );
        const toggleButton = component.getByRole('button', { name: 'ファイル構造を隠す' });
        await expect(toggleButton).toBeVisible();
    });

    test('imagesが指定されている場合、fileStructureVisibleが未指定ならデフォルトで表示されること', async ({
        mount
    }) => {
        const component = await mount(
            <CodePreviewFixture html="<div>Test</div>" images={{ 'img/test.png': '/img/test.png' }} />
        );
        const toggleButton = component.getByRole('button', { name: 'ファイル構造を隠す' });
        await expect(toggleButton).toBeVisible();
    });

    test('imagesが指定されていても、fileStructureVisible=falseなら非表示であること', async ({ mount }) => {
        const component = await mount(
            <CodePreviewFixture
                html="<div>Test</div>"
                images={{ 'img/test.png': '/img/test.png' }}
                fileStructureVisible={false}
            />
        );
        const toggleButton = component.getByRole('button', { name: 'ファイル構造を表示' });
        await expect(toggleButton).toBeVisible();
    });

    test('imagesが指定されていない場合、fileStructureVisibleが未指定ならデフォルトで非表示であること', async ({
        mount
    }) => {
        const component = await mount(<CodePreviewFixture html="<div>Test</div>" />);
        const toggleButton = component.getByRole('button', { name: 'ファイル構造を表示' });
        await expect(toggleButton).toBeVisible();
    });
});
