function _runPythonViaPyodide(pythonCode, packages, callback) {
    loadPyodide(/*{ indexURL : "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/" }*/)
    .then((pyodide) => {
        Promise.all(packages.map(packageName => pyodide.loadPackage(packageName)))
        .then(() => {
            pyodide.runPython(pythonCode);
            callback();
        });
    });
}

function scipy_ndimage_label(inp, callback) {
    window.inp = JSON.stringify(inp);
    const pythonCode = `
        import json
        from scipy.ndimage import label
        import numpy as np
        import js

        a = np.array(json.loads(js.inp))
        labeled_array, num_features = label(a)
        js.labeled_array = labeled_array.tolist()
        js.num_features = num_features
    `
    _runPythonViaPyodide(pythonCode, ['scipy', 'numpy'], function() {
        callback(JSON.parse(labeled_array.toString()), num_features);
    })
}

module.exports = {
    scipy_ndimage_label
}