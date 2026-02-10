const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env file
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const domain = process.env.NGROK_DOMAIN;
const port = process.env.PORT || 8081;

if (!domain) {
  console.error(
    "\x1b[31m%s\x1b[0m",
    "Error: NGROK_DOMAIN is not defined in .env file.",
  );
  console.log(
    "Please add NGROK_DOMAIN=your-domain.ngrok-free.dev to your .env file.",
  );
  process.exit(1);
}

console.log(`Starting ngrok tunnel for domain: ${domain} on port ${port}...`);

const command = `ngrok http --url=${domain} ${port}`;
const child = exec(command);

// Stream output
child.stdout.on("data", (data) => console.log(data));
child.stderr.on("data", (data) => console.error(data));

child.on("close", (code) => {
  console.log(`ngrok process exited with code ${code}`);
});
