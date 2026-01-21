import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

const clientChunks = new Set(['index', 'client', 'CodePreviewClient']);
const sharedChunks = {
    CodePreviewShared: ['src/components/CodePreview/utils/codeBlockParser.ts'],
};

export default {
    input: {
        index: 'src/index.ts',
        client: 'src/client.ts',
        server: 'src/server.tsx'
    },
    output: [
        {
            dir: 'dist',
            format: 'esm',
            sourcemap: true,
            entryFileNames: '[name].esm.js',
            chunkFileNames: '[name]-[hash].esm.js',
            banner: (chunk) => (clientChunks.has(chunk.name) ? '"use client";\n' : ''),
            manualChunks: {
                CodePreviewClient: ['src/components/CodePreview/CodePreviewClient.tsx'],
                ...sharedChunks
            }
        },
        {
            dir: 'dist',
            format: 'cjs',
            sourcemap: true,
            entryFileNames: '[name].cjs',
            chunkFileNames: '[name]-[hash].cjs',
            banner: (chunk) => (clientChunks.has(chunk.name) ? '"use client";\n' : ''),
            manualChunks: {
                CodePreviewClient: ['src/components/CodePreview/CodePreviewClient.tsx'],
                ...sharedChunks
            }
        }
    ],
    external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@monaco-editor/react'
    ],
    plugins: [
        resolve(),
        commonjs(),
        postcss({
            // ビルド時に CSS を別ファイルに抽出せず、JS に注入しておくことで、
            // 利用側が単にコンポーネントを import するだけでスタイルが適用されるようにします。
            // (必要に応じて再度 extract に戻すか、分離した styles.css を公開する選択肢も残せます)
            inject: true,
            modules: {
                // CSS Modulesを有効化
                generateScopedName: '[name]__[local]__[hash:base64:5]'
            },
            plugins: [autoprefixer()]
        }),
        typescript({ tsconfig: './tsconfig.json', sourceMap: true })
    ]
};
