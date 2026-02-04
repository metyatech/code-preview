import { useEffect, useState } from 'react';
import { CodePreviewFixture } from './CodePreviewFixture';

interface PathChangeFixtureProps {
    sourceId: string;
    html: string;
}

export const PathChangeFixture = ({ sourceId, html }: PathChangeFixtureProps) => {
    const [showConsumer, setShowConsumer] = useState(false);

    useEffect(() => {
        const originalState = history.state;
        const { pathname, search, hash } = window.location;
        const originalUrl = `${pathname}${search}${hash}`;

        history.replaceState({}, '', '/page-b');
        const timer = setTimeout(() => setShowConsumer(true), 0);

        return () => {
            clearTimeout(timer);
            history.replaceState(originalState, '', originalUrl);
        };
    }, []);

    return (
        <div>
            <CodePreviewFixture sourceId={sourceId} html={html} />
            {showConsumer && (
                <div id="consumer-after-path-change">
                    <CodePreviewFixture sourceId={sourceId} />
                </div>
            )}
        </div>
    );
};
