import { test, expect } from '@playwright/experimental-ct-react';
import { CodePreviewFixture } from './fixtures/CodePreviewFixture';

const THEMES: Array<'light' | 'dark'> = ['light', 'dark'];

test('all rendered elements satisfy contrast and boundary visibility', async ({ mount, page }) => {
  const issues: string[] = [];

  for (const theme of THEMES) {
    await page.emulateMedia({ colorScheme: theme });
    const component = await mount(
      <CodePreviewFixture
        title="Contrast Check"
        html={`<main><h1>Sample</h1><p>Preview text</p><button>Run</button></main>`}
        css={`
          main {
            padding: 16px;
            border: 1px solid #9aa4b2;
            border-radius: 8px;
          }
          button {
            border: 1px solid #8c98aa;
          }
        `}
        js={`console.log('contrast-check');`}
        consoleVisible={true}
        fileStructureVisible={true}
        cssPath="css/style.css"
        jsPath="js/app.js"
        images={{ 'img/logo.png': '/img/logo.png' }}
      />,
    );

    await expect(component).toBeVisible();
    await expect(component.locator('iframe')).toBeVisible();

    const pageIssues = await page.evaluate(() => {
      const toLinear = (value: number) => {
        const normalized = value / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };

      const parseColor = (text: string) => {
        const match = text.match(/rgba?\(([^)]+)\)/);
        if (!match) {
          return null;
        }
        const parts = match[1].split(',').map((part) => Number(part.trim()));
        if (parts.length < 3 || parts.some(Number.isNaN)) {
          return null;
        }
        return {
          red: parts[0],
          green: parts[1],
          blue: parts[2],
          alpha: parts.length >= 4 && !Number.isNaN(parts[3]) ? parts[3] : 1,
        };
      };

      const blend = (
        fg: { red: number; green: number; blue: number; alpha: number },
        bg: { red: number; green: number; blue: number; alpha: number },
      ) => {
        const alpha = fg.alpha + bg.alpha * (1 - fg.alpha);
        if (alpha <= 0) {
          return { red: 0, green: 0, blue: 0, alpha: 0 };
        }
        return {
          red: (fg.red * fg.alpha + bg.red * bg.alpha * (1 - fg.alpha)) / alpha,
          green: (fg.green * fg.alpha + bg.green * bg.alpha * (1 - fg.alpha)) / alpha,
          blue: (fg.blue * fg.alpha + bg.blue * bg.alpha * (1 - fg.alpha)) / alpha,
          alpha,
        };
      };

      const luminance = (color: { red: number; green: number; blue: number }) =>
        0.2126 * toLinear(color.red) +
        0.7152 * toLinear(color.green) +
        0.0722 * toLinear(color.blue);

      const contrast = (
        first: { red: number; green: number; blue: number },
        second: { red: number; green: number; blue: number },
      ) => {
        const l1 = luminance(first);
        const l2 = luminance(second);
        const [bright, dark] = l1 >= l2 ? [l1, l2] : [l2, l1];
        return (bright + 0.05) / (dark + 0.05);
      };

      const rootBackground = (() => {
        const root = parseColor(window.getComputedStyle(document.documentElement).backgroundColor);
        if (root && root.alpha > 0) {
          return root;
        }
        const body = parseColor(window.getComputedStyle(document.body).backgroundColor);
        if (body && body.alpha > 0) {
          return body;
        }
        return { red: 255, green: 255, blue: 255, alpha: 1 };
      })();

      const resolveBackground = (node: HTMLElement) => {
        let current: HTMLElement | null = node;
        let out = rootBackground;
        const chain: HTMLElement[] = [];
        while (current) {
          chain.unshift(current);
          current = current.parentElement;
        }
        for (const element of chain) {
          const bg = parseColor(window.getComputedStyle(element).backgroundColor);
          if (bg) {
            out = blend(bg, out);
          }
        }
        return out;
      };

      const ownText = (element: HTMLElement) => {
        const directText = Array.from(element.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent ?? '')
          .join(' ')
          .trim();
        if (directText.length > 0) {
          return directText;
        }
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          return `${element.value}${element.placeholder}`.trim();
        }
        return '';
      };

      const textIssues: string[] = [];
      const boundaryIssues: string[] = [];
      const elements = [...document.querySelectorAll<HTMLElement>('body *')];

      for (const element of elements) {
        const style = window.getComputedStyle(element);
        if (
          style.display === 'none' ||
          style.visibility !== 'visible' ||
          Number.parseFloat(style.opacity || '1') < 0.05
        ) {
          continue;
        }

        const rect = element.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) {
          continue;
        }

        const text = ownText(element);
        if (text.length > 0) {
          const fg = parseColor(style.color);
          if (fg) {
            const bg = resolveBackground(element);
            const fgBlended = blend(fg, bg);
            const ratio = contrast(fgBlended, bg);
            const fontSize = Number.parseFloat(style.fontSize || '16');
            const fontWeight = Number.parseInt(style.fontWeight || '400', 10);
            const largeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
            const minRatio = largeText ? 3 : 4.5;
            if (ratio < minRatio) {
              textIssues.push(
                `text ratio=${ratio.toFixed(2)} class=${String(element.className || '')}`,
              );
            }
          }
        }

        const borderWidth = Math.max(
          Number.parseFloat(style.borderTopWidth || '0'),
          Number.parseFloat(style.borderRightWidth || '0'),
          Number.parseFloat(style.borderBottomWidth || '0'),
          Number.parseFloat(style.borderLeftWidth || '0'),
        );
        if (borderWidth > 0 && rect.width * rect.height >= 300) {
          const borderColor = parseColor(style.borderTopColor);
          if (borderColor) {
            const parentBg = resolveBackground(element.parentElement ?? element);
            const blended = blend(borderColor, parentBg);
            const ratio = contrast(blended, parentBg);
            if (ratio < 3) {
              boundaryIssues.push(
                `boundary ratio=${ratio.toFixed(2)} class=${String(element.className || '')}`,
              );
            }
          }
        }
      }

      return [...textIssues.slice(0, 30), ...boundaryIssues.slice(0, 30)];
    });

    for (const issue of pageIssues) {
      issues.push(`${theme}: ${issue}`);
    }

    await component.unmount();
  }

  expect(issues.join('\n')).toBe('');
});
