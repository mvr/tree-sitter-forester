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

(p "p" @function.builtin)
(li "li" @markup.list)
(ul "ul"  @markup.list)
(ol "ol"  @markup.list)
(em "em"  @function.builtin)
(strong "strong" @function.builtin)
(code "code" @function.builtin)
(figure "figure" @function.builtin)
(figcaption "figcaption" @function.builtin)

(tag "tag" @field)
(author "author" @field)
(author_literal "author/literal" @field)
(contributor "contributor" @field)
(contributor_literal "contributor/literal" @field)
(title "title" @field)
(taxon "taxon" @field)
(meta "meta" @field)
(parent "parent" @field)
(number "number" @field)

(title "title" @text.title)
(title (_) @text.title)
(author (_) @markup.heading.url)
(contributor (_) @markup.heading.url)

(ident (text_identifier) @string)
(hash_ident) @method
(transclude "transclude" @include)
(transclude target: (_) @markup.link.url)
(ref target: (_) @markup.link.url)
(import target: (_) @markup.link.url)
(export target: (_) @markup.link.url)

(def "def" @keyword)
(fun "fun" @keyword)
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

(query_tree "query" @keyword)
;(query_author "query/author" @keyword)
;(query_tag "query/tag" @keyword)
;(query_taxon "query/taxon" @keyword)
;(query_and "query/and" @keyword)
;(query_or "query/or" @keyword)
;(query_meta "query/meta" @keyword)

(import "import" @include)
(export "export" @include)
(transclude "transclude" @include)
(route_asset "route-asset" @include)
(execute "execute" @keyword)
(current_tree "current-tree" @variable.builtin)

(inline_math) @string.special
(display_math) @string.special
(diagram) @string.special
(tikzfig) @string.special
(datalog) @string.special
(verbatim_block_body) @string
