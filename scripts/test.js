const path = require("path");
const execSync = require("child_process").execSync;

function exec(cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

const cwd = process.cwd();

[
  "@origin/contracts",
  "@origin/js",
  "@origin/marketplace"
].forEach(packageName => {
  process.chdir(path.resolve(__dirname, "../" + packageName));
  exec("npm run test");
});

process.chdir(cwd);
