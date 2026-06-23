(comment) @comment

[
 "\\"
 "("
 ")"
 "{"
 "}"
 "["
 "]"
] @punctuation.bracket

(command name: (command_name) @function.builtin)
(identifier name: (command_name) @string)
(hash_ident) @method

(def "def" @keyword)
(fun "fun" @keyword)
(let "let" @keyword)
(object "object" @constant)
(object self: (_) @keyword)
(method_decl key: (_) @method)
(patch "patch" @text.diff.add)
(patch object: (_) @constant)
(call "call" @function)

(markdown_link label: (_) @label)
(markdown_link dest: (_) @text.uri)
(unlabeled_link target: (_) @text.uri)

(scope "scope" @namespace)
(put "put" @variable.parameter)
(default "put?" @variable.parameter)
(open "open" @namespace)
(namespace "namespace" @namespace)
(get "get" @namespace)
(alloc "alloc" @keyword)
(subtree "subtree" @keyword)
(datalog "datalog" @keyword)
(tex "tex" @keyword)

(inline_math) @string.special
(display_math) @string.special
(verbatim_block_body) @string
