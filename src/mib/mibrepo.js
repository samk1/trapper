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
    var mibModules = {};

    var mibObjectTree = new MibObjectTree();

    function getMibObjectData(mibOid) {
        return mibObjectTree.getObject(mibOid.identifiersCopy()).getData();
    }

    function parseModuleObjectOidSyntax(oidSyntax) {
        var moduleName = oidSyntax.module_name;
        var objectDescriptor = oidSyntax.object_name;
        var postIdentifiers = oidSyntax.post_identifier_list;

        var module = mibModules[moduleName];
        if (!module) {
            throw(new Error("Unknown module " + moduleName));
        }

        var object = module.objects[objectDescriptor];
        if (!object) {
            throw(new Error(objectDescriptor + "is not defined in " + moduleName))
        }

        //Trace to root
        var oidDescriptors = mibObjectTree.getDescriptorPath(object);
        var oidIdentifiers = mibObjectTree.getIdentifierPath(object);

        if (postIdentifiers) {
            var postIdentifier;

            while (postIdentifier = postIdentifiers.pop()) {
                if (object = mibObjectTree.getChildObject(object, postIdentifier)) {
                    oidIdentifiers.push(object.identifier);
                    oidDescriptors.push(object.descriptor);
                }
                else {
                    oidIdentifiers.concat(postIdentifiers);
                    oidDescriptors.concat(postIdentifiers);
                    break;
                }
            }

            moduleName = object.moduleName;
            objectDescriptor = object.descriptor;
        }
        return new MibOid({
            moduleName: moduleName,
            objectName: objectDescriptor,
            identifiers: oidIdentifiers,
            names: oidDescriptors
        });
    }

    function parseIdentifierListOidSyntax(oidSyntax) {
        var mibOid;
        var oidDescriptors = [];
        var oidIdentifiers = [];
        var identifiers = oidSyntax.identifier_list;
        var identifier;
        var object;

        //It's *almost* the same as getMibObjectData
        //It's exactly the same as the loop in parseModuleObjectOidSyntax
        while (identifier = identifiers.pop()) {
            if (object = mibObjectTree.getChildObject(object, identifier)) {
                oidIdentifiers.push(object.identifier);
                oidDescriptors.push(object.descriptor);
            }
            else {
                oidIdentifiers.concat(identifiers);
                oidDescriptors.concat(identifiers);
                break;
            }
        }

        var moduleName = object.descriptor;
        var objectName = object.moduleName;

        mibOid = new MibOid({
            moduleName: moduleName,
            objectName: objectName,
            identifiers: oidIdentifiers,
            names: oidDescriptors
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
            mibModules[module.name] = module;
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
        Object.keys(mibModules).forEach(function(moduleName) {
            var module = mibModules[moduleName];

            Object.keys(module.objects).forEach(function(objectDescriptor) {
                var path = [];
                var object = module.objects[objectDescriptor];
                var parentDescriptor;

                 do {
                    object.oidPart.forEach(function(element) {
                        path.unshift(element)
                    });

                    parentDescriptor = object.oidValue[0].descriptor;
                    if(module.importsDescriptor(parentDescriptor)) {
                        var parentModuleName = module.getExporterForDescriptor(parentDescriptor);
                        object = mibModules[parentModuleName].objects[parentDescriptor];
                    } else {
                        object = module.objects[parentDescriptor];
                    }
                } while(!atRoot(object));

                mibObjectTree.addObject(path, object);
            });
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