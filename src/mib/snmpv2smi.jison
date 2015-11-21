%lex

%%
[ \t\n\r]+			                {/* skip whitespace */}
"--"[^\n\r]*			            {/* skip comments */}

"..."			                    {return 'TRIPLE_DOT';}
".."			                    {return 'DOUBLE_DOT';}
"."				                    {return 'DOT';}
","				                    {return 'COMMA';}
";"				                    {return 'SEMI_COLON';}
"("				                    {return 'LEFT_PAREN';}
")"				                    {return 'RIGHT_PAREN';}
"{"				                    {return 'LEFT_BRACE';}
"}"				                    {return 'RIGHT_BRACE';}
"["				                    {return 'LEFT_BRACKET';}
"]"				                    {return 'RIGHT_BRACKET';}
"-"				                    {return 'MINUS';}
"<"				                    {return 'LESS_THAN';}
"|"				                    {return 'VERTICAL_BAR';}
"::="				                {return 'DEFINITION';}

"DEFINITIONS"		                {return 'DEFINITIONS';}
"EXPLICIT"			                {return 'EXPLICIT';}
"IMPLICIT"			                {return 'IMPLICIT';}
"TAGS"				                {return 'TAGS';}
"BEGIN"				                {return 'BEGIN';}
"END"				                {return 'END';}
"EXPORTS"			                {return 'EXPORTS';}
"IMPORTS"			                {return 'IMPORTS';}
"FROM"				                {return 'FROM';}
"MACRO"				                {return 'MACRO  ';}

"INTEGER"			                {return 'INTEGER';}
"REAL"				                {return 'REAL';}
"BOOLEAN"			                {return 'BOOLEAN';}
"NULL"				                {return 'NULL';}
"BIT"				                {return 'BIT';}
"OCTET"				                {return 'OCTET';}
"STRING"			                {return 'STRING';}
"ENUMERATED"		                {return 'ENUMERATED';}
"SEQUENCE"			                {return 'SEQUENCE';}
"SET"				                {return 'SET';}
"OF"				                {return 'OF';}
"CHOICE"			                {return 'CHOICE';}
"UNIVERSAL"			                {return 'UNIVERSAL';}
"APPLICATION"		                {return 'APPLICATION';}
"PRIVATE"			                {return 'PRIVATE';}
"ANY"				                {return 'ANY';}
"DEFINED"			                {return 'DEFINED';}
"BY"				                {return 'BY';}
"OBJECTS"			                {return 'OBJECTS';}
"OBJECT-GROUP"		                {return 'OBJECT_GROUP';}
"OBJECT-IDENTITY"	                {return 'OBJECT_IDENTITY';}
"OBJECT-TYPE"		                {return 'OBJECT_TYPE';}
"OBJECT"			                {return 'OBJECT';}
"IDENTIFIER"		                {return 'IDENTIFIER';}
"INCLUDES"			                {return 'INCLUDES';}
"MIN-ACCESS"		                {return 'MIN_ACCESS';}
"MIN"				                {return 'MIN';}
"MAX-ACCESS"		                {return 'MAX_ACCESS';}
"MAX"				                {return 'MAX';}
"SIZE"				                {return 'SIZE';}
"WITH"				                {return 'WITH';}
"COMPONENTS"		                {return 'COMPONENTS';}
"COMPONENT"			                {return 'COMPONENT';}
"PRESENT"			                {return 'PRESENT';}
"ABSENT"			                {return 'ABSENT';}
"OPTIONAL"			                {return 'OPTIONAL';}
"DEFAULT"			                {return 'DEFAULT';}
"TRUE"				                {return 'TRUE';}
"FALSE"				                {return 'FALSE';}
"PLUS-INFINITY"			            {return 'PLUS_INFINITY';}
"MINUS-INFINITY"		            {return 'MINUS_INFINITY';}
"MODULE-IDENTITY"		            {return 'MODULE_IDENTITY';}
"NOTIFICATION-TYPE"		            {return 'NOTIFICATION_TYPE';}
"TRAP-TYPE"			                {return 'TRAP_TYPE';}
"TEXTUAL-CONVENTION"	            {return 'TEXTUAL_CONVENTION';}
"NOTIFICATION-GROUP"	            {return 'NOTIFICATION_GROUP';}
"MODULE-COMPLIANCE"		            {return 'MODULE_COMPLIANCE';}
"AGENT-CAPABILITIES"	            {return 'AGENT_CAPABILITIES';}
"LAST-UPDATED"			            {return 'LAST_UPDATED';}
"ORGANIZATION"			            {return 'ORGANIZATION';}
"CONTACT-INFO"			            {return 'CONTACT_INFO';}
"DESCRIPTION"			            {return 'DESCRIPTION';}
"REVISION"			                {return 'REVISION';}
"STATUS"			                {return 'STATUS';}
"REFERENCE"			                {return 'REFERENCE';}
"SYNTAX"			                {return 'SYNTAX';}
"BITS"				                {return 'BITS';}
"UNITS"				                {return 'UNITS';}
"ACCESS"			                {return 'ACCESS';}
"INDEX"				                {return 'INDEX';}
"AUGMENTS"			                {return 'AUGMENTS';}
"IMPLIED"			                {return 'IMPLIED';}
"DEFVAL"			                {return 'DEFVAL';}
"ENTERPRISE"			            {return 'ENTERPRISE';}
"VARIABLES"			                {return 'VARIABLES';}
"DISPLAY-HINT"			            {return 'DISPLAY_HINT';}
"NOTIFICATIONS"			            {return 'NOTIFICATIONS';}
"MODULE"			                {return 'MODULE';}
"MANDATORY-GROUPS"		            {return 'MANDATORY_GROUPS';}
"GROUP"				                {return 'GROUP';}
"WRITE-SYNTAX"			            {return 'WRITE_SYNTAX';}
"PRODUCT-RELEASE"		            {return 'PRODUCT_RELEASE';}
"SUPPORTS"			                {return 'SUPPORTS';}
"VARIATION"			                {return 'VARIATION';}
"CREATION-REQUIRES"		            {return 'CREATION_REQUIRES';}

'[0-1]*'(B|b)			            {return 'BINARY_STRING';}
'[0-9A-Fa-f]*'(H|h)		            {return 'HEXADECIMAL_STRING';}
"\""[^"]*"\""			            {return 'QUOTED_STRING';}
[a-zA-Z][a-zA-Z0-9-_]*	            {return 'IDENTIFIER_STRING';}
[0-9]+				                {return 'NUMBER_STRING';}

/lex

%left 'TRAP_TYPE'
%left 'QUOTED_STRING'

%start module_definition

%%

module_definition 
	: module_identifier DEFINITIONS tag_default DEFINITION BEGIN module_body END 
		{ return {module_identifier: $1, body: $6}; }
	| module_identifier DEFINITIONS tag_default DEFINITION BEGIN END 
		{ return {module_identifier: $1, body: {}}; }
	| module_identifier DEFINITIONS DEFINITION BEGIN END 
		{ return {module_identifier: $1, body: {}}; }
	| module_identifier DEFINITIONS DEFINITION BEGIN module_body END 
		{ return {module_identifier: $1, body: $5}; }
	;

module_identifier 
	: IDENTIFIER_STRING
		{ $$ = $1; }
	| IDENTIFIER_STRING object_identifier_value
		{ $$ = $1; }
	;

module_reference 
	: IDENTIFIER_STRING DOT 
	;

tag_default 
	: EXPLICIT TAGS
	| IMPLICIT TAGS
	;

module_body
	: export_list import_list assignment_list
		{ $$ = {exports: $1, imports: $2, assignments: $3}; }
	| export_list assignment_list
		{ $$ = {exports: $1, assignments: $2}; }
	| import_list assignment_list
		{ $$ = {imports: $1, assignments: $2}; }
	;

export_list
	: EXPORTS symbol_list SEMI_COLON
	| EXPORTS SEMI_COLON
	;

import_list
	: IMPORTS symbols_from_module_list SEMI_COLON
	    { $$ = $2 }
	;

symbols_from_module_list
	: symbols_from_module
	    {
	        symbols_from_module_list = {};
	        symbols_from_module_list[$1.module_identifier] = $1.symbols;
	        $$ = symbols_from_module_list;
        }
	| symbols_from_module_list symbols_from_module
	    {
	        $1[$2.module_identifier] = $2.symbols;
	        $$ = $1;
	    }
	;

symbols_from_module
	: symbol_list FROM module_identifier
	    { $$ = { 'module_identifier': $3, 'symbols': $1 } }
	;

symbol_list
	: symbol
	    { $$ = [ $1 ] }
	| symbol_list COMMA symbol
	    {
	        $1.push($3);
	        $$ = $1;
	    }
	;

symbol
	: IDENTIFIER_STRING
	| defined_macro_name
	;

assignment_list
	: assignment
		{
		    var assignment_list = {};
		    assignment_list[$1.assignment.identifier] = { assignment_type: $1.type, assignment_value: $1.assignment };
		    $$ = assignment_list;
		}
	| assignment_list assignment
		{
		    $1[$2.assignment.identifier] = { assignment_type: $2.type, assignment_value: $2.assignment };
			$$ = $1;
		}
	;

assignment
	: macro_definition
		{ $$ = 'not_implemented' }
	| macro_definition SEMI_COLON
		{ $$ = 'not_implemented' }
	| type_assignment
		{ $$ = { type: 'type', assignment: $1 } }
	| type_assignment SEMI_COLON
		{ $$ = { type: 'type', assignment: $1 } }
	| value_assignment
		{ $$ = { type: 'value', assignment: $1 } }
	| value_assignment SEMI_COLON
		{ $$ = { type: 'value', assignment: $1 } }
	;

macro_definition
	: macro_reference MACRO DEFINITION macro_body
	;

macro_reference
	: IDENTIFIER_STRING
	| defined_macro_name
	;

macro_body
	: BEGIN macro_body_element_list END
	| BEGIN END
	| module_reference macro_reference
	;

macro_body_element
	: LEFT_PAREN
    | RIGHT_PAREN
	| VERTICAL_BAR
	| DEFINITION
	| "INTEGER"
	| "REAL"
	| "BOOLEAN"
	| "NULL"
	| "BIT"
	| "OCTET"
	| "STRING"
	| "OBJECT"
	| "IDENTIFIER"
	| IDENTIFIER_STRING
	| QUOTED_STRING 
	;

type_assignment
	: IDENTIFIER_STRING DEFINITION type
	    { $$ = { identifier: $1, type: $3 } }
	;

type
	: builtin_type
		{ $$ = { type_class: 'builtin', type_def: $1 }; }
	| defined_type
		{ $$ = { type_class: 'defined', type_def: $1 }; }
	| defined_macro_type
		{ $$ = { type_class: 'defined_macro', type_def: $1 }; }
	;

defined_type
	: module_reference IDENTIFIER_STRING value_or_constraint_list
	| module_reference IDENTIFIER_STRING
	| IDENTIFIER_STRING value_or_constraint_list
	| IDENTIFIER_STRING
	;

builtin_type
	: null_type
	| boolean_type
	| real_type
	| integer_type 
	| object_identifier_type
	| string_type 
	| bit_string_type 
	| bits_type
	| sequence_type 
	| sequence_of_type 
	| set_type 
	| set_of_type 
	| choice_type 
	| enumerated_type 
	| selection_type 
	| tagged_type 
	| any_type 
	;

null_type
	: NULL
	;

boolean_type
	: BOOLEAN
	;

real_type
	: REAL
	;

integer_type
	: INTEGER
	| INTEGER value_or_constraint_list
	;

object_identifier_type
	: OBJECT IDENTIFIER
	;

string_type
	: OCTET STRING
	| OCTET STRING constraint_list_container
	;

bit_string_type
	: BIT STRING
	| BIT STRING value_or_constraint_list
	;

bits_type
	: BITS
	| BITS value_or_constraint_list
	;

sequence_type
	: SEQUENCE LEFT_BRACE element_type_list RIGHT_BRACE
	| SEQUENCE LEFT_BRACE RIGHT_BRACE
	;

sequence_of_type
	: SEQUENCE OF type
	| SEQUENCE constraint_list_container OF type
	;

set_type
	: SET LEFT_BRACE element_type_list RIGHT_BRACE
	| SET LEFT_BRACE RIGHT_BRACE
	;

set_of_type
	: SET size_constraint OF type
	| SET OF type
	;

choice_type
	: CHOICE LEFT_BRACE element_type_list RIGHT_BRACE
	;

enumerated_type
	: ENUMERATED named_number_list_container
	;

selection_type
	: IDENTIFIER_STRING LESS_THAN type
	;

tagged_type
	: tag type
	| tag explicit_or_implicit_tag type
	;

tag
	: LEFT_BRACKET NUMBER_STRING RIGHT_BRACKET
	| LEFT_BRACKET class NUMBER_STRING RIGHT_BRACKET
	;

class
	: UNIVERSAL
	| APPLICATION
	| PRIVATE
	;

explicit_or_implicit_tag
	: EXPLICIT
	| IMPLICIT
	;

any_type
	: ANY
	| ANY DEFINED BY IDENTIFIER_STRING
	;

element_type_list
	: element_type
	| element_type_list COMMA element_type
	;

element_type
	: IDENTIFIER_STRING type optional_or_default_element
	| IDENTIFIER_STRING type
	| type optional_or_default_element
	| type
	| IDENTIFIER_STRING COMPONENTS OF type
	| COMPONENTS OF type
	;

optional_or_default_element
	: OPTIONAL
	| DEFAULT value
	| DEFAULT IDENTIFIER_STRING value
	;

value_or_constraint_list
	: named_number_list_container
	| constraint_list_container
	;

named_number_list_container
	: LEFT_BRACE named_number_list RIGHT_BRACE
	;

named_number_list
	: named_number
	| named_number_list COMMA named_number
	;

named_number
	: IDENTIFIER_STRING LEFT_PAREN number RIGHT_PAREN
	;

number
	: MINUS NUMBER_STRING
	| NUMBER_STRING
	| defined_value
	;

constraint_list_container
	: LEFT_PAREN constraint_list RIGHT_PAREN
	;

constraint_list
	: constraint
	| constraint_list VERTICAL_BAR constraint
	;
	
constraint
	: value_constraint
	| size_constraint
	| alphabet_constraint
	| contained_type_constraint
	| inner_type_constraint
	;

value_constraint_list_container
	: LEFT_PAREN value_constraint_list RIGHT_PAREN
	;

value_constraint_list
	: value_constraint
	| value_constraint_list VERTICAL_BAR value_constraint
	;

value_constraint
	: lower_end_point value_range
	| lower_end_point
	;

value_range
	: LESS_THAN DOUBLE_DOT LESS_THAN upper_end_point
	| LESS_THAN DOUBLE_DOT upper_end_point
	| DOUBLE_DOT LESS_THAN upper_end_point
	| DOUBLE_DOT upper_end_point
	;

lower_end_point
	: value
	| MIN
	;

upper_end_point
	: value
	| MAX
	;

size_constraint
	: SIZE value_constraint_list_container
	;

alphabet_constraint
	: FROM value_constraint_list_container
	;

contained_type_constraint
	: INCLUDES type
	;

inner_type_constraint
	: WITH COMPONENT value_or_constraint_list
	| WITH COMPONENTS components_list_container
	;

components_list_container
	: LEFT_BRACE component_constraint_list RIGHT_BRACE
	;

component_constraint_list
	: component_constraint components_list_tail
	| component_constraint
	| TRIPLE_DOT components_list_tail
	;

components_list_tail
	: COMMA component_constraint
	| COMMA component_list_tail COMMA component_constraint
	;

component_constraint
	: IDENTIFIER_STRING component_value_presence
	| IDENTIFIER_STRING
	| component_value_presence
	;

component_value_presence
	: value_or_constraint_list component_presence
	| value_or_constraint_list
	| component_presence
	;

component_presence
	: PRESENT
	| ABSENT
	| OPTIONAL
	;

value_assignment
	: IDENTIFIER_STRING type DEFINITION value
		{ $$ = {identifier: $1, type: $2, value: $4}; }
	;

value
	: builtin_value
		{ $$ = $1; }
	| defined_value
		{ $$ = 'not_implemented' }
	;

defined_value
	: module_reference IDENTIFIER_STRING
	| IDENTIFIER_STRING
	;

builtin_value
	: null_value
		{ $$ = {type: 'null', value: $1}; }
	| boolean_value
		{ $$ = {type: 'boolean', value: $1}; }
	| special_real_value
		{ $$ = {type: 'special_real', value: $1}; }
	| number_value
		{ $$ = {type: 'number', value: $1}; }
	| binary_value
		{ $$ = {type: 'binary', value: $1}; }
	| hexadecimal_value
		{ $$ = {type: 'hexadecimal', value: $1}; }
	| string_value
		{ $$ = {type: 'string', value: $1}; }
	| bit_or_object_identifier_value 
		{ $$ = {type: $1.type, value: $1.value}; }
	;

null_value
	: NULL
		{ $$ = null; }
	;

bollean_value
	: TRUE
		{ $$ = true; }
	| FALSE
		{ $$ = false; }
	;

special_real_value
	: PLUS_INFINITY
		{ $$ = 'plus_infinity' }
	| MINUS_INFINITY
		{ $$ = 'minus_infinity' }
	;

number_value
	: MINUS NUMBER_STRING
		{ $$ = -1 * parseInt($2); }
	| NUMBER_STRING
		{ $$ = parseInt($1); }
	;

binary_value
	: BINARY_STRING
		{ $$ = $1; }
	;

hexadecimal_value
	: HEXADECIMAL_STRING
		{ $$ = $1; }
	;

string_value
	: QUOTED_STRING
		{ $$ = $1; }
	;

bit_or_object_identifier_value
	: name_value_list_container
		{ $$ = {type: 'ambiguous_bit_or_object_identifier', value: $1}; }
	;

bit_value
	: name_value_list_container
		{ $$ = {type: 'bit', value: $1}; }
	;

object_identifier_value
	: name_value_list_container
		{ $$ = {type: 'object_identifier', value: $1}; }
	;

name_value_list_container
	: LEFT_BRACE name_value_list RIGHT_BRACE
		{ $$ = $2; }
	| LEFT_BRACE RIGHT_BRACE
		{ $$ = []; }
	;

name_value_list
	: name_or_number
		{ $$ = [ $1 ]; }
	| name_value_list comma_opt name_or_number
		{
			$1.push($3);
			$$ = $1;
		}
	;

comma_opt
	:
	| COMMA
	;

name_or_number
	: NUMBER_STRING
	| IDENTIFIER_STRING
	| name_and_number
	;

name_and_number
	: IDENTIFIER_STRING LEFT_PAREN NUMBER_STRING RIGHT_PAREN
	| IDENTIFIER_STRING LEFT_PAREN defined_value RIGHT_PAREN
	;

defined_macro_type
	: snmp_module_identity_macro_type 
		{ $$ = {macro_type : 'module_identity', value: 'not_implemented'}; }
	| snmp_object_identity_macro_type 
		{ $$ = {macro_type : 'object_identity', value: 'not_implemented'}; }
	| snmp_object_type_macro_type 
		{ $$ = {macro_type: 'object_type', value: $1}; }
	| snmp_notification_type_macro_type 
		{ $$ = {macro_type : 'notification_type', value: 'not_implemented'}; }
	| snmp_trap_type_macro_type 
		{ $$ = {macro_type : 'trap_type', value: 'not_implemented'}; }
	| snmp_textual_convention_macro_type 
		{ $$ = {macro_type : 'textual_convention', value: 'not_implemented'}; }
	| snmp_object_group_macro_type 
		{ $$ = {macro_type : 'object_group', value: 'not_implemented'}; }
	| snmp_notification_group_macro_type 
		{ $$ = {macro_type : 'notification_group', value: 'not_implemented'}; }
	| snmp_module_compliance_macro_type 
		{ $$ = {macro_type : 'module_compliance', value: 'not_implemented'}; }
	| snmp_agent_capabilities_macro_type 
		{ $$ = {macro_type : 'agent_capabilities', value: 'not_implemented'}; }
	;

defined_macro_name
	: MODULE_IDENTITY 
	| OBJECT_IDENTITY 
	| OBJECT_TYPE 
	| NOTIFICATION_TYPE 
	| TRAP_TYPE 
	| TEXTUAL_CONVENTION 
	| OBJECT_GROUP 
	| NOTIFICATION_GROUP 
	| MODULE_COMPLIANCE 
	| AGENT_CAPABILITIES 
	;

snmp_module_identity_macro_type
	: MODULE_IDENTITY 
		snmp_update_part 
		snmp_organization_part 
		snmp_contact_part 
		snmp_descr_part 
		snmp_revision_part_list
	| MODULE_IDENTITY 
		snmp_update_part 
		snmp_organization_part 
		snmp_contact_part 
		snmp_descr_part 
	;

snmp_revision_part_list
	: snmp_revision_part
	| snmp_revision_part_list snmp_revision_part
	;

snmp_object_identity_macro_type
	: OBJECT_IDENTITY
		snmp_status_part
		snmp_descr_part
		snmp_refer_part
	|  OBJECT_IDENTITY
		snmp_status_part
		snmp_descr_part
	;

snmp_object_type_macro_type
	: OBJECT_TYPE
		snmp_syntax_part
		snmp_units_part_opt
		snmp_access_part
		snmp_status_part
		snmp_descr_part_opt
		snmp_refer_part_opt
		snmp_index_part_opt
		snmp_def_val_part_opt	
	{
		object_type = {};
		object_type.syntax = $2;
		if($2) { object_type.units = $3; }
		object_type.access = $4;
		object_type.status = $5;
		if($6) { object_type.descr = $6; }
		if($7) { object_type.refer = $7; }
		if($8) { object_type.index = $8; }
		if($9) { object_type.defval = $9; }
		$$ = object_type;
	}
			
	;

snmp_notification_type_macro_type
	: NOTIFICATION_TYPE
		snmp_objects_part_opt
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
	;

snmp_trap_type_macro_type
	: TRAP_TYPE
		snmp_enterprise_part
		snmp_var_part_opt
		snmp_descr_part_opt
		snmp_refer_part_opt
	;

snmp_textual_convention_macro_type
	: TEXTUAL_CONVENTION
		snmp_display_part_opt
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
		snmp_syntax_part
	;

snmp_object_group_macro_type
	: OBJECT_GROUP
		snmp_objects_part
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
	;

snmp_notification_group_macro_type
	: NOTIFICATION_GROUP
		snmp_notifications_part
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
	;

snmp_module_compliance_macro_type
	: MODULE_COMPLIANCE
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
		snmp_module_part_list
	;

snmp_agent_capabilities_macro_type
	: AGENT_CAPABILITIES
		snmp_product_release_part
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
		snmp_module_support_part_list
	| AGENT_CAPABILITIES
		snmp_product_release_part
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
	;

snmp_update_part
	: LAST_UPDATED QUOTED_STRING
	;

snmp_organization_part
	: ORGANIZATION QUOTED_STRING
	;

snmp_contact_part
	: CONTACT_INFO QUOTED_STRING
	;

snmp_descr_part
	: DESCRIPTION QUOTED_STRING
		{ $$ = $2; }
	;

snmp_descr_part_opt
	:
		{ $$ = false; }
	| DESCRIPTION QUOTED_STRING
		{ $$ = $2; }
	;

snmp_revision_part
	: REVISION value
		DESCRIPTION QUOTED_STRING
	;

snmp_status_part
	: STATUS IDENTIFIER_STRING
		{ $$ = $2; }
	;

snmp_refer_part
	: REFERENCE QUOTED_STRING
		{ $$ = $2; }
	;

snmp_refer_part_opt
	:
		{ $$ = false; }
	| REFERENCE QUOTED_STRING 
		{ $$ = $2; }
	;

snmp_syntax_part
	: SYNTAX type
		{ $$ = $2; }
	;

snmp_syntax_part_opt
	:
		{ $$ = false; }
	| SYNTAX type
		{ $$ = $2; }
	;

snmp_units_part
	: UNITS QUOTED_STRING
		{ $$ = $2; }
	;

snmp_units_part_opt
	:
		{ $$ = false; }
	| UNITS QUOTED_STRING
		{ $$ = $2; }
	;

snmp_access_part
	: ACCESS IDENTIFIER_STRING
		{ $$ = {access_type: 'access', access_level: $2}; }
	| MAX_ACCESS IDENTIFIER_STRING
		{ $$ = {access_type: 'max_access', access_level: $2}; }
	| MIN_ACCESS IDENTIFIER_STRING
		{ $$ = {access_type: 'min_access', access_level: $2}; }
	;

snmp_access_part_opt
	:
		{ $$ = false; }
	| ACCESS IDENTIFIER_STRING
		{ $$ = {access_type: 'access', access_level: $2}; }
	| MAX_ACCESS IDENTIFIER_STRING
		{ $$ = {access_type: 'max_access', access_level: $2}; }
	| MIN_ACCESS IDENTIFIER_STRING
		{ $$ = {access_type: 'min_access', access_level: $2}; }
	;

snmp_index_part
	: INDEX LEFT_BRACE index_value_list RIGHT_BRACE
		{ $$ = {part_type: 'index', value: $3}; }
	| AUGMENTS LEFT_BRACE value RIGHT_BRACE
		{ $$ = {part_type: 'augments', value: $3}; }
	;

snmp_index_part_opt
	:
		{ $$ = false; }
	| INDEX LEFT_BRACE index_value_list RIGHT_BRACE
		{ $$ = {part_type: 'index', value: $3}; }
	| AUGMENTS LEFT_BRACE value RIGHT_BRACE
		{ $$ = {part_type: 'augments', value: $3}; }
	;

index_value_list
	: index_value
		{ $$ = [ $1 ]; }
	| index_value_list COMMA index_value
		{
			$1.push($3);
			$$ = $1;
		}
	;

index_value
	: value
		{ $$ = 'not_implemented'; }
	| IMPLIED value
		{ $$ = 'not_implemented'; }
	| index_type
		{ $$ = $1; }
	;

index_type
	: integer_type
		{ $$ = $1; }
	| string_type
		{ $$ = $1; }
	| object_identifier_type
		{ $$ = $1; }
	;

snmp_def_val_part
	: DEFVAL LEFT_BRACE value RIGHT_BRACE
		{ $$ = $1; }
	;

snmp_def_val_part_opt
	:
		{ $$ = false; }
	| DEFVAL LEFT_BRACE value RIGHT_BRACE
		{ $$ = $1; }
	;

snmp_objects_part
	: OBJECTS LEFT_BRACE value_list RIGHT_BRACE
	;

snmp_objects_part_opt
	:
	| OBJECTS LEFT_BRACE value_list RIGHT_BRACE
	;

value_list
	: value
	| value_list COMMA value
	;

snmp_enterprise_part
	: ENTERPRISE value
	;

snmp_var_part
	: VARIABLES LEFT_BRACE value_list RIGHT_BRACE
	;

snmp_var_part_opt
	:
	| VARIABLES LEFT_BRACE value_list RIGHT_BRACE
	;

snmp_display_part
	: DISPLAY_HINT QUOTED_STRING
	;

snmp_display_part_opt
	:
	| DISPLAY_HINT QUOTED_STRING
	;

snmp_notifications_part
	: NOTIFICATIONS LEFT_BRACE value_list RIGHT_BRACE
	;

snmp_module_part_list
	: snmp_module_part
	| snmp_module_part_list snmp_module_part
	;

snmp_module_part
	: MODULE snmp_module_import_opt	
		snmp_mandatory_part_opt
		snmp_compliance_part_list
	| MODULE snmp_module_import_opt	
		snmp_mandatory_part_opt
	;

snmp_module_import
	: module_identifier
	;

snmp_module_import_opt
	:
	| module_identifier
	;

snmp_mandatory_part
	: MANDATORY_GROUPS LEFT_BRACE value_list RIGHT_BRACE
	;

snmp_mandatory_part_opt
	:
	| MANDATORY_GROUPS LEFT_BRACE value_list RIGHT_BRACE
	;

snmp_compliance_part_list
	: snmp_compliance_part
	| snmp_compliance_part_list snmp_compliance_part
	;

snmp_compliance_part
	: compliance_group
	| compliance_object
	;

compliance_group
	: GROUP value
		snmp_descr_part
	;

compliance_object
	: OBJECT value
		snmp_syntax_part_opt
		snmp_write_syntax_part_opt
		snmp_access_part_opt
		snmp_descr_part
	;

snmp_write_syntax_part_opt
	:
	| WRITE_SYTNAX type
	;

snmp_product_release_part_opt
	:
	| PRODUCT_RELEASE QUOTED_STRING
	;

snmp_module_support_part_list
	: snmp_module_support_part
	| snmp_module_support_part_list snmp_module_support_part
	;

snmp_module_support_part
	: SUPPORTS snmp_module_import
		INCLUDES LEFT_BRACE value_list RIGHT_BRACE
		snmp_variation_part_list
	| SUPPORTS snmp_module_import
		INCLUDES LEFT_BRACE value_list RIGHT_BRACE
	;

snmp_variation_part_list
	: snmp_variation_part
	| snmp_variation_part_list snmp_variation_part
	;

snmp_variation_part
	: VARIATION value
		snmp_syntax_part_opt
		snmp_write_syntax_part_opt
		snmp_access_part_opt
		snmp_creation_part_opt
		snmp_def_val_part_opt
		snmp_descr_part
	;

snmp_creation_part
	: CREATION_REQUIRES LEFT_BRACE value_list RIGHT_BRACE
	;

snmp_creation_part_opt
	:
	| CREATION_REQUIRES LEFT_BRACE value_list RIGHT_BRACE
	;
