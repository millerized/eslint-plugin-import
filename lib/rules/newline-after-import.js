'use strict';

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @fileoverview Rule to enforce new line after import not followed by another import.
 * @author Radek Benkel
 */

const log = (0, _debug2.default)('eslint-plugin-import:rules:newline-after-import');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

function containsNodeOrEqual(outerNode, innerNode) {
  return outerNode.range[0] <= innerNode.range[0] && outerNode.range[1] >= innerNode.range[1];
}

function getScopeBody(scope) {
  if (scope.block.type === 'SwitchStatement') {
    log('SwitchStatement scopes not supported');
    return null;
  }

  const body = scope.block.body;

  if (body && body.type === 'BlockStatement') {
    return body.body;
  }

  return body;
}

function findNodeIndexInScopeBody(body, nodeToFind) {
  return body.findIndex(node => containsNodeOrEqual(node, nodeToFind));
}

function getLineDifference(node, nextNode) {
  return nextNode.loc.start.line - node.loc.end.line;
}

function isClassWithDecorator(node) {
  return node.type === 'ClassDeclaration' && node.decorators && node.decorators.length;
}

module.exports = {
  meta: {
    docs: {},
    schema: [{
      'type': 'object',
      'properties': {
        'count': {
          'type': 'integer',
          'minimum': 1
        }
      },
      'additionalProperties': false
    }],
    fixable: 'whitespace'
  },
  create: function (context) {
    let level = 0;
    const requireCalls = [];

    function checkForNewLine(node, nextNode, type) {
      if (isClassWithDecorator(nextNode)) {
        nextNode = nextNode.decorators[0];
      }

      const options = context.options[0] || { count: 1 };
      const lineDifference = getLineDifference(node, nextNode);
      const EXPECTED_LINE_DIFFERENCE = options.count + 1;

      if (lineDifference < EXPECTED_LINE_DIFFERENCE) {
        let column = node.loc.start.column;

        if (node.loc.start.line !== node.loc.end.line) {
          column = 0;
        }

        context.report({
          loc: {
            line: node.loc.end.line,
            column
          },
          message: `Expected ${options.count} empty line${options.count > 1 ? 's' : ''} \
after ${type} statement not followed by another ${type}.`,
          fix: fixer => fixer.insertTextAfter(node, '\n'.repeat(EXPECTED_LINE_DIFFERENCE - lineDifference))
        });
      }
    }

    function incrementLevel() {
      level++;
    }
    function decrementLevel() {
      level--;
    }

    return {
      ImportDeclaration: function (node) {
        const parent = node.parent;

        const nodePosition = parent.body.indexOf(node);
        const nextNode = parent.body[nodePosition + 1];

        if (nextNode && nextNode.type !== 'ImportDeclaration') {
          checkForNewLine(node, nextNode, 'import');
        }
      },
      CallExpression: function (node) {
        if ((0, _staticRequire2.default)(node) && level === 0) {
          requireCalls.push(node);
        }
      },
      'Program:exit': function () {
        log('exit processing for', context.getFilename());
        const scopeBody = getScopeBody(context.getScope());
        log('got scope:', scopeBody);

        requireCalls.forEach(function (node, index) {
          const nodePosition = findNodeIndexInScopeBody(scopeBody, node);
          log('node position in scope:', nodePosition);

          const statementWithRequireCall = scopeBody[nodePosition];
          const nextStatement = scopeBody[nodePosition + 1];
          const nextRequireCall = requireCalls[index + 1];

          if (nextRequireCall && containsNodeOrEqual(statementWithRequireCall, nextRequireCall)) {
            return;
          }

          if (nextStatement && (!nextRequireCall || !containsNodeOrEqual(nextStatement, nextRequireCall))) {

            checkForNewLine(statementWithRequireCall, nextStatement, 'require');
          }
        });
      },
      FunctionDeclaration: incrementLevel,
      FunctionExpression: incrementLevel,
      ArrowFunctionExpression: incrementLevel,
      BlockStatement: incrementLevel,
      ObjectExpression: incrementLevel,
      Decorator: incrementLevel,
      'FunctionDeclaration:exit': decrementLevel,
      'FunctionExpression:exit': decrementLevel,
      'ArrowFunctionExpression:exit': decrementLevel,
      'BlockStatement:exit': decrementLevel,
      'ObjectExpression:exit': decrementLevel,
      'Decorator:exit': decrementLevel
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25ld2xpbmUtYWZ0ZXItaW1wb3J0LmpzIl0sIm5hbWVzIjpbImxvZyIsImNvbnRhaW5zTm9kZU9yRXF1YWwiLCJvdXRlck5vZGUiLCJpbm5lck5vZGUiLCJyYW5nZSIsImdldFNjb3BlQm9keSIsInNjb3BlIiwiYmxvY2siLCJ0eXBlIiwiYm9keSIsImZpbmROb2RlSW5kZXhJblNjb3BlQm9keSIsIm5vZGVUb0ZpbmQiLCJmaW5kSW5kZXgiLCJub2RlIiwiZ2V0TGluZURpZmZlcmVuY2UiLCJuZXh0Tm9kZSIsImxvYyIsInN0YXJ0IiwibGluZSIsImVuZCIsImlzQ2xhc3NXaXRoRGVjb3JhdG9yIiwiZGVjb3JhdG9ycyIsImxlbmd0aCIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwiZG9jcyIsInNjaGVtYSIsImZpeGFibGUiLCJjcmVhdGUiLCJjb250ZXh0IiwibGV2ZWwiLCJyZXF1aXJlQ2FsbHMiLCJjaGVja0Zvck5ld0xpbmUiLCJvcHRpb25zIiwiY291bnQiLCJsaW5lRGlmZmVyZW5jZSIsIkVYUEVDVEVEX0xJTkVfRElGRkVSRU5DRSIsImNvbHVtbiIsInJlcG9ydCIsIm1lc3NhZ2UiLCJmaXgiLCJmaXhlciIsImluc2VydFRleHRBZnRlciIsInJlcGVhdCIsImluY3JlbWVudExldmVsIiwiZGVjcmVtZW50TGV2ZWwiLCJJbXBvcnREZWNsYXJhdGlvbiIsInBhcmVudCIsIm5vZGVQb3NpdGlvbiIsImluZGV4T2YiLCJDYWxsRXhwcmVzc2lvbiIsInB1c2giLCJnZXRGaWxlbmFtZSIsInNjb3BlQm9keSIsImdldFNjb3BlIiwiZm9yRWFjaCIsImluZGV4Iiwic3RhdGVtZW50V2l0aFJlcXVpcmVDYWxsIiwibmV4dFN0YXRlbWVudCIsIm5leHRSZXF1aXJlQ2FsbCIsIkZ1bmN0aW9uRGVjbGFyYXRpb24iLCJGdW5jdGlvbkV4cHJlc3Npb24iLCJBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiIsIkJsb2NrU3RhdGVtZW50IiwiT2JqZWN0RXhw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KiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gZW5mb3JjZSBuZXcgbGluZSBhZnRlciBpbXBvcnQgbm90IGZvbGxvd2VkIGJ5IGFub3RoZXIgaW1wb3J0LlxuICogQGF1dGhvciBSYWRlayBCZW5rZWxcbiAqL1xuXG5pbXBvcnQgaXNTdGF0aWNSZXF1aXJlIGZyb20gJy4uL2NvcmUvc3RhdGljUmVxdWlyZSdcblxuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJ1xuY29uc3QgbG9nID0gZGVidWcoJ2VzbGludC1wbHVnaW4taW1wb3J0OnJ1bGVzOm5ld2xpbmUtYWZ0ZXItaW1wb3J0JylcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJ1bGUgRGVmaW5pdGlvblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gY29udGFpbnNOb2RlT3JFcXVhbChvdXRlck5vZGUsIGlubmVyTm9kZSkge1xuICAgIHJldHVybiBvdXRlck5vZGUucmFuZ2VbMF0gPD0gaW5uZXJOb2RlLnJhbmdlWzBdICYmIG91dGVyTm9kZS5yYW5nZVsxXSA+PSBpbm5lck5vZGUucmFuZ2VbMV1cbn1cblxuZnVuY3Rpb24gZ2V0U2NvcGVCb2R5KHNjb3BlKSB7XG4gICAgaWYgKHNjb3BlLmJsb2NrLnR5cGUgPT09ICdTd2l0Y2hTdGF0ZW1lbnQnKSB7XG4gICAgICBsb2coJ1N3aXRjaFN0YXRlbWVudCBzY29wZXMgbm90IHN1cHBvcnRlZCcpXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIGNvbnN0IHsgYm9keSB9ID0gc2NvcGUuYmxvY2tcbiAgICBpZiAoYm9keSAmJiBib2R5LnR5cGUgPT09ICdCbG9ja1N0YXRlbWVudCcpIHtcbiAgICAgICAgcmV0dXJuIGJvZHkuYm9keVxuICAgIH1cblxuICAgIHJldHVybiBib2R5XG59XG5cbmZ1bmN0aW9uIGZpbmROb2RlSW5kZXhJblNjb3BlQm9keShib2R5LCBub2RlVG9GaW5kKSB7XG4gICAgcmV0dXJuIGJvZHkuZmluZEluZGV4KChub2RlKSA9PiBjb250YWluc05vZGVPckVxdWFsKG5vZGUsIG5vZGVUb0ZpbmQpKVxufVxuXG5mdW5jdGlvbiBnZXRMaW5lRGlmZmVyZW5jZShub2RlLCBuZXh0Tm9kZSkge1xuICByZXR1cm4gbmV4dE5vZGUubG9jLnN0YXJ0LmxpbmUgLSBub2RlLmxvYy5lbmQubGluZVxufVxuXG5mdW5jdGlvbiBpc0NsYXNzV2l0aERlY29yYXRvcihub2RlKSB7XG4gIHJldHVybiBub2RlLnR5cGUgPT09ICdDbGFzc0RlY2xhcmF0aW9uJyAmJiBub2RlLmRlY29yYXRvcnMgJiYgbm9kZS5kZWNvcmF0b3JzLmxlbmd0aFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWV0YToge1xuICAgIGRvY3M6IHt9LFxuICAgIHNjaGVtYTogW1xuICAgICAge1xuICAgICAgICAndHlwZSc6ICdvYmplY3QnLFxuICAgICAgICAncHJvcGVydGllcyc6IHtcbiAgICAgICAgICAnY291bnQnOiB7XG4gICAgICAgICAgICAndHlwZSc6ICdpbnRlZ2VyJyxcbiAgICAgICAgICAgICdtaW5pbXVtJzogMSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAnYWRkaXRpb25hbFByb3BlcnRpZXMnOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBmaXhhYmxlOiAnd2hpdGVzcGFjZScsXG4gIH0sXG4gIGNyZWF0ZTogZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICBsZXQgbGV2ZWwgPSAwXG4gICAgY29uc3QgcmVxdWlyZUNhbGxzID0gW11cblxuICAgIGZ1bmN0aW9uIGNoZWNrRm9yTmV3TGluZShub2RlLCBuZXh0Tm9kZSwgdHlwZSkge1xuICAgICAgaWYgKGlzQ2xhc3NXaXRoRGVjb3JhdG9yKG5leHROb2RlKSkge1xuICAgICAgICBuZXh0Tm9kZSA9IG5leHROb2RlLmRlY29yYXRvcnNbMF1cbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3B0aW9ucyA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7IGNvdW50OiAxIH1cbiAgICAgIGNvbnN0IGxpbmVEaWZmZXJlbmNlID0gZ2V0TGluZURpZmZlcmVuY2Uobm9kZSwgbmV4dE5vZGUpXG4gICAgICBjb25zdCBFWFBFQ1RFRF9MSU5FX0RJRkZFUkVOQ0UgPSBvcHRpb25zLmNvdW50ICsgMVxuXG4gICAgICBpZiAobGluZURpZmZlcmVuY2UgPCBFWFBFQ1RFRF9MSU5FX0RJRkZFUkVOQ0UpIHtcbiAgICAgICAgbGV0IGNvbHVtbiA9IG5vZGUubG9jLnN0YXJ0LmNvbHVtblxuXG4gICAgICAgIGlmIChub2RlLmxvYy5zdGFydC5saW5lICE9PSBub2RlLmxvYy5lbmQubGluZSkge1xuICAgICAgICAgIGNvbHVtbiA9IDBcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgICBsb2M6IHtcbiAgICAgICAgICAgIGxpbmU6IG5vZGUubG9jLmVuZC5saW5lLFxuICAgICAgICAgICAgY29sdW1uLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgbWVzc2FnZTogYEV4cGVjdGVkICR7b3B0aW9ucy5jb3VudH0gZW1wdHkgbGluZSR7b3B0aW9ucy5jb3VudCA+IDEgPyAncycgOiAnJ30gXFxcbmFmdGVyICR7dHlwZX0gc3RhdGVtZW50IG5vdCBmb2xsb3dlZCBieSBhbm90aGVyICR7dHlwZX0uYCxcbiAgICAgICAgICBmaXg6IGZpeGVyID0+IGZpeGVyLmluc2VydFRleHRBZnRlcihcbiAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAnXFxuJy5yZXBlYXQoRVhQRUNURURfTElORV9ESUZGRVJFTkNFIC0gbGluZURpZmZlcmVuY2UpXG4gICAgICAgICAgKSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbmNyZW1lbnRMZXZlbCgpIHtcbiAgICAgIGxldmVsKytcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVjcmVtZW50TGV2ZWwoKSB7XG4gICAgICBsZXZlbC0tXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIEltcG9ydERlY2xhcmF0aW9uOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICBjb25zdCB7IHBhcmVudCB9ID0gbm9kZVxuICAgICAgICBjb25zdCBub2RlUG9zaXRpb24gPSBwYXJlbnQuYm9keS5pbmRleE9mKG5vZGUpXG4gICAgICAgIGNvbnN0IG5leHROb2RlID0gcGFyZW50LmJvZHlbbm9kZVBvc2l0aW9uICsgMV1cblxuICAgICAgICBpZiAobmV4dE5vZGUgJiYgbmV4dE5vZGUudHlwZSAhPT0gJ0ltcG9ydERlY2xhcmF0aW9uJykge1xuICAgICAgICAgIGNoZWNrRm9yTmV3TGluZShub2RlLCBuZXh0Tm9kZSwgJ2ltcG9ydCcpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBDYWxsRXhwcmVzc2lvbjogZnVuY3Rpb24obm9kZSkge1xuICAgICAgICBpZiAoaXNTdGF0aWNSZXF1aXJlKG5vZGUpICYmIGxldmVsID09PSAwKSB7XG4gICAgICAgICAgcmVxdWlyZUNhbGxzLnB1c2gobm9kZSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxvZygnZXhpdCBwcm9jZXNzaW5nIGZvcicsIGNvbnRleHQuZ2V0RmlsZW5hbWUoKSlcbiAgICAgICAgY29uc3Qgc2NvcGVCb2R5ID0gZ2V0U2NvcGVCb2R5KGNvbnRleHQuZ2V0U2NvcGUoKSlcbiAgICAgICAgbG9nKCdnb3Qgc2NvcGU6Jywgc2NvcGVCb2R5KVxuXG4gICAgICAgIHJlcXVpcmVDYWxscy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlLCBpbmRleCkge1xuICAgICAgICAgIGNvbnN0IG5vZGVQb3NpdGlvbiA9IGZpbmROb2RlSW5kZXhJblNjb3BlQm9keShzY29wZUJvZHksIG5vZGUpXG4gICAgICAgICAgbG9nKCdub2RlIHBvc2l0aW9uIGluIHNjb3BlOicsIG5vZGVQb3NpdGlvbilcblxuICAgICAgICAgIGNvbnN0IHN0YXRlbWVudFdpdGhSZXF1aXJlQ2FsbCA9IHNjb3BlQm9keVtub2RlUG9zaXRpb25dXG4gICAgICAgICAgY29uc3QgbmV4dFN0YXRlbWVudCA9IHNjb3BlQm9keVtub2RlUG9zaXRpb24gKyAxXVxuICAgICAgICAgIGNvbnN0IG5leHRSZXF1aXJlQ2FsbCA9IHJlcXVpcmVDYWxsc1tpbmRleCArIDFdXG5cbiAgICAgICAgICBpZiAobmV4dFJlcXVpcmVDYWxsICYmIGNvbnRhaW5zTm9kZU9yRXF1YWwoc3RhdGVtZW50V2l0aFJlcXVpcmVDYWxsLCBuZXh0UmVxdWlyZUNhbGwpKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobmV4dFN0YXRlbWVudCAmJlxuICAgICAgICAgICAgICghbmV4dFJlcXVpcmVDYWxsIHx8ICFjb250YWluc05vZGVPckVxdWFsKG5leHRTdGF0ZW1lbnQsIG5leHRSZXF1aXJlQ2FsbCkpKSB7XG5cbiAgICAgICAgICAgIGNoZWNrRm9yTmV3TGluZShzdGF0ZW1lbnRXaXRoUmVxdWlyZUNhbGwsIG5leHRTdGF0ZW1lbnQsICdyZXF1aXJlJylcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgRnVuY3Rpb25EZWNsYXJhdGlvbjogaW5jcmVtZW50TGV2ZWwsXG4gICAgICBGdW5jdGlvbkV4cHJlc3Npb246IGluY3JlbWVudExldmVsLFxuICAgICAgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb246IGluY3JlbWVudExldmVsLFxuICAgICAgQmxvY2tTdGF0ZW1lbnQ6IGluY3JlbWVudExldmVsLFxuICAgICAgT2JqZWN0RXhwcmVzc2lvbjogaW5jcmVtZW50TGV2ZWwsXG4gICAgICBEZWNvcmF0b3I6IGluY3JlbWVudExldmVsLFxuICAgICAgJ0Z1bmN0aW9uRGVjbGFyYXRpb246ZXhpdCc6IGRlY3JlbWVudExldmVsLFxuICAgICAgJ0Z1bmN0aW9uRXhwcmVzc2lvbjpleGl0JzogZGVjcmVtZW50TGV2ZWwsXG4gICAgICAnQXJyb3dGdW5jdGlvbkV4cHJlc3Npb246ZXhpdCc6IGRlY3JlbWVudExldmVsLFxuICAgICAgJ0Jsb2NrU3RhdGVtZW50OmV4aXQnOiBkZWNyZW1lbnRMZXZlbCxcbiAgICAgICdPYmplY3RFeHByZXNzaW9uOmV4aXQnOiBkZWNyZW1lbnRMZXZlbCxcbiAgICAgICdEZWNvcmF0b3I6ZXhpdCc6IGRlY3JlbWVudExldmVsLFxuICAgIH1cbiAgfSxcbn1cbiJdfQ==