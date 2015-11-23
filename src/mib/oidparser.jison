%lex

%%
"::"                    {return 'DOUBLE_COLON';}
"."                     {return 'DOT';}
[A-Z-]+                 {return 'MODULE_IDENTIFIER';}
[0-9]+                  {return 'DIGIT_STRING';}
[a-z][a-zA-Z0-9-_]*     {return 'IDENTIFIER';}

/lex

%start oid_string

%%

oid_string
    : MODULE_IDENTIFIER DOUBLE_COLON IDENTIFIER
        {
            $$ = {
                class: 'module_id_with_object_name',
                module_name: $1,
                object_name: $3
            };
        }
    | MODULE_IDENTIFIER DOUBLE_COLON IDENTIFIER DOT numeric_identifier_list
        {
            $$ = {
                class: 'module_id_with_object_name_and_identifier_list',
                module_name: $1,
                object_name: $3,
                identifier_list: $5
            };
        }
    | DOT numeric_identifier_list
        {
            $$ = {
                class: 'identifier_list_only',
                identifier_list: $2
            };
        }
    | numeric_identifier_list
        {
            $$ = {
                class: 'identifier_list_only',
                identifier_list: $1
            };
        }
    | DOT string_identifier_list
        {
            $$ = {
                class: 'string_identifier_list_only',
                string_identifier_list: $2
            };
        }
    | string_identifier_list
        {
            $$ = {
                class: 'string_identifier_list_only',
                string_identifier_list: $1
            };
        }
    ;

numeric_identifier_list
    : DIGIT_STRING
        { $$ = [ $1 ]; }
    | numeric_identifier_list DOT DIGIT_STRING
        { $1.push($3); $$ = $1; }
    ;

string_identifier_list
    : IDENTIFIER
        { $$ = [ $1 ]; }
    | string_identifier_list DOT IDENTIFIER
        { $1.push($3); $$ = $1; }
    ;