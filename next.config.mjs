import withNextra from 'nextra';

/** @type {import('next').NextConfig} */
const nextConfig = withNextra({
    theme: 'nextra-theme-docs',
    themeConfig: './theme.config.tsx',
    staticImage: true,
    latex: true,
    flexsearch: {
        codeblocks: false,
    },
    defaultShowCopyCode: true,
});

export default nextConfig;
