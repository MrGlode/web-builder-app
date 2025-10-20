// src/app/features/api-orchestrator/models/block-definitions.ts

import { BlockDefinition } from './orchestrator.model';

/**
 * Catalogue des blocs disponibles
 */
export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  // 1. BLOC API CALL - Appelle une API externe
  {
    id: 'api-call',
    type: 'api-call',
    name: 'API Call',
    description: 'Appelle une API externe et récupère les données',
    icon: 'globe',
    color: '#3B82F6',
    inputs: [
      {
        id: 'url',
        name: 'URL',
        type: 'input',
        dataType: 'string',
        required: true,
        description: 'URL de l\'API'
      },
      {
        id: 'method',
        name: 'Method',
        type: 'input',
        dataType: 'string',
        required: true,
        description: 'GET, POST, PUT, DELETE'
      },
      {
        id: 'headers',
        name: 'Headers',
        type: 'input',
        dataType: 'object',
        description: 'En-têtes HTTP personnalisés'
      },
      {
        id: 'body',
        name: 'Body',
        type: 'input',
        dataType: 'object',
        description: 'Corps de la requête'
      }
    ],
    outputs: [
      {
        id: 'response',
        name: 'Response',
        type: 'output',
        dataType: 'object',
        description: 'Réponse de l\'API'
      },
      {
        id: 'status',
        name: 'Status Code',
        type: 'output',
        dataType: 'number',
        description: 'Code HTTP de la réponse'
      }
    ]
  },

  // 2. BLOC CONDITION - Branchement conditionnel
  {
    id: 'condition',
    type: 'condition',
    name: 'Condition',
    description: 'Exécute différents chemins selon une condition',
    icon: 'git-branch',
    color: '#F59E0B',
    inputs: [
      {
        id: 'condition',
        name: 'Condition',
        type: 'input',
        dataType: 'boolean',
        required: true,
        description: 'Condition à évaluer'
      }
    ],
    outputs: [
      {
        id: 'true-path',
        name: 'Si Vrai',
        type: 'output',
        dataType: 'object',
        description: 'Exécuté si condition vraie'
      },
      {
        id: 'false-path',
        name: 'Si Faux',
        type: 'output',
        dataType: 'object',
        description: 'Exécuté si condition fausse'
      }
    ]
  },

  // 3. BLOC TRANSFORM - Transforme les données
  {
    id: 'transform',
    type: 'transform',
    name: 'Transform Data',
    description: 'Transforme, mappe ou filtre les données',
    icon: 'shuffle',
    color: '#10B981',
    inputs: [
      {
        id: 'input-data',
        name: 'Input Data',
        type: 'input',
        dataType: 'object',
        required: true,
        description: 'Données à transformer'
      },
      {
        id: 'transformation',
        name: 'Transformation',
        type: 'input',
        dataType: 'object',
        required: true,
        description: 'Règles de transformation (format JSONPath)'
      }
    ],
    outputs: [
      {
        id: 'output-data',
        name: 'Output Data',
        type: 'output',
        dataType: 'object',
        description: 'Données transformées'
      }
    ]
  },

  // 4. BLOC TRIGGER - Déclenche l'orchestration
  {
    id: 'trigger',
    type: 'trigger',
    name: 'Trigger',
    description: 'Point de départ de l\'orchestration',
    icon: 'play-circle',
    color: '#8B5CF6',
    inputs: [],
    outputs: [
      {
        id: 'trigger-data',
        name: 'Trigger Data',
        type: 'output',
        dataType: 'object',
        description: 'Données du trigger'
      }
    ]
  },

  // 5. BLOC LOOP - Boucle sur les données
  {
    id: 'loop',
    type: 'loop',
    name: 'Loop',
    description: 'Itère sur un tableau et exécute un sous-processus',
    icon: 'repeat',
    color: '#EC4899',
    inputs: [
      {
        id: 'array',
        name: 'Array',
        type: 'input',
        dataType: 'array',
        required: true,
        description: 'Tableau à parcourir'
      }
    ],
    outputs: [
      {
        id: 'item',
        name: 'Item',
        type: 'output',
        dataType: 'object',
        description: 'Élément courant de la boucle'
      },
      {
        id: 'results',
        name: 'Results',
        type: 'output',
        dataType: 'array',
        description: 'Résultats de la boucle'
      }
    ]
  }
];

/**
 * Retourne la définition d'un bloc par son ID
 */
export function getBlockDefinition(definitionId: string): BlockDefinition | undefined {
  return BLOCK_DEFINITIONS.find(def => def.id === definitionId);
}