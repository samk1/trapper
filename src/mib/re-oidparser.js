/**
 * Created by Samuel on 25/11/2015.
 */
var moduleNameMatch = '[A-Z-]+';
var objectNameMatch = '[a-z][a-zA-Z0-9-]*';
var numberMatch = '[0-9]+';
var identifierMatch = `(?:(?:${objectNameMatch})|(?:${numberMatch}))`;
var identifierListMatch = `(?:${identifierMatch}\.)*${identifierMatch}`;

var identifierListRe = new RegExp(`^\.?(${identifierListMatch})$`);
var moduleObjectRe = new RegExp(`^(${moduleNameMatch})::(${objectNameMatch})\.(${identifierListMatch})?$`);
var identifierRe = new RegExp(`(${identifierMatch})`, 'y');
var numberRe = new RegExp(`^${numberMatch}$`);

function parseIdentifierList(identifierList) {
    var identifiers = [];
    var identifier;
    var matches;

    while ( matches = identifierRe.exec(identifierList) ) {
        if(numberRe.exec(matches[1])) {
            identifier = parseInt(matches[1])
        } else {
            identifier = matches[1];
        }

        identifiers.push(identifier);
    }

    return identifiers;
}

function parse (string) {
    var matches;

    var syntax = null;

    if ( matches = identifierListRe.exec(string) ) {
        var identifiers = parseIdentifierList(matches[1]);

        syntax = {
            syntax_class: 'identifier_list',
            identifier_list: identifiers
        };
    } else if ( matches = moduleObjectRe.exec(string) ) {
        var moduleName = matches[1];
        var objectName = matches[2];
        var postIdentifiers = null;

        if(matches[3]) {
            postIdentifiers = parseIdentifierList(matches[3])
        }

        syntax = {
            syntax_class: 'module_object',
            module_name: moduleName,
            object_name: objectName,
            post_identifier_list: postIdentifiers
        };
    }

    return syntax;
}

exports.parser = {
    parse: parse
};