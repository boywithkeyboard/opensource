import { parse } from 'https://deno.land/std@v0.181.0/yaml/parse.ts'
import { Octokit } from 'https://esm.sh/@octokit/rest@19.0.7'

const repositoryNames = parse(await Deno.readTextFile('./opensource.yml')) as { full_name: string, description: string, html_url: string, stargazers_count: number }[]

for (const name of repositoryNames) {
  const result = await (await fetch(`https://api.github.com/repos/${name}`)).json()

  repositoryNames[repositoryNames.indexOf(name)] = result
}

const azurystudioRepositories = repositoryNames.filter(item => item.full_name.startsWith('azurystudio'))
const boywithkeyboardRepositories = repositoryNames.filter(item => item.full_name.startsWith('boywithkeyboard'))

// sort repositorie

let portfolio = '## opensource\n'

const formatter = new Intl.NumberFormat('en', { notation: 'compact' })

portfolio += '\n- **@azurystudio**\n'

for (const repository of azurystudioRepositories.sort((a, b) => a.stargazers_count < b.stargazers_count ? 1 : a.stargazers_count > b.stargazers_count ? -1 : 0)) {
  portfolio += `    - **${formatter.format(repository.stargazers_count)}** ⭐ - [**${repository.full_name}**](${repository.html_url})\n    \`\`\`\n    ${repository.description}\n    \`\`\`  \n`
}

portfolio += '\n- **@boywithkeyboard**\n'

for (const repository of boywithkeyboardRepositories.sort((a, b) => a.stargazers_count < b.stargazers_count ? 1 : a.stargazers_count > b.stargazers_count ? -1 : 0)) {
  portfolio += `    - **${formatter.format(repository.stargazers_count)}** ⭐ - [**${repository.full_name}**](${repository.html_url})\n    \`\`\`\n    ${repository.description}\n    \`\`\`  \n`
}

const sha = (await (await fetch('https://api.github.com/repos/boywithkeyboard/opensource/contents/readme.md')).json()).sha

const octokit = new Octokit({
  auth: Deno.env.get('token')
})

await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
  owner: 'boywithkeyboard',
  repo: 'opensource',
  path: 'readme.md',
  message: 'update',
  sha,
  committer: {
    name: 'Github',
    email: 'noreply@github.com'
  },
  content: btoa(unescape(encodeURIComponent(portfolio))),
  headers: {
    'X-GitHub-Api-Version': '2022-11-28'
  }
})
