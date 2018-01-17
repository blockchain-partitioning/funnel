const Path = require('path');
const fs = require('fs-extra');
const globby = require('globby');

const fromPath = Path.join('.', 'from');
const toPath = Path.join('.', 'to');
const logLevel = process.env.LOG_LEVEL || "ERROR";
const logDebug = logLevel === "DEBUG";

console.info("Writing files...");
(async () => {
    try {
        const paths = await globby('**', {cwd: fromPath});
        paths.forEach(fileName => {
            try {
                if (logDebug) {
                    console.log("Copying file:", fileName);
                    copy(fileName);
                    console.log("Copied file");
                }
                else {
                    copy(fileName);
                }
            }
            catch (e) {
                console.error("Error copying file:", fileName);
                console.error(e);
            }
        });
        console.info('Finished writing files.');
    }
    catch (e) {
        console.error("Error reading paths glob.");
        console.error(e);
        process.exit(1);
    }
})();

function copy(fileName) {
    const from = Path.join(fromPath, fileName);
    const contents = fs.readFileSync(from);
    if (logDebug) {
        console.log("File contents:", contents.toString());
    }
    const to = Path.join(toPath, fileName);
    fs.outputFileSync(to, contents);
}
