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

        if(oidSyntax.class === OID_SYNTAX_CLASSES.ModuleObject) {
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
            while(module.name !== 'SNMPv2-SMI' && object.name !== 'iso') {
                identifiers.unshift(object.identifier);

                if(module.importsName(object.parentObjectName)) {
                    module = module.getExporterForName(object.parentObjectName);
                    object = module[object.parentObjectName];
                } else {
                    object = module[object.parentObjectName];
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

            Object.keys(module.objects).forEach(function(objectName) {
                var object = objects[objectName];
                var parentObjectName = object.parentObjectName;
                var parentObject = null;

                if(module.importsName(object.parentObjectName)) {
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
}

exports.MibRepo = MibRepo;