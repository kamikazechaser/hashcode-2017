fs = require('fs')
fs.readFile('./input/' + process.argv[2], 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    run(data);
});

function run(input) {
    var lines = input.split('\n').slice(0, -1) // remove the last element, which should be an empty one

    var config = lines[0].split(' ')
    var numberVideos = config[0] // from 0 to V - 1
    var numberEndpoints = config[1] // from 0 to E - 1
    var numberRequestDescriptions = config[2]
    var numberCacheServers = config[3] // from 0 to C - 1
    var capacityCacheServer = parseInt(config[4], 10)
    lines.shift()

    var videoSize = lines[0].split(' ')
    lines.shift()

    var cache = []
    var videos = videoSize.length
    for (var i = 0; i < numberCacheServers; i += 1) {
        cache[i] = {}
        cache[i].videoWeight = []
        for (var j = 0; j < videos; j += 1) {
            cache[i].videoWeight[j] = {
                'id': j,
                'value': 0
            }
        }
    }

    var item = lines[0].split(' ')
    var endpoint = []
    while (item.length == 2) {
        var point = {
            'centerLatency': item[0],
            'cache': []
        }
        lines.shift()
        for (var i = 0; i < item[1]; i += 1) {
            var cacheItem = lines[0].split(' ')
            point.cache.push({
                'id': cacheItem[0],
                'latency': cacheItem[1]
            })
            lines.shift()
        }
        endpoint.push(point)
        item = lines[0].split(' ')
    } 

    var request = []
    lines.forEach(function (item) {
            item = item.split(' ')
            item = {
                'videoId': item[0],
                'endpointId': item[1],
                'weight': item[2] // requests
            }
            request.push(item)
            var vSize = videoSize[item.videoId]
            if (vSize < capacityCacheServer) {
                var point = endpoint[item.endpointId]
                point.cache.forEach(function (server) {
                    var videoSizeScore = capacityCacheServer - vSize
                    var latencyScore = point.centerLatency - server.latency
                    var requestScore = item.weight * latencyScore
                    var value = cache[server.id].videoWeight[item.videoId].value
                    cache[server.id].videoWeight[item.videoId] = {
                        'id': parseInt(item.videoId, 10),
                        'value': value + videoSizeScore * latencyScore
                    }
                })
            }
        }) 

    var solutionForCacheServer = []
    for (var i = 0; i < numberCacheServers; i += 1) {
        var item = cache[i]
        var topContenders = item.videoWeight.sort(compareValues).reverse()
        var size = 0
        var solution = []
        topContenders.forEach(function (vWe) {
            vSize = parseInt(videoSize[vWe.id], 10)
            if (size + vSize < capacityCacheServer) {
                size += vSize
                solution.push(vWe.id)
            }
        })
        solutionForCacheServer.push(solution)
    }


    var solution = solutionForCacheServer.length + '\n'
    solutionForCacheServer.forEach(function (item, i) {
        solution += i + ' ' + item.join(' ') + '\n'
    })
    fs.writeFile('./output/' + process.argv[2] + '.out', solution, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('The file was saved!');
    });
}

function compareValues(a, b) {
    return a.value - b.value;
}