const hcl = require("tree-sitter-hcl/grammar");
const PREC = {
  unary: 7,
  binary_mult: 6,
  binary_add: 5,
  binary_ord: 4,
  binary_comp: 3,
  binary_and: 2,
  binary_or: 1,

  // if possible prefer string_literals to quoted templates
  string_lit: 2,
  quoted_template: 1,
}
module.exports = grammar(hcl, {
  name: "hcl",

  rules: {

    // attribute: ($, original) => seq(
    //   $.attribute_name,
    //   '=',
    //   $.attribute_value,
    // ),

    // attribute_name: $ => token(seq(
    //   choice(/\p{ID_Start}/, '_'),
    //   repeat(choice(/\p{ID_Continue}/, '-')),
    // )),

    // attribute_value: $ => prec.right(choice(
    //   $._expr_term,
    //   $.conditional,
    // )),

    block: ($, original) => choice(
      original,
      $.node_resource
    ),

    node_resource: ($) => seq(
      "resource",
      alias($.string_lit, $.resource_type),
      alias($.string_lit, $.resource_name),
      $.block_start,
      optional($.body),
      $.block_end,
    ),

    resource_type: ($) => $.string_lit,
    resource_name: ($) => $.string_lit
  },
});
