jsonDocgen = (function () {
    return {
        render: function (options) {
//             example = `{
//     "a": [{
//         "b": null
//     }]
// }
// `;
//             window.s = schema; // FIXME

            // process options
            var $exampleContainer = options.exampleContainer,
                $docContainer = options.docContainer,
                docRenderFn = options.docRenderFn,
                example = options.example,
                schema = options.schema;

            if ((!$docContainer && !docRenderFn) || ($docContainer && docRenderFn)) {
                throw new Error('Exactly one of options.docContainer and options.docRenderFn must be given');
            }
            docRenderFn = docRenderFn || function (schemaItem, isRequired) {
                $docContainer.innerText = schemaItem ? schemaItem.description : '';
            };

            // set up example container
            $exampleContainer.style.position = 'relative';
            $exampleContainer.innerHTML = '<pre style="margin: 0; padding: 0; border: 0; line-height: 1.5">' +
                '<code style="margin: 0; padding: 0; border: 0;" class="language-json" id="json-docgen-example-inner"></code></pre>';
            var $example = $exampleContainer.querySelector('#json-docgen-example-inner');

            // measure height and width of a single character in the example container (monospace font is assumed)
            $example.innerHTML = '<span id="yardstick" style="position: absolute; top: -9999px; left: -9999px">x</span>';
            var $yardstick = $exampleContainer.querySelector('#yardstick');
            var charWidth = $yardstick.clientWidth,
                charHeight = $yardstick.clientHeight;

            // render example
            if (Prism && Prism.highlight) {
                $example.innerHTML = Prism.highlight(example, Prism.languages.json);
            } else {
                $example.innerText = example;
            }

            // construct overlays
            $exampleContainer.innerHTML += "" +
                '<style type="text/css">' +
                '   .node-overlay {' +
                '       position: absolute;' +
                '       background: #333;' +
                '       opacity: 0;' +
                '       border-radius: 2px;' +
                '   }' +
                '' +
                '   .node-overlay:hover {' +
                '        opacity: 0.12;' +
                '   }' +
                '</style>' +
            '';
            var ast = esprima.parse('var a = ' + example, { loc: true });
            traverse(ast, {
                post: function (node, maxColumn, path) {
                    if (node.type === 'Property') {
                        var schemaItem = jsonSchemaLookup(schema, path);
                        if (! schemaItem) return;
                        var requiredProps = jsonSchemaLookup(schema, path.slice(0, path.length-2).concat(["required"]));
                        var isRequired = requiredProps ? (requiredProps.indexOf(node.key.value) !== -1) : false;
                        var $nodeOverlay = document.createElement('div');
                        $nodeOverlay.classList.add('node-overlay');
                        $nodeOverlay.style.left = ((node.loc.start.column) * charWidth - 3) + 'px';
                        $nodeOverlay.style.top = ((node.loc.start.line-1) * charHeight) + 'px';
                        $nodeOverlay.style.height = ((node.loc.end.line-node.loc.start.line+1) * charHeight) + 'px';
                        $nodeOverlay.style.width = ((maxColumn-node.loc.start.column) * charWidth + 10) + 'px';
                        $nodeOverlay.style.zIndex = path.length;
                        $nodeOverlay.addEventListener('mouseover', function () {
                            docRenderFn(schemaItem, isRequired, $nodeOverlay);
                        });
                        $nodeOverlay.addEventListener('mouseout', function () {
                            docRenderFn(null, false, $nodeOverlay);
                        })
                        $exampleContainer.appendChild($nodeOverlay);
                    }
                }
            });
        }
    };

    function jsonSchemaLookup(schema, path) {
        return path.reduce(function (value, pathPart) {
            return (value ? value[pathPart] : null);
        }, schema);
    }

    // adapted from https://github.com/olov/ast-traverse/blob/master/ast-traverse.js
    function traverse(root, options) {
        "use strict";

        options = options || {};
        var pre = options.pre;
        var post = options.post;

        function visit(node, path) {
            if (!node || typeof node.type !== "string") {
                return 0;
            }

            var res = undefined;
            var maxColumn = node.loc.end.column;
            if (pre) {
                res = pre(node, maxColumn, path);
            }

            if (res !== false) {
                for (var prop in node) {
                    if (!node.hasOwnProperty(prop)) {
                        continue;
                    }

                    var child = node[prop];
                    if (Array.isArray(child)) {
                        maxColumn = child.reduce(function (max, item) {
                            var newPath = makePath(item, path);
                            return Math.max(max, visit(item, newPath));
                        }, maxColumn);
                    } else {
                        var newPath = makePath(child, path);
                        maxColumn = Math.max(maxColumn, visit(child, newPath));
                    }
                }
            }

            if (post) {
                post(node, maxColumn, path);
            }

            return maxColumn;
        }

        function makePath(node, parentPath) {
            if (node && node.type === 'Property') {
                return parentPath.concat(["properties", node.key.value]);
            } else if (node && node.type === 'ArrayExpression') {
                return parentPath.concat(["items"]);
            } else {
                return parentPath.slice();
            }
        }

        return visit(root, []);
    }
})();
