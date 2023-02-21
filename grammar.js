const hcl = require("tree-sitter-hcl/grammar");

module.exports = grammar(hcl, {
  name: "hcl",

  // extras: ($, original) => [...original, $.comment],

  // rules: {
  //   // document: ($, original) => optional(original),

  //   comment: ($) => token(choice(seq("//", /.*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"))),
  // },
});
