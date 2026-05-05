const ROOT = import.meta.dir;

let bundledJS = "";

async function rebuild() {
  const result = await Bun.build({
    entrypoints: [ROOT + "/src/index.ts"],
    target: "browser",
    format: "esm",
    splitting: false,
  });
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    return false;
  }
  bundledJS = await result.outputs[0].text();
  console.log(`Build done (${bundledJS.length} bytes)`);
  return true;
}

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Rebuild on every request to the entry point (so editing src/ + browser refresh works)
    if (url.pathname === "/src/index.ts") {
      await rebuild();
      return new Response(bundledJS, {
        headers: { "Content-Type": "application/javascript;charset=utf-8" },
      });
    }

    if (url.pathname === "/") {
      return new Response(Bun.file(ROOT + "/examples/index.html"), {
        headers: { "Content-Type": "text/html;charset=utf-8" },
      });
    }

    // Serve other static files
    const file = Bun.file(ROOT + url.pathname);
    if (await file.exists()) {
      return new Response(file);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Dev server: http://localhost:${server.port}`);
