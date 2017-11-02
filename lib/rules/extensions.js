'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _importType = require('../core/importType');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const enumValues = { enum: ['always', 'ignorePackages', 'never'] };
const patternProperties = {
  type: 'object',
  patternProperties: { '.*': enumValues }
};
const properties = {
  type: 'object',
  properties: {
    'pattern': patternProperties,
    'ignorePackages': { type: 'boolean' }
  }
};

function buildProperties(context) {

  const result = {
    defaultConfig: 'never',
    pattern: {},
    ignorePackages: false
  };

  context.options.forEach(obj => {

    // If this is a string, set defaultConfig to its value
    if (typeof obj === 'string') {
      result.defaultConfig = obj;
      return;
    }

    // If this is not the new structure, transfer all props to result.pattern
    if (obj.pattern === undefined && obj.ignorePackages === undefined) {
      Object.assign(result.pattern, obj);
      return;
    }

    // If pattern is provided, transfer all props
    if (obj.pattern !== undefined) {
      Object.assign(result.pattern, obj.pattern);
    }

    // If ignorePackages is provided, transfer it to result
    if (obj.ignorePackages !== undefined) {
      result.ignorePackages = obj.ignorePackages;
    }
  });

  return result;
}

module.exports = {
  meta: {
    docs: {},

    schema: {
      anyOf: [{
        type: 'array',
        items: [enumValues],
        additionalItems: false
      }, {
        type: 'array',
        items: [enumValues, properties],
        additionalItems: false
      }, {
        type: 'array',
        items: [properties],
        additionalItems: false
      }, {
        type: 'array',
        items: [patternProperties],
        additionalItems: false
      }, {
        type: 'array',
        items: [enumValues, patternProperties],
        additionalItems: false
      }]
    }
  },

  create: function (context) {

    const props = buildProperties(context);

    function getModifier(extension) {
      return props.pattern[extension] || props.defaultConfig;
    }

    function isUseOfExtensionRequired(extension, isPackageMain) {
      return getModifier(extension) === 'always' && (!props.ignorePackages || !isPackageMain);
    }

    function isUseOfExtensionForbidden(extension) {
      return getModifier(extension) === 'never';
    }

    function isResolvableWithoutExtension(file) {
      const extension = _path2.default.extname(file);
      const fileWithoutExtension = file.slice(0, -extension.length);
      const resolvedFileWithoutExtension = (0, _resolve2.default)(fileWithoutExtension, context);

      return resolvedFileWithoutExtension === (0, _resolve2.default)(file, context);
    }

    function checkFileExtension(node) {
      const source = node.source;

      const importPath = source.value;

      // don't enforce anything on builtins
      if ((0, _importType.isBuiltIn)(importPath, context.settings)) return;

      const resolvedPath = (0, _resolve2.default)(importPath, context);

      // get extension from resolved path, if possible.
      // for unresolved, use source value.
      const extension = _path2.default.extname(resolvedPath || importPath).substring(1);

      // determine if this is a module
      const isPackageMain = (0, _importType.isExternalModuleMain)(importPath, context.settings) || (0, _importType.isScopedMain)(importPath);

      if (!extension || !importPath.endsWith(extension)) {
        const extensionRequired = isUseOfExtensionRequired(extension, isPackageMain);
        const extensionForbidden = isUseOfExtensionForbidden(extension);
        if (extensionRequired && !extensionForbidden) {
          context.report({
            node: source,
            message: `Missing file extension ${extension ? `"${extension}" ` : ''}for "${importPath}"`
          });
        }
      } else if (extension) {
        if (isUseOfExtensionForbidden(extension) && isResolvableWithoutExtension(importPath)) {
          context.report({
            node: source,
            message: `Unexpected use of file extension "${extension}" for "${importPath}"`
          });
        }
      }
    }

    return {
      ImportDeclaration: checkFileExtension
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL2V4dGVuc2lvbnMuanMiXSwibmFtZXMiOlsiZW51bVZhbHVlcyIsImVudW0iLCJwYXR0ZXJuUHJvcGVydGllcyIsInR5cGUiLCJwcm9wZXJ0aWVzIiwiYnVpbGRQcm9wZXJ0aWVzIiwiY29udGV4dCIsInJlc3VsdCIsImRlZmF1bHRDb25maWciLCJwYXR0ZXJuIiwiaWdub3JlUGFja2FnZXMiLCJvcHRpb25zIiwiZm9yRWFjaCIsIm9iaiIsInVuZGVmaW5lZCIsIk9iamVjdCIsImFzc2lnbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwiZG9jcyIsInNjaGVtYSIsImFueU9mIiwiaXRlbXMiLCJhZGRpdGlvbmFsSXRlbXMiLCJjcmVhdGUiLCJwcm9wcyIsImdldE1vZGlmaWVyIiwiZXh0ZW5zaW9uIiwiaXNVc2VPZkV4dGVuc2lvblJlcXVpcmVkIiwiaXNQYWNrYWdlTWFpbiIsImlzVXNlT2ZFeHRlbnNpb25Gb3JiaWRkZW4iLCJpc1Jlc29sdmFibGVXaXRob3V0RXh0ZW5zaW9uIiwiZmlsZSIsImV4dG5hbWUiLCJmaWxlV2l0aG91dEV4dGVuc2lvbiIsInNsaWNlIiwibGVuZ3RoIiwicmVzb2x2ZWRGaWxlV2l0aG91dEV4dGVuc2lvbiIsImNoZWNrRmlsZUV4dGVuc2lvbiIsIm5vZGUiLCJzb3VyY2UiLCJpbXBvcnRQYXRoIiwidmFsdWUiLCJzZXR0aW5ncyIsInJlc29sdmVkUGF0aCIsInN1YnN0cmluZyIsImVuZHNXaXRoIiwiZXh0ZW5zaW9uUmVxdWlyZWQiLCJleHRlbnNpb25Gb3JiaWRkZW4iLCJyZXBvcnQiLCJtZXNzYWdlIiwiSW1wb3J0RGVjbGFyYXRpb24iXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7QUFFQTs7OztBQUNBOzs7O0FBRUEsTUFBTUEsYUFBYSxFQUFFQyxNQUFNLENBQUUsUUFBRixFQUFZLGdCQUFaLEVBQThCLE9BQTlCLENBQVIsRUFBbkI7QUFDQSxNQUFNQyxvQkFBb0I7QUFDeEJDLFFBQU0sUUFEa0I7QUFFeEJE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cEZwQyxrQkFBUTRDLE1BQVIsQ0FBZTtBQUNiVixrQkFBTUMsTUFETztBQUViVSxxQkFBVSxxQ0FBb0N2QixTQUFVLFVBQVNjLFVBQVc7QUFGL0QsV0FBZjtBQUlEO0FBQ0Y7QUFDRjs7QUFFRCxXQUFPO0FBQ0xVLHlCQUFtQmI7QUFEZCxLQUFQO0FBR0Q7QUExR2MsQ0FBakIiLCJmaWxlIjoicnVsZXMvZXh0ZW5zaW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmltcG9ydCByZXNvbHZlIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvcmVzb2x2ZSdcbmltcG9ydCB7IGlzQnVpbHRJbiwgaXNFeHRlcm5hbE1vZHVsZU1haW4sIGlzU2NvcGVkTWFpbiB9IGZyb20gJy4uL2NvcmUvaW1wb3J0VHlwZSdcblxuY29uc3QgZW51bVZhbHVlcyA9IHsgZW51bTogWyAnYWx3YXlzJywgJ2lnbm9yZVBhY2thZ2VzJywgJ25ldmVyJyBdIH1cbmNvbnN0IHBhdHRlcm5Qcm9wZXJ0aWVzID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcGF0dGVyblByb3BlcnRpZXM6IHsgJy4qJzogZW51bVZhbHVlcyB9LFxufVxuY29uc3QgcHJvcGVydGllcyA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHsgXG4gICAgJ3BhdHRlcm4nOiBwYXR0ZXJuUHJvcGVydGllcyxcbiAgICAnaWdub3JlUGFja2FnZXMnOiB7IHR5cGU6ICdib29sZWFuJyB9LFxuICB9LFxufVxuXG5mdW5jdGlvbiBidWlsZFByb3BlcnRpZXMoY29udGV4dCkge1xuXG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgZGVmYXVsdENvbmZpZzogJ25ldmVyJyxcbiAgICAgIHBhdHRlcm46IHt9LFxuICAgICAgaWdub3JlUGFja2FnZXM6IGZhbHNlLFxuICAgIH1cblxuICAgIGNvbnRleHQub3B0aW9ucy5mb3JFYWNoKG9iaiA9PiB7XG5cbiAgICAgIC8vIElmIHRoaXMgaXMgYSBzdHJpbmcsIHNldCBkZWZhdWx0Q29uZmlnIHRvIGl0cyB2YWx1ZVxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJlc3VsdC5kZWZhdWx0Q29uZmlnID0gb2JqXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGlzIGlzIG5vdCB0aGUgbmV3IHN0cnVjdHVyZSwgdHJhbnNmZXIgYWxsIHByb3BzIHRvIHJlc3VsdC5wYXR0ZXJuXG4gICAgICBpZiAob2JqLnBhdHRlcm4gPT09IHVuZGVmaW5lZCAmJiBvYmouaWdub3JlUGFja2FnZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBPYmplY3QuYXNzaWduKHJlc3VsdC5wYXR0ZXJuLCBvYmopXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyBJZiBwYXR0ZXJuIGlzIHByb3ZpZGVkLCB0cmFuc2ZlciBhbGwgcHJvcHNcbiAgICAgIGlmIChvYmoucGF0dGVybiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24ocmVzdWx0LnBhdHRlcm4sIG9iai5wYXR0ZXJuKVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBpZ25vcmVQYWNrYWdlcyBpcyBwcm92aWRlZCwgdHJhbnNmZXIgaXQgdG8gcmVzdWx0XG4gICAgICBpZiAob2JqLmlnbm9yZVBhY2thZ2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmVzdWx0Lmlnbm9yZVBhY2thZ2VzID0gb2JqLmlnbm9yZVBhY2thZ2VzXG4gICAgICB9ICAgICAgXG4gICAgfSlcblxuICAgIHJldHVybiByZXN1bHRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ldGE6IHtcbiAgICBkb2NzOiB7fSxcblxuICAgIHNjaGVtYToge1xuICAgICAgYW55T2Y6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICAgaXRlbXM6IFtlbnVtVmFsdWVzXSxcbiAgICAgICAgICBhZGRpdGlvbmFsSXRlbXM6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgZW51bVZhbHVlcywgXG4gICAgICAgICAgICBwcm9wZXJ0aWVzLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgYWRkaXRpb25hbEl0ZW1zOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICAgaXRlbXM6IFtwcm9wZXJ0aWVzXSxcbiAgICAgICAgICBhZGRpdGlvbmFsSXRlbXM6IGZhbHNlLFxuICAgICAgICB9LCAgICAgICAgICAgICAgICBcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICAgaXRlbXM6IFtwYXR0ZXJuUHJvcGVydGllc10sXG4gICAgICAgICAgYWRkaXRpb25hbEl0ZW1zOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIGVudW1WYWx1ZXMsXG4gICAgICAgICAgICBwYXR0ZXJuUHJvcGVydGllcyxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGFkZGl0aW9uYWxJdGVtczogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIH0sXG5cbiAgY3JlYXRlOiBmdW5jdGlvbiAoY29udGV4dCkge1xuXG4gICAgY29uc3QgcHJvcHMgPSBidWlsZFByb3BlcnRpZXMoY29udGV4dClcbiAgICBcbiAgICBmdW5jdGlvbiBnZXRNb2RpZmllcihleHRlbnNpb24pIHtcbiAgICAgIHJldHVybiBwcm9wcy5wYXR0ZXJuW2V4dGVuc2lvbl0gfHwgcHJvcHMuZGVmYXVsdENvbmZpZ1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzVXNlT2ZFeHRlbnNpb25SZXF1aXJlZChleHRlbnNpb24sIGlzUGFja2FnZU1haW4pIHtcbiAgICAgIHJldHVybiBnZXRNb2RpZmllcihleHRlbnNpb24pID09PSAnYWx3YXlzJyAmJiAoIXByb3BzLmlnbm9yZVBhY2thZ2VzIHx8ICFpc1BhY2thZ2VNYWluKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzVXNlT2ZFeHRlbnNpb25Gb3JiaWRkZW4oZXh0ZW5zaW9uKSB7XG4gICAgICByZXR1cm4gZ2V0TW9kaWZpZXIoZXh0ZW5zaW9uKSA9PT0gJ25ldmVyJ1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzUmVzb2x2YWJsZVdpdGhvdXRFeHRlbnNpb24oZmlsZSkge1xuICAgICAgY29uc3QgZXh0ZW5zaW9uID0gcGF0aC5leHRuYW1lKGZpbGUpXG4gICAgICBjb25zdCBmaWxlV2l0aG91dEV4dGVuc2lvbiA9IGZpbGUuc2xpY2UoMCwgLWV4dGVuc2lvbi5sZW5ndGgpXG4gICAgICBjb25zdCByZXNvbHZlZEZpbGVXaXRob3V0RXh0ZW5zaW9uID0gcmVzb2x2ZShmaWxlV2l0aG91dEV4dGVuc2lvbiwgY29udGV4dClcblxuICAgICAgcmV0dXJuIHJlc29sdmVkRmlsZVdpdGhvdXRFeHRlbnNpb24gPT09IHJlc29sdmUoZmlsZSwgY29udGV4dClcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja0ZpbGVFeHRlbnNpb24obm9kZSkge1xuICAgICAgY29uc3QgeyBzb3VyY2UgfSA9IG5vZGVcbiAgICAgIGNvbnN0IGltcG9ydFBhdGggPSBzb3VyY2UudmFsdWVcblxuICAgICAgLy8gZG9uJ3QgZW5mb3JjZSBhbnl0aGluZyBvbiBidWlsdGluc1xuICAgICAgaWYgKGlzQnVpbHRJbihpbXBvcnRQYXRoLCBjb250ZXh0LnNldHRpbmdzKSkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHJlc29sdmUoaW1wb3J0UGF0aCwgY29udGV4dClcblxuICAgICAgLy8gZ2V0IGV4dGVuc2lvbiBmcm9tIHJlc29sdmVkIHBhdGgsIGlmIHBvc3NpYmxlLlxuICAgICAgLy8gZm9yIHVucmVzb2x2ZWQsIHVzZSBzb3VyY2UgdmFsdWUuXG4gICAgICBjb25zdCBleHRlbnNpb24gPSBwYXRoLmV4dG5hbWUocmVzb2x2ZWRQYXRoIHx8IGltcG9ydFBhdGgpLnN1YnN0cmluZygxKVxuXG4gICAgICAvLyBkZXRlcm1pbmUgaWYgdGhpcyBpcyBhIG1vZHVsZVxuICAgICAgY29uc3QgaXNQYWNrYWdlTWFpbiA9IFxuICAgICAgICBpc0V4dGVybmFsTW9kdWxlTWFpbihpbXBvcnRQYXRoLCBjb250ZXh0LnNldHRpbmdzKSB8fCBcbiAgICAgICAgaXNTY29wZWRNYWluKGltcG9ydFBhdGgpXG5cbiAgICAgIGlmICghZXh0ZW5zaW9uIHx8ICFpbXBvcnRQYXRoLmVuZHNXaXRoKGV4dGVuc2lvbikpIHtcbiAgICAgICAgY29uc3QgZXh0ZW5zaW9uUmVxdWlyZWQgPSBpc1VzZU9mRXh0ZW5zaW9uUmVxdWlyZWQoZXh0ZW5zaW9uLCBpc1BhY2thZ2VNYWluKVxuICAgICAgICBjb25zdCBleHRlbnNpb25Gb3JiaWRkZW4gPSBpc1VzZU9mRXh0ZW5zaW9uRm9yYmlkZGVuKGV4dGVuc2lvbilcbiAgICAgICAgaWYgKGV4dGVuc2lvblJlcXVpcmVkICYmICFleHRlbnNpb25Gb3JiaWRkZW4pIHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgICAgICBub2RlOiBzb3VyY2UsXG4gICAgICAgICAgICBtZXNzYWdlOlxuICAgICAgICAgICAgICBgTWlzc2luZyBmaWxlIGV4dGVuc2lvbiAke2V4dGVuc2lvbiA/IGBcIiR7ZXh0ZW5zaW9ufVwiIGAgOiAnJ31mb3IgXCIke2ltcG9ydFBhdGh9XCJgLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZXh0ZW5zaW9uKSB7XG4gICAgICAgIGlmIChpc1VzZU9mRXh0ZW5zaW9uRm9yYmlkZGVuKGV4dGVuc2lvbikgJiYgaXNSZXNvbHZhYmxlV2l0aG91dEV4dGVuc2lvbihpbXBvcnRQYXRoKSkge1xuICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgICAgIG5vZGU6IHNvdXJjZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBVbmV4cGVjdGVkIHVzZSBvZiBmaWxlIGV4dGVuc2lvbiBcIiR7ZXh0ZW5zaW9ufVwiIGZvciBcIiR7aW1wb3J0UGF0aH1cImAsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBJbXBvcnREZWNsYXJhdGlvbjogY2hlY2tGaWxlRXh0ZW5zaW9uLFxuICAgIH1cbiAgfSxcbn1cbiJdfQ==