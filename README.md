# Terraform to CloudTrail Event for CloudWatch

This tool parses Terraform HCL to produce an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) useful for converting
HCL into other formats.

The main goal of this project is to use that AST to produce "predictive alerts" that mock AWS CloudTrail events.

## Getting Started

Clone the repository and install the dependencies with `npm i`. A postinstall script will set up and build quite a few dependencies which takes a while. After this is finished you can parse hcl.

```
npx ts-node bin/tf2cwe.ts test/fixtures/terraform
```

## What Can I Do With This

### Convert 1 Format To Another

You could add a parser for any other format (CloudFormation, Bicep, GDM, etc...) and produce the AST. You could then write a compiler off the AST to produce a specific output format.

For example, if you could parse both Terraform and Bicep and output CloudTrail Events or GDM you could:

- Convert HCL to GDM
- Convert HCL to CloudTrail Events
- Convert Bicep to GDM
- Convert Bicep to CloudTrail Events

Combinations of input/output grow exponentially with each new input or output added.

### Simulte CloudTrail Events

CloudTrail events has a simple, but useful, syntax to allow for detecting events happening in your AWS Account(s). Combine this tool with something like [https://github.com/3p3r/tree-sitter-eventrule](https://github.com/3p3r/tree-sitter-eventrule) and you could use CloudTrail events to detective and preventative controls for your Terraform codebases.

## AST

The AST is written in a way as to abstract support of different CSPs (Cloud Service Providers). Adhering to this AST as your parser's output ensures support longer term for other clouds.

### Other CSPs

| AST             | HCL          | CFN            | Bicep               | GDM        |
| --------------- | ------------ | -------------- | ------------------- | ---------- |
| resource        | resources    | resources      | resources           | resources  |
| import          | module       | include        | imports             | imports    |
| input/parameter | variables    | parameters     | parameters          |            |
|                 | inputs       | input          |                     |            |
| output          | outputs      | outputs        | outputs             | outputs    |
| config          | config       | parameter file | variables           |            |
| environment     | env vars     |                |                     | env vars   |
| reference       | references   | references     | references          | references |
| expression      | expressions  |                |                     |            |
| function        | functions    | transforms?    | loops               |            |
| data            | data sources |                |                     |            |
| condition       | conditions   | conditions     | conditions          |            |
| metadata        | metadata     | metadata       | metadata            | metadata   |
| comments        | comments     | comments       |                     |            |
|                 |              | mappings       |                     |            |
| dependencies    |              | dependencies   | dependencies        |            |
|                 |              |                | module              |            |
|                 |              |                | existing resources  |            |
|                 |              |                | child resource      |            |
|                 |              |                | extension resources |            |
