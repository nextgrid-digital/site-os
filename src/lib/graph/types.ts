import { z } from 'zod';

export const graphEntityTypeSchema = z.enum([
  'page',
  'icp',
  'offer',
  'product',
  'use_case',
  'claim',
  'proof',
  'cta',
  'query',
  'competitor',
  'topic',
]);

export const graphEntityStatusSchema = z.enum(['found', 'missing', 'inferred']);

export const graphRelationshipTypeSchema = z.enum([
  'targets',
  'supports',
  'proves',
  'links_to',
  'answers',
  'converts_to',
  'references',
  'missing',
]);

export const graphWorkOrderActionSchema = z.enum([
  'create_node',
  'connect_node',
  'rewrite_node',
  'add_proof',
  'add_cta',
  'add_faq_schema',
  'create_page_system',
]);

export type GraphEntityType = z.infer<typeof graphEntityTypeSchema>;
export type GraphEntityStatus = z.infer<typeof graphEntityStatusSchema>;
export type GraphRelationshipType = z.infer<typeof graphRelationshipTypeSchema>;
export type GraphWorkOrderAction = z.infer<typeof graphWorkOrderActionSchema>;

/** In-memory entity before DB insert (stable local id for edge wiring). */
export interface DraftGraphEntity {
  localId: string;
  type: GraphEntityType;
  label: string;
  source: string;
  confidence: number;
  metadata: Record<string, unknown>;
  status: GraphEntityStatus;
}

export interface DraftGraphRelationship {
  fromLocalId: string;
  toLocalId: string;
  type: GraphRelationshipType;
  confidence: number;
  evidence: Record<string, unknown>;
  source: string;
}

export interface DraftGraphGap {
  gap: string;
  gapType: string;
  impact: string;
  fix: string;
  confidence: number;
  entityLocalIds: string[];
  revenueImpact: number;
  buyerImportance: number;
  urgency: number;
  executionDifficulty: number;
  aeoValue: number;
  programmaticPotential: number;
  priorityScore: number;
}

export interface DraftBuyerPath {
  queryLabel: string | null;
  buyerMoment: string | null;
  pageLabel: string | null;
  offerLabel: string | null;
  proofLabel: string | null;
  ctaLabel: string | null;
  missingSteps: string[];
  completeness: number;
  priorityScore: number;
  metadata: Record<string, unknown>;
}

export type ProgrammaticPatternFamily =
  | 'curation'
  | 'comparisons'
  | 'use_case'
  | 'integrations'
  | 'templates'
  | 'converters'
  | 'examples'
  | 'directories'
  | 'glossary'
  | 'localization'
  | 'locations'
  | 'profiles';

export interface ProgrammaticUniqueData {
  whatMakesUnique: string;
  realDataNeeded: string;
  proofNeeded: string;
  doNotTemplate: string;
}

export interface ProgrammaticAeoFlags {
  improvesAnswerability: boolean;
  improvesEntityClarity: boolean;
  improvesCitationReadiness: boolean;
  improvesAiOverview: boolean;
}

export interface DraftProgrammaticOpportunity {
  patternName: string;
  patternFamily: ProgrammaticPatternFamily;
  whyFits: string;
  exampleTemplate: string;
  firstRecommendedPages: string[];
  /** Flattened unique-data summary for legacy table column / quick display. */
  uniqueDataNeeded: string;
  uniqueData: ProgrammaticUniqueData;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  expectedBenefit: string;
  agentPrompt: string;
  priorityScore: number;
  searchDemand: number;
  buyerIntent: number;
  aiCitationValue: number;
  easeOfProduction: number;
  uniquenessRequirement: number;
  revenueImpact: number;
  thinContentRisk: number;
  linkedGapTypes: string[];
  linkedEntityLabels: string[];
  buyerPathSummary: string;
  aeoFlags: ProgrammaticAeoFlags;
  strategySummary: string;
  risksIfBad: string;
}

export interface DraftGraphWorkOrder {
  actionType: GraphWorkOrderAction;
  title: string;
  summary: string;
  gapIndex: number | null;
  opportunityIndex: number | null;
  fullPrompt: string;
  revenueImpact: number;
  buyerImportance: number;
  urgency: number;
  executionDifficulty: number;
  confidence: number;
  aeoValue: number;
  programmaticPotential: number;
  priorityScore: number;
}

export interface GraphScores {
  completenessScore: number;
  entityCompleteness: number;
  relationshipCompleteness: number;
  proofDensity: number;
  buyerPathCoverage: number;
  searchCoverage: number;
  ctaCoverage: number;
  aeoClarity: number;
  programmaticReadiness: number;
  missingNodeCount: number;
  disconnectedClaimCount: number;
  queryPageMatchRate: number;
  programmaticOpportunityCount: number;
}

export interface CommercialGraphArtifact {
  entities: DraftGraphEntity[];
  relationships: DraftGraphRelationship[];
  gaps: DraftGraphGap[];
  buyerPaths: DraftBuyerPath[];
  opportunities: DraftProgrammaticOpportunity[];
  workOrders: DraftGraphWorkOrder[];
  scores: GraphScores;
  relationshipHealth: {
    claimsWithoutProof: string[];
    useCasesWithoutPage: string[];
    icpsWithoutPage: string[];
    queriesWithoutAnswer: string[];
    ctasDisconnected: string[];
    offersWithoutPage: string[];
    pagesWithTrafficWeakProof: string[];
    pagesThatShouldLink: string[];
  };
  executiveMemo: {
    whatTheSiteIsSaying: string;
    whatSearchConsoleIsSaying: string;
    whatGa4IsSaying: string;
    whatAiIsInferring: string;
    whatTheGraphShows: string;
    whatMattersMost: string;
    whatToFixFirst: string;
    whatPageSystemsToBuild: string;
    whatNextgridShouldExecute: string;
  };
}

export interface CommercialGraphBriefSlice {
  scores: GraphScores;
  topGaps: Array<{
    gap: string;
    gapType: string;
    impact: string;
    fix: string;
    confidence: number;
    priorityScore: number;
  }>;
  topPaths: DraftBuyerPath[];
  topOpportunities: Array<{
    patternName: string;
    patternFamily: ProgrammaticPatternFamily;
    whyFits: string;
    exampleTemplate: string;
    firstRecommendedPages: string[];
    uniqueDataNeeded: string;
    uniqueData: ProgrammaticUniqueData;
    priority: 'low' | 'medium' | 'high';
    confidence: number;
    expectedBenefit: string;
    agentPrompt: string;
    priorityScore: number;
    searchDemand: number;
    buyerIntent: number;
    aiCitationValue: number;
    easeOfProduction: number;
    uniquenessRequirement: number;
    revenueImpact: number;
    thinContentRisk: number;
    linkedGapTypes: string[];
    linkedEntityLabels: string[];
    buyerPathSummary: string;
    aeoFlags: ProgrammaticAeoFlags;
    strategySummary: string;
    risksIfBad: string;
  }>;
  topWorkOrders: Array<{
    actionType: GraphWorkOrderAction;
    title: string;
    summary: string;
    fullPrompt: string;
    priorityScore: number;
  }>;
  entitiesByType: Record<string, Array<{ label: string; status: GraphEntityStatus; confidence: number }>>;
  relationships: Array<{
    from: string;
    to: string;
    type: GraphRelationshipType;
    statusHint: string;
  }>;
  relationshipHealth: CommercialGraphArtifact['relationshipHealth'];
  executiveMemo: CommercialGraphArtifact['executiveMemo'];
}
