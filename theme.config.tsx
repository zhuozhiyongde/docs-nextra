import Image from 'next/image';

const themeConfig = {
    logo: (
        <>
            <Image src="/Arthals-mcskin.png" alt="" width={24} height={24} />
            <style jsx>{`
                span {
                    padding: 0.5rem 0.5rem 0.5rem 0;
                    mask-image: linear-gradient(60deg, black 25%, rgba(0, 0, 0, 0.2) 50%, black 75%);
                    mask-size: 400%;
                    mask-position: 0%;
                    display: flex;
                    align-items: center;
                    font-size: 16px;
                    font-weight: 600;
                    margin-left: 8px;
                }
                span:hover {
                    mask-position: 100%;
                    transition: mask-position 1s ease, -webkit-mask-position 1s ease;
                }
            `}</style>
            <span>Arthals&apos; Docs</span>
        </>
    ),
    project: {
        link: 'https://github.com/zhuozhiyongde',
    },
    footer: {
        text: (
            <span>
                MIT {new Date().getFullYear()} ©{' '}
                <a href="https://arthals.ink" target="_blank">
                    Arthals
                </a>
            </span>
        ),
    },
    // ... other theme options
};

export default themeConfig;
