'use strict';

/**
 * Construct new invalid argument error.
 *
 * @constructor
 * @param {string} [message] - Human-readable description of the error.
 */
function InvalidArgumentError(message) {
    var parent = new InvalidArgumentError.super_(message);
    this.name = 'InvalidArgumentError';

    if (parent.stack) {
        parent.name = this.name;
        this.stack = parent.stack.replace(/\n[^\n]*/,'');
    }
}

util.inherits(InvalidArgumentError, Error);

// Export to global scope.
global.InvalidArgumentError = InvalidArgumentError;
