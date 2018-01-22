const Path = require('path');
const fs = require('fs-extra');
const Utensil = require('./utensil');

class Apex {
    /**
     * @desc Copies a file from one path, to another path.
     * @param {string} fileName
     */
    static tube(fileName) {
        const from = Path.join(Utensil.fromPath(), fileName);
        const contents = fs.readFileSync(from);
        if (Utensil.logDebug()) {
            console.log("File contents:", contents.toString());
        }
        const to = Path.join(Utensil.toPath(), fileName);
        fs.outputFileSync(to, contents);
    }
}

module.exports = Apex;