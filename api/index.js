// Placeholder required so Vercel can match functions.api/index.js before build.
// The build command overwrites this file with the esbuild bundle.
export default function handler(_req, res) {
  res.statusCode = 500;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify({ error: "Serverless bundle was not generated" }));
}
