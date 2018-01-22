const os = require('os');
const path = require('path');
const Funnel = require('../funnel');

// For instance:
// - 'HOSTNAME': Funnels data based on the 'hostname' of a a pod.
//               Would copy files only if a directory or sub-directory matches the current hostname.
//               This is useful when mapping configMaps into a StatefulSet.
class HostnameFunnel {
    static hasFilter(filter) {
        return filter.toLowerCase() === 'HOST_NAME'.toLowerCase();
    }

    static conduct() {
        const funnel = new Funnel();
        funnel.addFilter(path.join('**', os.hostname(), '**'));
        funnel.conduct();
    }
}

module.exports = HostnameFunnel;