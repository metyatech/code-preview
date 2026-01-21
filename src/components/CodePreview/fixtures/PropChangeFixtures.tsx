import { useState } from 'react';
import CodePreview from '../index';

export const InitialHtmlChangeFixture = () => {
    const [useOverride, setUseOverride] = useState(true);
    const raw = '```html\n<div id="child-html">Child</div>\n```';

    return (
        <div>
            <button id="toggle-html" onClick={() => setUseOverride(false)}>toggle</button>
            <CodePreview
                sourceId="prop-change-html"
                initialHTML={useOverride ? "<div id='override-html'>Override</div>" : undefined}
            >
                {raw}
            </CodePreview>
            <div id="consumer-html">
                <CodePreview sourceId="prop-change-html" />
            </div>
        </div>
    );
};

export const InitialCssChangeFixture = () => {
    const [useOverride, setUseOverride] = useState(true);
    const raw = '```css\n#color-box { color: red; }\n```';

    return (
        <div>
            <button id="toggle-css" onClick={() => setUseOverride(false)}>toggle</button>
            <CodePreview
                sourceId="prop-change-css"
                initialHTML="<div id='color-box'>Box</div>"
                initialCSS={useOverride ? '#color-box { color: blue; }' : undefined}
                initialJS=""
            >
                {raw}
            </CodePreview>
            <div id="consumer-css">
                <CodePreview sourceId="prop-change-css" />
            </div>
        </div>
    );
};

export const InitialJsChangeFixture = () => {
    const [useOverride, setUseOverride] = useState(true);
    const raw = '```js\ndocument.body.setAttribute(\"data-js\", \"child\");\n```';

    return (
        <div>
            <button id="toggle-js" onClick={() => setUseOverride(false)}>toggle</button>
            <CodePreview
                sourceId="prop-change-js"
                initialHTML="<div>JS</div>"
                initialCSS="body { margin: 0; }"
                initialJS={useOverride ? 'document.body.setAttribute(\"data-js\", \"prop\");' : undefined}
            >
                {raw}
            </CodePreview>
            <div id="consumer-js">
                <CodePreview sourceId="prop-change-js" />
            </div>
        </div>
    );
};
