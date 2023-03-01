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

    body: ($, original) => repeat1(
      prec.right(
        choice(
          original,
          $.for_each
        )
      )
    ),

    for_each: $ => seq(
      $.for_each_identifier,
      '=',
      $.expression,
    ),

    for_each_identifier: ($) => "for_each",

  },
});
