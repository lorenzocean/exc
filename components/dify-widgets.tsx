'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Circle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Workflow,
  Box,
  Tool,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for Dify events
export interface DifyWorkflowEvent {
  event: 'workflow_started' | 'workflow_finished';
  task_id: string;
  workflow_run_id: string;
  data: {
    id: string;
    workflow_id: string;
    status?: 'running' | 'succeeded' | 'failed' | 'stopped';
    outputs?: any;
    error?: string;
    elapsed_time?: number;
    total_tokens?: number;
    total_steps?: number;
    created_at: number;
    finished_at?: number;
  };
}

export interface DifyNodeEvent {
  event: 'node_started' | 'node_finished';
  task_id: string;
  workflow_run_id: string;
  data: {
    id: string;
    node_id: string;
    node_type: string;
    title: string;
    index: number;
    inputs?: any;
    outputs?: any;
    status?: 'running' | 'succeeded' | 'failed' | 'stopped';
    error?: string;
    elapsed_time?: number;
    execution_metadata?: {
      total_tokens?: number;
      total_price?: string;
      currency?: string;
    };
    created_at: number;
  };
}

export interface DifyMessageFileEvent {
  event: 'message_file';
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  belongs_to: 'user' | 'assistant';
  conversation_id: string;
}

// Workflow Widget
export const DifyWorkflowWidget: React.FC<{ event: DifyWorkflowEvent }> = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isStarted = event.event === 'workflow_started';
  const isFinished = event.event === 'workflow_finished';

  const statusIcon = {
    running: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
    succeeded: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    failed: <XCircle className="w-4 h-4 text-red-500" />,
    stopped: <Circle className="w-4 h-4 text-gray-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-2"
    >
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-primary" />
              <CardTitle className="text-sm font-medium">
                {isStarted ? 'Workflow Started' : 'Workflow Completed'}
              </CardTitle>
              {event.data.status && statusIcon[event.data.status]}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {event.data.total_steps && (
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span className="text-muted-foreground">Steps:</span>
                      <span className="font-mono">{event.data.total_steps}</span>
                    </div>
                  )}
                  {event.data.elapsed_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-mono">{event.data.elapsed_time.toFixed(2)}s</span>
                    </div>
                  )}
                  {event.data.total_tokens && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Tokens:</span>
                      <span className="font-mono">{event.data.total_tokens.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                {event.data.error && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-red-500">
                    {event.data.error}
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

// Node Execution Widget
export const DifyNodeWidget: React.FC<{ event: DifyNodeEvent }> = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isStarted = event.event === 'node_started';
  const isFinished = event.event === 'node_finished';

  const statusIcon = {
    running: <Loader2 className="w-3 h-3 animate-spin text-blue-500" />,
    succeeded: <CheckCircle2 className="w-3 h-3 text-green-500" />,
    failed: <XCircle className="w-3 h-3 text-red-500" />,
    stopped: <Circle className="w-3 h-3 text-gray-500" />,
  };

  const nodeTypeIcon = {
    start: <Circle className="w-4 h-4" />,
    end: <CheckCircle2 className="w-4 h-4" />,
    llm: <Box className="w-4 h-4" />,
    tool: <Tool className="w-4 h-4" />,
    default: <Box className="w-4 h-4" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: event.data.index * 0.05 }}
      className="my-1.5 ml-4"
    >
      <div className={cn(
        "flex items-start gap-2 p-2 rounded-lg border transition-all",
        isFinished && event.data.status === 'succeeded' && "border-green-500/20 bg-green-500/5",
        isFinished && event.data.status === 'failed' && "border-red-500/20 bg-red-500/5",
        isStarted && "border-blue-500/20 bg-blue-500/5"
      )}>
        <div className="flex-shrink-0 mt-0.5">
          {nodeTypeIcon[event.data.node_type as keyof typeof nodeTypeIcon] || nodeTypeIcon.default}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-medium truncate">{event.data.title}</span>
              <Badge variant="outline" className="text-xs px-1 h-4">
                {event.data.node_type}
              </Badge>
              {event.data.status && statusIcon[event.data.status]}
            </div>
            {isFinished && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          {event.data.elapsed_time && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {event.data.elapsed_time.toFixed(2)}s
            </div>
          )}

          <AnimatePresence>
            {isExpanded && isFinished && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 text-xs space-y-1"
              >
                {event.data.outputs && (
                  <div className="p-2 bg-muted/50 rounded text-xs font-mono overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(event.data.outputs, null, 2)}
                    </pre>
                  </div>
                )}
                {event.data.error && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-red-500">
                    {event.data.error}
                  </div>
                )}
                {event.data.execution_metadata && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {event.data.execution_metadata.total_tokens && (
                      <span>Tokens: {event.data.execution_metadata.total_tokens.toLocaleString()}</span>
                    )}
                    {event.data.execution_metadata.total_price && (
                      <span>
                        Cost: {event.data.execution_metadata.currency} {event.data.execution_metadata.total_price}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// Message File Widget
export const DifyMessageFileWidget: React.FC<{ event: DifyMessageFileEvent }> = ({ event }) => {
  const fileTypeIcon = {
    image: <ImageIcon className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    audio: <Music className="w-4 h-4" />,
    file: <FileText className="w-4 h-4" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="my-2"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 text-primary">
              {fileTypeIcon[event.type]}
            </div>
            <div className="flex-1 min-w-0">
              {event.type === 'image' ? (
                <img
                  src={event.url}
                  alt="Generated image"
                  className="max-w-full rounded"
                  loading="lazy"
                />
              ) : event.type === 'video' ? (
                <video
                  src={event.url}
                  controls
                  className="max-w-full rounded"
                />
              ) : event.type === 'audio' ? (
                <audio
                  src={event.url}
                  controls
                  className="w-full"
                />
              ) : (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  View file
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Tool Invocation Progress Widget
export const DifyToolProgressWidget: React.FC<{
  toolName: string;
  progress?: number;
  status: 'running' | 'completed' | 'error';
}> = ({ toolName, progress, status }) => {
  const statusConfig = {
    running: { icon: <Loader2 className="w-4 h-4 animate-spin" />, color: 'text-blue-500' },
    completed: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-500' },
    error: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-500' },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 p-2 rounded-lg border border-muted bg-muted/30"
    >
      <Tool className={cn("w-4 h-4", config.color)} />
      <span className="text-sm flex-1">{toolName}</span>
      {config.icon}
      {progress !== undefined && status === 'running' && (
        <div className="w-32">
          <Progress value={progress} className="h-1" />
        </div>
      )}
    </motion.div>
  );
};

// Summary Widget for displaying 120+ tools
export const DifyToolsSummaryWidget: React.FC<{ tools: string[] }> = ({ tools }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="my-2"
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tool className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">
                Available Tools ({tools.length})
              </CardTitle>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="pt-2">
                <div className="flex flex-wrap gap-1">
                  {tools.map((tool, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
