import { UilGithub } from '~components/Icons/GitHub';
import { Cards, Card } from 'nextra/components';

export function ToGitHub({ repo }: { repo: string }) {
    return (
        <Cards num={1}>
            <Card
                arrow
                href={`https://github.com/${repo}`}
                title={`${repo} - GitHub`}
                icon={<UilGithub />}
                // @ts-ignore
                target="_blank"
            />
        </Cards>
    );
}
