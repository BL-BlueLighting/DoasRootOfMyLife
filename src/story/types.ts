// doas story DSL — AST types

export interface StoryFile {
  conditions: ConditionDef[];
  dirs: DirDef[];
  restricted: RestrictedDef[];
  files: FileDef[];
  commands: CommandDef[];
  manAIs: ManAIDef[];
  webTries: WebTryDef[];
  triggers: TriggerDef[];
  scripts: ScriptDef[];
}

// ---- Condition / Flag ----
export interface ConditionDef {
  name: string;
  default: boolean | number | string;
}

// ---- Directory ----
export interface DirDef {
  path: string;
}

// ---- Restricted Directory ----
export interface RestrictedDef {
  path: string;
}

// ---- File ----
export interface FileDef {
  path: string;
  require: RequireEntry[];
  onRead: Action[];
  content: string;
}

// ---- Command ----
export interface CommandDef {
  name: string;
  require: RequireEntry[];
  params: string[];
  steps: CommandStep[];
}

export interface CommandStep {
  at?: number;          // exact storyWhere match
  atMin?: number;
  atMax?: number;
  when?: string;        // condition expression e.g. "$1 == 'hq'"
  echo: string[];       // lines to echo
  actions: Action[];    // /sw, /cond, etc.
  ask?: AskDef;         // - ask block
}

// ---- manAI Dialogue ----
export interface ManAIDef {
  require: RequireEntry[];
  steps: ManAIStep[];
}

export interface ManAIStep {
  at?: number;
  atMin?: number;
  atMax?: number;
  echo: string[];
  actions: Action[];
}

// ---- WebTry ----
export interface WebTryDef {
  name: string;
  filepath: string;
}

// ---- Trigger ----
export interface TriggerDef {
  name: string;
  require: RequireEntry[];
  actions: Action[];
  echo: string[];
}

// ---- Script (complex logic hook) ----
export interface ScriptDef {
  name: string;
  type: string;
  config: Record<string, string>;
}

// ---- Ask ----
export interface AskDef {
  prompt: string;
  on: AskHandler[];
}

export interface AskHandler {
  match?: string;       // specific match
  empty?: boolean;      // match empty response
  default?: boolean;    // default handler
  echo: string[];
  actions: Action[];
}

// ---- Actions ----
export type Action =
  | { kind: 'sw'; value: number | 'next' | 'back' }
  | { kind: 'cond'; name: string; value: string | number | boolean }
  | { kind: 'trig'; name: string }
  | { kind: 'wt'; action: 'go' | 'exit'; name?: string }
  | { kind: 'capture'; ip: string; sender: string; more: string }
  | { kind: 'clear' }
  | { kind: 'exit' }
  | { kind: 'achieve'; name: string; level: string }
  | { kind: 'panel'; action: 'show' | 'hide' }
  | { kind: 'status'; ip: string; ports: string; mem: string; extra: string }
  | { kind: 'help'; text: string }
  | { kind: 'wait'; ms: number }
  | { kind: 'cmdAdd'; name: string; steps: CommandStep[] }
  | { kind: 'ask'; prompt: string; handlers: AskHandler[] };

// ---- Require (condition for visibility) ----
export interface RequireEntry {
  type: 'storyWhere' | 'condition';
  op?: '>=' | '<=' | '==' | '!=' | '>' | '<';
  value?: number;
  name?: string;   // for condition type
}
