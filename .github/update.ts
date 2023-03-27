import { parse } from 'https://deno.land/std@v0.181.0/yaml/parse.ts'

const repositoryNames = parse(await Deno.readTextFile('./opensource.yml')) as { full_name: string, description: string, html_url: string, stargazers_count: number }[]

for (const name of repositoryNames) {
  const result = await (await fetch(`https://api.github.com/repos/${name}`)).json()

  console.log(result)
  repositoryNames[repositoryNames.indexOf(name)] = result
}

const azurystudioRepositories = repositoryNames.filter(item => item.full_name.startsWith('azurystudio'))
const boywithkeyboardRepositories = repositoryNames.filter(item => item.full_name.startsWith('boywithkeyboard'))

// sort repositorie

let portfolio = '## opensource\n'

const formatter = new Intl.NumberFormat('en', { notation: 'compact' })

portfolio += '\n- **@azurystudio**\n'

for (const repository of azurystudioRepositories.sort((a, b) => a.stargazers_count < b.stargazers_count ? 1 : a.stargazers_count > b.stargazers_count ? -1 : 0)) {
  portfolio += `  - **${formatter.format(repository.stargazers_count)}** ⭐ - [**${repository.full_name}**](${repository.html_url})\n\`\`\`\n${repository.description}\n\`\`\`  \n`
}

portfolio += '\n- **@boywithkeyboard**\n'

for (const repository of boywithkeyboardRepositories.sort((a, b) => a.stargazers_count < b.stargazers_count ? 1 : a.stargazers_count > b.stargazers_count ? -1 : 0)) {
  portfolio += `  - **${formatter.format(repository.stargazers_count)}** ⭐ - [**${repository.full_name}**](${repository.html_url})\n\`\`\`\n${repository.description}\n\`\`\`  \n`
}

const sha = (await (await fetch('https://api.github.com/repos/boywithkeyboard/opensource/contents/readme.md')).json()).sha

await fetch('https://api.github.com/repos/boywithkeyboard/opensource/contents/readme.md', {
  method: 'PUT',
  headers: {
    authorization: `bearer ${Deno.env.get('token')}`
  },
  body: JSON.stringify({
    sha,
    committer: {
      name: 'Github',
      email: 'noreply@github.com'
    },
    message: 'update',
    content: btoa(portfolio)
  })
})
