const logger = require('./logger')('extensions');
/**
 * Explicitly tells that promise should be run asynchonously.
 */
Promise.prototype.logError = function () {
    this.catch(e => {
        logger.error(e);
    });
};
//# sourceMappingURL=extensions.js.map