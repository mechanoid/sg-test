var path = require('path')
    , through = require('through2');

module.exports = {
  applyTo(config, options) {
    return through.obj(function(file, enc, cb) {
      if (file.isNull()) {
        return cb(null, file);
      }

      if (file.isStream()) {
        return cb(new PluginError(PLUGIN_NAME, 'Streams are not supported'));
      }

      var data = file.data ? file.data : {};
      var context = Object.assign({}, config, data);
      var componentPath = context.pathes.find((p) => file.path.startsWith(p));
      var componentID = path.dirname(file.path).slice(componentPath.length + 1);

      config.components = config.components || {};
      config.components[componentID] = config.components[componentID] || {};
      config.components[componentID]['content'] = file.contents.toString();

      cb(null, file);
    });
  }
}
