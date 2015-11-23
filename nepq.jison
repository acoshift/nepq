%lex

%%
\s+                                     ;
[0-9]+("."[0-9]+)?\b                    return 'NUMBER';

["]                                     this.begin('STRING');

true                                    return 'true';
false                                   return 'false';

null                                    return 'null';

create                                  return 'create';
read                                    return 'read';
update                                  return 'update';
delete                                  return 'delete';

"("                                     return '(';
")"                                     return ')';
"{"                                     return '{';
"}"                                     return '}';
":"                                     return ':';
","                                     return ',';
"."                                     return '.';

([a-z]|[A-Z]|_)+([a-z]|[A-Z]|[0-9]|_)*  return 'id';

<<EOF>>                                 return 'EOF';

/lex

%start nepq

%%

nepq
  : crud name params EOF
    {
      $$ = {
        method: $1,
        database: $2.database,
        collection: $2.collection,
        param: $3
      }
      console.log($$);
      return $$;
    }
  ;

crud
  : create
  | read
  | update
  | delete
  ;

name
  : id
    { $$ = { database: null, collection: $1 }; }
  | id '.' id
    { $$ = { database: $1, collection: $3 }; }
  ;

bool
  : true
    { $$ = Boolean(yytext); }
  | false
    { $$ = Boolean(yytext); }
  ;

st
  : STRING
  | NUMBER
    { $$ = Number(yytext); }
  | bool
  ;

param
  : id ':' st
    { $$ = { }; $$[$1] = $3; }
  | param ',' id ':' st
    { $$ = $1; $$[$3] = $5; }
  ;

params
  :
    { $$ = null; }
  | '(' ')'
    { $$ = { }; }
  | '(' json ')'
    { $$ = $2; }
  | '(' param ')'
    { $$ = $2; }
  ;

json
  : '{' '}'
  ;
