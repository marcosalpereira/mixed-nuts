const package_json = require('../package.json');
const fs = require('fs');

const envPath = process.argv[2];
let env = fs.readFileSync(envPath).toString();
const newEnv = env.replace(/version:.+/, `version: '${package_json.version}',`);

const outputFile = fs.createWriteStream(envPath);
outputFile.write(newEnv);
outputFile.close();

console.log(`environment version changed to ${package_json.version}`)