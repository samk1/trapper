/**
 * Created by Samuel on 21/11/2015.
 */

var MibObject = require('./mibobject.js');
var MibOid = require('./miboid');
var MibModule = require('./mibmodule.js');
var oidparser = require('./oidparser.js');
var OID_SYNTAX_CLASSES = require('./mibconstants.js').OID_SYNTAX_CLASSES;
var fs = require('fs');
var path = require('path');

function MibRepo(search) {
    var modules = {};

    var rootObject = new MibObject({
        id: 1,
        parent: null,
        name: 'iso'
    });

    function getMibObjectData(mibOid) {
        var mibObject = rootObject;
        var identifiers = mibOid.identifiersCopy(); //or names
        var identifier; //or name

        while(identifier = identifiers.shift()) {
            mibObject = mibObject.children[identifier];

            if (!mibObject) {
                return null;
            }
        }
        return mibObject.getData();
    }

    function parseModuleObjectOidSyntax(oidSyntax) {
        var moduleName = oidSyntax.module_name;
        var objectName = oidSyntax.object_name;
        var postIdentifiers = oidSyntax.post_identifier_list;
        var oidIdentifiers = [];
        var oidNames = [];

        var module = modules[moduleName];
        if (!module) {
            throw(new Error("Unknown module " + moduleName));
        }

        var object = module.objects[objectName];
        if (!object) {
            throw(new Error(objectName + "is not defined in " + moduleName))
        }

        //Trace to root
        while (module.name !== 'SNMPv2-SMI' && object.name !== 'iso') {
            oidIdentifiers.unshift(object.identifier);
            oidNames.unshift(object.name);

            if (module.importsName(object.parentName)) {
                module = module.getExporterForName(object.parentName);
                object = module[object.parentName];
            } else {
                object = module[object.parentName];
            }
        }

        //Add root
        oidIdentifiers.unshift(1);
        oidNames.unshift('iso');

        if (postIdentifiers) {
            var postIdentifier;

            while (postIdentifier = postIdentifiers.pop()) {
                if (object = object.children[postIdentifier]) {
                    oidIdentifiers.push(object.identifier);
                    oidNames.push(object.name);
                }
                else {
                    oidIdentifiers.concat(postIdentifiers);
                    oidNames.concat(postIdentifiers);
                    break;
                }
            }

            moduleName = object.moduleName;
            objectName = object.name;
        }
        return new MibOid({
            moduleName: moduleName,
            objectName: objectName,
            identifiers: oidIdentifiers,
            names: oidNames
        });
    }

    function parseIdentifierListOidSyntax(oidSyntax) {
        var mibOid;
        var oidNames = [];
        var oidIdentifiers = [];
        var identifiers = oidSyntax.identifier_list;
        var identifier;
        var object = rootObject;

        //It's *almost* the same as getMibObjectData
        //It's exactly the same as the loop in parseModuleObjectOidSyntax
        while (identifier = identifiers.pop()) {
            if (object = object.children[identifier]) {
                oidIdentifiers.push(object.identifier);
                oidNames.push(object.name);
            }
            else {
                oidIdentifiers.concat(identifier);
                oidNames.concat(identifier);
                break;
            }
        }

        var moduleName = object.name;
        var objectName = object.moduleName;

        mibOid = new MibOid({
            moduleName: moduleName,
            objectName: objectName,
            identifiers: oidIdentifiers,
            names: oidNames
        });
        return mibOid;
    }

    function parseOid(oidString) {
        var oidSyntax = oidparser.parse(oidString);

        if(oidSyntax.class === OID_SYNTAX_CLASSES.ModuleObject) {
            return parseModuleObjectOidSyntax(oidSyntax);
        } else if (oidSyntax.syntax_class === OID_SYNTAX_CLASSES.IdentifierList) {
            return parseIdentifierListOidSyntax(oidSyntax);
        }
    }

    function parseMibs(dirPath) {
        enumFiles(dirPath).forEach(function (filePath) {
            var module = new MibModule(filePath);
            modules[module.name] = module;
        })
    }

    function enumFiles(dirPath) {
        dirPath = path.normalize(dirPath);
        var filePaths = [];

        if(fs.statSync(dirPath).isDirectory()) {
            fs.readdirSync(dirPath).forEach(function (fileName) {
                var filePath = path.join(dirPath, fileName);
                if(fs.statSync(filePath).isFile()) {
                    filePaths.push(filePath);
                }
            });
        }

        return filePaths;
    }

    function buildObjectTree() {
        Object.keys(modules).forEach(function(moduleName) {
            var module = modules[moduleName];

            Object.keys(module.objects).forEach(function(objectName) {
                var object = module.objects[objectName];
                var parentObjectName = object.parentName;
                var parentObject = null;

                if(module.importsName(object.parentName)) {
                    var exportingModuleName = module.getExporterForName(parentObjectName);
                    var exportingModule = modules[exportingModuleName];

                    if(!exportingModule) {
                        throw new Error("Unknown module " + exportingModuleName + " imported by " + moduleName)
                    }

                    parentObject = exportingModule.objects[parentObjectName];
                } else if(moduleName === 'SNMPv2-SMI' && parentObjectName === 'iso') { //special case for root object
                    parentObject = rootObject;
                } else {
                    parentObject = module.objects[parentObjectName];
                }

                parentObject.addChild(object);
            })
        })
    }

    //Parse mib modules in search paths
    if (Array.isArray(search)) {
        search.forEach(function (dirPath) {
            parseMibs(dirPath)
        })
    } else if(typeof search === 'string') {
        parseMibs(search)
    }

    //Makes a path from all mib objects in all modules to rootObject (.1)
    buildObjectTree();

    Object.defineProperty(this, 'getMibObjectData', {
        value: getMibObjectData
    });

    Object.defineProperty(this, 'parseOid', {
        value: parseOid
    });
}

exports.MibRepo = MibRepo;