// Copyright 2014-2015, Renasar Technologies Inc.
/* jshint node: true */

"use strict";

var di = require('di');

module.exports = Runner;

di.annotate(Runner, new di.Provide('Http'));
di.annotate(Runner, new di.Inject(
        'Http.Server',
        'Services.Core',
        'Services.Configuration',
        'stomp',
        'common-api-router',
        'common-stomp-resources',
        'gridfs',
        'Q'
    )
);
function Runner(app, core, configuration, stomp, router, resources, gridfs, Q) {
    function start() {
        return core.start()
            .then(function() {

                // TODO (benbp): Remove this, it's deprecated. Issue is the overlay
                // rc.local script still has this URL in it and we would need
                // to update the overlays at a customer site. Time-saving
                // workaround for now, since we ship tomorrow.
                app.use('/api/rack', router);
                app.use('/api/common', router);

                resources.register(stomp);

                return gridfs.start();
            })
            .then(function() {
                app.listen(configuration.get('httpport'));
            });
    }

    function stop() {
        return Q.resolve()
            .then(function() {
                return app.close();
            })
            .then(function() {
                return core.stop();
            });
    }

    return {
        start: start,
        stop: stop
    };
}