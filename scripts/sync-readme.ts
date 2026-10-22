const readmePath = new URL('../README.md', import.meta.url)
const readme = await Bun.file(readmePath).text()
const block = /<!-- example: (\S+) -->\n[\s\S]*?<!-- \/example -->/g

let synced = readme
for (const [match, path] of readme.matchAll(block)) {
  const code = (await Bun.file(new URL(`../${path}`, import.meta.url)).text()).trimEnd()
  const lang = path.endsWith('.tsx') ? 'tsx' : 'ts'
  synced = synced.replace(match, `<!-- example: ${path} -->\n\`\`\`${lang}\n${code}\n\`\`\`\n<!-- /example -->`)
}

if (process.argv.includes('--check')) {
  if (synced !== readme) {
    console.error('README examples are out of date. Run: bun run readme')
    process.exit(1)
  }
} else {
  await Bun.write(readmePath, synced)
}
