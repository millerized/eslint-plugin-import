'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _readPkgUp = require('read-pkg-up');

var _readPkgUp2 = _interopRequireDefault(_readPkgUp);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _importType = require('../core/importType');

var _importType2 = _interopRequireDefault(_importType);

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDependencies(context, packageDir) {
  try {
    const packageContent = packageDir ? JSON.parse(_fs2.default.readFileSync(_path2.default.join(packageDir, 'package.json'), 'utf8')) : _readPkgUp2.default.sync({ cwd: context.getFilename(), normalize: false }).pkg;

    if (!packageContent) {
      return null;
    }

    return {
      dependencies: packageContent.dependencies || {},
      devDependencies: packageContent.devDependencies || {},
      optionalDependencies: packageContent.optionalDependencies || {},
      peerDependencies: packageContent.peerDependencies || {}
    };
  } catch (e) {
    if (packageDir && e.code === 'ENOENT') {
      context.report({
        message: 'The package.json file could not be found.',
        loc: { line: 0, column: 0 }
      });
    }
    if (e.name === 'JSONError' || e instanceof SyntaxError) {
      context.report({
        message: 'The package.json file could not be parsed: ' + e.message,
        loc: { line: 0, column: 0 }
      });
    }

    return null;
  }
}

function missingErrorMessage(packageName) {
  return `'${packageName}' should be listed in the project's dependencies. ` + `Run 'npm i -S ${packageName}' to add it`;
}

function devDepErrorMessage(packageName) {
  return `'${packageName}' should be listed in the project's dependencies, not devDependencies.`;
}

function optDepErrorMessage(packageName) {
  return `'${packageName}' should be listed in the project's dependencies, ` + `not optionalDependencies.`;
}

function reportIfMissing(context, deps, depsOptions, node, name) {
  if ((0, _importType2.default)(name, context) !== 'external') {
    return;
  }
  const splitName = name.split('/');
  const packageName = splitName[0][0] === '@' ? splitName.slice(0, 2).join('/') : splitName[0];
  const isInDeps = deps.dependencies[packageName] !== undefined;
  const isInDevDeps = deps.devDependencies[packageName] !== undefined;
  const isInOptDeps = deps.optionalDependencies[packageName] !== undefined;
  const isInPeerDeps = deps.peerDependencies[packageName] !== undefined;

  if (isInDeps || depsOptions.allowDevDeps && isInDevDeps || depsOptions.allowPeerDeps && isInPeerDeps || depsOptions.allowOptDeps && isInOptDeps) {
    return;
  }

  if (isInDevDeps && !depsOptions.allowDevDeps) {
    context.report(node, devDepErrorMessage(packageName));
    return;
  }

  if (isInOptDeps && !depsOptions.allowOptDeps) {
    context.report(node, optDepErrorMessage(packageName));
    return;
  }

  context.report(node, missingErrorMessage(packageName));
}

function testConfig(config, filename) {
  // Simplest configuration first, either a boolean or nothing.
  if (typeof config === 'boolean' || typeof config === 'undefined') {
    return config;
  }
  // Array of globs.
  return config.some(c => (0, _minimatch2.default)(filename, c) || (0, _minimatch2.default)(filename, _path2.default.join(process.cwd(), c)));
}

module.exports = {
  meta: {
    docs: {},

    schema: [{
      'type': 'object',
      'properties': {
        'devDependencies': { 'type': ['boolean', 'array'] },
        'optionalDependencies': { 'type': ['boolean', 'array'] },
        'peerDependencies': { 'type': ['boolean', 'array'] },
        'packageDir': { 'type': 'string' }
      },
      'additionalProperties': false
    }]
  },

  create: function (context) {
    const options = context.options[0] || {};
    const filename = context.getFilename();
    const deps = getDependencies(context, options.packageDir);

    if (!deps) {
      return {};
    }

    const depsOptions = {
      allowDevDeps: testConfig(options.devDependencies, filename) !== false,
      allowOptDeps: testConfig(options.optionalDependencies, filename) !== false,
      allowPeerDeps: testConfig(options.peerDependencies, filename) !== false

      // todo: use module visitor from module-utils core
    };return {
      ImportDeclaration: function (node) {
        reportIfMissing(context, deps, depsOptions, node, node.source.value);
      },
      CallExpression: function handleRequires(node) {
        if ((0, _staticRequire2.default)(node)) {
          reportIfMissing(context, deps, depsOptions, node, node.arguments[0].value);
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzLmpzIl0sIm5hbWVzIjpbImdldERlcGVuZGVuY2llcyIsImNvbnRleHQiLCJwYWNrYWdlRGlyIiwicGFja2FnZUNvbnRlbnQiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJqb2luIiwic3luYyIsImN3ZCIsImdldEZpbGVuYW1lIiwibm9ybWFsaXplIiwicGtnIiwiZGVwZW5kZW5jaWVzIiwiZGV2RGVwZW5kZW5jaWVzIiwib3B0aW9uYWxEZXBlbmRlbmNpZXMiLCJwZWVyRGVwZW5kZW5jaWVzIiwiZSIsImNvZGUiLCJyZXBvcnQiLCJtZXNzYWdlIiwibG9jIiwibGluZSIsImNvbHVtbiIsIm5hbWUiLCJTeW50YXhFcnJvciIsIm1pc3NpbmdFcnJvck1lc3NhZ2UiLCJwYWNrYWdlTmFtZSIsImRldkRlcEVycm9yTWVzc2FnZSIsIm9wdERlcEVycm9yTWVzc2FnZSIsInJlcG9ydElmTWlzc2luZyIsImRlcHMiLCJkZXBzT3B0aW9ucyIsIm5vZGUiLCJzcGxpdE5hbWUiLCJzcGxpdCIsInNsaWNlIiwiaXNJbkRlcHMiLCJ1bmRlZmluZWQiLCJpc0luRGV2RGVwcyIsImlzSW5PcHREZXBzIiwiaXNJblBlZXJEZXBzIiwiYWxsb3dEZXZEZXBzIiwiYWxsb3dQZWVyRGVwcyIsImFsbG93T3B0RGVwcyIsInRlc3RDb25maWciLCJjb25maWciLCJmaWxlbmFtZSIsInNvbWUiLCJjIiwicHJvY2VzcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwiZG9jcyIsInNjaGVtYSIsImNyZWF0ZSIsIm9wdGlvbnMiLCJJbXBvcnREZWNsYXJhdGlvbiIsInNvdXJjZSIsInZhbHVlIiwiQ2FsbEV4cHJlc3Npb24iLCJoYW5kbGVSZXF1aXJlcyIsImFyZ3VtZW50cyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLFNBQVNBLGVB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VXZELE9BQVYsRUFBbUI7QUFDekIsVUFBTXdELFVBQVV4RCxRQUFRd0QsT0FBUixDQUFnQixDQUFoQixLQUFzQixFQUF0QztBQUNBLFVBQU1WLFdBQVc5QyxRQUFRUyxXQUFSLEVBQWpCO0FBQ0EsVUFBTXFCLE9BQU8vQixnQkFBZ0JDLE9BQWhCLEVBQXlCd0QsUUFBUXZELFVBQWpDLENBQWI7O0FBRUEsUUFBSSxDQUFDNkIsSUFBTCxFQUFXO0FBQ1QsYUFBTyxFQUFQO0FBQ0Q7O0FBRUQsVUFBTUMsY0FBYztBQUNsQlUsb0JBQWNHLFdBQVdZLFFBQVEzQyxlQUFuQixFQUFvQ2lDLFFBQXBDLE1BQWtELEtBRDlDO0FBRWxCSCxvQkFBY0MsV0FBV1ksUUFBUTFDLG9CQUFuQixFQUF5Q2dDLFFBQXpDLE1BQXVELEtBRm5EO0FBR2xCSixxQkFBZUUsV0FBV1ksUUFBUXpDLGdCQUFuQixFQUFxQytCLFFBQXJDLE1BQW1EOztBQUdwRTtBQU5vQixLQUFwQixDQU9BLE9BQU87QUFDTFcseUJBQW1CLFVBQVV6QixJQUFWLEVBQWdCO0FBQ2pDSCx3QkFBZ0I3QixPQUFoQixFQUF5QjhCLElBQXpCLEVBQStCQyxXQUEvQixFQUE0Q0MsSUFBNUMsRUFBa0RBLEtBQUswQixNQUFMLENBQVlDLEtBQTlEO0FBQ0QsT0FISTtBQUlMQyxzQkFBZ0IsU0FBU0MsY0FBVCxDQUF3QjdCLElBQXhCLEVBQThCO0FBQzVDLFlBQUksNkJBQWdCQSxJQUFoQixDQUFKLEVBQTJCO0FBQ3pCSCwwQkFBZ0I3QixPQUFoQixFQUF5QjhCLElBQXpCLEVBQStCQyxXQUEvQixFQUE0Q0MsSUFBNUMsRUFBa0RBLEtBQUs4QixTQUFMLENBQWUsQ0FBZixFQUFrQkgsS0FBcEU7QUFDRDtBQUNGO0FBUkksS0FBUDtBQVVEO0FBNUNjLENBQWpCIiwiZmlsZSI6InJ1bGVzL25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCByZWFkUGtnVXAgZnJvbSAncmVhZC1wa2ctdXAnXG5pbXBvcnQgbWluaW1hdGNoIGZyb20gJ21pbmltYXRjaCdcbmltcG9ydCBpbXBvcnRUeXBlIGZyb20gJy4uL2NvcmUvaW1wb3J0VHlwZSdcbmltcG9ydCBpc1N0YXRpY1JlcXVpcmUgZnJvbSAnLi4vY29yZS9zdGF0aWNSZXF1aXJlJ1xuXG5mdW5jdGlvbiBnZXREZXBlbmRlbmNpZXMoY29udGV4dCwgcGFja2FnZURpcikge1xuICB0cnkge1xuICAgIGNvbnN0IHBhY2thZ2VDb250ZW50ID0gcGFja2FnZURpclxuICAgICAgPyBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4ocGFja2FnZURpciwgJ3BhY2thZ2UuanNvbicpLCAndXRmOCcpKVxuICAgICAgOiByZWFkUGtnVXAuc3luYyh7Y3dkOiBjb250ZXh0LmdldEZpbGVuYW1lKCksIG5vcm1hbGl6ZTogZmFsc2V9KS5wa2dcblxuICAgIGlmICghcGFja2FnZUNvbnRlbnQpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRlcGVuZGVuY2llczogcGFja2FnZUNvbnRlbnQuZGVwZW5kZW5jaWVzIHx8IHt9LFxuICAgICAgZGV2RGVwZW5kZW5jaWVzOiBwYWNrYWdlQ29udGVudC5kZXZEZXBlbmRlbmNpZXMgfHwge30sXG4gICAgICBvcHRpb25hbERlcGVuZGVuY2llczogcGFja2FnZUNvbnRlbnQub3B0aW9uYWxEZXBlbmRlbmNpZXMgfHwge30sXG4gICAgICBwZWVyRGVwZW5kZW5jaWVzOiBwYWNrYWdlQ29udGVudC5wZWVyRGVwZW5kZW5jaWVzIHx8IHt9LFxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChwYWNrYWdlRGlyICYmIGUuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgbWVzc2FnZTogJ1RoZSBwYWNrYWdlLmpzb24gZmlsZSBjb3VsZCBub3QgYmUgZm91bmQuJyxcbiAgICAgICAgbG9jOiB7IGxpbmU6IDAsIGNvbHVtbjogMCB9LFxuICAgICAgfSlcbiAgICB9XG4gICAgaWYgKGUubmFtZSA9PT0gJ0pTT05FcnJvcicgfHwgZSBpbnN0YW5jZW9mIFN5bnRheEVycm9yKSB7XG4gICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgIG1lc3NhZ2U6ICdUaGUgcGFja2FnZS5qc29uIGZpbGUgY291bGQgbm90IGJlIHBhcnNlZDogJyArIGUubWVzc2FnZSxcbiAgICAgICAgbG9jOiB7IGxpbmU6IDAsIGNvbHVtbjogMCB9LFxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbmZ1bmN0aW9uIG1pc3NpbmdFcnJvck1lc3NhZ2UocGFja2FnZU5hbWUpIHtcbiAgcmV0dXJuIGAnJHtwYWNrYWdlTmFtZX0nIHNob3VsZCBiZSBsaXN0ZWQgaW4gdGhlIHByb2plY3QncyBkZXBlbmRlbmNpZXMuIGAgK1xuICAgIGBSdW4gJ25wbSBpIC1TICR7cGFja2FnZU5hbWV9JyB0byBhZGQgaXRgXG59XG5cbmZ1bmN0aW9uIGRldkRlcEVycm9yTWVzc2FnZShwYWNrYWdlTmFtZSkge1xuICByZXR1cm4gYCcke3BhY2thZ2VOYW1lfScgc2hvdWxkIGJlIGxpc3RlZCBpbiB0aGUgcHJvamVjdCdzIGRlcGVuZGVuY2llcywgbm90IGRldkRlcGVuZGVuY2llcy5gXG59XG5cbmZ1bmN0aW9uIG9wdERlcEVycm9yTWVzc2FnZShwYWNrYWdlTmFtZSkge1xuICByZXR1cm4gYCcke3BhY2thZ2VOYW1lfScgc2hvdWxkIGJlIGxpc3RlZCBpbiB0aGUgcHJvamVjdCdzIGRlcGVuZGVuY2llcywgYCArXG4gICAgYG5vdCBvcHRpb25hbERlcGVuZGVuY2llcy5gXG59XG5cbmZ1bmN0aW9uIHJlcG9ydElmTWlzc2luZyhjb250ZXh0LCBkZXBzLCBkZXBzT3B0aW9ucywgbm9kZSwgbmFtZSkge1xuICBpZiAoaW1wb3J0VHlwZShuYW1lLCBjb250ZXh0KSAhPT0gJ2V4dGVybmFsJykge1xuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IHNwbGl0TmFtZSA9IG5hbWUuc3BsaXQoJy8nKVxuICBjb25zdCBwYWNrYWdlTmFtZSA9IHNwbGl0TmFtZVswXVswXSA9PT0gJ0AnXG4gICAgPyBzcGxpdE5hbWUuc2xpY2UoMCwgMikuam9pbignLycpXG4gICAgOiBzcGxpdE5hbWVbMF1cbiAgY29uc3QgaXNJbkRlcHMgPSBkZXBzLmRlcGVuZGVuY2llc1twYWNrYWdlTmFtZV0gIT09IHVuZGVmaW5lZFxuICBjb25zdCBpc0luRGV2RGVwcyA9IGRlcHMuZGV2RGVwZW5kZW5jaWVzW3BhY2thZ2VOYW1lXSAhPT0gdW5kZWZpbmVkXG4gIGNvbnN0IGlzSW5PcHREZXBzID0gZGVwcy5vcHRpb25hbERlcGVuZGVuY2llc1twYWNrYWdlTmFtZV0gIT09IHVuZGVmaW5lZFxuICBjb25zdCBpc0luUGVlckRlcHMgPSBkZXBzLnBlZXJEZXBlbmRlbmNpZXNbcGFja2FnZU5hbWVdICE9PSB1bmRlZmluZWRcblxuICBpZiAoaXNJbkRlcHMgfHxcbiAgICAoZGVwc09wdGlvbnMuYWxsb3dEZXZEZXBzICYmIGlzSW5EZXZEZXBzKSB8fFxuICAgIChkZXBzT3B0aW9ucy5hbGxvd1BlZXJEZXBzICYmIGlzSW5QZWVyRGVwcykgfHxcbiAgICAoZGVwc09wdGlvbnMuYWxsb3dPcHREZXBzICYmIGlzSW5PcHREZXBzKVxuICApIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChpc0luRGV2RGVwcyAmJiAhZGVwc09wdGlvbnMuYWxsb3dEZXZEZXBzKSB7XG4gICAgY29udGV4dC5yZXBvcnQobm9kZSwgZGV2RGVwRXJyb3JNZXNzYWdlKHBhY2thZ2VOYW1lKSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChpc0luT3B0RGVwcyAmJiAhZGVwc09wdGlvbnMuYWxsb3dPcHREZXBzKSB7XG4gICAgY29udGV4dC5yZXBvcnQobm9kZSwgb3B0RGVwRXJyb3JNZXNzYWdlKHBhY2thZ2VOYW1lKSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnRleHQucmVwb3J0KG5vZGUsIG1pc3NpbmdFcnJvck1lc3NhZ2UocGFja2FnZU5hbWUpKVxufVxuXG5mdW5jdGlvbiB0ZXN0Q29uZmlnKGNvbmZpZywgZmlsZW5hbWUpIHtcbiAgLy8gU2ltcGxlc3QgY29uZmlndXJhdGlvbiBmaXJzdCwgZWl0aGVyIGEgYm9vbGVhbiBvciBub3RoaW5nLlxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ2Jvb2xlYW4nIHx8IHR5cGVvZiBjb25maWcgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGNvbmZpZ1xuICB9XG4gIC8vIEFycmF5IG9mIGdsb2JzLlxuICByZXR1cm4gY29uZmlnLnNvbWUoYyA9PiAoXG4gICAgbWluaW1hdGNoKGZpbGVuYW1lLCBjKSB8fFxuICAgIG1pbmltYXRjaChmaWxlbmFtZSwgcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIGMpKVxuICApKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWV0YToge1xuICAgIGRvY3M6IHt9LFxuXG4gICAgc2NoZW1hOiBbXG4gICAgICB7XG4gICAgICAgICd0eXBlJzogJ29iamVjdCcsXG4gICAgICAgICdwcm9wZXJ0aWVzJzoge1xuICAgICAgICAgICdkZXZEZXBlbmRlbmNpZXMnOiB7ICd0eXBlJzogWydib29sZWFuJywgJ2FycmF5J10gfSxcbiAgICAgICAgICAnb3B0aW9uYWxEZXBlbmRlbmNpZXMnOiB7ICd0eXBlJzogWydib29sZWFuJywgJ2FycmF5J10gfSxcbiAgICAgICAgICAncGVlckRlcGVuZGVuY2llcyc6IHsgJ3R5cGUnOiBbJ2Jvb2xlYW4nLCAnYXJyYXknXSB9LFxuICAgICAgICAgICdwYWNrYWdlRGlyJzogeyAndHlwZSc6ICdzdHJpbmcnIH0sXG4gICAgICAgIH0sXG4gICAgICAgICdhZGRpdGlvbmFsUHJvcGVydGllcyc6IGZhbHNlLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuXG4gIGNyZWF0ZTogZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICBjb25zdCBvcHRpb25zID0gY29udGV4dC5vcHRpb25zWzBdIHx8IHt9XG4gICAgY29uc3QgZmlsZW5hbWUgPSBjb250ZXh0LmdldEZpbGVuYW1lKClcbiAgICBjb25zdCBkZXBzID0gZ2V0RGVwZW5kZW5jaWVzKGNvbnRleHQsIG9wdGlvbnMucGFja2FnZURpcilcblxuICAgIGlmICghZGVwcykge1xuICAgICAgcmV0dXJuIHt9XG4gICAgfVxuXG4gICAgY29uc3QgZGVwc09wdGlvbnMgPSB7XG4gICAgICBhbGxvd0RldkRlcHM6IHRlc3RDb25maWcob3B0aW9ucy5kZXZEZXBlbmRlbmNpZXMsIGZpbGVuYW1lKSAhPT0gZmFsc2UsXG4gICAgICBhbGxvd09wdERlcHM6IHRlc3RDb25maWcob3B0aW9ucy5vcHRpb25hbERlcGVuZGVuY2llcywgZmlsZW5hbWUpICE9PSBmYWxzZSxcbiAgICAgIGFsbG93UGVlckRlcHM6IHRlc3RDb25maWcob3B0aW9ucy5wZWVyRGVwZW5kZW5jaWVzLCBmaWxlbmFtZSkgIT09IGZhbHNlLFxuICAgIH1cblxuICAgIC8vIHRvZG86IHVzZSBtb2R1bGUgdmlzaXRvciBmcm9tIG1vZHVsZS11dGlscyBjb3JlXG4gICAgcmV0dXJuIHtcbiAgICAgIEltcG9ydERlY2xhcmF0aW9uOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICByZXBvcnRJZk1pc3NpbmcoY29udGV4dCwgZGVwcywgZGVwc09wdGlvbnMsIG5vZGUsIG5vZGUuc291cmNlLnZhbHVlKVxuICAgICAgfSxcbiAgICAgIENhbGxFeHByZXNzaW9uOiBmdW5jdGlvbiBoYW5kbGVSZXF1aXJlcyhub2RlKSB7XG4gICAgICAgIGlmIChpc1N0YXRpY1JlcXVpcmUobm9kZSkpIHtcbiAgICAgICAgICByZXBvcnRJZk1pc3NpbmcoY29udGV4dCwgZGVwcywgZGVwc09wdGlvbnMsIG5vZGUsIG5vZGUuYXJndW1lbnRzWzBdLnZhbHVlKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH1cbiAgfSxcbn1cbiJdfQ==