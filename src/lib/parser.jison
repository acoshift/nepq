%lex

%x string

%%
<<EOF>>                                 return 'eof';
\s+                                     ;
\.\.\.                                  return '...';
\.                                      return '.';
\+                                      return '+';
\-                                      return '-';
\*                                      return '*';
\,                                      return ',';
\:                                      return ':';
\(                                      return '(';
\)                                      return ')';
\{                                      return '{';
\}                                      return '}';
\[                                      return '[';
\]                                      return ']';
[eE][+-]                                return 'e';
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
[a-zA-Z_$][a-zA-Z0-9_$]*                return 'id';
/lex

%start nepq

%{
  var retMethod = 1;
%}

%%

nepq
  : id nameOrEmpty parametersOrEmpty retsOrEmpty eof
    {
      $$ = {
        method: $1,
        name: $2,
        params: $3,
        retrieves: $4,
        $_: retMethod
      };
      return $$;
    }
  | parameters eof
    {
      $$ = {
        method: '',
        name: '',
        params: $1,
        retrieves: 1,
        $_: retMethod
      };
      return $$;
    }
  | rets eof
    {
      $$ = {
        method: '',
        name: '',
        params: [],
        retrieves: $1,
        $_: retMethod
      };
      return $$;
    }
  | parameters rets eof
    {
      $$ = {
        method: '',
        name: '',
        params: $1,
        retrieves: $2,
        $_: retMethod
      };
      return $$;
    }
  | eof
    {
      $$ = {
        method: '',
        name: '',
        params: [],
        retrieves: 1,
        $_: retMethod
      };
      return $$;
    }
  ;

nameOrEmpty
  :
    { $$ = ''; }
  | name
  ;

name
  : id
  | name '.' id
    { $$ = $1 + $2 + $3; }
  ;

retsOrEmpty
  :
    { $$ = 1; }
  | rets
  ;

rets
  : rets1
    { $$ = $1; retMethod = 1; }
  | '+' rets1
   { $$ = $2; retMethod = 1; }
  | '-' rets0
   { $$ = $2; retMethod = 0; }
  | '*' retsp
   { $$ = $2; retMethod = null; }
  ;

rets1
  : '{' '}'
    { $$ = 0; }
  | '{' ret1 '}'
    { $$ = $2; }
  ;

rets0
  : '{' '}'
    { $$ = 1; }
  | '{' ret0 '}'
    { $$ = $2; }
  ;

retsp
  : '{' '}'
    { $$ = 1; }
  | '{' retp '}'
    { $$ = $2; }
  ;

ret1
  : retv1
  | retv1 ',' ret1
    { $$ = Object.assign($1, $3); }
  ;

ret0
  : retv0
  | retv0 ',' ret0
    { $$ = Object.assign($1, $3); }
  ;

retp
  : retvp
  | retvp ',' retp
    { $$ = Object.assign($1, $3); }
  ;

retv1
  : name parametersOrUndefined
    {
      $$ = {};
      $$[$1] = 1;
      if (typeof $2 !== 'undefined') $$[$1 + '.$'] = $2;
    }
  | name parametersOrUndefined rets1
    {
      $$ = {};
      $$[$1] = $3;
      if (typeof $2 !== 'undefined') $$[$1 + '.$'] = $2;
    }
  | pretv
  ;

retv0
  : name parametersOrUndefined
    {
      $$ = {};
      $$[$1] = 0;
      if (typeof $2 !== 'undefined') $$[$1 + '.$'] = $2;
    }
  | name parametersOrUndefined rets0
    {
      $$ = {};
      $$[$1] = $3;
      if (typeof $2 !== 'undefined') $$[$1 + '.$'] = $2;
    }
  | pretv
  ;

retvp
  : name parametersOrUndefined
    {
      $$ = {};
      if (typeof $2 !== 'undefined') $$[$1 + '.$'] = $2;
    }
  | name parametersOrUndefined retsp
    {
      $$ = {};
      if ($3 !== 1) $$[$1] = $3;
      if (typeof $2 !== 'undefined') $$[$1 + '.$'] = $2;
    }
  | pretv
  ;

pretv
  : name parametersOrUndefined '+' rets1
    {
      $$ = {};
      $$[$1] = $4;
      if (typeof $2 !== 'undefined') $$[$1 + '.$'] = $2;
      $$[$1 + '.$_'] = 1;
    }
  | name parametersOrUndefined '-' rets0
    {
      $$ = {};
      $$[$1] = $4;
      if (typeof $2 !== 'undefined')
      $$[$1 + '.$'] = $2;
      $$[$1 + '.$_'] = 0;
    }
  | name parametersOrUndefined '*' retsp
    {
      $$ = {};
      if ($4 !== 1) $$[$1] = $4;
      if (typeof $2 !== 'undefined') $$[$1 + '.$'] = $2;
      $$[$1 + '.$_'] = null;
    }
  ;

parametersOrEmpty
  :
    { $$ = []; }
  | parameters
  ;

parametersOrUndefined
  :
    { $$ = undefined; }
  | parameters
  ;


parameters
  : '(' ')'
    { $$ = []; }
  | '(' params ')'
    { $$ = [$2]; }
  | '(' anparams ')'
    { $$ = $2; }
  | '(' '...' anparams ')'
    { $$ = $3[0]; }
  ;

anparams
  : value
    { $$ = [ $1 ]; }
  | value ',' anparams
    { $$ = $3; $$.unshift($1); }
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
  | id ':' value
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
  | digit digits
    { $$ = $1 + $2; }
  | digit1_9 digits
    { $$ = $1 + $2; }
  ;
