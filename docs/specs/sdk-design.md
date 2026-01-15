# SDK Design

## Overview

This document defines the design for the **Agent Platform SDK** - an open-source library for building, deploying, and managing AI agents. The SDK is available in **Python** (primary) and **TypeScript**.

---

## Design Principles

1. **Simple by default, powerful when needed** - Basic use cases should be 5 lines of code
2. **Type-safe** - Full type hints in Python, strict TypeScript
3. **Framework-agnostic** - Works standalone or integrates with LangChain, CrewAI, etc.
4. **Local-first** - Run agents locally without cloud connection
5. **Production-ready** - Built-in tracing, evals, and error handling

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Agent Platform SDK                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Agent     │  │    Tools     │  │   Memory     │          │
│  │   Builder    │  │   Registry   │  │   Manager    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Executor   │  │   Tracer     │  │    Evals     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    LLM Providers                          │  │
│  │    OpenAI  │  Anthropic  │  Google  │  Local (Ollama)    │  │
│  └──────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Platform Client                         │  │
│  │              (Optional cloud connection)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Python SDK

### Installation

```bash
# Core SDK
pip install agentplatform

# With all extras
pip install agentplatform[all]

# Specific providers
pip install agentplatform[openai,anthropic]
```

### Quick Start

```python
from agentplatform import Agent, tool

# Define a tool
@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    # Implementation
    return f"Results for: {query}"

# Create an agent
agent = Agent(
    name="Research Assistant",
    instructions="You are a helpful research assistant.",
    tools=[search_web],
)

# Run the agent
response = agent.run("What is the capital of France?")
print(response.content)
```

### Core Classes

#### Agent

```python
# agentplatform/agent.py
from typing import Optional, List, Callable, AsyncIterator
from pydantic import BaseModel, Field

class AgentConfig(BaseModel):
    """Configuration for an agent."""
    name: str
    instructions: str
    model: str = "gpt-4o"
    temperature: float = 0.7
    max_tokens: int = 4096
    tools: List[Callable] = Field(default_factory=list)
    memory: Optional["MemoryConfig"] = None


class Agent:
    """
    The main Agent class for building AI agents.

    Example:
        >>> agent = Agent(
        ...     name="Assistant",
        ...     instructions="You are helpful.",
        ... )
        >>> response = agent.run("Hello!")
    """

    def __init__(
        self,
        name: str,
        instructions: str,
        *,
        model: str = "gpt-4o",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        tools: Optional[List[Callable]] = None,
        memory: Optional["Memory"] = None,
        tracer: Optional["Tracer"] = None,
    ):
        self.config = AgentConfig(
            name=name,
            instructions=instructions,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            tools=tools or [],
        )
        self.memory = memory
        self.tracer = tracer
        self._executor = AgentExecutor(self)

    def run(
        self,
        input: str,
        *,
        context: Optional[dict] = None,
        session_id: Optional[str] = None,
    ) -> "AgentResponse":
        """
        Run the agent synchronously.

        Args:
            input: The user input/query
            context: Additional context to pass to the agent
            session_id: Session ID for conversation continuity

        Returns:
            AgentResponse containing the result
        """
        return self._executor.run(input, context=context, session_id=session_id)

    async def arun(
        self,
        input: str,
        *,
        context: Optional[dict] = None,
        session_id: Optional[str] = None,
    ) -> "AgentResponse":
        """Run the agent asynchronously."""
        return await self._executor.arun(input, context=context, session_id=session_id)

    def stream(
        self,
        input: str,
        *,
        context: Optional[dict] = None,
        session_id: Optional[str] = None,
    ) -> AsyncIterator["StreamEvent"]:
        """
        Stream the agent's response.

        Yields:
            StreamEvent objects for each token/tool call
        """
        return self._executor.stream(input, context=context, session_id=session_id)

    def clone(self, **overrides) -> "Agent":
        """Create a copy of this agent with optional overrides."""
        config = self.config.model_copy(update=overrides)
        return Agent(**config.model_dump())

    def to_dict(self) -> dict:
        """Serialize the agent to a dictionary."""
        return self.config.model_dump()

    @classmethod
    def from_dict(cls, data: dict) -> "Agent":
        """Create an agent from a dictionary."""
        return cls(**data)

    @classmethod
    def from_yaml(cls, path: str) -> "Agent":
        """Load an agent from a YAML file."""
        import yaml
        with open(path) as f:
            data = yaml.safe_load(f)
        return cls.from_dict(data)
```

#### Tool Decorator

```python
# agentplatform/tools.py
from typing import Callable, Optional, Any
from functools import wraps
import inspect

def tool(
    func: Optional[Callable] = None,
    *,
    name: Optional[str] = None,
    description: Optional[str] = None,
):
    """
    Decorator to convert a function into an agent tool.

    The function's docstring is used as the tool description,
    and type hints are used to generate the input schema.

    Example:
        @tool
        def get_weather(city: str, unit: str = "celsius") -> str:
            '''Get the current weather for a city.'''
            return f"Weather in {city}: 22{unit[0].upper()}"

        @tool(name="calculator", description="Perform math")
        def calc(expression: str) -> float:
            # Use a safe math parser library here
            return safe_math_parse(expression)
    """
    def decorator(fn: Callable) -> "Tool":
        tool_name = name or fn.__name__
        tool_description = description or fn.__doc__ or ""

        # Extract parameters from type hints
        sig = inspect.signature(fn)
        parameters = {}

        for param_name, param in sig.parameters.items():
            param_type = param.annotation
            param_default = param.default

            parameters[param_name] = {
                "type": _python_type_to_json(param_type),
                "description": "",  # Could extract from docstring
            }

            if param_default is not inspect.Parameter.empty:
                parameters[param_name]["default"] = param_default

        return Tool(
            name=tool_name,
            description=tool_description.strip(),
            parameters=parameters,
            function=fn,
        )

    if func is not None:
        return decorator(func)
    return decorator


class Tool:
    """Represents an agent tool."""

    def __init__(
        self,
        name: str,
        description: str,
        parameters: dict,
        function: Callable,
    ):
        self.name = name
        self.description = description
        self.parameters = parameters
        self.function = function

    def __call__(self, **kwargs) -> Any:
        return self.function(**kwargs)

    async def acall(self, **kwargs) -> Any:
        if inspect.iscoroutinefunction(self.function):
            return await self.function(**kwargs)
        return self.function(**kwargs)

    def to_openai_schema(self) -> dict:
        """Convert to OpenAI function calling schema."""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {
                    "type": "object",
                    "properties": self.parameters,
                    "required": [
                        k for k, v in self.parameters.items()
                        if "default" not in v
                    ],
                },
            },
        }
```

#### Memory

```python
# agentplatform/memory.py
from typing import Optional, List
from abc import ABC, abstractmethod
from pydantic import BaseModel

class MemoryEntry(BaseModel):
    """A single memory entry."""
    content: str
    metadata: dict = {}
    timestamp: float
    importance: float = 0.5


class Memory(ABC):
    """Abstract base class for agent memory."""

    @abstractmethod
    def add(self, content: str, metadata: Optional[dict] = None) -> None:
        """Add a memory entry."""
        pass

    @abstractmethod
    def search(self, query: str, limit: int = 5) -> List[MemoryEntry]:
        """Search for relevant memories."""
        pass

    @abstractmethod
    def clear(self) -> None:
        """Clear all memories."""
        pass


class ConversationMemory(Memory):
    """
    Simple conversation buffer memory.

    Stores the last N messages in the conversation.
    """

    def __init__(self, max_messages: int = 50):
        self.max_messages = max_messages
        self._messages: List[MemoryEntry] = []

    def add(self, content: str, metadata: Optional[dict] = None) -> None:
        entry = MemoryEntry(
            content=content,
            metadata=metadata or {},
            timestamp=time.time(),
        )
        self._messages.append(entry)
        if len(self._messages) > self.max_messages:
            self._messages = self._messages[-self.max_messages:]

    def search(self, query: str, limit: int = 5) -> List[MemoryEntry]:
        # For conversation memory, return recent messages
        return self._messages[-limit:]

    def clear(self) -> None:
        self._messages = []

    def get_context(self) -> str:
        """Get formatted conversation context."""
        return "\n".join([m.content for m in self._messages])


class VectorMemory(Memory):
    """
    Vector-based long-term memory using embeddings.

    Stores memories with semantic search capability.
    """

    def __init__(
        self,
        embedding_model: str = "text-embedding-3-small",
        store: Optional["VectorStore"] = None,
    ):
        self.embedding_model = embedding_model
        self.store = store or InMemoryVectorStore()

    def add(self, content: str, metadata: Optional[dict] = None) -> None:
        embedding = self._get_embedding(content)
        self.store.add(
            content=content,
            embedding=embedding,
            metadata=metadata or {},
        )

    def search(self, query: str, limit: int = 5) -> List[MemoryEntry]:
        query_embedding = self._get_embedding(query)
        return self.store.search(query_embedding, limit=limit)

    def clear(self) -> None:
        self.store.clear()

    def _get_embedding(self, text: str) -> List[float]:
        # Use configured embedding model
        from openai import OpenAI
        client = OpenAI()
        response = client.embeddings.create(
            model=self.embedding_model,
            input=text,
        )
        return response.data[0].embedding
```

#### Tracer

```python
# agentplatform/tracer.py
from typing import Optional, Any, Dict
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime
import uuid

@dataclass
class Span:
    """A single span in a trace."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    type: str = ""  # llm_call, tool_call, memory_access
    parent_id: Optional[str] = None
    start_time: datetime = field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    input: Any = None
    output: Any = None
    metadata: Dict = field(default_factory=dict)
    error: Optional[str] = None


@dataclass
class Trace:
    """A complete execution trace."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    agent_name: str = ""
    input: str = ""
    output: str = ""
    spans: list[Span] = field(default_factory=list)
    start_time: datetime = field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    total_tokens: int = 0
    cost_usd: float = 0.0


class Tracer:
    """
    Tracer for recording agent execution traces.

    Example:
        tracer = Tracer()
        agent = Agent("Assistant", "...", tracer=tracer)
        response = agent.run("Hello")

        # View trace
        print(tracer.get_trace())
    """

    def __init__(self, backend: Optional["TracingBackend"] = None):
        self.backend = backend
        self._current_trace: Optional[Trace] = None
        self._span_stack: list[Span] = []

    @contextmanager
    def trace(self, agent_name: str, input: str):
        """Start a new trace."""
        self._current_trace = Trace(agent_name=agent_name, input=input)
        try:
            yield self._current_trace
        finally:
            self._current_trace.end_time = datetime.utcnow()
            if self.backend:
                self.backend.save_trace(self._current_trace)
            self._current_trace = None

    @contextmanager
    def span(self, name: str, type: str, **metadata):
        """Record a span within the current trace."""
        parent_id = self._span_stack[-1].id if self._span_stack else None
        span = Span(
            name=name,
            type=type,
            parent_id=parent_id,
            metadata=metadata,
        )
        self._span_stack.append(span)

        try:
            yield span
        except Exception as e:
            span.error = str(e)
            raise
        finally:
            span.end_time = datetime.utcnow()
            self._span_stack.pop()
            if self._current_trace:
                self._current_trace.spans.append(span)

    def get_trace(self) -> Optional[Trace]:
        """Get the current trace."""
        return self._current_trace


class ConsoleTracingBackend:
    """Print traces to console."""

    def save_trace(self, trace: Trace) -> None:
        print(f"\n{'='*50}")
        print(f"Trace: {trace.id}")
        print(f"Agent: {trace.agent_name}")
        print(f"Input: {trace.input[:100]}...")
        print(f"Output: {trace.output[:100]}...")
        print(f"Total Tokens: {trace.total_tokens}")
        print(f"Cost: ${trace.cost_usd:.6f}")
        print(f"\nSpans ({len(trace.spans)}):")
        for span in trace.spans:
            duration = (span.end_time - span.start_time).total_seconds() * 1000
            print(f"  - {span.type}: {span.name} ({duration:.0f}ms)")
        print(f"{'='*50}\n")


class PlatformTracingBackend:
    """Send traces to Agent Platform cloud."""

    def __init__(self, api_key: str, base_url: str = "https://api.agentplatform.com"):
        self.api_key = api_key
        self.base_url = base_url

    def save_trace(self, trace: Trace) -> None:
        import httpx
        httpx.post(
            f"{self.base_url}/v1/traces",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json=trace.__dict__,
        )
```

#### Evals

```python
# agentplatform/evals.py
from typing import List, Callable, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod

@dataclass
class TestCase:
    """A single test case for evaluation."""
    name: str
    input: str
    expected: Optional[str] = None
    context: Optional[dict] = None
    rubric: Optional[str] = None


@dataclass
class EvalResult:
    """Result of a single evaluation."""
    test_case: TestCase
    actual_output: str
    score: float  # 0.0 to 1.0
    passed: bool
    feedback: str


class Evaluator(ABC):
    """Base class for evaluators."""

    @abstractmethod
    def evaluate(self, test_case: TestCase, output: str) -> EvalResult:
        pass


class ExactMatchEvaluator(Evaluator):
    """Check for exact string match."""

    def evaluate(self, test_case: TestCase, output: str) -> EvalResult:
        passed = output.strip() == test_case.expected.strip()
        return EvalResult(
            test_case=test_case,
            actual_output=output,
            score=1.0 if passed else 0.0,
            passed=passed,
            feedback="Exact match" if passed else "Output does not match expected",
        )


class ContainsEvaluator(Evaluator):
    """Check if output contains expected substring."""

    def evaluate(self, test_case: TestCase, output: str) -> EvalResult:
        passed = test_case.expected.lower() in output.lower()
        return EvalResult(
            test_case=test_case,
            actual_output=output,
            score=1.0 if passed else 0.0,
            passed=passed,
            feedback="Contains expected" if passed else "Missing expected content",
        )


class LLMJudgeEvaluator(Evaluator):
    """Use an LLM to evaluate the output."""

    def __init__(self, model: str = "gpt-4o", rubric: Optional[str] = None):
        self.model = model
        self.default_rubric = rubric or """
        Evaluate the response on a scale of 0-10:
        - Accuracy: Is the information correct?
        - Relevance: Does it address the query?
        - Completeness: Is it thorough?
        - Clarity: Is it well-written?
        """

    def evaluate(self, test_case: TestCase, output: str) -> EvalResult:
        from openai import OpenAI
        client = OpenAI()

        rubric = test_case.rubric or self.default_rubric

        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": f"You are an evaluator. {rubric}"},
                {"role": "user", "content": f"""
                    Query: {test_case.input}
                    Expected: {test_case.expected or 'N/A'}
                    Actual Response: {output}

                    Score (0-10) and explain:
                """},
            ],
        )

        # Parse score from response
        feedback = response.choices[0].message.content
        score = self._extract_score(feedback) / 10.0

        return EvalResult(
            test_case=test_case,
            actual_output=output,
            score=score,
            passed=score >= 0.7,
            feedback=feedback,
        )

    def _extract_score(self, text: str) -> float:
        import re
        match = re.search(r'(\d+(?:\.\d+)?)\s*/\s*10', text)
        if match:
            return float(match.group(1))
        return 5.0  # Default middle score


class EvalSuite:
    """
    A suite of tests for evaluating an agent.

    Example:
        suite = EvalSuite(
            name="Math Tests",
            test_cases=[
                TestCase("addition", "What is 2+2?", expected="4"),
                TestCase("subtraction", "What is 10-3?", expected="7"),
            ],
            evaluator=ContainsEvaluator(),
        )

        results = suite.run(agent)
        print(f"Pass rate: {results.pass_rate:.1%}")
    """

    def __init__(
        self,
        name: str,
        test_cases: List[TestCase],
        evaluator: Evaluator,
    ):
        self.name = name
        self.test_cases = test_cases
        self.evaluator = evaluator

    def run(self, agent: "Agent") -> "EvalSuiteResults":
        results = []

        for test_case in self.test_cases:
            response = agent.run(test_case.input, context=test_case.context)
            result = self.evaluator.evaluate(test_case, response.content)
            results.append(result)

        return EvalSuiteResults(
            suite_name=self.name,
            results=results,
        )

    @classmethod
    def from_yaml(cls, path: str) -> "EvalSuite":
        """Load test suite from YAML file."""
        import yaml
        with open(path) as f:
            data = yaml.safe_load(f)

        test_cases = [TestCase(**tc) for tc in data["test_cases"]]
        evaluator = cls._create_evaluator(data.get("evaluator", {}))

        return cls(
            name=data["name"],
            test_cases=test_cases,
            evaluator=evaluator,
        )


@dataclass
class EvalSuiteResults:
    """Results from running an eval suite."""
    suite_name: str
    results: List[EvalResult]

    @property
    def pass_rate(self) -> float:
        if not self.results:
            return 0.0
        return sum(1 for r in self.results if r.passed) / len(self.results)

    @property
    def average_score(self) -> float:
        if not self.results:
            return 0.0
        return sum(r.score for r in self.results) / len(self.results)

    def to_dict(self) -> dict:
        return {
            "suite_name": self.suite_name,
            "total_tests": len(self.results),
            "passed": sum(1 for r in self.results if r.passed),
            "failed": sum(1 for r in self.results if not r.passed),
            "pass_rate": self.pass_rate,
            "average_score": self.average_score,
        }
```

#### Platform Client

```python
# agentplatform/client.py
from typing import Optional, List
import httpx

class PlatformClient:
    """
    Client for Agent Platform cloud services.

    Example:
        client = PlatformClient(api_key="ap_...")

        # Deploy agent
        deployment = client.deploy(agent)

        # List agents
        agents = client.agents.list()

        # Get execution history
        executions = client.executions.list(agent_id="...")
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.agentplatform.com",
    ):
        self.api_key = api_key
        self.base_url = base_url
        self._client = httpx.Client(
            base_url=base_url,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=30.0,
        )

        # Resource clients
        self.agents = AgentsResource(self)
        self.executions = ExecutionsResource(self)
        self.integrations = IntegrationsResource(self)

    def deploy(self, agent: "Agent") -> "Deployment":
        """Deploy an agent to the platform."""
        response = self._client.post(
            "/v1/agents",
            json=agent.to_dict(),
        )
        response.raise_for_status()
        return Deployment(**response.json())

    def close(self):
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


class AgentsResource:
    """Agent management operations."""

    def __init__(self, client: PlatformClient):
        self._client = client

    def list(self, limit: int = 50, offset: int = 0) -> List[dict]:
        response = self._client._client.get(
            "/v1/agents",
            params={"limit": limit, "offset": offset},
        )
        response.raise_for_status()
        return response.json()["data"]

    def get(self, agent_id: str) -> dict:
        response = self._client._client.get(f"/v1/agents/{agent_id}")
        response.raise_for_status()
        return response.json()

    def delete(self, agent_id: str) -> None:
        response = self._client._client.delete(f"/v1/agents/{agent_id}")
        response.raise_for_status()

    def run(self, agent_id: str, input: str, **kwargs) -> dict:
        response = self._client._client.post(
            f"/v1/agents/{agent_id}/run",
            json={"input": input, **kwargs},
        )
        response.raise_for_status()
        return response.json()
```

---

## TypeScript SDK

### Installation

```bash
npm install @agentplatform/sdk
# or
pnpm add @agentplatform/sdk
```

### Quick Start

```typescript
import { Agent, tool } from '@agentplatform/sdk';

// Define a tool
const searchWeb = tool({
  name: 'search_web',
  description: 'Search the web for information',
  parameters: {
    query: { type: 'string', description: 'Search query' },
  },
  execute: async ({ query }) => {
    return `Results for: ${query}`;
  },
});

// Create an agent
const agent = new Agent({
  name: 'Research Assistant',
  instructions: 'You are a helpful research assistant.',
  tools: [searchWeb],
});

// Run the agent
const response = await agent.run('What is the capital of France?');
console.log(response.content);
```

### Core Types

```typescript
// types.ts

export interface AgentConfig {
  name: string;
  instructions: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: Tool[];
  memory?: Memory;
}

export interface AgentResponse {
  content: string;
  toolCalls: ToolCall[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  trace?: Trace;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, ParameterSchema>;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

export interface StreamEvent {
  type: 'text' | 'tool_call' | 'tool_result' | 'done' | 'error';
  content?: string;
  toolCall?: ToolCall;
  error?: Error;
}
```

### Agent Class

```typescript
// agent.ts

import { AgentConfig, AgentResponse, StreamEvent } from './types';
import { AgentExecutor } from './executor';

export class Agent {
  private config: Required<AgentConfig>;
  private executor: AgentExecutor;

  constructor(config: AgentConfig) {
    this.config = {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4096,
      tools: [],
      memory: undefined,
      ...config,
    };
    this.executor = new AgentExecutor(this.config);
  }

  async run(
    input: string,
    options?: {
      context?: Record<string, unknown>;
      sessionId?: string;
    }
  ): Promise<AgentResponse> {
    return this.executor.run(input, options);
  }

  async *stream(
    input: string,
    options?: {
      context?: Record<string, unknown>;
      sessionId?: string;
    }
  ): AsyncGenerator<StreamEvent> {
    yield* this.executor.stream(input, options);
  }

  clone(overrides?: Partial<AgentConfig>): Agent {
    return new Agent({ ...this.config, ...overrides });
  }

  toJSON(): AgentConfig {
    return { ...this.config };
  }

  static fromJSON(json: AgentConfig): Agent {
    return new Agent(json);
  }
}
```

---

## CLI

### Installation

```bash
# Included with SDK
pip install agentplatform

# Or standalone
pip install agentplatform-cli
```

### Commands

```bash
# Initialize a new agent project
agentplatform init my-agent

# Run agent locally
agentplatform run agent.yaml

# Run with input
agentplatform run agent.yaml --input "Hello, world!"

# Deploy to platform
agentplatform deploy agent.yaml

# Run evaluations
agentplatform eval agent.yaml --suite tests/eval.yaml

# View traces
agentplatform traces --agent-id agt_xxx

# Interactive REPL
agentplatform repl agent.yaml
```

### Agent YAML Format

```yaml
# agent.yaml
name: Research Assistant
instructions: |
  You are a helpful research assistant.
  You can search the web and summarize information.

model: gpt-4o
temperature: 0.7
max_tokens: 4096

tools:
  - name: search_web
    description: Search the web for information
    type: function
    module: tools.search
    function: search_web

  - name: summarize
    description: Summarize text
    type: function
    module: tools.summarize
    function: summarize_text

memory:
  type: conversation
  max_messages: 50
```

---

## Package Structure

```
agentplatform/
├── __init__.py           # Public API exports
├── agent.py              # Agent class
├── tools.py              # Tool decorator and Tool class
├── memory/
│   ├── __init__.py
│   ├── base.py           # Memory ABC
│   ├── conversation.py   # ConversationMemory
│   └── vector.py         # VectorMemory
├── tracer/
│   ├── __init__.py
│   ├── tracer.py         # Tracer class
│   └── backends/         # Tracing backends
├── evals/
│   ├── __init__.py
│   ├── evaluators.py     # Built-in evaluators
│   └── suite.py          # EvalSuite
├── providers/
│   ├── __init__.py
│   ├── base.py           # Provider ABC
│   ├── openai.py         # OpenAI provider
│   ├── anthropic.py      # Anthropic provider
│   └── google.py         # Google provider
├── client/
│   ├── __init__.py
│   └── platform.py       # PlatformClient
├── cli/
│   ├── __init__.py
│   └── main.py           # CLI entry point
└── py.typed              # PEP 561 marker
```

---

## Versioning Strategy

- **SDK Version**: Semantic versioning (1.0.0, 1.1.0, 2.0.0)
- **API Compatibility**: SDK version X.Y works with API v1
- **Breaking Changes**: Major version bump, migration guide provided
