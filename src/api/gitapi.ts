import type { StrippedGitResponse } from "../types";
import { parseGitRepoUrl } from "../utility";

const GIT_REPO_API_URL = "https://api.github.com/repos";

export class GitAPIManager {
    private name: string;
    constructor(remote_url: string) {
        this.name = parseGitRepoUrl(remote_url);
    }

    public getRepoInfo = async (): Promise<StrippedGitResponse | undefined> => {
        const responses = await Promise.allSettled([
            fetch(`${GIT_REPO_API_URL}/${this.name}`).then((r) => r.json()),
            fetch(`${GIT_REPO_API_URL}/${this.name}/community/profile`).then((r) =>
                r.json(),
            ),
            fetch(`${GIT_REPO_API_URL}/${this.name}/stats/commit_activity`).then(
                (r) => r.json(),
            ),
        ]);

        let repoObj: any, communityObj: any, statsObj: any;
        if (responses[0].status === "fulfilled") {
            repoObj = responses[0].value;
        }

        if (responses[1].status === "fulfilled") {
            communityObj = responses[1].value;
        }

        if (responses[2].status === "fulfilled") {
            statsObj = responses[2].value;
        }

        if (!repoObj || !communityObj || !statsObj) {
            console.error("There was an issue getting git repository informations");
            return undefined;
        }

        /// For now we can ignore the statsobj. I would see how to use it better in future when i really go deep into templating.
        // TODO: Make the git commit messages so identical the the authors by looking at how they wrote their previous commit messsages, choice of words and tone then using that to  make it professsional.
        // I would just leave this here, i don't want to forget later on. I would just use a a fuzzy search or grep to find you.
        // TODO: Incode commenting... ie you place markers around your code and the LLM does the commenting for you, not like the LLM reading through your files

        return {
            main_language: repoObj.language,
            stargazers_count: repoObj.stargazers_count,
            license: repoObj.license,
            watchers_count: repoObj.watchers_count,
            topics: repoObj.topics,
            watchers: repoObj.watchers,
            has_readme: communityObj.files.readme || false,
            health_percentage: communityObj.health_percentage,
        };
    };
}
