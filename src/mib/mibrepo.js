/**
 * Created by Samuel on 21/11/2015.
 */

var MibObject = require('./mibobject.js');
var MibOid = require('./miboid');
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

        while(!mibOid.atEnd) {
            mibObject = mibObject.getChild(mibOid.nextIdentifier());

            if (!node) {
                return null;
            }
        }
        mibOid.reset();
        return mibObject.getData();
    }

    function parseOid(oidString) {
        var oidSyntax = oidparser.parse(oidString);
        var identifiers = [];
        var string = null;
        var mibOid = null;

        if(oidSyntax.class === OID_SYNTAX_CLASSES.ModuleIdWithObjectName ||
           oidSyntax.class === OID_SYNTAX_CLASSES.ModuleIdWithObjectNameAndIdentifierList) {
            var moduleName = oidSyntax.module_name;
            var objectName = oidSyntax.module_name;

            var module = modules[moduleName];
            if(!module) {
                return null;
            }

            var object = module.objects[objectName];
            if(!object) {
                return null;
            }

            //Trace to root
            while(module.name !== 'SNMPv2-SMI' && object.identifier !== 'iso') {
                identifiers.unshift(object.numericIdentifier);

                if(module.importsIdentifier(object.parentIdentifier)) {
                    module = module.getExporterForIndentifier(object.parentIdentifier);
                    object = module[object.parentIdentifier];
                } else {
                    object = module[object.parentIdentifier];
                }
            }

            //Add root
            identifiers.unshift(1);
        }

        return new MibOid({
            identifiers: identifiers,
            string: string
        });
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

            Object.keys(module.objects).forEach(function(identifier) {
                var object = objects[identifier];
                var parentIdentifier = object.parentIdentifier;
                var parentObject = null;

                if(module.importsIdentifier(object.parentIdentifier)) {
                    var exportingModuleName = module.getExporterForIdentifier(parentIdentifier);
                    var exportingModule = modules[exportingModuleName];

                    if(!exportingModule) {
                        throw new Error("Undefined module " + exportingModuleName + " in " + moduleName)
                    }

                    parentObject = exportingModule.objects[parentIdentifier];
                } else if(moduleName === 'SNMPv2-SMI' && parentIdentifier === 'iso') { //special case for root object
                    parentObject = rootObject;
                } else {
                    parentObject = module.objects[parentIdentifier];
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
}

exports.MibRepo = MibRepo;