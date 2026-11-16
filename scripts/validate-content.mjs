// Content checks. Demo: structural checks + pending report. Live: launch gates must pass.
// Usage: node scripts/validate-content.mjs [--mode=demo|live] [--form=preview|disabled|live]
import { loadContent, resolveConfig, validateContent } from '../src/lib/content.mjs';

const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1];
const config = resolveConfig({ mode: arg('mode'), formDelivery: arg('form') });
const result = validateContent(loadContent(), config);

console.log(`Mode: ${config.mode} · form delivery: ${config.formDelivery}`);
console.log(`${result.total - result.pending.length} confirmed, ${result.pending.length} pending content fields`);
for (const w of result.warnings) console.log(`  ! ${w}`);
if (result.errors.length) {
  console.error(`\n${result.errors.length} problem(s):`);
  for (const e of result.errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log('Content checks passed.');
