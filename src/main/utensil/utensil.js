const Path = require('path');

class Utensil{
    static fromPath(){
        return Path.join('.', 'from');
    }
    static toPath(){
        return Path.join('.', 'to');
    }

    static logLevel(){
        return process.env.LOG_LEVEL || "ERROR";
    }

    static logDebug(){
        return Utensil.logLevel() === "DEBUG";
    }

    static filterType(){
        return process.env.FILTER_TYPE || "NONE";
    }
}

module.exports = Utensil;