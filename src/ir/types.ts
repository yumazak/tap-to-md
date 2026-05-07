export interface CliOptions {
  input?: string;
  output?: string;
  failOnly: boolean;
  strict: boolean;
  maxDiagnostics?: number;
  help: boolean;
  version: boolean;
}

export interface Plan {
  start: number;
  end: number;
}

export interface Diagnostic {
  raw: string;
}

export interface BailOut {
  reason: string;
}

export interface ParserWarning {
  message: string;
}

export interface TestResult {
  id?: number;
  name: string;
  ok: boolean;
  skip?: string | boolean;
  todo?: string | boolean;
  diagnostics: Diagnostic[];
  comments: string[];
  children: TestResult[];
}

export interface TapDocument {
  version?: number;
  plan?: Plan;
  tests: TestResult[];
  comments: string[];
  bailout?: BailOut;
  warnings: ParserWarning[];
  raw: string;
}

export interface Summary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  todo: number;
  bailout: boolean;
  warnings: number;
}
