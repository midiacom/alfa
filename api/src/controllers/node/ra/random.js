const manual = {
    run: function(payload) {
        return payload.nodes[Math.floor(Math.random()*payload.nodes.length)].ip;
    }
}

module.exports = manual