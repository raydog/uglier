const _ = require('lodash');
var util = require('util');


exports.gurgitateAST = gurgitateAST;


function State() {
  this.codez = [];
  this.cur = null;
  this.depth = 0;
  this.count = 0;
  this.noSemis = false;
}
State.prototype = {
  newLine: function () {
    this.cur = [];
    this.codez.push(this.cur);
  },
  push: function () {
    var args = [].slice.call(arguments, 0);
    if (this.noSemis) { args = args.filter(x => x !== ";"); }
    this.cur.push.apply(this.cur, args);
  },
  holdSemis: function (fn) {
    var orig = this.noSemis;
    this.noSemis = true;
    fn();
    this.noSemis = orig;
  },
  noWrap: function (fn) {
    var old_cur = this.cur;
    var cur = this.cur = [];
    fn();
    this.cur = old_cur;
    this.push(cur);
  }
};

// Takes Root AST node (File usually) and will return an array of (String|String[])s.
// Idea of the result object is that each row in the top-most structure should be a
// line in the final file, pre-wrapping. The items inside those rows are individual
// tokens, and can be spaced out. If another array is inside that row, then that
// means that the following tokens shouldn't be wrapped to different lines.
function gurgitateAST(ast) {
  var s = new State();
  descend(s, ast);
  return s.codez;
}

// Will descend into a node, looking up the correct method based on ast.type:
function descend(state, ast) {
  _assertOrUnknown(ast && ast.type && _.isFunction(HANDLERS[ast.type]), ast);
  state.count++;
  state.depth++;
  HANDLERS[ast.type](state, ast);
  state.depth--;
}

// Will descend into a node. Will surround with parens if the type is non-basic:
// ("basic" being simple literals / identifiers and the like...)
const SIMPLE_TYPES = {
  Identifier: 1,
  RegExpLiteral: 1,
  NullLiteral: 1,
  StringLiteral: 1,
  BooleanLiteral: 1,
  NumericLiteral: 1,
  BigIntLiteral: 1,
  Super: 1,
  Import: 1,
  ThisExpression: 1,
};
function descendMaybeParens(state, ast) {
  _assertOrUnknown(ast && ast.type && _.isFunction(HANDLERS[ast.type]), ast);

  var addParens = !SIMPLE_TYPES[ast.type];
  addParens && state.push("(");
  descend(state, ast);
  addParens && state.push(")");
}

// Descends into every item in an array. Can optionally add separators:
function descendArray(state, astArray, sep) {
  const useSepFn = (!sep)
    ? () => false
    : (_.isFunction(sep))
      ? sep
      : () => state.push(sep);

  astArray = astArray || [];
  astArray.forEach((item, idx) => {
    idx && useSepFn();
    if (item) {
      descend(state, item);
    }
  });
}

var HANDLERS = {
  "File": function parseFile(state, ast) {
    state.newLine();
    descend(state, ast.program);
  },
  "Program": function parseProgram(state, ast) {
    state.depth = 0; // << Ensure zero, so that we can use this depth as a reference...
    if (ast.interpreter) {
      state.push("#!" + ast.interpreter.value);
      state.newLine();
    }
    if (ast.directives.length) {
      descendArray(state, ast.directives);
      state.newLine();
    }
    descendArray(state, ast.body, () => state.newLine());
  },

  // JS Syntax:
  "VariableDeclaration": function parseVariableDeclaration(state, ast) {
    state.push(ast.kind);
    descendArray(state, ast.declarations, ",");
    state.push(";");
  },
  "VariableDeclarator": function parseVariableDeclarator(state, ast) {
    descend(state, ast.id);
    if (ast.init) {
      state.push("=");
      descend(state, ast.init);
    }
  },
  "Identifier": function parseIdentifier(state, ast) {
    if (ast._private) {
      state.push("#" + ast.name);
    } else {
      state.push(ast.name);
    }
    if (ast.optional) {
      state.push("?");
    }
    if (ast.typeAnnotation) {
      descend(state, ast.typeAnnotation);
    }
  },
  "PrivateName": function parsePrivateName(state, ast) {
    // Hate to mutate AST, but spaces not allowed between # and id, so:
    ast.id._private = true;
    descend(state, ast.id);
  },
  "RegExpLiteral": function parseRegExpLiteral(state, ast) {
    state.push('/' + ast.pattern +'/' + ast.flags);
  },
  "NullLiteral": function parseNullLiteral(state, ast) {
    state.push("null");
  },
  "StringLiteral": function parseStringLiteral(state, ast) {
    state.push(_stringLiteral(ast.value));
  },
  "BooleanLiteral": function parseBooleanLiteral(state, ast) {
    state.push(ast.value ? "true" : "false");
  },
  "NumericLiteral": function parseNumericLiteral(state, ast) {
    state.push(_numLiteral(ast.extra.raw));
  },
  "BigIntLiteral": function parseBigIntLiteral(state, ast) {
    state.push(_numLiteral(ast.extra.raw));
  },
  "ExpressionStatement": function parseExpressionStatement(state, ast) {
    // TODO: Needs parens only if top-level, and string:
    var addParens = (state.depth === 1) && (ast.expression.type === "StringLiteral" || ast.expression.type === "ObjectExpression");
    
    addParens && state.push("(");
    descend(state, ast.expression);
    addParens && state.push(")");
    
    state.push(";");
  },
  "BlockStatement": function parseBlockStatement(state, ast) {
    state.push("{");
    descendArray(state, ast.directives);
    descendArray(state, ast.body);
    state.push("}");
  },
  "EmptyStatement": function parseEmptyStatement(state, ast) {
    state.push(";");
  },
  "DebuggerStatement": function parseDebuggerStatement(state, ast) {
    state.push("debugger", ";");
  },
  "WithStatement": function parseWithStatement(state, ast) {
    state.push("with", "(");
    descend(state, ast.object);
    state.push(")");
    descend(state, ast.body);
  },
  "ReturnStatement": function parseReturnStatement(state, ast) {
    if (ast.argument) {
      state.push(["return", "("]);
      descend(state, ast.argument);
      state.push(")", ";");
    } else {
      state.push(["return", ";"]);
    }
  },
  "LabeledStatement": function parseLabeledStatement(state, ast) {
    descend(state, ast.label);
    state.push(":");
    descend(state, ast.body);
  },
  "BreakStatement": function parseBreakStatement(state, ast) {
    state.noWrap(() => {
      state.push("break");
      if (ast.label) {
        descend(state, ast.label);
      }
      state.push(";");
    });
  },
  "ContinueStatement": function parseContinueStatement(state, ast) {
    state.noWrap(() => {
      state.push("continue");
      if (ast.label) {
        descend(state, ast.label);
      }
      state.push(";");
    });
  },
  "IfStatement": function parseIfStatement(state, ast) {
    state.push("if", "(");
    descend(state, ast.test);
    state.push(")");
    descend(state, ast.consequent);
    if (ast.alternate) {
      state.push("else");
      descend(state, ast.alternate);
    }
  },
  "SwitchStatement": function parseSwitchStatement(state, ast) {
    state.push("switch", "(");
    descend(state, ast.discriminant);
    state.push(")", "{");
    descendArray(state, ast.cases);
    state.push("}");
  },
  "SwitchCase": function parseSwitchCase(state, ast) {
    if (ast.test) {
      state.push("case");
      descend(state, ast.test);
      state.push(":");
    } else {
      state.push("default", ":");
    }
    descendArray(state, ast.consequent);
  },
  "ThrowStatement": function parseThrowStatement(state, ast) {
    state.push(["throw", "("]);
    descend(state, ast.argument);
    state.push(")", ";");
  },
  "TryStatement": function parseTryStatement(state, ast) {
    state.push("try");
    descend(state, ast.block);
    if (ast.handler) {
      descend(state, ast.handler);
    }
    if (ast.finalizer) {
      state.push("finally");
      descend(state, ast.finalizer);
    }
  },
  "CatchClause": function parseCatchClause(state, ast) {
    state.push("catch", "(");
    descend(state, ast.param);
    state.push(")");
    descend(state, ast.body);
  },
  "WhileStatement": function parseWhileStatement(state, ast) {
    state.push("while", "(");
    descend(state, ast.test);
    state.push(")");
    descend(state, ast.body);
  },
  "DoWhileStatement": function parseDoWhileStatement(state, ast) {
    state.push("do");
    descend(state, ast.body);
    state.push("while", "(");
    descend(state, ast.test);
    state.push(")", ";");
  },
  "ForStatement": function parseForStatement(state, ast) {
    state.push("for", "(");
    if (ast.init) {
      state.holdSemis(() => descend(state, ast.init));
    }
    state.push(";");
    if (ast.test) {
      descend(state, ast.test);
    }
    state.push(";");
    if (ast.update) {
      state.holdSemis(() => descend(state, ast.update));
    }
    state.push(")");
    descend(state, ast.body);
  },
  "ForInStatement": function parseForInStatement(state, ast) {
    state.push("for", "(");
    state.holdSemis(() => descend(state, ast.left));
    state.push("in");
    descend(state, ast.right);
    state.push(")");
    descend(state, ast.body);
  },
  "ForOfStatement": function parseForOfStatement(state, ast) {
    if (ast.await) {
      state.push("for", "await", "(");
    } else {
      state.push("for", "(");
    }
    state.holdSemis(() => descend(state, ast.left));
    state.push("of");
    descend(state, ast.right);
    state.push(")");
    descend(state, ast.body);
  },
  "FunctionDeclaration": function parseFunctionDeclaration(state, ast) {
    state.noWrap(() => {
      if (ast.async) {
        state.push("async");
      }
      state.push("function");
      if (ast.generator) {
        state.push("*");
      }
      if (ast.id) {
        descend(state, ast.id);
      }
      if (ast.typeParameters) {
        descend(state, ast.typeParameters);
      }
      state.push("(");
    });
    
    descendArray(state, ast.params, ",");
    state.push(")");
    if (ast.returnType) {
      descend(state, ast.returnType);
    }
    if (ast.predicate) {
      // Ugh.
      if (!ast.returnType) {
        state.push(":");
      }
      descend(state, ast.predicate);
    }
    descend(state, ast.body);
  },
  

  "Decorator": function parseDecorator(state, ast) {
    state.push("@");
    descend(state, ast.expression);
  },
  "Directive": function parseDirective(state, ast) {
    descend(state, ast.value);
    state.push(";");
  },
  "DirectiveLiteral": function parseDirectiveLiteral(state, ast) {
    state.push(_stringLiteral(ast.value));
  },
  "Super": function parseSuper(state, ast) {
    state.push("super");
  },
  "ThisExpression": function parseThisExpression(state, ast) {
    state.push("this");
  },
  "ArrowFunctionExpression": function parseArrowFunctionExpression(state, ast) {
    _assertOrUnknown(!ast.generator, ast);
    // Known bug: arrow functions work best with wrapping parens, but babylon
    // has a problem with flow generics wrapped in parens, so we have to disable
    // them in that case. This might make some rare circumstances generate bad
    // code.
    if (!ast.typeParameters) {
      state.push("(");
    }
    state.noWrap(() => {
      if (ast.async) { state.push("async"); }
      if (ast.typeParameters) {
        descend(state, ast.typeParameters);
      }
      state.push("(");
      descendArray(state, ast.params, ",");
      state.push(")");
      if (ast.returnType) {
        descend(state, ast.returnType);
      }
      state.push("=>");
    });
    if (ast.body.type === "BlockStatement") {
      descend(state, ast.body);
    } else {
      descendMaybeParens(state, ast.body);
    }
    if (!ast.typeParameters) {
      state.push(")");
    }
  },
  "YieldExpression": function parseYieldExpression(state, ast) {
    state.noWrap(() => {
      state.push("yield");
      if (ast.delegate) {
        state.push("*");
      }
      if (ast.argument) {
        descend(state, ast.argument);
      }
    });
  },
  "AwaitExpression": function parseAwaitExpression(state, ast) {
    state.push("(", "await");
    descend(state, ast.argument);
    state.push(")");
  },
  "ArrayExpression": function parseArrayExpression(state, ast) {
    state.push('[');
    descendArray(state, ast.elements, ",");
    state.push(']');
  },
  "ObjectExpression": function parseObjectExpression(state, ast) {
    state.push("{");
    descendArray(state, ast.properties, ",");
    state.push("}");
  },
  "ObjectProperty": function parseObjectProperty(state, ast) {
    if (ast.value && ast.value.type === "AssignmentPattern") {
      // Ew:
      if (ast.key && ast.key.name !== ast.value.left.name) {
        descend(state, ast.key);
        state.push(":");
      }
      descend(state, ast.value);
    } else {
      if (ast.computed) {
        state.push("[");
        descend(state, ast.key);
        state.push("]");
      } else {
        descend(state, ast.key);
      }
      if (!ast.shorthand) {
        state.push(":");
        descend(state, ast.value);
      }
    }
  },
  "SpreadProperty": function parseSpreadProperty(state, ast) {
    state.push("...");
    descend(state, ast.argument);
  },
  "ObjectMethod": function parseObjectMethod(state, ast) {
    _assertOrUnknown(!ast.id, ast);
    _assertOrUnknown(!ast.static, ast);
    
    // Need to put modifiers on same lines as fn name:
    state.noWrap(() => {
      if (ast.kind === "get" || ast.kind === "set") {
        state.push(ast.kind);
      }
      if (ast.async) {
        state.push("async");
      }
      if (ast.generator) {
        state.push("*");
      }
      if (ast.computed) {
        state.push("[");
      }
      descend(state, ast.key);
      if (ast.computed) {
        state.push("]");
      }
      if (ast.typeParameters) {
        descend(state, ast.typeParameters);
      }
      state.push("(");
    });
    descendArray(state, ast.params, ",");
    state.push(")");
    if (ast.returnType) {
      descend(state, ast.returnType);
    }
    descend(state, ast.body);
  },
  "FunctionExpression": function parseFunctionExpression(state, ast) {
    state.push("(");
    HANDLERS.FunctionDeclaration(state, ast);
    state.push(")");
  },
  "UnaryExpression": function parseUnaryExpression(state, ast) {
    // AFAIK, the two postfix unary expressions in JS are parsed by
    // babylon as UpdateExpressions, so this should be impossible:
    _assertOrUnknown(ast.prefix, ast);
    
    state.push("(", ast.operator);
    descend(state, ast.argument);
    state.push(")");
  },
  "UpdateExpression": function parseUpdateExpression(state, ast) {
    state.push("(");
    state.noWrap(() => {
      if (ast.prefix) {
        state.push(ast.operator);
      }
      descend(state, ast.argument);
      if (!ast.prefix) {
        state.push(ast.operator);
      }
    });
    state.push(")");
  },
  "BinaryExpression": function parseBinaryExpression(state, ast) {
    state.push("(");
    descend(state, ast.left);
    state.push(ast.operator);
    descend(state, ast.right);
    state.push(")");
  },
  "AssignmentExpression": function parseAssignmentExpression(state, ast) {
    state.push("(");
    descend(state, ast.left);
    state.push(ast.operator);
    descend(state, ast.right);
    state.push(")");
  },
  "LogicalExpression": function parseLogicalExpression(state, ast) {
    state.push("(");
    descend(state, ast.left);
    state.push(ast.operator);
    descend(state, ast.right);
    state.push(")");
  },
  "SpreadElement": function parseSpreadElement(state, ast) {
    state.push("...");
    descend(state, ast.argument);
  },
  "MemberExpression": function parseMemberExpression(state, ast) {
    descend(state, ast.object);
    if (ast.computed) {
      state.push("[");
      descend(state, ast.property);
      state.push("]");
    } else {
      state.push(".");
      descend(state, ast.property);
    }
  },
  "BindExpression": function parseBindExpression(state, ast) {
    if (ast.object) {
      descend(state, ast.object);
    }
    state.push("::");
    descend(state, ast.callee);
  },
  "ConditionalExpression": function parseConditionalExpression(state, ast) {
    state.push("(");
    descendMaybeParens(state, ast.test);
    state.push("?");
    descendMaybeParens(state, ast.consequent);
    state.push(":");
    descendMaybeParens(state, ast.alternate);
    state.push(")");
  },
  "CallExpression": function parseCallExpression(state, ast) {
    descendMaybeParens(state, ast.callee);
    state.push("(");
    descendArray(state, ast.arguments, ",");
    state.push(")");
  },
  "NewExpression": function parseNewExpression(state, ast) {
    state.push("new");
    HANDLERS.CallExpression(state, ast);
  },
  "SequenceExpression": function parseSequenceExpression(state, ast) {
    state.push("(");
    descendArray(state, ast.expressions, ",");
    state.push(")");
  },
  "DoExpression": function parseDoExpression(state, ast) {
    state.push("do");
    descend(state, ast.body);
  },
  "TemplateLiteral": function parseTemplateLiteral(state, ast) {
    ast.quasis.forEach(function (part, idx) {
      var firstchar = (idx === 0) ? "`" : "}";
      var lastchar = (part.tail) ? "`" : "${";
      state.push(firstchar + part.value.raw + lastchar);
      if (!part.tail) {
        descend(state, ast.expressions[idx]);
      }
    });
  },
  "TaggedTemplateExpression": function parseTaggedTemplateExpression(state, ast) {
    var needsParens = ast.tag.type !== "BlockStatement";
    needsParens && state.push("(");
    descend(state, ast.tag);
    needsParens && state.push(")");
    descend(state, ast.quasi);
  },
  "ObjectPattern": function parseObjectPattern(state, ast) {
    state.push("{");
    descendArray(state, ast.properties, ",");
    state.push("}");
    if (ast.typeAnnotation) {
      descend(state, ast.typeAnnotation);
    }
  },
  "ArrayPattern": function parseArrayPattern(state, ast) {
    state.push("[");
    descendArray(state, ast.elements, ",");
    state.push("]");
    if (ast.typeAnnotation) {
      descend(state, ast.typeAnnotation);
    }
  },
  "RestElement": function parseRestElement(state, ast) {
    state.push("...");
    descend(state, ast.argument);
    if (ast.typeAnnotation) {
      descend(state, ast.typeAnnotation);
    }
  },
  "RestProperty": function parseRestProperty(state, ast) {
    state.push("...");
    descend(state, ast.argument);
  },
  "AssignmentPattern": function parseAssignmentPattern(state, ast) {
    descend(state, ast.left);
    state.push("=");
    descend(state, ast.right);
  },
  "ClassBody": function parseClassBody(state, ast) {
    state.push("{");
    descendArray(state, ast.body, () => state.newLine()); // NOTE: newline needed because of babylon bug...
    state.push("}");
  },
  "ClassMethod": function parseClassMethod(state, ast) {
    _assertOrUnknown(!ast.id, ast);
    descendArray(state, ast.decorators);

    // Need to put modifiers on same lines as fn name:
    state.noWrap(() => {
      if (ast.kind === "get" || ast.kind === "set") {
        state.push(ast.kind);
      }
      if (ast.static) {
        state.push("static");
      }
      if (ast.async) {
        state.push("async");
      }
      if (ast.generator) {
        state.push("*");
      }
      if (ast.computed) {
        state.push("[");
      }
      descend(state, ast.key);
      if (ast.computed) {
        state.push("]");
      }
      if (ast.typeParameters) {
        descend(state, ast.typeParameters);
      }
      state.push("(");
    });
    descendArray(state, ast.params, ",");
    state.push(")");
    if (ast.returnType) {
      descend(state, ast.returnType);
    }
    descend(state, ast.body);
  },
  "ClassProperty": function parseClassProperty(state, ast) {
    descendArray(state, ast.decorators);
    if (ast.static) {
      state.push("static");
    }
    if (ast.computed) {
      state.push("[");
    }
    descend(state, ast.key);
    if (ast.computed) {
      state.push("]");
    }
    if (ast.typeAnnotation) {
      descend(state, ast.typeAnnotation);
    }
    if (ast.value) {
      state.push("=");
      descend(state, ast.value);
    }
    state.push(";");
  },
  "ClassPrivateProperty": function parseClassPrivateProperty(state, ast) {
    // Alias:
    HANDLERS.ClassProperty(state, ast);
  },
  "ClassPrivateMethod": function parseClassPrivateMethod(state, ast) {
    // Alias:
    HANDLERS.ClassMethod(state, ast);
  },
  "ClassDeclaration": function parseClassDeclaration(state, ast) {
    // _unknownASTLog(ast);
    descendArray(state, ast.decorators);
    state.push("class");
    if (ast.id) {
      descend(state, ast.id);
    }
    if (ast.typeParameters) {
      descend(state, ast.typeParameters);
    }
    if (ast.superClass) {
      state.push("extends");
      descendMaybeParens(state, ast.superClass);
    }
    if (ast.superTypeParameters) {
      descend(state, ast.superTypeParameters);
    }
    descendArray(state, ast.extends);
    if (ast.implements && ast.implements.length) {
      state.push("implements");
      descendArray(state, ast.implements, ",");
    }
    descend(state, ast.body);
  },
  "ClassExpression": function parseClassExpression(state, ast) {
    state.push("(");
    HANDLERS.ClassDeclaration(state, ast);
    state.push(")");
  },
  "MetaProperty": function parseMetaProperty(state, ast) {
    descend(state, ast.meta);
    state.push(".");
    descend(state, ast.property);
  },
  "Import": function parseImport(state, ast) {
    state.push("import");
  },
  "ImportDeclaration": function parseImportDeclaration(state, ast) {
    state.push("import");
    if (ast.importKind && ast.importKind !== "value") {
      state.push(ast.importKind);
    }
    if (ast.specifiers.length) {
      // Default vs alias specifiers need to be differentiated, and aliases must be grouped:
      var groups = _.groupBy(ast.specifiers, "type");
      var idx = 0;
      if (groups.ImportDefaultSpecifier) {
        descendArray(state, groups.ImportDefaultSpecifier, ",");
        idx += groups.ImportDefaultSpecifier.length;
      }
      if (groups.ImportNamespaceSpecifier) {
        idx && state.push(",");
        descendArray(state, groups.ImportNamespaceSpecifier, ",");
        idx += groups.ImportNamespaceSpecifier.length;
      }
      if (groups.ImportSpecifier) {
        idx && state.push(",");
        state.push("{");
        descendArray(state, groups.ImportSpecifier, ",");
        state.push("}");
      }
      state.push("from");
    }
    descend(state, ast.source);
    state.push(";");
  },
  "ImportSpecifier": function parseImportSpecifier(state, ast) {
    descend(state, ast.imported);
    state.push("as");
    descend(state, ast.local);
  },
  "ImportDefaultSpecifier": function parseImportDefaultSpecifier(state, ast) {
    descend(state, ast.local);
  },
  "ImportNamespaceSpecifier": function parseImportNamespaceSpecifier(state, ast) {
    state.push("*", "as");
    descend(state, ast.local);
  },
  "ExportNamedDeclaration": function parseExportNamedDeclaration(state, ast) {
    // HACK: Handle decorators here, if any exist. I hate mutating ast, but here we are:
    if (_.get(ast, "declaration.decorators.length") > 0) {
      descendArray(state, ast.declaration.decorators);
      ast.declaration.decorators = [];
    }
    state.push("export");
    var exportedSomething = false;
    if (ast.exportKind === "type" && !ast.declaration) {
      // Hack: The 'type' keyword is usually added by the declaration, but when
      // specifiers are used instead, we need to add the keyword ourselves:
      state.push(ast.exportKind);
    }
    if (ast.specifiers.length) {
      exportedSomething = true;
      // Ugh. Some specifiers want to be grouped via {}. Others don't.
      const byType = _.groupBy(ast.specifiers, node => node.type === "ExportNamespaceSpecifier" ? "ns" : "other");
      if (byType.ns) { descendArray(state, byType.ns, ","); }
      if (byType.other) {
        if (byType.ns) {
          state.push(",");
        }
        state.push("{");
        descendArray(state, byType.other, ",");
        state.push("}");
      }
    }
    if (ast.source) {
      exportedSomething = true;
      state.push("from");
      descend(state, ast.source);
    }
    if (ast.declaration) {
      exportedSomething = true;
      descend(state, ast.declaration);
    }
    if (!exportedSomething) {
      state.push("{", "}");
    }
  },
  "ExportSpecifier": function parseExportSpecifier(state, ast) {
    descend(state, ast.local);
    state.push("as");
    descend(state, ast.exported);
  },
  "ExportNamespaceSpecifier": function parseExportNamespaceSpecifier(state, ast) {
    state.push("*", "as");
    descend(state, ast.exported);
  },
  "ExportDefaultDeclaration": function parseExportDefaultDeclaration(state, ast) {
    state.push("export", "default");
    descend(state, ast.declaration);
    // Funcs / classes don't get semicolons:
    if (!["FunctionDeclaration", "ClassDeclaration"].includes(ast.declaration.type)) {
      state.push(";");
    }
  },
  "ExportAllDeclaration": function parseExportAllDeclaration(state, ast) {
    state.push("export", "*", "from");
    descend(state, ast.source);
    state.push(";");
  },


  // Flow Syntax:
  "TypeAnnotation": function parseTypeAnnotation(state, ast) {
    state.push(":");
    if (ast.typeAnnotation) {
      descend(state, ast.typeAnnotation);
    }
    if (ast.predicate) {
      descend(state, ast.predicate);
    }
  },
  "DeclaredPredicate": function parseDeclaredPredicate(state, ast) {
    state.push("%checks");
    descend(state, ast.value);
  },
  "InferredPredicate": function checkInferredPredicate(state, ast) {
    state.push("%checks");
  },
  "AnyTypeAnnotation": function parseAnyTypeAnnotation(state, ast) {
    state.push("any");
  },
  "MixedTypeAnnotation": function parseMixedTypeAnnotation(state, ast) {
    state.push("mixed");
  },
  "NumberTypeAnnotation": function parseNumberTypeAnnotation(state, ast) {
    state.push("number");
  },
  "NumberLiteralTypeAnnotation": function parseNumberLiteralTypeAnnotation(state, ast) {
    HANDLERS.NumericLiteral(state, ast);
  },
  "StringTypeAnnotation": function parseStringTypeAnnotation(state, ast) {
    state.push("string");
  },
  "StringLiteralTypeAnnotation": function parseStringLiteralTypeAnnotation(state, ast) {
    HANDLERS.StringLiteral(state, ast);
  },
  "BooleanTypeAnnotation": function parseBooleanTypeAnnotation(state, ast) {
    state.push("boolean");
  },
  "BooleanLiteralTypeAnnotation": function parseBooleanLiteralTypeAnnotation(state, ast) {
    HANDLERS.BooleanLiteral(state, ast);
  },
  "ExistsTypeAnnotation": function parseExistsTypeAnnotation(state, ast) {
    state.push("*");
  },
  "ThisTypeAnnotation": function parseThisTypeAnnotation(state, ast) {
    state.push("this");
  },
  "ArrayTypeAnnotation": function parseArrayTypeAnnotation(state, ast) {
    state.noWrap(() => {
      descend(state, ast.elementType);
      state.push("[");
    });
    state.push("]");
  },
  "TupleTypeAnnotation": function parseTupleTypeAnnotation(state, ast) {
    state.push("[");
    descendArray(state, ast.types, ",");
    state.push("]");
  },
  "VoidTypeAnnotation": function parseVoidTypeAnnotation(state, ast) {
    state.push("void");
  },
  "NullLiteralTypeAnnotation": function parseNullLiteralTypeAnnotation(state, ast) {
    state.push("null");
  },
  "EmptyTypeAnnotation": function parseEmptyTypeAnnotation(state, ast) {
    state.push("empty");
  },
  "UnionTypeAnnotation": function parseUnionTypeAnnotation(state, ast) {
    state.push("(");
    descendArray(state, ast.types, "|");
    state.push(")");
  },
  "IntersectionTypeAnnotation": function parseIntersectionTypeAnnotation(state, ast) {
    state.push("(");
    descendArray(state, ast.types, "&");
    state.push(")");
  },
  "TypeCastExpression": function parseTypeCastExpression(state, ast) {
    state.push("(");
    descend(state, ast.expression);
    descend(state, ast.typeAnnotation);
    state.push(")");
  },
  "TypeParameterDeclaration": function parseTypeParameterDeclaration(state, ast) {
    state.push("<");
    descendArray(state, ast.params, ",");
    state.push(">");
  },
  "TypeParameter": function parseTypeParameter(state, ast) {
    _assertOrUnknown(!ast.variance, ast);
    state.push(ast.name);
    if (ast.bound) {
      descend(state, ast.bound);
    }
    if (ast.default) {
      state.push("=");
      descend(state, ast.default);
    }
  },
  "TypeofTypeAnnotation": function parseTypeofTypeAnnotation(state, ast) {
    state.push("typeof");
    descend(state, ast.argument);
  },
  "FunctionTypeAnnotation": function parseFunctionTypeAnnotation(state, ast) {
    state.push("(");
    if (ast.typeParameters) {
      descend(state, ast.typeParameters);
    }
    state.push("(");
    descendArray(state, ast.params, ",");
    if (ast.rest) {
      ast.params.length && state.push(",");
      state.push("...");
      descend(state, ast.rest);
    }
    state.push(")", "=>");
    descend(state, ast.returnType);
    state.push(")");
  },
  "FunctionTypeAnnotation_DotHack": function parseFunctionTypeAnnotation(state, ast) {
    if (!ast.returnType) {
      _unknownASTLog(ast);
    }
    if (ast.typeParameters) {
      descend(state, ast.typeParameters);
    }
    state.push("(");
    descendArray(state, ast.params, ",");
    if (ast.rest) {
      ast.params.length && state.push(",");
      state.push("...");
      descend(state, ast.rest);
    }
    state.push(")", ":");
    descend(state, ast.returnType);
  },
  "FunctionTypeParam": function parseFunctionTypeParam(state, ast) {
    if (ast.name) {
      descend(state, ast.name);
      if (ast.optional) {
        state.push("?");
      }
      state.push(":");
    }
    descend(state, ast.typeAnnotation);
  },
  "ObjectTypeAnnotation": function parseObjectTypeAnnotation(state, ast) {
    var idx = 0;
    state.push(ast.exact ? "{|" : "{");
    
    descendArray(state, ast.indexers, ",");
    idx += ast.indexers.length;
    
    if (ast.callProperties.length) {
      idx && state.push(",");
      descendArray(state, ast.callProperties, ",");
      idx += ast.callProperties.length;
    }

    if (ast.properties.length) {
      idx && state.push(",");
      descendArray(state, ast.properties, ",");
    }

    state.push(ast.exact ? "|}" : "}");
  },
  "ObjectTypeCallProperty": function parseObjectTypeCallProperty(state, ast) {
    ast.static && state.push("static");
    HANDLERS.FunctionTypeAnnotation_DotHack(state, ast.value);
  },
  "ObjectTypeIndexer": function parseObjectTypeIndexer(state, ast) {
    _assertOrUnknown(!ast.static, ast);
    _assertOrUnknown(!ast.variance || ["minus", "plus"].includes(ast.variance.kind), ast);
    switch (ast.variance && ast.variance.kind) {
      case "minus": state.push("-"); break;
      case "plus":  state.push("+"); break;
    }
    state.push("[");
    if (ast.id) {
      descend(state, ast.id);
      state.push(":");
    }
    descend(state, ast.key);
    state.push("]", ":");
    descend(state, ast.value);
  },
  "ObjectTypeProperty": function parseObjectTypeProperty(state, ast) {
    _assertOrUnknown(!ast.static, ast);
    _assertOrUnknown(!ast.variance || ["minus", "plus"].includes(ast.variance.kind), ast);
    switch (ast.variance && ast.variance.kind) {
      case "minus": state.push("-"); break;
      case "plus":  state.push("+"); break;
    }
    descend(state, ast.key);
    if (ast.optional) {
      state.push("?");
    }
    if (ast.method) {
      HANDLERS.FunctionTypeAnnotation_DotHack(state, ast.value);
    } else {
      state.push(":");
      descend(state, ast.value);
    }
  },
  "TypeAlias": function parseTypeAlias(state, ast) {
    state.push("type");
    descend(state, ast.id);
    if (ast.typeParameters) {
      descend(state, ast.typeParameters);
    }
    state.push("=");
    descend(state, ast.right);
    state.push(";");
  },
  "InterfaceDeclaration": function parseInterfaceDeclaration(state, ast) {
    _assertOrUnknown(!ast.mixins.length, ast);
    state.push("interface");
    descend(state, ast.id);
    if (ast.typeParameters) {
      descend(state, ast.typeParameters);
    }
    descendArray(state, ast.extends);
    descend(state, ast.body);
  },
  "InterfaceExtends": function parseInterfaceExtends(state, ast) {
    state.push("extends");
    descendMaybeParens(state, ast.id);
    if (ast.typeParameters) {
      descend(state, ast.typeParameters);
    }
  },
  "ClassImplements": function parseClassImplements(state, ast) {
    descend(state, ast.id);
    if (ast.typeParameters) {
      descend(state, ast.typeParameters);
    }
  },
  "NullableTypeAnnotation": function parseNullableTypeAnnotation(state, ast) {
    state.push("?");
    descend(state, ast.typeAnnotation);
  },
  "GenericTypeAnnotation": function parseGenericTypeAnnotation(state, ast) {
    descend(state, ast.id);
    if (ast.typeParameters) {
      descend(state, ast.typeParameters);
    }
  },
  "QualifiedTypeIdentifier": function parseQualifiedTypeIdentifier(state, ast) {
    descend(state, ast.qualification);
    state.push(".");
    descend(state, ast.id);
  },
  "TypeParameterInstantiation": function parseTypeParameterInstantiation(state, ast) {
    state.push("<");
    descendArray(state, ast.params, ",");
    state.push(">");
  },
  "DeclareFunction": function parseDeclareFunction(state, ast) {
    // Ugh. Babylon really fouls up the AST here, and this takes a number of hacks to work:
    var name = _.get(ast, "id.name");
    var func = _.get(ast, "id.typeAnnotation");
    var pred = ast.predicate;
    _assertOrUnknown(name, ast);
    _assertOrUnknown(func && func.type === "TypeAnnotation", ast);
    state.push("declare", "function", name);
    HANDLERS.FunctionTypeAnnotation_DotHack(state, func.typeAnnotation);
    if (pred) {
      descend(state, pred);
    }
    state.push(";");
  },
  "DeclareVariable": function parseDeclareVariable(state, ast) {
    state.push("declare", "var");
    descend(state, ast.id);
    state.push(";");
  },
  "DeclareModule": function parseDeclareModule(state, ast) {
    state.push("declare", "module");
    descend(state, ast.id);
    descend(state, ast.body);
  },
  "DeclareTypeAlias": function parseDeclareTypeAlias(state, ast) {
    state.push("declare");
    HANDLERS.TypeAlias(state, ast);
  },
  "DeclareInterface": function parseDeclareInterface(state, ast) {
    state.push("declare");
    HANDLERS.InterfaceDeclaration(state, ast);
  },
  "DeclareClass": function parseDeclareClass(state, ast) {
    // _assertOrUnknown(false, ast);
    state.push("declare");
    HANDLERS.ClassDeclaration(state, ast);
  },
  "DeclareModuleExports": function parseDeclareModuleExports(state, ast) {
    _assertOrUnknown(ast.typeAnnotation, ast);

    // Why the hell does it get its own node type? :/
    state.push("declare", "module", ".", "exports");
    descend(state, ast.typeAnnotation);
    state.push(";");
  }
};

function _assertOrUnknown(cond, ast) {
  if (cond) { return; }
  _unknownASTLog(ast);
}

function _unknownASTLog(ast) {
  var type = ast && ast.type;
  var purty = util.inspect(ast, { colors: true, depth: 8 });
  throw new Error(`Unknown AST Node: ${type}\n${purty}`);
}


function _stringLiteral(str) {
  str = String(str);
  return "'" + str.replace(/[\x00-\x1f"'\\\b\f\n\r\t\u2028\u2029\v]/g, _replaceChar) + "'";
}

function _numLiteral(val) {
  // Drop the spacing chars, because we're jerks:
  return String(val).replace(/_/g, "");
}

function _replaceChar(ch) {
  var code = ch.charCodeAt(0);
  return (code <= 0x1f)
    ? '\\u' + _.padStart(code.toString(16), 4, '0')
    : STR_CHAR_LOOKUP[ch];
}

var STR_CHAR_LOOKUP = {
  "\u0000": "\\0",

  "\"": "\\\"",
  "\'": "\\\'",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
  "\v": "\\v",
};
