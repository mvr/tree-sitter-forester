function command_seq(rule, arg) {
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
        $.namespace,
        $.let,
        $.datalog,
        $.tex,
        $.subtree,
        $.put,
        $.default,
        $.get,
        $.open,
        $.xml_tag,
        $.decl_xmlns,
        $.object,
        $.patch,
        $.hash_ident,
        $.verbatim_block,
        $.linebreak,
        $.control_symbol,
        $.inline_math,
        $.display_math,
        $._link,
        $.squares,
        $.parens,
        $.text,
        $.comment,
        $.command,
      ),

    braces: ($) => braces(optional(repeat1($._node))),
    squares: ($) => squares(optional(repeat1($._node))),
    parens: ($) => parens(optional(repeat1($._node))),

    xml_tag: ($) =>
      seq("\\<", $._xml_qname, ">", repeat(field("argument", $.argument))),
    decl_xmlns: ($) => seq("\\xmlns:", $._xml_base_ident, $._txt_arg),

    def: ($) => command_seq("def", $.fun_spec),
    fun: ($) =>
      command_seq(
        "fun",
        seq(
          field("binder", repeat(squares($.text))),
          field("argument", $.argument),
        ),
      ),
    alloc: ($) => command_seq("alloc", $.identifier),
    namespace: ($) =>
      command_seq(
        "namespace",
        seq(
          field("identifier", $.identifier),
          field("body", $.argument),
        ),
      ),
    let: ($) => command_seq("let", $.fun_spec),
    datalog: ($) => command_seq("datalog", field("argument", $.opaque_argument)),
    tex: ($) =>
      prec.right(command_seq("tex", repeat1(field("argument", $.opaque_argument)))),
    subtree: ($) =>
      prec.left(
        command_seq(
          "subtree",
          seq(optional(squares(field("target", $.addr))), $.argument),
        ),
      ),
    put: ($) =>
      command_seq(
        "put",
        seq(field("identifier", $.identifier), field("argument", $.argument)),
      ),
    default: ($) =>
      command_seq(
        "put?",
        seq(field("identifier", $.identifier), field("argument", $.argument)),
      ),
    get: ($) => command_seq("get", $.identifier),
    open: ($) => command_seq("open", $.identifier),
    object: ($) =>
      prec.left(
        command_seq(
          "object",
          seq(
            optional(field("self", squares($.text))),
            braces(repeat(choice($.method_decl, $._whitespace))),
          ),
        ),
      ),

    patch: ($) =>
      prec.left(
        command_seq(
          "patch",
          seq(
            field("object", $.argument),
            optional($.patch_bindings),
            braces(repeat(choice($.method_decl, $._whitespace))),
          ),
        ),
      ),
    comment: ($) => /%[^\r\n]*/,
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
        field("value", alias($.argument, $.method_body)),
      ),
    fun_spec: ($) =>
      field(
        "function",
        seq(
          field("identifier", $.identifier),
          choice(
            field("argument", $.argument),
            seq(
              field("binder", repeat1(squares($.text))),
              field("argument", $.argument),
            ),
          ),
        ),
      ),
    command: ($) =>
      prec.right(
        2,
        seq("\\", field("name", $.command_name), repeat(field("argument", $.argument))),
      ),
    identifier: ($) => seq("\\", field("name", $.command_name)),
    argument: ($) => braces(optional(repeat1(choice($._node)))),
    _opaque_content: ($) =>
      repeat1(choice(alias($._opaque_braces, $.braces), alias($._opaque_text, $.text))),
    _opaque_arg: ($) =>
      braces(optional($._opaque_content)),
    opaque_argument: ($) =>
      braces(optional($._opaque_content)),
    _opaque_braces: ($) =>
      braces(optional($._opaque_content)),
    _opaque_text: ($) => /([^{}]|\\[{}])+/,
    _link: ($) => choice($.markdown_link, $.unlabeled_link),
    addr: ($) => prec(1, $.text),
    markdown_link: ($) =>
      prec(
        1,
        seq(
        "[",
        field(
          "label",
          alias(
            repeat1(
              choice(
                $.text,
                $.inline_math,
                $.display_math,
                $.command,
                $.hash_ident,
                $.linebreak,
                $.control_symbol,
              ),
            ),
            $.link_label,
          ),
        ),
        "]",
        token.immediate("("),
        field("dest", $.addr),
        ")",
        ),
      ),
    unlabeled_link: ($) =>
      seq("[[", field("target", choice($.addr, $.external_link)), "]]"),
    external_link: ($) => $.text,
    _whitespace: ($) => /[ \t]+/,
    _alpha: ($) => /[a-zA-Z]+/,
    _digit: ($) => /[0-9]+/,
    text: ($) => /[^%#\\\{\}\[\]\(\)\r\n]+/,
    command_name: ($) => /[^%#\\\{\}\[\]\(\)\ \r\n]+/,
    _txt_arg: ($) => braces($.text),
    _xml_base_ident: ($) =>
      seq($._alpha, repeat(choice($._alpha, $._digit, /[-/#]/))),
    _xml_qname: ($) =>
      choice(seq($._xml_base_ident, ":", $._xml_base_ident), $._xml_base_ident),
  },
});
