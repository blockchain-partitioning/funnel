const Funnel = require('./funnel');

class RegularFunnel {
    static hasFilter(filter) {
        return filter.toLowerCase() === "NONE".toLowerCase();
    }

    static conduct() {
        const funnel = new Funnel();
        funnel.addFilter('**');
        funnel.conduct();
    }
}

module.exports = RegularFunnel;