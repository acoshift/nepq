%lex

%x string

%%
<<EOF>>                                 return 'eof';
\s+                                     ;
\.                                      return '.';
\-                                      return '-';
\,                                      return ',';
\:                                      return ':';
\(                                      return '(';
\)                                      return ')';
\{                                      return '{';
\}                                      return '}';
\[                                      return '[';
\]                                      return ']';
([eE][+-]?)                             return 'e';
true                                    return 'true';
false                                   return 'false';
null                                    return 'null';
create                                  return 'create';
read                                    return 'read';
update                                  return 'update';
delete                                  return 'delete';
[1-9]                                   return 'digit1_9';
[0-9]                                   return 'digit';
\"                                      this.begin('string');
<string>\"                              this.popState();
<string>
([^\"\\]|
(\\[\"\\\/bfnrt])|
(\\u[0-9a-fA-F]{4}))*                   return 'string';
[a-zA-Z_][a-zA-Z0-9_]*                  return 'id';
/lex

%start nepq

%%

nepq
  : crud name parameters rets eof
    {
      $$ = {
        method: $1,
        namespace: $2.namespace,
        name: $2.name,
        param: $3,
        retrieve: $4
      }
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
    { $$ = { namespace: null, name: $1 }; }
  | namespace id
    { $$ = { namespace: $1, name: $2 }; }
  ;

namespace
  : id '.'
    { $$ = [ $1 ]; }
  | namespace id '.'
    { $$ = $1; $$.push($2); }
  ;

rets
  :
    { $$ = null; }
  | '{' '}'
    { $$ = {}; }
  | '{' ret '}'
    { $$ = $2; }
  ;

ret
  : retv
  | retv ',' ret
    { $$ = Object.assign($1, $3); }
  ;

retv
  : id
    { $$ = {}; $$[$1] = 1; }
  | id ':' rets
    { $$ = {}; $$[$1] = $3; }
  ;

parameters
  : '(' ')'
    { $$ = {}; }
  | '(' params ')'
    { $$ = $2; }
  | '(' object ')'
    { $$ = $2; }
  ;

object
  : '{' '}'
    { $$ = {}; }
  | '{' members '}'
    { $$ = $2; }
  ;

params
  : param
  | param ',' params
    { $$ = Object.assign($1, $3); }
  ;

param
  : id ':' value
    { $$ = {}; $$[$1] = $3; }
  ;

members
  : pair
  | pair ',' members
    { $$ = Object.assign($1, $3); }
  ;

pair
  : string ':' value
    { $$ = {}; $$[$1] = $3; }
  ;

array
  : '[' ']'
    { $$ = []; }
  | '[' elements ']'
    { $$ = $2; }
  ;

elements
  : value
    { $$ = [ $1 ]; }
  | value ',' elements
    { $$ = $3; $$.unshift($1); }
  ;

value
  : string
  | number
    { $$ = Number($1); }
  | object
  | array
  | true
    { $$ = true; }
  | false
    { $$ = false; }
  | null
    { $$ = null; }
  ;

number
  : int
  | int frac
    { $$ = $1 + $2; }
  | int exp
    { $$ = $1 + $2; }
  | int frac exp
    { $$ = $1 + $2 + $3; }
  ;

int
  : digit
  | digit1_9
  | digit1_9 digits
    { $$ = $1 + $2; }
  | '-' digit
    { $$ = $1 + $2; }
  | '-' digit1_9
    { $$ = $1 + $2; }
  | '-' digit1_9 digits
    { $$ = $1 + $2 + $3; }
  ;

frac
  : '.' digits
    { $$ = $1 + $2; }
  ;

exp
  : e digits
    { $$ = $1 + $2; }
  ;

digits
  : digit
  | digit1_9
  | digit1_9 digits
    { $$ = $1 + $2; }
  ;
