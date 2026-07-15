<!--
Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
SPDX-License-Identifier: Apache-2.0
-->

# Codex Execution Plans (ExecPlans)

This document describes the requirements for an execution plan ("ExecPlan"), a design document that a coding agent can follow to deliver a working feature or system change. Treat the reader as a complete beginner to this repository: they have only the current working tree and the single ExecPlan file you provide. There is no memory of prior plans and no external context.

## How to use ExecPlans and PLANS.md

When authoring an executable specification (ExecPlan), follow PLANS.md _to the letter_. If it is not in your context, refresh your memory by reading the entire PLANS.md file. Be thorough in reading and re-reading source material to produce an accurate specification. When creating a specification, start from the skeleton and flesh it out as you do your research.

When implementing an executable specification, do not prompt the user for "next steps"; simply proceed to the next milestone. Keep all sections up to date, and add or split entries in the progress list at every stopping point to affirmatively state the progress made and the next steps. Resolve ambiguities autonomously and commit frequently.

When discussing an executable specification, record decisions in a log in the specification for posterity. It should be unambiguously clear why any change to the specification was made. ExecPlans are living documents, and it should always be possible to restart from _only_ the ExecPlan and no other work.

When researching a design with challenging requirements or significant unknowns, use milestones to implement proofs of concept, toy implementations, or other focused experiments that validate whether the proposal is feasible. Read the source code of libraries by finding or acquiring them, research deeply, and include prototypes to guide the full implementation.

At completion, preserve not only implementation evidence but also the factual material needed to communicate the work later. Every completed ExecPlan must contain a final `Editorial Report` that distinguishes the original intention from what was actually implemented and records the most useful material for a future technical article, release note, case study, or project update.

## Requirements

NON-NEGOTIABLE REQUIREMENTS:

* Every ExecPlan must be fully self-contained. Self-contained means that, in its current form, it contains all knowledge and instructions needed for a novice to succeed.
* Every ExecPlan is a living document. Contributors are required to revise it as progress is made, discoveries occur, and design decisions are finalized. Each revision must remain fully self-contained.
* Every ExecPlan must enable a complete novice to implement the feature end-to-end without prior knowledge of this repository.
* Every ExecPlan must produce demonstrably working behavior, not merely code changes that meet a narrow definition.
* Every ExecPlan must define every term of art in plain language or avoid using it.
* Every completed ExecPlan must contain a factual, self-contained `Editorial Report`. The report is part of the definition of done and must be updated if later work changes the final outcome.

Purpose and intent come first. Begin by explaining, in a few sentences, why the work matters from a user's perspective: what someone can do after this change that they could not do before, and how to see it working. Then guide the reader through the exact steps to achieve that outcome, including what to edit, what to run, and what they should observe.

The agent executing the plan can list files, read files, search, run the project, and run tests. It does not know prior context and cannot infer what was intended from earlier milestones. Repeat every assumption on which the work relies. Do not point to external blogs or documentation as a substitute for necessary context; embed the required knowledge in the plan in your own words. If an ExecPlan builds upon a prior ExecPlan and that file is checked in, incorporate it by reference. Otherwise, include all relevant context from the prior plan.

The `Editorial Report` must be grounded in execution evidence. It must not present planned work as completed work, estimates as measurements, prototypes as production behavior, or hypotheses as conclusions. When a useful fact cannot be verified, state that it is unverified or omit it. Reference repository-relative paths, tests, commits, benchmarks, issue or pull-request identifiers, and concise output excerpts when they support the report.

## Formatting

Format and envelope are simple and strict. Each ExecPlan must be one single fenced code block labeled as `md` that begins and ends with triple backticks. Do not nest additional triple-backtick code fences inside it. When showing commands, transcripts, diffs, or code, present them as indented blocks within that single fence. Use indentation for clarity rather than nested fences.

Use two newlines after every heading, use `#`, `##`, and subsequent heading levels correctly, and use valid Markdown syntax for ordered and unordered lists.

When writing an ExecPlan to a Markdown file whose entire contents are the single ExecPlan, omit the outer triple backticks.

Write in plain prose. Prefer sentences over lists. Avoid checklists, tables, and long enumerations unless prose would obscure the meaning. Checklists are permitted only in the `Progress` section, where they are mandatory. The `Editorial Report` may use short labeled entries because it is a factual handoff artifact, but each entry must remain explanatory rather than becoming an unannotated inventory.

## Guidelines

Self-containment and plain language are paramount. If you introduce a phrase that is not ordinary English, such as "daemon", "middleware", "RPC gateway", or "filter graph", define it immediately and explain how it manifests in this repository by naming relevant files, modules, or commands. Do not say "as defined previously" or "according to the architecture document." Include the needed explanation here, even when that repeats information.

Avoid common failure modes. Do not rely on undefined jargon. Do not describe a feature so narrowly that the resulting code compiles but does nothing meaningful. Do not outsource key decisions to the reader. When ambiguity exists, resolve it in the plan and explain why that path was chosen. Err on the side of explaining user-visible effects and avoid over-specifying incidental implementation details.

Anchor the plan with observable outcomes. State what the user can do after implementation, the commands to run, and the outputs they should see. Acceptance must be phrased as behavior a human can verify, such as "after starting the server, navigating to http://localhost:8080/health returns HTTP 200 with body OK", rather than an internal attribute such as "added a HealthCheck struct". If a change is internal, explain how its effect can still be demonstrated, for example through a test that fails before the change and passes afterward or through a scenario that exercises the new behavior.

Specify repository context explicitly. Name files with full repository-relative paths, name functions and modules precisely, and describe where new files must be created. If touching multiple areas, include a short orientation paragraph explaining how those parts fit together. When running commands, show the working directory and exact command line. When outcomes depend on the environment, state the assumptions and provide alternatives when reasonable.

Be idempotent and safe. Write steps so they can be run repeatedly without causing damage or drift. If a step can fail halfway, explain how to retry or adapt. If a migration or destructive operation is necessary, describe backups and safe fallback paths. Prefer additive, testable changes that can be validated incrementally.

Validation is not optional. Include instructions to run tests, start the system when applicable, and observe useful behavior. Describe comprehensive testing for new features and capabilities. Include expected outputs and relevant failure messages so a novice can distinguish success from failure. Where possible, prove that the change is effective beyond compilation through an end-to-end scenario, CLI invocation, request and response, generated artifact, or another observable result. State the exact test commands appropriate to the project's toolchain and explain how to interpret the results.

Capture evidence. When steps produce terminal output, short diffs, logs, benchmarks, screenshots, generated files, or other evidence, include concise examples in the plan. Prefer small excerpts that prove success over large output dumps.

Capture editorial evidence as the work proceeds. When a discovery changes the implementation, a rejected alternative clarifies a trade-off, a benchmark produces a meaningful result, or an unexpected failure leads to a useful lesson, record it immediately in the living sections. The final `Editorial Report` should synthesize those records rather than reconstructing the project from memory at the end.

## Milestones

Milestones are narrative, not bureaucracy. If the work is divided into milestones, introduce each with a brief paragraph that describes its scope, what will exist at its end that did not exist before, the commands to run, and the acceptance criteria to observe. Keep the narrative readable as goal, work, result, and proof.

Progress and milestones are distinct. Milestones tell the implementation story; `Progress` tracks granular work. Both must exist. Never abbreviate a milestone merely for brevity or omit details that could be crucial to a future implementation. Each milestone must be independently verifiable and incrementally implement the overall goal.

The final milestone must include completion of the `Editorial Report`. It is not acceptable to mark the plan complete while leaving that section as a placeholder. The report may be written incrementally, but it must be reconciled with the final implementation, validation results, and `Outcomes & Retrospective` before completion.

## Living plans and design decisions

* ExecPlans are living documents. As key design decisions are made, update the plan to record both the decision and the reasoning behind it. Record all decisions in the `Decision Log`.
* ExecPlans must contain and maintain a `Progress` section, a `Surprises & Discoveries` section, a `Decision Log`, an `Outcomes & Retrospective` section, and an `Editorial Report` section. These are not optional.
* When optimizer behavior, performance trade-offs, unexpected bugs, portability limitations, compatibility constraints, or inverse and rollback semantics shape the approach, capture those observations in `Surprises & Discoveries` with concise evidence.
* If the implementation changes course, document why in the `Decision Log` and reflect the implications in `Progress`.
* At completion of a major task or the full plan, update `Outcomes & Retrospective` with what was achieved, what remains, and what was learned.
* At completion of the full plan, finalize the `Editorial Report` from the actual implementation and validation evidence. Make clear which intended outcomes were delivered, changed, deferred, rejected, or remain uncertain.
* If the plan is resumed after the report was first written, update the report so it continues to describe the final repository state rather than an earlier stopping point.

## Editorial Report requirements

The `Editorial Report` is a concise factual handoff for future communication. It is not itself a finished blog post and must not use promotional language unsupported by evidence. It must be understandable without access to chat history.

The report must contain the following labeled subsections:

### Editorial Summary

Explain the engineering problem, why it mattered, and the final result in a few paragraphs. Describe the reader-visible or developer-visible consequence, not merely the files changed.

### Original Plan versus Actual Outcome

State what the plan initially intended and how the executed result differed. Identify work completed as planned, work whose design changed, work deferred, and work rejected. Explain the reasons for material differences.

### What Changed

Describe the significant changes with repository-relative paths and stable names for important components, APIs, build tasks, workflows, or artifacts. Focus on changes that help a future writer explain the system rather than exhaustively reproducing a diff.

### Decisions and Trade-offs

Summarize the most consequential decisions and alternatives considered. Explain why the selected approach was preferable under the project's constraints and identify meaningful costs or limitations it introduced.

### Unexpected Problems and Discoveries

Summarize the failures, incompatibilities, surprising behavior, or new understanding that materially shaped the result. Include concise supporting evidence or point to entries in `Surprises & Discoveries`.

### Validation and Measurable Results

List only results that were actually observed. Include exact test commands, relevant counts, benchmark conditions, artifact sizes, compatibility results, or before-and-after behavior when available. Explicitly state when no meaningful performance or size measurement was taken.

### Useful Evidence and Examples

Identify concise code excerpts, diffs, logs, screenshots, diagrams, commits, pull requests, issues, generated artifacts, or reproducible commands that would help support a future article. Do not paste large blobs; point to stable repository locations or include short evidence excerpts.

### Limitations, Remaining Work, and Open Questions

Describe what the implementation does not solve, known platform or compatibility limits, follow-up work, and questions that remain unresolved. Do not hide incomplete or negative results.

### Possible Article Angles

Suggest several technically honest article directions. Each angle should name the target reader, the central problem, and the useful takeaway. Prefer problem-oriented titles over product announcements. For example, prefer "Designing a rendering abstraction for CPU, OpenGL, Metal, and Vulkan" over "We added new graphics backends".

### Suggested Narrative

Provide a compact narrative sequence for the strongest article angle, normally covering the problem, constraints, alternatives, implementation path, unexpected difficulty, final design, evidence, limitations, and next step. This is an outline, not a polished article.

### Claims Requiring Human Review

List statements that may be sensitive, externally visible, historically uncertain, commercially significant, security-relevant, or insufficiently verified. If there are none, state that no special claims were identified, while still requiring normal editorial and technical review before publication.

## Prototyping milestones and parallel implementations

It is acceptable, and often encouraged, to include explicit prototyping milestones when they reduce risk in a larger change. Examples include adding a low-level operator to a dependency to validate feasibility or exploring two composition orders while measuring optimizer effects. Keep prototypes additive and testable. Clearly label the scope as prototyping, describe how to run and observe the result, and state the criteria for promoting or discarding the prototype.

Prefer additive changes followed by removals that keep tests passing. Parallel implementations, such as keeping an adapter alongside an older path during migration, are appropriate when they reduce risk or allow validation to continue. Describe how to validate both paths and how to retire one safely.

When working with multiple new libraries or feature areas, consider creating independent spikes that prove each external library or feature behaves as required before integrating them.

## Skeleton of a Good ExecPlan

# <Short, action-oriented description>

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`, and `Editorial Report` must be kept up to date as work proceeds.

If PLANS.md is checked into the repository, reference its repository-relative path here and state that this document must be maintained in accordance with it.

## Purpose / Big Picture

Explain in a few sentences what someone gains after this change and how they can see it working. State the user-visible or developer-visible behavior that will be enabled.

## Progress

Use a list with checkboxes to summarize granular steps. Every stopping point must be documented here, even if that requires splitting a partially completed task into completed and remaining portions. This section must always reflect the actual state of the work.

- [x] (2025-10-01 13:00Z) Example completed step.
- [ ] Example incomplete step.
- [ ] Example partially completed step (completed: X; remaining: Y).
- [ ] Finalize the Editorial Report from the completed implementation and validation evidence.

Use timestamps to make the rate and sequence of progress visible.

## Surprises & Discoveries

Document unexpected behavior, bugs, optimizations, limitations, or insights discovered during implementation. Provide concise evidence.

- Observation: …
  Evidence: …

## Decision Log

Record every decision made while working on the plan in this format:

- Decision: …
  Rationale: …
  Date/Author: …

## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones and at completion. Compare the result against the original purpose.

## Editorial Report

This section is mandatory at completion. Keep it factual, evidence-based, and synchronized with the final implementation.

### Editorial Summary

Describe the problem, its significance, and the final result.

### Original Plan versus Actual Outcome

Explain what was intended and what actually happened, including completed, changed, deferred, or rejected work.

### What Changed

Name the important repository-relative paths, components, APIs, workflows, and artifacts that changed.

### Decisions and Trade-offs

Summarize the consequential choices, alternatives, rationale, costs, and limitations.

### Unexpected Problems and Discoveries

Describe the difficulties and insights that materially affected the implementation, with concise evidence.

### Validation and Measurable Results

Record exact validation commands and only results that were actually observed.

### Useful Evidence and Examples

Point to concise supporting code, tests, logs, diffs, diagrams, screenshots, commits, pull requests, issues, or generated artifacts.

### Limitations, Remaining Work, and Open Questions

State what remains incomplete or unresolved and the known limits of the result.

### Possible Article Angles

Suggest problem-oriented article angles, identifying the target reader and useful takeaway for each.

### Suggested Narrative

Outline the strongest article as problem, constraints, alternatives, implementation, difficulty, result, evidence, limitations, and next step.

### Claims Requiring Human Review

Identify claims requiring special verification before publication, or state that none were identified beyond normal review.

## Context and Orientation

Describe the current state relevant to this task as if the reader knows nothing. Name key files and modules by full repository-relative path. Define every non-obvious term. Do not rely on prior plans or chat history.

## Plan of Work

Describe in prose the sequence of edits and additions. For every edit, name the file and location, such as the function or module, and explain what to insert or change. Keep it concrete and minimal.

## Concrete Steps

State exact commands to run and the working directory for each. When a command generates output, show a short expected transcript so the reader can compare. Update this section as the work proceeds.

## Validation and Acceptance

Describe how to start or exercise the system and what to observe. Phrase acceptance as behavior with specific inputs and outputs. When tests are involved, state the project command and the expected result, including which new test fails before the change and passes afterward when applicable.

The plan is not complete until the final validation evidence has also been reconciled into `Outcomes & Retrospective` and the `Editorial Report`.

## Idempotence and Recovery

State which steps can be repeated safely. For risky steps, provide a safe retry, rollback, or restoration path. Keep the environment clean after completion.

## Artifacts and Notes

Include the most important transcripts, diffs, generated files, screenshots, diagrams, or snippets. Keep them concise and focused on proving success.

## Interfaces and Dependencies

Be prescriptive. Name the libraries, modules, and services to use and explain why. Specify the types, interfaces, traits, and function signatures that must exist at the end of the milestone. Prefer stable names and repository-relative paths.

For example, in `crates/foo/planner.rs`, define:

    pub trait Planner {
        fn plan(&self, observed: &Observed) -> Vec<Action>;
    }

If this guidance is followed, a single stateless agent or a human novice can read an ExecPlan from top to bottom and produce a working, observable result while preserving enough trustworthy evidence for future communication. That is the bar: SELF-CONTAINED, SELF-SUFFICIENT, NOVICE-GUIDING, OUTCOME-FOCUSED, AND EDITORIALLY TRACEABLE.

When revising a plan, ensure the changes are comprehensively reflected across all sections, including the living-document sections and the `Editorial Report`. Write a note at the bottom of the plan describing the revision and why it was made. ExecPlans must describe not only what changed but why, and completed plans must make clear what actually happened.
