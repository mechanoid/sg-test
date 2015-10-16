var path = require('path')
    , through = require('through2');

module.exports = {
  load(options) {
    return through.obj(function(file, enc, cb) {
      if (file.isNull()) {
        return cb(null, file);
      }

      if (file.isStream()) {
        return cb(new PluginError(PLUGIN_NAME, 'Streams are not supported'));
      }

      var data = file.data ? file.data : {};
      var context = Object.assign({}, options, data);
      var componentPath = context.pathes.find((p) => file.path.startsWith(p));
      var componentID = path.dirname(file.path).slice(componentPath.length + 1);

      context.components = context.components || {};
      context.components[componentID] = context.components[componentID] || {};
      context.components[componentID]['content'] = file.contents.toString();

      file.data = context;
      cb(null, file);
    });
  }
}
