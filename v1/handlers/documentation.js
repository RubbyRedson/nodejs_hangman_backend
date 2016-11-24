var documentation = {};

documentation.getDocs = function(req, res, endpoints) {
    if (req.params.format == "json") {
        docsWithJson(req, res, endpoints);
    } else if (req.params.format == "html") {
        docsWithHtml(req, res, endpoints);
    } else {
        res.send("Could not find format. Supported formats are JSON and HTML", 400);
    }
};

function docsWithHtml(req, res, endpoints) {

    var content = [];

    //Pre process the data
    for (var key in endpoints) {
        content.push({
            title: key,
            url: endpoints[key].url,
            description: endpoints[key].description,
            method: endpoints[key].method,
            handler: endpoints[key].handler.toString(),
            handlerName: endpoints[key].handlerName,
            expectedInput: endpoints[key].expectedInput,
            expectedOutput: endpoints[key].expectedOutput
        });
    }

    res.render('docs', {
        head: {
            title: 'page title'
        },
        endpoints: content
    });
}

function docsWithJson(req, res, endpoints) {

    console.log(endpoints);

    var output = {};
    output.endpoints = endpoints;

    res.status(200).send(output);
}



module.exports = documentation;
