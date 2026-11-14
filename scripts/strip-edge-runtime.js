const fs = require('fs')
const path = require('path')

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f)
    const st = fs.statSync(fp)
    if (st.isDirectory() && !f.startsWith('.') && f !== 'node_modules') {
      walk(fp)
    } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
      let c = fs.readFileSync(fp, 'utf8')
      const original = c
      c = c.replace(/export const runtime = ['"]edge['"]\n?/g, '')
      if (c !== original) {
        fs.writeFileSync(fp, c)
      }
    }
  }
}

walk('app')
console.log('[strip-edge-runtime] Removed runtime=edge declarations for non-CF build')