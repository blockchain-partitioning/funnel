const globby = require('globby');
const Utensil = require('../utensil/utensil');
const Apex = require('../utensil/apex');

class Funnel{
    constructor(){
        this._filters = [];
    }

    /**
     * @desc Add a filter to the funnel.
     * @param {string} filter - Should conform to the glob spec.
     */
    addFilter(filter){
        this._filters.push(filter);
    }

    async conduct(){
        try {
            console.info("Conducting files...");
            const paths = await globby(this._filters, {cwd: Utensil.fromPath()});
            paths.forEach(fileName => {
                try {
                    if (Utensil.logDebug()) {
                        console.log("Conducting file:", fileName);
                        Apex.tube(fileName);
                        console.log("Conducted file");
                    }
                    else {
                        Apex.tube(fileName);
                    }
                }
                catch (e) {
                    console.error("Error conducting file:", fileName);
                    console.error(e);
                }
            });
            console.info('Finished conducting files.');
        }
        catch (e) {
            console.error("Error reading paths glob.");
            console.error(e);
            process.exit(1);
        }
    }
}

module.exports = Funnel;