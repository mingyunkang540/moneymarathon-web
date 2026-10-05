import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import process from 'node:process'
import { build } from 'vite'

const projectRoot = process.cwd()
const htmlPath = path.join(projectRoot, 'dist', 'index.html')
const serverOutDir = path.join(
  projectRoot,
  'node_modules',
  '.cache',
  'moneymarathon-prerender',
)
const serverEntryPath = path.join(serverOutDir, 'entry-static.js')

await build({
  root: projectRoot,
  mode: 'production',
  publicDir: false,
  build: {
    ssr: 'src/entry-static.tsx',
    outDir: serverOutDir,
    emptyOutDir: true,
    copyPublicDir: false,
  },
})

const [{ render }, html] = await Promise.all([
  import(pathToFileURL(serverEntryPath).href),
  readFile(htmlPath, 'utf8'),
])

const rootPattern = /<div id="root"><\/div>/
if (!rootPattern.test(html)) {
  throw new Error(`Could not find the empty #root element in ${htmlPath}`)
}

const renderedHtml = html.replace(rootPattern, `<div id="root">${render()}</div>`)
await writeFile(htmlPath, renderedHtml, 'utf8')
