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
[1-9]                                   return 'digit1_9';
[0-9]                                   return 'digit';
\"                                      { this.begin('string'); yystr = ''; }
<string>\\u[0-9a-fA-F]{4}               { yystr += String.fromCharCode(parseInt('0x' + yytext.substr(-4))); }
<string>\\\"                            yystr += '\"';
<string>\\\\                            yystr += '\\';
<string>\\b                             yystr += '\b';
<string>\\f                             yystr += '\f';
<string>\\n                             yystr += '\n';
<string>\\r                             yystr += '\r';
<string>\\t                             yystr += '\t';
<string>\\\/                            yystr += '\/';
<string>[^\"\\]+                        yystr += yytext;
<string>\"                              { this.popState(); yytext = yystr; return 'string'; }
[a-zA-Z_][a-zA-Z0-9_]*                  return 'id';
/lex

%start nepq

%%

nepq
  : id name parameters rets eof
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