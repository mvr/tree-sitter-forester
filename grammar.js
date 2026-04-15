function command(rule, arg) {
  return seq("\\", rule, arg);
}

function braces(p) {
  return seq("{", p, "}");
}

function squares(p) {
  return seq("[", p, "]");
}

function parens(p) {
  return seq("(", p, ")");
}

function any_amount_of() {
  return repeat(seq(...arguments));
}

module.exports = grammar({
  name: "forester",

  conflicts: ($) => [
    [$._node, $.markdown_link],
  ],

  rules: {
    source_file: ($) => any_amount_of($._node),
    _node: ($) =>
      choice(
        $.def,
        $.fun,
        $.alloc,
        $.tex_package,
        $.taxon,
        $.meta,
        $.import,
        $.export,
        $.namespace,
        $.transclude,
        $.let,
        $.datalog,
        $.diagram,
        $.tikzfig,
        $.tex,
        $.scope,
        $.subtree,
        $.put,
        $.default,
        $.get,
        $.open,
        $.execute,
        $.route_asset,
        $.current_tree,
        $.syndicate_query_as_json_blob,
        $.syndicate_current_tree_as_atom_feed,
        $.xml_tag,
        $.decl_xmlns,
        $.query_tree,
        $.object,
        $.patch,
        $.call,
        $.hash_ident,
        $._prim,
        $.verbatim_block,
        $.linebreak,
        $.control_symbol,
        $.inline_math,
        $.display_math,
        $._link,
        $.squares,
        $.parens,
        $.braces,
        $.text,
        $.comment,
        $.title,
        $.author,
        $.author_literal,
        $.contributor,
        $.contributor_literal,
        $.date,
        $.parent,
        $.number,
        $.tag,
        $.ref,
        $.ident,
      ),

    braces: ($) => braces(optional(repeat1($._node))),
    squares: ($) => squares(optional(repeat1($._node))),
    parens: ($) => parens(optional(repeat1($._node))),

    title: ($) => field("title", command("title", $._arg)),
    author: ($) => field("author", command("author", $._arg)),
    author_literal: ($) =>
      field("author_literal", command("author/literal", $._arg)),
    contributor: ($) =>
      field("contributor", command("contributor", $._arg)),
    contributor_literal: ($) =>
      field("contributor_literal", command("contributor/literal", $._arg)),
    date: ($) => field("date", command("date", $._txt_arg)),
    parent: ($) => field("parent", command("parent", $._arg)),
    number: ($) => field("number", command("number", $._txt_arg)),
    tag: ($) => field("tag", command("tag", $._arg)),
    ref: ($) =>
      field(
        "ref",
        choice(
          prec(1, command("ref", braces(field("target", $.addr)))),
          command("ref", $._arg),
        ),
      ),

    xml_tag: ($) => seq("\\<", $._xml_qname, ">"),
    decl_xmlns: ($) => seq("\\xmlns:", $._xml_base_ident, $._txt_arg),

    year: ($) => /[0-9]{4}/,
    month: ($) => /(1[012]|0?[1-9])/,
    day: ($) => seq(/[0123]/, /[0-9]/),
    def: ($) => command("def", $.fun_spec),
    fun: ($) =>
      command(
        "fun",
        seq(
          field("binder", repeat(squares($.text))),
          field("argument", $._arg),
        ),
      ),
    tex_package: ($) => command("tex_package", $._txt_arg),
    alloc: ($) => command("alloc", $.ident),
    taxon: ($) => command("taxon", $._arg),
    meta: ($) => prec.left(command("meta", seq($._txt_arg, $._arg))),
    import: ($) => prec(2, command("import", braces(field("target", $.addr)))),
    export: ($) => prec(2, command("export", braces(field("target", $.addr)))),
    namespace: ($) =>
      command(
        "namespace",
        seq(
          field("identifier", $.ident),
          field("body", $._arg),
        ),
      ),
    transclude: ($) =>
      choice(
        prec(1, command("transclude", braces(field("target", $.addr)))),
        command("transclude", $._arg),
      ),
    let: ($) => command("let", $.fun_spec),
    datalog: ($) => command("datalog", $._opaque_arg),
    diagram: ($) => command("diagram", $._opaque_arg),
    tikzfig: ($) => command("tikzfig", $._opaque_arg),
    tex: ($) => prec.right(command("tex", repeat1($._opaque_arg))),
    scope: ($) => command("scope", $._arg),
    subtree: ($) =>
      prec.left(
        command(
          "subtree",
          seq(optional(squares(field("target", $.addr))), $._arg),
        ),
      ),
    put: ($) =>
      command(
        "put",
        seq(field("identifier", $.ident), field("argument", $._arg)),
      ),
    default: ($) =>
      command(
        "put?",
        seq(field("identifier", $.ident), field("argument", $._arg)),
      ),
    get: ($) => command("get", $.ident),
    open: ($) => command("open", $.ident),
    execute: ($) => command("execute", $._arg),
    route_asset: ($) => command("route-asset", $._txt_arg),
    current_tree: ($) => seq("\\", "current-tree"),
    syndicate_query_as_json_blob: ($) =>
      command(
        "syndicate-query-as-json-blob",
        seq(field("name", $._txt_arg), field("query", $._arg)),
      ),
    syndicate_current_tree_as_atom_feed: ($) =>
      seq("\\", "syndicate-current-tree-as-atom-feed"),
    query_tree: ($) => prec(2, command("query", $._arg)),
    object: ($) =>
      prec.left(
        command(
          "object",
          seq(
            optional(field("self", squares($.text))),
            braces(repeat(choice($.method_decl, $._whitespace))),
          ),
        ),
      ),

    patch: ($) =>
      prec.left(
        command(
          "patch",
          seq(
            field("object", $._arg),
            optional($.patch_bindings),
            braces(repeat(choice($.method_decl, $._whitespace))),
          ),
        ),
      ),
    call: ($) =>
      command(
        "call",
        seq(
          field("object", $._arg),
          field("method", $._txt_arg),
        ),
      ),
    comment: ($) => /%[^\r\n]*/,
    _prim: ($) =>
      choice(
        $.p,
        $.em,
        $.strong,
        $.li,
        $.ul,
        $.ol,
        $.code,
        $.blockquote,
        $.pre,
        $.figure,
        $.figcaption,
      ),
    hash_ident: ($) => token(seq("#", /[A-Za-z0-9-]+/)),
    inline_math: ($) => seq("#", $._opaque_arg),
    display_math: ($) => seq("##", $._opaque_arg),
    verbatim_block: ($) =>
      seq(
        "\\",
        "startverb",
        optional($.verbatim_block_body),
        "\\",
        "stopverb",
      ),
    verbatim_block_body: ($) =>
      token(/([^\\]|\\[^s]|\\s[^t]|\\st[^o]|\\sto[^p]|\\stop[^v]|\\stopv[^e]|\\stopve[^r]|\\stopver[^b])+/),
    linebreak: ($) => "\\\\",
    control_symbol: ($) => token(seq("\\", /[^A-Za-z0-9\\< \t\r\n]/)),

    p: ($) => command("p", $._arg),
    em: ($) => command("em", $._arg),
    strong: ($) => command("strong", $._arg),
    li: ($) => command("li", $._arg),
    ul: ($) => command("ul", $._arg),
    ol: ($) => command("ol", $._arg),
    code: ($) => command("code", $._arg),
    blockquote: ($) => command("blockquote", $._arg),
    pre: ($) => command("pre", $._arg),
    figure: ($) => command("figure", $._arg),
    figcaption: ($) => command("figcaption", $._arg),
    patch_bindings: ($) =>
      choice(
        seq(
          field("self", squares($.text)),
          field("super", squares($.text)),
        ),
        seq(field("self", squares($.text))),
      ),

    method_decl: ($) =>
      seq(
        field("key", squares($.text)),
        field("value", alias($._arg, $.method_body)),
      ),
    fun_spec: ($) =>
      field(
        "function",
        seq(
          field("identifier", $.ident),
          choice(
            field("argument", $._arg),
            seq(
              field("binder", repeat1(squares($.text))),
              field("argument", $._arg),
            ),
          ),
        ),
      ),
    ident: ($) =>
      prec.left(seq("\\", $.text_identifier, optional(choice(repeat1($._arg), "{}")))),
    _arg: ($) => braces(optional(repeat1(choice($._node)))),
    _opaque_arg: ($) =>
      braces(repeat(choice(alias($._opaque_braces, $.braces), alias($._opaque_text, $.text)))),
    _opaque_braces: ($) =>
      braces(repeat(choice(alias($._opaque_braces, $.braces), alias($._opaque_text, $.text)))),
    _opaque_text: ($) => /([^{}]|\\[{}])+/,
    _link: ($) => choice($.markdown_link, $.unlabeled_link),
    addr: ($) => prec(1, $.text),
    id: ($) => repeat1(choice($._alpha, $._digit, "-", "_")),
    prefix: ($) => repeat1($._alpha),
    markdown_link: ($) =>
      seq(
        "[",
        field("label", $.text),
        "]",
        token.immediate("("),
        field("dest", choice($.addr, $.text)),
        ")",
      ),
    unlabeled_link: ($) =>
      seq("[[", field("target", choice($.addr, $.external_link)), "]]"),
    external_link: ($) => $.text,
    _whitespace: ($) => /[ \t]+/,
    _alpha: ($) => /[a-zA-Z]+/,
    _digit: ($) => /[0-9]+/,
    text: ($) => /[^%#\\\{\}\[\]\(\)\r\n]+/,
    text_identifier: ($) => /[^%#\\\{\}\[\]\(\)\ \r\n]+/,
    _txt_arg: ($) => braces($.text),
    _xml_base_ident: ($) =>
      seq($._alpha, repeat(choice($._alpha, $._digit, /[-/#]/))),
    _xml_qname: ($) =>
      choice(seq($._xml_base_ident, ":", $._xml_base_ident), $._xml_base_ident),
  },
});
