'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const meta = {};
/* eslint-disable max-len */
const errors = {
  ExportNamedDeclaration: 'Multiple named export declarations; consolidate all named exports into a single export declaration',
  AssignmentExpression: 'Multiple CommonJS exports; consolidate all exports into a single assignment to `module.exports`'
  /* eslint-enable max-len */

  /**
   * Returns an array with names of the properties in the accessor chain for MemberExpression nodes
   *
   * Example:
   *
   * `module.exports = {}` => ['module', 'exports']
   * `module.exports.property = true` => ['module', 'exports', 'property']
   *
   * @param     {Node}    node    AST Node (MemberExpression)
   * @return    {Array}           Array with the property names in the chain
   * @private
   */
};function accessorChain(node) {
  const chain = [];

  do {
    chain.unshift(node.property.name);

    if (node.object.type === 'Identifier') {
      chain.unshift(node.object.name);
      break;
    }

    node = node.object;
  } while (node.type === 'MemberExpression');

  return chain;
}

function create(context) {
  const nodes = {
    modules: new Set(),
    commonjs: new Set()
  };

  return {
    ExportNamedDeclaration(node) {
      nodes.modules.add(node);
    },

    AssignmentExpression(node) {
      if (node.left.type !== 'MemberExpression') {
        return;
      }

      const chain = accessorChain(node.left);

      // Assignments to module.exports
      // Deeper assignments are ignored since they just modify what's already being exported
      // (ie. module.exports.exported.prop = true is ignored)
      if (chain[0] === 'module' && chain[1] === 'exports' && chain.length <= 3) {
        nodes.commonjs.add(node);
        return;
      }

      // Assignments to exports (exports.* = *)
      if (chain[0] === 'exports' && chain.length === 2) {
        nodes.commonjs.add(node);
        return;
      }
    },

    'Program:exit': function onExit() {
      // Report multiple `export` declarations (ES2015 modules)
      if (nodes.modules.size > 1) {
        nodes.modules.forEach(node => {
          context.report({
            node,
            message: errors[node.type]
          });
        });
      }

      // Report multiple `module.exports` assignments (CommonJS)
      if (nodes.commonjs.size > 1) {
        nodes.commonjs.forEach(node => {
          context.report({
            node,
            message: errors[node.type]
          });
        });
      }
    }
  };
}

exports.default = {
  meta,
  create
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL2dyb3VwLWV4cG9ydHMuanMiXSwibmFtZXMiOlsibWV0YSIsImVycm9ycyIsIkV4cG9ydE5hbWVkRGVjbGFyYXRpb24iLCJBc3NpZ25tZW50RXhwcmVzc2lvbiIsImFjY2Vzc29yQ2hhaW4iLCJub2RlIiwiY2hhaW4iLCJ1bnNoaWZ0IiwicHJvcGVydHkiLCJuYW1lIiwib2JqZWN0IiwidHlwZSIsImNyZWF0ZSIsImNvbnRleHQiLCJub2RlcyIsIm1vZHVsZXMiLCJTZXQiLCJjb21tb25qcyIsImFkZCIsImxlZnQiLCJsZW5ndGgiLCJvbkV4aXQiLCJzaXplIiwiZm9yRWFjaCIsInJlcG9ydCIsIm1lc3NhZ2UiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsTUFBTUEsT0FBTyxFQUFiO0FBQ0E7QUFDQSxNQUFNQyxTQUFTO0FBQ2JDLDBCQUF3QixvR0FEWDtBQUViQyx3QkFBc0I7QUFFeEI7O0FBRUE7Ozs7Ozs7Ozs7OztBQU5lLENBQWYsQ0FrQkEsU0FBU0MsYUFBVCxDQUF1QkMsSUFBdkIsRUFBNkI7QUFDM0IsUUFBTUMsUUFBUSxFQUFkOztBQUVBLEtBQUc7QUFDREEsVUFBTUMsT0FBTixDQUFjRixLQUFLRyxRQUFMLENBQWNDLElBQTVCOztBQUVBLFFBQUlKLEtBQUtLLE1BQUwsQ0FBWUMsSUFBWixLQUFxQixZQUF6QixFQUF1QztBQUNyQ0wsWUFBTUMsT0FBTixDQUFjRixLQUFLSyxNQUFMLENBQVlELElBQTFCO0FBQ0E7QUFDRDs7QUFFREosV0FBT0EsS0FBS0ssTUFBWjtBQUNELEdBVEQsUUFTU0wsS0FBS00sSUFBTCxLQUFjLGtCQVR2Qjs7QUFXQSxTQUFPTCxLQUFQO0FBQ0Q7O0FBRUQsU0FBU00sTUFBVCxDQUFnQkMsT0FBaEIsRUFBeUI7QUFDdkIsUUFBTUMsUUFBUTtBQUNaQyxhQUFTLElBQUlDLEdBQUosRUFERztBQUVaQyxjQUFVLElBQUlELEdBQUo7QUFGRSxHQUFkOztBQUtBLFNBQU87QUFDTGQsMkJBQXVCRyxJQUF2QixFQUE2QjtBQUMzQlMsWUFBTUMsT0FBTixDQUFjRyxHQUFkLENBQWtCYixJQUFsQjtBQUNELEtBSEk7O0FBS0xGLHlCQUFxQkUsSUFBckIsRUFBMkI7QUFDekIsVUFBSUEsS0FBS2MsSUFBTCxDQUFVUixJQUFWLEtBQW1CLGtCQUF2QixFQUEyQztBQUN6QztBQUNEOztBQUVELFlBQU1MLFFBQVFGLGNBQWNDLEtBQUtjLElBQW5CLENBQWQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBSWIsTUFBTSxDQUFOLE1BQWEsUUFBYixJQUF5QkEsTUFBTSxDQUFOLE1BQWEsU0FBdEMsSUFBbURBLE1BQU1jLE1BQU4sSUFBZ0IsQ0FBdkUsRUFBMEU7QUFDeEVOLGNBQU1HLFFBQU4sQ0FBZUMsR0FBZixDQUFtQmIsSUFBbkI7QUFDQTtBQUNEOztBQUVEO0FBQ0EsVUFBSUMsTUFBTSxDQUFOLE1BQWEsU0FBYixJQUEwQkEsTUFBTWMsTUFBTixLQUFpQixDQUEvQyxFQUFrRDtBQUNoRE4sY0FBTUcsUUFBTixDQUFlQyxHQUFmLENBQW1CYixJQUFuQjtBQUNBO0FBQ0Q7QUFDRixLQXpCSTs7QUEyQkwsb0JBQWdCLFNBQVNnQixNQUFULEdBQWtCO0FBQ2hDO0FBQ0EsVUFBSVAsTUFBTUMsT0FBTixDQUFjTyxJQUFkLEdBQXFCLENBQXpCLEVBQTRCO0FBQzFCUixjQUFNQyxPQUFOLENBQWNRLE9BQWQsQ0FBc0JsQixRQUFRO0FBQzVCUSxrQkFBUVcsTUFBUixDQUFlO0FBQ2JuQixnQkFEYTtBQUVib0IscUJBQVN4QixPQUFPSSxLQUFLTSxJQUFaO0FBRkksV0FBZjtBQUlELFNBTEQ7QUFNRDs7QUFFRDtBQUNBLFVBQUlHLE1BQU1HLFFBQU4sQ0FBZUssSUFBZixHQUFzQixDQUExQixFQUE2QjtBQUMzQlIsY0FBTUcsUUFBTixDQUFlTSxPQUFmLENBQXVCbEIsUUFBUTtBQUM3QlEsa0JBQVFXLE1BQVIsQ0FBZTtBQUNibkIsZ0JBRGE7QUFFYm9CLHFCQUFTeEIsT0FBT0ksS0FBS00sSUFBWjtBQUZJLFdBQWY7QUFJRCxTQUxEO0FBTUQ7QUFDRjtBQS9DSSxHQUFQO0FBaUREOztrQkFFYztBQUNiWCxNQURhO0FBRWJZO0FBRmEsQyIsImZpbGUiOiJydWxlcy9ncm91cC1leHBvcnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgbWV0YSA9IHt9XG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG5jb25zdCBlcnJvcnMgPSB7XG4gIEV4cG9ydE5hbWVkRGVjbGFyYXRpb246ICdNdWx0aXBsZSBuYW1lZCBleHBvcnQgZGVjbGFyYXRpb25zOyBjb25zb2xpZGF0ZSBhbGwgbmFtZWQgZXhwb3J0cyBpbnRvIGEgc2luZ2xlIGV4cG9ydCBkZWNsYXJhdGlvbicsXG4gIEFzc2lnbm1lbnRFeHByZXNzaW9uOiAnTXVsdGlwbGUgQ29tbW9uSlMgZXhwb3J0czsgY29uc29saWRhdGUgYWxsIGV4cG9ydHMgaW50byBhIHNpbmdsZSBhc3NpZ25tZW50IHRvIGBtb2R1bGUuZXhwb3J0c2AnLFxufVxuLyogZXNsaW50LWVuYWJsZSBtYXgtbGVuICovXG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSB3aXRoIG5hbWVzIG9mIHRoZSBwcm9wZXJ0aWVzIGluIHRoZSBhY2Nlc3NvciBjaGFpbiBmb3IgTWVtYmVyRXhwcmVzc2lvbiBub2Rlc1xuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYG1vZHVsZS5leHBvcnRzID0ge31gID0+IFsnbW9kdWxlJywgJ2V4cG9ydHMnXVxuICogYG1vZHVsZS5leHBvcnRzLnByb3BlcnR5ID0gdHJ1ZWAgPT4gWydtb2R1bGUnLCAnZXhwb3J0cycsICdwcm9wZXJ0eSddXG4gKlxuICogQHBhcmFtICAgICB7Tm9kZX0gICAgbm9kZSAgICBBU1QgTm9kZSAoTWVtYmVyRXhwcmVzc2lvbilcbiAqIEByZXR1cm4gICAge0FycmF5fSAgICAgICAgICAgQXJyYXkgd2l0aCB0aGUgcHJvcGVydHkgbmFtZXMgaW4gdGhlIGNoYWluXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBhY2Nlc3NvckNoYWluKG5vZGUpIHtcbiAgY29uc3QgY2hhaW4gPSBbXVxuXG4gIGRvIHtcbiAgICBjaGFpbi51bnNoaWZ0KG5vZGUucHJvcGVydHkubmFtZSlcblxuICAgIGlmIChub2RlLm9iamVjdC50eXBlID09PSAnSWRlbnRpZmllcicpIHtcbiAgICAgIGNoYWluLnVuc2hpZnQobm9kZS5vYmplY3QubmFtZSlcbiAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgbm9kZSA9IG5vZGUub2JqZWN0XG4gIH0gd2hpbGUgKG5vZGUudHlwZSA9PT0gJ01lbWJlckV4cHJlc3Npb24nKVxuXG4gIHJldHVybiBjaGFpblxufVxuXG5mdW5jdGlvbiBjcmVhdGUoY29udGV4dCkge1xuICBjb25zdCBub2RlcyA9IHtcbiAgICBtb2R1bGVzOiBuZXcgU2V0KCksXG4gICAgY29tbW9uanM6IG5ldyBTZXQoKSxcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgRXhwb3J0TmFtZWREZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICBub2Rlcy5tb2R1bGVzLmFkZChub2RlKVxuICAgIH0sXG5cbiAgICBBc3NpZ25tZW50RXhwcmVzc2lvbihub2RlKSB7XG4gICAgICBpZiAobm9kZS5sZWZ0LnR5cGUgIT09ICdNZW1iZXJFeHByZXNzaW9uJykge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgY2hhaW4gPSBhY2Nlc3NvckNoYWluKG5vZGUubGVmdClcblxuICAgICAgLy8gQXNzaWdubWVudHMgdG8gbW9kdWxlLmV4cG9ydHNcbiAgICAgIC8vIERlZXBlciBhc3NpZ25tZW50cyBhcmUgaWdub3JlZCBzaW5jZSB0aGV5IGp1c3QgbW9kaWZ5IHdoYXQncyBhbHJlYWR5IGJlaW5nIGV4cG9ydGVkXG4gICAgICAvLyAoaWUuIG1vZHVsZS5leHBvcnRzLmV4cG9ydGVkLnByb3AgPSB0cnVlIGlzIGlnbm9yZWQpXG4gICAgICBpZiAoY2hhaW5bMF0gPT09ICdtb2R1bGUnICYmIGNoYWluWzFdID09PSAnZXhwb3J0cycgJiYgY2hhaW4ubGVuZ3RoIDw9IDMpIHtcbiAgICAgICAgbm9kZXMuY29tbW9uanMuYWRkKG5vZGUpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyBBc3NpZ25tZW50cyB0byBleHBvcnRzIChleHBvcnRzLiogPSAqKVxuICAgICAgaWYgKGNoYWluWzBdID09PSAnZXhwb3J0cycgJiYgY2hhaW4ubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIG5vZGVzLmNvbW1vbmpzLmFkZChub2RlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgJ1Byb2dyYW06ZXhpdCc6IGZ1bmN0aW9uIG9uRXhpdCgpIHtcbiAgICAgIC8vIFJlcG9ydCBtdWx0aXBsZSBgZXhwb3J0YCBkZWNsYXJhdGlvbnMgKEVTMjAxNSBtb2R1bGVzKVxuICAgICAgaWYgKG5vZGVzLm1vZHVsZXMuc2l6ZSA+IDEpIHtcbiAgICAgICAgbm9kZXMubW9kdWxlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvcnNbbm9kZS50eXBlXSxcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAvLyBSZXBvcnQgbXVsdGlwbGUgYG1vZHVsZS5leHBvcnRzYCBhc3NpZ25tZW50cyAoQ29tbW9uSlMpXG4gICAgICBpZiAobm9kZXMuY29tbW9uanMuc2l6ZSA+IDEpIHtcbiAgICAgICAgbm9kZXMuY29tbW9uanMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JzW25vZGUudHlwZV0sXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbWV0YSxcbiAgY3JlYXRlLFxufVxuIl19