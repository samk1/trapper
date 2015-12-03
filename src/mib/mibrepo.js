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

    var descriptors = {
        iso: [{
            oid: [ 1 ],
            from: 'SNMPv2-SMI'
        }]
    };

    var oids = {
        '.1': {
            descriptor: 'iso',
            from: 'SNMPv2-SMI'
        }
    };

    function Tree() {
        var self = this;
        var isoObject = null;

        var isoNode = {
            _object: isoObject
        };

        function addObject(object) {
            var currentNode = self.root;
            var prevNode = null;

            object.oid.forEach(function (identifier) {
                if(!currentNode[identifier]) {
                    currentNode[identifier] = {}
                }

                prevNode = currentNode;
                currentNode = currentNode[identifier];
            });

            prevNode[object.descriptor] = currentNode;
            currentNode._object = object;

            // Now that the object has been added to the tree, it can
            // be retrieved via public API so it is now sealed.
            object.finalise();
            Object.seal(object);
        }

        this.root = {
            1: isoNode,
            iso: isoNode
        };
        this.addObject = addObject;
    }

    var tree = new Tree();

    function expandOids() {
        function addDescriptor(descriptor, oid, from) {
            if(!descriptors[descriptor]) {
                descriptors[descriptor] = [ {
                    oid: oid,
                    from: from
                } ];
            } else {
                descriptors[descriptor].push({
                    oid: oid,
                    from: from
                });
            }
        }

        function findOid(descriptor, from) {
            if(!descriptors[descriptor]) {
                return null;
            }

            descriptors[descriptor].forEach(function (defn) {
                if(defn.from === from) {
                    return defn.oid;
                }
            })
        }

        /*
         * recursively expand OID of object defined in module,
         * and add the object to the tree. Any descriptors below this
         * are also expanded and added to the tree.
         */
        function expandOid(object, module) {
            var moduleName = module.name;
            var oid = findOid(object.descriptor, moduleName);

            // This oid for this object has already been expanded,
            // so unwind from here.
            if(object.oid) {
                return object.oid;
            }

            // If the first sub-id is a number, then we are at root and can unwind.
            if(typeof oid[0] === 'number') {
                object.oid = oid.slice();
                tree.addObject(object);
                return oid;
            }

            // The first sub-id is a descriptor. Find the module it is from
            // and expand from there.
            var baseDescriptor = oid.unshift();
            var fromModule;
            var fromModuleName;
            var fromObject;
            if(module.importsDescriptor(baseDescriptor)) {
                fromModuleName = module.getExporterForDescriptor(baseDescriptor);
            } else {
                fromModuleName = moduleName;
            }
            fromModule = modules[fromModuleName];
            fromObject = fromModule.objects[baseDescriptor];

            // recurse down to expand the next part of the OID.
            oid.concat(expandOid(fromObject, fromModule));
            object.oid = oid.slice();
            tree.addObject(object);

            return oid;
        }

        // We examine every object that has been defined in two passes. The first pass can
        // create some extra objects which necessitates the second pass.

        // First pass: extract all partial ids in this format [foo, n_1, n_2, ... , n_m]
        // If there are any 'bare' descriptors (eg 'bar' in [foo, bar(2), 1]) these are
        // added to the module as an extra object.
        Object.keys(modules).forEach(function (moduleName) {
            var module = modules[moduleName];

            Object.keys(module.objects).forEach(function (objectDescriptor) {
                var object = module[objectDescriptor];
                var oidSyntax = object.oidSyntax.slice();
                var oid = [];
                do {
                    var oidElm = oidSyntax.pop();
                    oid.push(oidElm.id || 0);
                } while (oidSyntax.length > 1);

                oid.push(oidSyntax.pop().de);

                addDescriptor(objectDescriptor, oid, moduleName);

                for(var i = 1; i++; i < object.oidSyntax.length) {
                    var descriptor;
                    if(descriptor = object.oidSyntax[i].de) {
                        addDescriptor(descriptor, oid.slice(0, i+1), moduleName);
                        module[descriptor] = new MibObject({
                            descriptor: descriptor,
                            identifier: object.oidSyntax[i].id,
                            moduleName: moduleName
                        });
                    }
                }
            });
        });

        // Second pass: expand all oids that were extracted above into full format
        // starting from root (eg .1.3.6.1.2.1.2.2 and so on), and then insert the object
        // into the tree for quick retrieval.
        Object.keys(modules).forEach(function (moduleName) {
            var module = modules[moduleName]; {
                Object.keys(module.objects).forEach(function (objectDescriptor) {
                    var object = module.objects[objectDescriptor];
                    expandOid(object, module);
                });
            }
        });
    }

    function getMibObjectData(mibOid) {
        return objectTree.getObject(mibOid.identifiersCopy()).getData();
    }

    function parseModuleObjectOidSyntax(oidSyntax) {
        var moduleName = oidSyntax.module_name;
        var objectDescriptor = oidSyntax.object_name;
        var postIdentifiers = oidSyntax.post_identifier_list;

        var module = modules[moduleName];
        if (!module) {
            throw(new Error("Unknown module " + moduleName));
        }

        var object = module.objects[objectDescriptor];
        if (!object) {
            throw(new Error(objectDescriptor + "is not defined in " + moduleName))
        }

        //Trace to root
        var oidDescriptors = objectTree.getDescriptorPath(object);
        var oidIdentifiers = objectTree.getIdentifierPath(object);

        if (postIdentifiers) {
            var postIdentifier;

            while (postIdentifier = postIdentifiers.pop()) {
                if (object = objectTree.getChildObject(object, postIdentifier)) {
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
        var object = rootObject;

        //It's *almost* the same as getMibObjectData
        //It's exactly the same as the loop in parseModuleObjectOidSyntax
        while (identifier = identifiers.pop()) {
            if (object = objectTree.getChildObject(object, identifier)) {
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

    //Parse mib modules in search paths
    if (Array.isArray(search)) {
        search.forEach(function (dirPath) {
            parseMibs(dirPath)
        })
    } else if(typeof search === 'string') {
        parseMibs(search)
    }

    //Expand all OIDs
    expandOids();

    Object.defineProperty(this, 'getMibObjectData', {
        value: getMibObjectData
    });

    Object.defineProperty(this, 'parseOid', {
        value: parseOid
    });
}

exports.MibRepo = MibRepo;