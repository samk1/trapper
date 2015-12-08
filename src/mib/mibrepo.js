/**
 * Created by Samuel on 21/11/2015.
 */

var MibObject = require('./mibobject.js').MibObject;
var MibModule = require('./mibmodule.js').MibModule;
var oidparser = require('./oidparser.js').parser;
var OID_SYNTAX_CLASSES = require('./mibconstants.js').OID_SYNTAX_CLASSES;
var fs = require('fs');
var path = require('path');

function MibRepo(search) {
    var mibFileExtns = new Set([
        '.txt',
        '.mib',
        '.my'
    ]);

    var modules = {};

    var ccittObject = new MibObject({
        descriptor: 'ccitt',
        moduleName: 'SNMPv2-SMI'
    });
    ccittObject.oidSyntax = [ { de: '_root' }, { id: 0 } ];

    var smiV1IsoObject = new MibObject({
        descriptor: 'iso',
        moduleName: 'RFC1155-SMI'
    });
    smiV1IsoObject.oidSyntax = [ { de: '_root'}, { id: 1 }];

    var smiV2IsoObject = new MibObject({
        descriptor: 'iso',
        moduleName: 'SNMPv2-SMI'
    });
    smiV2IsoObject.oidSyntax = [ { de: '_root' }, { id: 1 } ];

    var jointIsoCcittObject = new MibObject({
        descriptor: 'joint-iso-ccitt',
        moduleName: 'SNMPv2-SMI'
    });
    jointIsoCcittObject.oidSyntax = [ { de: '_root' }, { id: 2 } ];

    function Tree() {
        var self = this;

        this.root = {
            children: { },
            parent: null
        };

        this.addObject = function (object) {
            var currentNode = self.root;
            var prevNode = null;

            object.oid.forEach(function (identifier) {
                if(!currentNode.children[identifier]) {
                    currentNode.children[identifier] = {
                        children: {},
                        parent: currentNode
                    }
                }

                prevNode = currentNode;
                currentNode = currentNode.children[identifier];
            });

            if(!prevNode.children[object.descriptor]) {
                prevNode.children[object.descriptor] = {
                    children: currentNode.children,
                    parent: prevNode,
                    object: object
                };
            }

            // real objects overwrite anonymous objects
            if(currentNode.object) {
                if(currentNode.object.descriptor.startsWith('anonymous#')) {
                    currentNode.object = object;
                } else {
                    if(currentNode.object.equals(object)) {
                        currentNode.object.from.push(object.moduleName);
                    } else {
                        throw (new Error("Attempt to redefine object"));
                    }
                }
            } else {
                currentNode.object = object;
            }

            // Now that the object has been added to the tree, it can
            // be retrieved via public API so it is now sealed.
            object.finalise();
            Object.seal(object);
        };

        this.getNode = function (oid) {
            var currentNode = self.root;

            oid.forEach(function (identifier) {
                currentNode = currentNode.children[identifier];
                if(!currentNode) {
                    return null;
                }
            });

            return currentNode;
        };

        this.getLastDefinedNode = function (oid) {
            var currentNode = self.root;

            oid.forEach(function (identifier) {
                if(!currentNode.children[identifier]) {
                    return currentNode;
                }
                currentNode = currentNode.children[identifier];
            });

            return currentNode;
        }
    }

    var tree = new Tree();

    function expandOids() {

        var descriptors = {
            iso: [{
                oid: [ 1 ],
                from: 'SNMPv2-SMI'
            }]
        };

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
            var oid = null;

            if(!descriptors[descriptor]) {
                return null;
            }

            descriptors[descriptor].forEach(function (defn) {
                if(defn.from === from) {
                    oid = defn.oid;
                }
            });

            return oid;
        }

        /*
         * recursively expand OID of object defined in module,
         * and add the object to the tree. Any descriptors below this
         * are also expanded and added to the tree.
         */
        function expandOid(object, module) {
            var moduleName = module.name;
            var oid = findOid(object.descriptor, moduleName);

            if(!oid) {
                throw new Error(`No such descriptor: ${object.descriptor} from ${moduleName}`)
            }

            // This oid for this object has already been expanded,
            // so unwind from here.
            if(object.oid) {
                return object.oid;
            }

            // If the first sub-id is a number, then we are at root and can unwind.
            // This is the case for mibs that implement a new root.
            if(typeof oid[oid.length - 1] === 'number') {
                object.oid = oid.slice();
                tree.addObject(object);
                return oid;
            }

            // If the first sub-id is _root then unwind.
            // This is the case for the well-known objects (iso etc)
            if(oid[oid.length - 1] === '_root') {
                oid.pop();
                object.oid = oid.slice();
                tree.addObject(object);
                return oid;
            }

            // The first sub-id is a descriptor. Find the module it is from
            // and expand from there.
            var baseDescriptor = oid.pop();
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
            oid = expandOid(fromObject, fromModule).concat(oid);
            object.oid = oid.slice();
            tree.addObject(object);

            return oid;
        }

        // We examine every object that has been defined in two passes. The first pass can
        // create some extra objects which necessitates the second pass.

        // First pass: extract all partial ids in this format [foo, n_1, n_2, ... , n_m]
        // If there are any 'bare' descriptors (eg 'bar' in [foo, bar(2), 1]) these are
        // added to the module as an extra object.
        // any bare identifiers are added to the module as anonymous objects.
        Object.keys(modules).forEach(function (moduleName) {
            var module = modules[moduleName];
            var anonymousCount = 1;

            Object.keys(module.objects).forEach(function (objectDescriptor) {
                var object = module.objects[objectDescriptor];
                var oidSyntax = object.oidSyntax.slice();
                var oid = [];
                do {
                    var oidElm = oidSyntax.pop();
                    oid.push(oidElm.id || 0);
                } while (oidSyntax.length > 1);

                oidElm = oidSyntax.pop();
                oid.push(oidElm.de || oidElm.id);

                addDescriptor(objectDescriptor, oid, moduleName);
                for(var i = 1; i < object.oidSyntax.length; i++) {
                    var descriptor;
                    if(object.oidSyntax[i].de) {
                        descriptor = object.oidSyntax[i].de
                    } else {
                        descriptor = `anonymous#${anonymousCount}`;
                    }

                    addDescriptor(descriptor, oid.slice(0, i+1), moduleName);
                    module[descriptor] = new MibObject({
                        descriptor: descriptor,
                        moduleName: moduleName
                    });
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

    function parseModuleObjectOidSyntax(oidSyntax) {
        var moduleName = oidSyntax.module_name;
        var objectDescriptor = oidSyntax.object_name;
        var postIdentifiers = oidSyntax.post_identifier_list;
        var oid;

        var module = modules[moduleName];
        if (!module) {
            throw(new Error("Unknown module " + moduleName));
        }

        var object = module.objects[objectDescriptor];
        if (!object) {
            throw(new Error(objectDescriptor + "is not defined in " + moduleName))
        }

        oid = object.oid;

        var currentNode = tree.getNode(oid);

        if (postIdentifiers) {
            var postIdentifier;

            while (postIdentifier = postIdentifiers.pop()) {
                if (currentNode = currentNode.children[postIdentifier]) {
                    oid.push(postIdentifier);
                }
                else {
                    postIdentifiers.forEach(function (id) {
                        if (typeof id === 'string') {
                            throw new Error("Undefined descriptor:" + id);
                        }
                    });
                    oid.concat(postIdentifiers);
                    break;
                }
            }

        }

        return oid
    }

    function parseIdentifierListOidSyntax(oidSyntax) {
        var identifiers = oidSyntax.identifier_list;
        var oid;

        var lastNode = tree.getLastDefinedNode(identifiers);
        oid = lastNode.object.oid;

        var remainingIdentifiers = identifiers.slice(oid.length, identifiers.length);

        remainingIdentifiers.forEach(function (id) {
            if(typeof id === 'string') {
                throw new Error("Undefined descriptor:" + id);
            }
        });

        oid.concat(remainingIdentifiers);

        return oid;
    }

    function getObject(oid) {
        return tree.getNode(oid).object;
    }

    function parseOid(oidString) {
        var oidSyntax = oidparser.parse(oidString);

        if(oidSyntax.syntax_class === OID_SYNTAX_CLASSES.ModuleObject) {
            return parseModuleObjectOidSyntax(oidSyntax);
        } else if (oidSyntax.syntax_class === OID_SYNTAX_CLASSES.IdentifierList) {
            return parseIdentifierListOidSyntax(oidSyntax);
        }
    }

    function translateNumericOid(oid) {

    }

    function translateFullOid(oid) {

    }

    function translateSymbolicOid(oid) {

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
                var extn;
                if(extn = /(\.[^.]+)$/.exec(fileName)[1]) {
                    if(mibFileExtns.has(extn)) {
                        var filePath = path.join(dirPath, fileName);

                        if(fs.statSync(filePath).isFile()) {
                            filePaths.push(filePath);
                        }
                    }
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

    // Well known objects
    modules['SNMPv2-SMI'].objects[ccittObject.descriptor] = ccittObject;
    modules['SNMPv2-SMI'].objects[smiV2IsoObject.descriptor] = smiV2IsoObject;
    modules['SNMPv2-SMI'].objects[jointIsoCcittObject.descriptor] = jointIsoCcittObject;
    modules['RFC1155-SMI'].objects[smiV1IsoObject.descriptor] = smiV1IsoObject;

    //Expand all OIDs
    expandOids();


    Object.defineProperty(this, 'parseOid', {
        value: parseOid
    });

    Object.defineProperty(this, 'getObject', {
        value: getObject
    });

    Object.defineProperty(this, 'translateNumericOid', {
        value: translateNumericOid
    });

    Object.defineProperty(this, 'translateFullOid', {
        value: translateFullOid
    });

    Object.defineProperty(this, 'translateSymbolicOid', {
        value: translateSymbolicOid
    });
}

exports.MibRepo = MibRepo;