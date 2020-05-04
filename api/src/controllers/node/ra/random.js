const ra_random = {
    run: function(payload) {
        return payload.nodes[Math.floor(Math.random()*payload.nodes.length)];
    }
}

module.exports = ra_random 