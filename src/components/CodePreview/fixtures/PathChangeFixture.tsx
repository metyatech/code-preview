import { useEffect, useState } from 'react';
import { CodePreviewFixture } from './CodePreviewFixture';

interface PathChangeFixtureProps {
    sourceId: string;
    html: string;
}

export const PathChangeFixture = ({ sourceId, html }: PathChangeFixtureProps) => {
    const [showConsumer, setShowConsumer] = useState(false);

    useEffect(() => {
        history.replaceState({}, '', '/page-b');
        setShowConsumer(true);
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
