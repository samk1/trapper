/**
 * Created by Samuel on 25/11/2015.
 */

var syntaxClasses = require('./mibconstants.js').OID_SYNTAX_CLASSES;

var moduleNameMatch = '[A-Z-]+';
var objectNameMatch = '[a-z][a-zA-Z0-9-]*';
var numberMatch = '[0-9]+';
var identifierMatch = `(?:(?:${objectNameMatch})|(?:${numberMatch}))`;
var identifierListMatch = `(?:${identifierMatch}\\.)*${identifierMatch}`;

var identifierListRe = new RegExp(`^\\.?(${identifierListMatch})$`);
var moduleObjectRe = new RegExp(`^(${moduleNameMatch})::(${objectNameMatch})(?:\\.(${identifierListMatch}))?$`);

function parseIdentifierList(identifierList) {
    if(!identifierList) {
        return null
    }

    var identifiers = [];
    var number;

    identifierList.split('.').forEach(function (identifier) {
        identifiers.push( (number = parseInt(identifier)) ? number : identifier );
    });

    return identifiers;
}

function parse (string) {
    var matches;
    var syntax = null;

    if ( matches = identifierListRe.exec(string) ) {
        syntax = {
            syntax_class: syntaxClasses.IdentifierList,
            identifier_list: parseIdentifierList(matches[1])
        };
    } else if ( matches = moduleObjectRe.exec(string) ) {
        syntax = {
            syntax_class: syntaxClasses.ModuleObject,
            module_name: matches[1],
            object_name: matches[2],
            post_identifier_list: parseIdentifierList(matches[3])
        };
    }

    return syntax;
}

exports.parser = {
    parse: parse
};