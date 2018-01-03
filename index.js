const Path = require('path');
const fs = require('fs-extra');
const globby = require('globby');

const fromPath = Path.join('.', 'from');
const toPath = Path.join('.', 'to');

console.info("Writing files...");
(async () => {
    const paths = await globby('**', {cwd: fromPath});
    paths.forEach(filePath => {
        const contents = fs.readFileSync(Path.join(fromPath, filePath));
        fs.outputFileSync(Path.join(toPath, filePath), contents);
    });
    console.info('Finished writing files.');
})();
