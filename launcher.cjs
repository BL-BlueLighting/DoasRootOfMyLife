// CJS launcher that loads the ncc ESM bundle
(async () => {
  await import('./bundle/index.mjs');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
