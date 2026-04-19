export interface GrammarTopic {
  id: string;
  title: string;
  description: string;
}

export interface GrammarStep {
  id: string;
  title: string;
  objective: string;
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
}

export interface GrammarPlayerState {
  isPlaying: boolean;
  currentStep: number;
  speed: number;
}