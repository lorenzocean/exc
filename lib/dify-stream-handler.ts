/**
 * Dify Stream Handler
 *
 * Handles server-sent events (SSE) from Dify API and converts them
 * into a format compatible with the existing chat system.
 */

export interface DifyStreamEvent {
  event: string;
  [key: string]: any;
}

export class DifyStreamHandler {
  private buffer: string = '';
  private onEvent?: (event: DifyStreamEvent) => void;

  constructor(onEvent?: (event: DifyStreamEvent) => void) {
    this.onEvent = onEvent;
  }

  /**
   * Process incoming data chunk from Dify SSE stream
   */
  processChunk(chunk: string): DifyStreamEvent[] {
    this.buffer += chunk;
    const events: DifyStreamEvent[] = [];

    // Split by double newline (SSE event separator)
    const lines = this.buffer.split('\n\n');

    // Keep the last incomplete line in buffer
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim().startsWith('data:')) {
        try {
          const jsonStr = line.replace(/^data:\s*/, '').trim();
          if (jsonStr) {
            const event = JSON.parse(jsonStr) as DifyStreamEvent;
            events.push(event);

            if (this.onEvent) {
              this.onEvent(event);
            }
          }
        } catch (error) {
          console.error('Failed to parse Dify event:', error, line);
        }
      }
    }

    return events;
  }

  /**
   * Convert Dify events to chat message parts
   */
  static eventToMessagePart(event: DifyStreamEvent): any {
    switch (event.event) {
      case 'workflow_started':
        return {
          type: 'dify-workflow',
          subtype: 'started',
          data: event,
        };

      case 'workflow_finished':
        return {
          type: 'dify-workflow',
          subtype: 'finished',
          data: event,
        };

      case 'node_started':
        return {
          type: 'dify-node',
          subtype: 'started',
          data: event,
        };

      case 'node_finished':
        return {
          type: 'dify-node',
          subtype: 'finished',
          data: event,
        };

      case 'message':
        // Text streaming chunk
        return {
          type: 'text-delta',
          textDelta: event.answer || '',
        };

      case 'message_end':
        return {
          type: 'dify-message-end',
          data: event,
        };

      case 'message_file':
        return {
          type: 'dify-file',
          data: event,
        };

      case 'tts_message':
        return {
          type: 'dify-tts',
          data: {
            audio: event.audio,
            message_id: event.message_id,
          },
        };

      case 'tts_message_end':
        return {
          type: 'dify-tts-end',
          data: event,
        };

      case 'message_replace':
        return {
          type: 'dify-message-replace',
          data: event,
        };

      case 'error':
        return {
          type: 'error',
          error: event.message || 'Unknown error',
          code: event.code,
        };

      case 'ping':
        // Heartbeat event, no action needed
        return null;

      default:
        console.warn('Unknown Dify event type:', event.event);
        return null;
    }
  }

  /**
   * Build tool information from workflow nodes
   */
  static extractToolsFromWorkflow(events: DifyStreamEvent[]): string[] {
    const tools = new Set<string>();

    for (const event of events) {
      if (event.event === 'node_finished' && event.data?.node_type === 'tool') {
        tools.add(event.data.title);
      }
    }

    return Array.from(tools);
  }

  /**
   * Calculate overall progress from workflow events
   */
  static calculateProgress(events: DifyStreamEvent[]): number {
    const workflowEvent = events.find(e => e.event === 'workflow_started');
    if (!workflowEvent) return 0;

    const totalSteps = workflowEvent.data?.total_steps || 0;
    if (totalSteps === 0) return 0;

    const completedNodes = events.filter(
      e => e.event === 'node_finished' && e.data?.status === 'succeeded'
    ).length;

    return Math.min(100, (completedNodes / totalSteps) * 100);
  }

  /**
   * Get workflow status summary
   */
  static getWorkflowStatus(events: DifyStreamEvent[]): {
    status: 'idle' | 'running' | 'succeeded' | 'failed';
    currentStep?: string;
    progress: number;
  } {
    const workflowFinished = events.find(e => e.event === 'workflow_finished');

    if (workflowFinished) {
      return {
        status: workflowFinished.data?.status || 'succeeded',
        progress: 100,
      };
    }

    const workflowStarted = events.find(e => e.event === 'workflow_started');
    if (!workflowStarted) {
      return { status: 'idle', progress: 0 };
    }

    const runningNode = events
      .slice()
      .reverse()
      .find(e => e.event === 'node_started' && !events.some(
        f => f.event === 'node_finished' && f.data?.node_id === e.data?.node_id
      ));

    return {
      status: 'running',
      currentStep: runningNode?.data?.title,
      progress: DifyStreamHandler.calculateProgress(events),
    };
  }

  /**
   * Format retriever resources (citations) from metadata
   */
  static formatRetrieverResources(metadata: any): any[] {
    if (!metadata?.retriever_resources) return [];

    return metadata.retriever_resources.map((resource: any) => ({
      position: resource.position,
      datasetId: resource.dataset_id,
      datasetName: resource.dataset_name,
      documentId: resource.document_id,
      documentName: resource.document_name,
      segmentId: resource.segment_id,
      score: resource.score,
      content: resource.content,
    }));
  }
}

/**
 * Convert Dify conversation history to standard format
 */
export function convertDifyMessagesToStandard(difyMessages: any[]): any[] {
  return difyMessages.map(msg => ({
    id: msg.id || msg.message_id,
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.query || msg.answer || msg.content,
    createdAt: new Date(msg.created_at * 1000),
    metadata: {
      conversation_id: msg.conversation_id,
      feedback: msg.feedback,
      retriever_resources: msg.retriever_resources,
    },
  }));
}

/**
 * Build Dify API request payload
 */
export function buildDifyRequestPayload(options: {
  query: string;
  user: string;
  conversationId?: string;
  files?: Array<{
    type: string;
    transfer_method: 'remote_url' | 'local_file';
    url?: string;
    upload_file_id?: string;
  }>;
  inputs?: Record<string, any>;
}): any {
  return {
    query: options.query,
    user: options.user,
    response_mode: 'streaming',
    conversation_id: options.conversationId || '',
    files: options.files || [],
    inputs: options.inputs || {},
    auto_generate_name: true,
  };
}
