/**
 * Created by Samuel on 26/11/2015.
 */
//Expected types in syntax objects

var moduleSyntax = {
    module_name: String,
    imports: Array, //of importSyntax
    definitions: Array //of definitionSyntax
};

var importSyntax = {
    module_name: String,
    object_names: Array //of strings
};

var definitionSyntax = {
    definition_class: String, // value | type | macro
    name: String
};

var valueDefinitionSyntax = {
    definition_class: 'value',
    name: String,
    type: Object, //typeSyntax
    value: Object //valueSyntax
};

var typeDefinitionSyntax = {
    definition_class: 'type',
    name: String,
    type: Object //typeSyntax
};

var typeSyntax = {
    type_class: String // builtin | defined | defined_macro
};

var builtinTypeSyntax = {
    type_class: 'builtin',
    builtin_name: String //as tokens (ie 'INTEGER', 'OCTET STRING', etc)
};

var integerTypeSyntax = {
    type_class: 'builtin',
    builtin_name: 'INTEGER',
    constraint_type: String, // size or value
    constraint_list: Array // per RFC
};

var octetStringTypeSyntax = {
    type_class: 'builtin',
    builtin_name: 'OCTET STRING',
    constraint_type: String, // size or value
    constraint_list: Array // per RFC
};

var definedTypeSyntax = {
    type_class: 'defined',
    defined_name: String,
    module_name: String, //or null
    constraint_type: String, // size or value
    constraint_list: Array // per RFC
};

var definedMacroTypeSyntax = {
    type_class: 'defined_macro',
    macro_name: String
    //Macro data
};

var valueSyntax = {
    value_class: String // builtin | defined
};

var builtinValueSyntax = {
    value_class: 'builtin',
    type: String,
    value: String
};

var macroDefinitionSyntax = {
    definition_class: 'macro'
};