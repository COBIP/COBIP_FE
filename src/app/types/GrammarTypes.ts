export interface GrammarTopic {
  id: string;
  title: string;
  description: string;
}

export interface GrammarStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  code: string;
  objective?: string;
  variables: VariableState[];
  visualization: VisualizationData;
}

export interface VariableState {
  name: string;
  value: string | number | boolean;
  type: string;
}

export interface VisualizationData {
  variables: VariableState[];
  currentLine: number;
  output: string[];
  arrayData?: number[];
}

export interface GrammarLevel {
  id: string;
  title: string;
  description: string;
  steps: GrammarStep[];
}

export interface GrammarPlayerState {
  isPlaying: boolean;
  currentStep: number;
  speed: number;
}