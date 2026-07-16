# Add Maven-to-Gradle migration reminders and assisted conversion

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`, and `Editorial Report` must be kept up to date as work proceeds.

This plan must be maintained in accordance with the repository's `PLANS.md`. If `PLANS.md` is not present in the working tree, use the original ExecPlan requirements supplied with this task: keep the document self-contained, novice-guiding, outcome-focused, continuously updated, and grounded in observable validation evidence.

## Purpose / Big Picture

After this change, opening an older TotalCross workspace that has a root `pom.xml` but no Gradle build files will cause the VS Code extension to recognize that it is a Maven-based TotalCross project and recommend migration to Gradle.

The notification must be written in English and must present exactly two action buttons:

    Convert Now
    Remind Me Tomorrow

Choosing `Convert Now` starts an assisted conversion that preserves the Java source tree, reads the relevant TotalCross configuration from `pom.xml`, creates a Gradle build using the unpublished `com.totalcross.application` plugin, adds a Gradle Wrapper, and validates the generated build. Until the Gradle plugin is published remotely, the generated project must resolve it from Maven Local after the developer runs `publishToMavenLocal` in `totalcross-gradle-plugin`.

Choosing `Remind Me Tomorrow`, or dismissing the notification, postpones the notification for that workspace folder by exactly 24 hours. Opening or reloading the same workspace before that period expires must not show the notification again. Other workspaces remain independent.

The feature is visible when a legacy TotalCross Maven project is opened in an Extension Development Host: the notification appears, postponement suppresses it for one day, and conversion produces a runnable Gradle project whose `./gradlew totalcrossPackage` task succeeds when the TotalCross Gradle plugin has been published to Maven Local.

## Progress

- [x] (2026-07-16 13:47Z) Inspected the checked-out extension, existing Gradle generator/layout work, test suite, package exclusions, and sibling `totalcross-gradle-plugin` repository.
- [x] (2026-07-16 13:48Z) Added pure root-level Maven-only TotalCross classification with invalid-POM containment.
- [x] (2026-07-16 13:48Z) Added per-workspace reminder state with an exact 24-hour delay and tests passing fixed timestamps.
- [x] (2026-07-16 13:50Z) Added the English activation-time migration notification with the exact two actions and dismissal postponement semantics.
- [x] (2026-07-16 13:50Z) Registered the explicit `extension.convertMavenProjectToGradle` command and its activation event; its transaction is implemented in the conversion milestone.
- [x] (2026-07-16 13:52Z) Implemented normalized Maven extraction with parent fallbacks, simple properties, TotalCross configuration, and specific unsupported-model errors.
- [x] (2026-07-16 13:52Z) Added a reusable Gradle renderer that packages the existing Gradle 9.6.1 Wrapper resources and writes non-secret migration metadata.
- [x] (2026-07-16 13:54Z) Implemented atomic Maven-to-Gradle conversion, post-validation POM backup, rollback, generated-build retry, and Maven-Local-missing retention behavior.
- [ ] Update packaging and project recognition so converted Gradle projects use Gradle while existing Maven projects remain usable.
- [ ] Add unit, migration-fixture, extension, and end-to-end validation.
- [ ] Update user-facing documentation and changelog entries in English.
- [ ] Record actual implementation evidence in `Outcomes & Retrospective`.
- [ ] Finalize the `Editorial Report` from the completed implementation and validation evidence.

Use UTC timestamps on every progress update. Split partially completed work into explicit completed and remaining portions at every stopping point.

## Surprises & Discoveries

Record unexpected behavior, compatibility constraints, parser edge cases, VS Code lifecycle behavior, Gradle resolution failures, or migration limitations here as implementation proceeds.

- Observation: The extension already generated new Gradle projects and detected their `build/totalcross` layout before this plan began.
  Evidence: `src/project-generator.ts`, `src/project-layout.ts`, and commits `3255075` and `3b4bf14` predate this ExecPlan.

- Observation: The local plugin uses version `0.1.0-SNAPSHOT`, Gradle Wrapper `9.6.1`, and documents `build/totalcross` output.
  Evidence: `../totalcross-gradle-plugin/build.gradle`, `gradle/wrapper/gradle-wrapper.properties`, and `README.md` inspected on 2026-07-16.

## Decision Log

- Decision: Show the migration recommendation only for a root-level `pom.xml` that is recognizably a TotalCross project and only when no root-level Gradle build files exist.
  Rationale: A generic Maven project must never be offered a TotalCross-specific migration, and a project containing both Maven and Gradle files may be in an intentional transition state.
  Date/Author: 2026-07-16 / OpenAI

- Decision: Use the exact action labels `Convert Now` and `Remind Me Tomorrow`.
  Rationale: These are the user-approved English labels and make the one-day delay explicit.
  Date/Author: 2026-07-16 / OpenAI

- Decision: Treat dismissing the notification as equivalent to `Remind Me Tomorrow`.
  Rationale: Repeating the notification on every reload after a dismissal would be intrusive. Dismissal is not displayed as a third action, so the notification still contains exactly the two requested buttons.
  Date/Author: 2026-07-16 / OpenAI

- Decision: Store the reminder deadline in `ExtensionContext.workspaceState`, keyed by the normalized workspace-folder URI.
  Rationale: The choice belongs to one project rather than to the user globally. A separate key per workspace folder also keeps multi-root workspaces independent.
  Date/Author: 2026-07-16 / OpenAI

- Decision: The reminder interval is exactly 86,400,000 milliseconds from the moment the user postpones or dismisses the notification.
  Rationale: This implements one day as a precise 24-hour interval and allows deterministic tests through an injected clock.
  Date/Author: 2026-07-16 / OpenAI

- Decision: Show no more than one migration notification per extension activation.
  Rationale: A multi-root workspace could otherwise produce several simultaneous prompts. The first eligible folder is handled, and other eligible folders can be considered on a later activation or through the explicit conversion command.
  Date/Author: 2026-07-16 / OpenAI

- Decision: Resolve the unpublished Gradle plugin from `mavenLocal()` and use the plugin version currently declared by `totalcross-gradle-plugin`.
  Rationale: The Gradle plugin is not yet available from a remote plugin repository, while `publishToMavenLocal` already publishes the implementation artifact and plugin marker artifacts required by the Gradle plugins DSL.
  Date/Author: 2026-07-16 / OpenAI

- Decision: Keep Maven compatibility in the extension while new projects and successfully converted projects use Gradle.
  Rationale: The recommendation is a migration path, not an immediate removal of support for existing projects whose conversion is postponed or cannot yet be completed.
  Date/Author: 2026-07-16 / OpenAI

- Decision: Keep classification and reminder state free of VS Code UI calls and accept a supplied timestamp.
  Rationale: This makes XML failure containment and the exact 86,400,000-millisecond boundary testable in the existing Mocha suite.
  Date/Author: 2026-07-16 / OpenAI

## Outcomes & Retrospective

The first milestone is complete: `src/migration/project-classifier.ts` recognizes only root TotalCross Maven POMs, and `src/migration/reminder-state.ts` persists an exact per-folder 24-hour deadline. `npm run compile` and `npm test` passed with 12 tests. Notification UI, conversion, packaging alignment, and end-to-end publication validation remain.

The second milestone is complete: `src/migration/migration-reminder.ts` presents the requested English prompt only once per activation and routes `Convert Now` using the selected folder URI. `package.json` exposes the retryable command. `npm run compile` and `npm test` passed with 14 tests.

The third and fourth milestones are complete: `src/migration/maven-project.ts` normalizes supported POM values, and `src/migration/gradle-renderer.ts` builds Groovy Gradle files, wrapper resources, and `.totalcross/project.json` in memory. The renderer draws the wrapper from the pre-existing packaged `resources/gradle` tree, whose version is Gradle 9.6.1. `npm run compile` and `npm test` passed with 16 tests.

The fifth milestone is complete: `src/migration/convert-project.ts` writes generated files through sibling temporary paths, merges a pre-existing `gradle.properties` conservatively, validates with an argument-array Wrapper invocation, and renames the POM only after success. It preserves generated files and the original POM if Maven Local lacks the plugin, but restores ordinary failures. `npm run compile` and `npm test` passed with 18 tests before the final missing-local-plugin regression was added.

## Editorial Report

This section is mandatory at completion. It must describe only observed results and remain synchronized with the final repository state.

### Editorial Summary

To be completed from implementation evidence.

### Original Plan versus Actual Outcome

To be completed from implementation evidence.

### What Changed

To be completed with repository-relative paths, stable command names, templates, tests, and generated artifacts.

### Decisions and Trade-offs

To be completed from the final `Decision Log`, including reminder persistence, dismissal behavior, Maven compatibility, and local Gradle plugin resolution.

### Unexpected Problems and Discoveries

To be completed from `Surprises & Discoveries`.

### Validation and Measurable Results

To be completed with exact commands and observed results only.

### Useful Evidence and Examples

To be completed with concise references to tests, fixtures, logs, generated projects, commits, issues, or pull requests.

### Limitations, Remaining Work, and Open Questions

To be completed honestly. At minimum, reassess whether remote publication of the Gradle plugin, Kotlin DSL support, multi-module Maven projects, and multi-root notification sequencing remain limitations.

### Possible Article Angles

To be completed with technically honest, problem-oriented article ideas.

### Suggested Narrative

To be completed as an evidence-based outline rather than a finished article.

### Claims Requiring Human Review

To be completed. Normal editorial and technical review is required even if no special claims are identified.

## Context and Orientation

The repository is `TotalCross/totalcross-vscode-plugin`, a TypeScript VS Code extension.

At the revision inspected while preparing this plan, `package.json` activates the extension when a workspace contains `pom.xml` and contributes the existing TotalCross commands. The extension entry point is `src/extension.ts`.

The current project creator is implemented in `src/creator.ts`. It asks for a group ID, artifact ID, TotalCross SDK version, and target platforms, then copies templates from `resources/`. The current template is `resources/pom.xml`, so newly generated projects are Maven projects.

The current packaging command is implemented in `src/packager.ts` and sends `mvn package` to a VS Code terminal. The current remote deployment implementation in `src/deployer.ts` reads `pom.xml`, uses the Maven project name, and looks for generated files under `target/install/linux_arm`.

The repository already depends on `fs-extra` for file operations, `replace-in-file` for template replacement, and `xml-js` for parsing XML. Prefer these existing dependencies unless a concrete implementation problem proves that another dependency is necessary.

The separate repository `TotalCross/totalcross-gradle-plugin` currently defines the Gradle plugins `com.totalcross.application` and `com.totalcross.library`. Its local development workflow supports:

    ./gradlew publishToMavenLocal

The current unpublished version is expected to be `0.1.0-SNAPSHOT`, but the implementing agent must inspect `totalcross-gradle-plugin/build.gradle` before hard-coding it. The application plugin registers `totalcrossPackage`, attaches it to `assemble`, reads the `com.totalcross:totalcross-sdk:<version>` runtime dependency, and writes its working and generated output beneath `build/totalcross`.

A Maven-only TotalCross project means a workspace folder whose root contains `pom.xml`, does not contain `build.gradle`, `build.gradle.kts`, `settings.gradle`, or `settings.gradle.kts`, and whose POM contains either the `com.totalcross:totalcross-sdk` dependency or the `com.totalcross:totalcross-maven-plugin` build plugin.

A reminder deadline means an epoch-millisecond timestamp stored in `workspaceState`. The extension must not show the notification while the current time is earlier than that timestamp.

Assume the existing extension remains compatible with its declared TypeScript and VS Code versions. Avoid APIs introduced after the declared minimum VS Code version unless `package.json` is intentionally upgraded and the compatibility change is documented and validated.

## Milestone 1: Isolate project classification and reminder policy

Create pure, testable logic that can decide whether a workspace folder is eligible for the notification without displaying UI or changing files.

Add a module such as `src/migration/project-classifier.ts`. The final path may differ if the repository already has a suitable project model, but keep migration logic out of `src/extension.ts`.

Define a result that distinguishes at least:

    not a Maven project
    Maven project with an existing Gradle build
    non-TotalCross Maven project
    eligible TotalCross Maven-only project
    unreadable or invalid POM

The classifier must inspect only files in the workspace-folder root. Do not classify a project from nested example projects or child modules.

Use `fs-extra` to test for:

    pom.xml
    build.gradle
    build.gradle.kts
    settings.gradle
    settings.gradle.kts

Parse the POM using `xml-js` in compact mode, but normalize nodes that may be either a single object or an array. Maven POMs commonly omit `groupId` or `version` in favor of values inherited from `<parent>`, so the parser must support both direct and parent fallbacks where relevant.

Recognize a TotalCross project if either of these coordinates is present:

    dependency: com.totalcross:totalcross-sdk
    build plugin: com.totalcross:totalcross-maven-plugin

Do not classify based only on artifact names, source imports, a repository URL, or the existence of the extension configuration.

Add a module such as `src/migration/reminder-state.ts` with:

    export const MIGRATION_REMINDER_DELAY_MS = 24 * 60 * 60 * 1000;

Provide functions equivalent to:

    migrationReminderKey(folder: vscode.WorkspaceFolder): string
    shouldShowMigrationReminder(context, folder, now): boolean
    postponeMigrationReminder(context, folder, now): Promise<void>
    clearMigrationReminder(context, folder): Promise<void>

Inject or pass the current time instead of calling `Date.now()` deep inside all logic. Production code may default to `Date.now`, while tests pass a fixed value.

The milestone is complete when pure tests prove that an eligible project is identified, unrelated Maven projects are rejected, any root Gradle file suppresses the suggestion, invalid XML does not crash activation, and a stored deadline suppresses the prompt until exactly 24 hours have elapsed.

## Milestone 2: Add the English notification and command routing

Add a coordinator such as `src/migration/migration-reminder.ts` that runs after extension activation has initialized its existing services.

The coordinator must inspect workspace folders in their existing order and stop after the first eligible folder whose reminder deadline has expired. It must then call:

    vscode.window.showInformationMessage(
        message,
        'Convert Now',
        'Remind Me Tomorrow'
    )

Use an English message that clearly identifies both the old and recommended build systems. The preferred exact text is:

    This TotalCross project uses Maven. Convert it to Gradle to use the TotalCross Gradle plugin?

If a multi-root workspace is supported, append or incorporate the workspace-folder name without changing the action labels.

When the result is `Convert Now`, execute the explicit command:

    extension.convertMavenProjectToGradle

Pass the target workspace folder URI or an equivalent unambiguous identifier to the command. Do not make the conversion implementation depend on whichever folder happens to be `workspaceFolders[0]`.

When the result is `Remind Me Tomorrow` or `undefined`, store `now + MIGRATION_REMINDER_DELAY_MS`.

Register the conversion command in `src/extension.ts` and contribute it in `package.json` with an English title such as:

    TotalCross: Convert Maven Project to Gradle

Keep the existing `workspaceContains:pom.xml` activation event so the extension can detect legacy projects. Also add the conversion command activation event if required by the minimum VS Code version used by the repository.

Ensure activation never fails because project classification or POM parsing failed. Log a concise diagnostic to an extension output channel or the console and continue without showing the prompt.

The milestone is complete when automated tests verify all action branches and a manual Extension Development Host run displays the exact English message and exact two buttons.

## Milestone 3: Extract Maven configuration for conversion

Add a parser such as `src/migration/maven-project.ts` that converts a supported POM into a normalized migration model. Keep parsing separate from file generation.

The model must contain, when available:

    project group
    project artifact ID
    project version
    project display or application name
    TotalCross SDK version
    target platforms
    activation key
    certificates path
    TotalCross home path
    Java source or target level
    declared Maven repository URLs

Use direct project values first and parent values as fallbacks for group and version. Resolve simple Maven property references such as `${totalcross.version}` and `${project.artifactId}` from `<properties>` and known project coordinates. Do not attempt to implement Maven's complete model builder. If a required value uses an unsupported expression, stop conversion with an English message that names the unresolved field and leaves the project unchanged.

Read TotalCross values from the existing Maven plugin configuration. Platform nodes may be a single value or an array. Preserve a leading hyphen if present; the Gradle plugin accepts both forms.

Require at least:

    artifact ID
    exactly one TotalCross SDK version

If the POM resolves multiple SDK versions or no SDK version, refuse automatic conversion and explain the problem in English.

Derive the application name from the Maven plugin `<name>` configuration when present, then from `<name>`, and finally from `artifactId`.

Preserve the existing repository URL when it hosts the TotalCross SDK. If no usable repository is declared, use the TotalCross repository already used by the project generator or Gradle plugin example. When the URL is plain HTTP, the generated Gradle repository block must set `allowInsecureProtocol = true`.

Add fixture POMs covering direct values, inherited group/version, property-based SDK versions, one and many platforms, absent optional configuration, invalid XML, unresolved properties, and a non-TotalCross Maven project.

The milestone is complete when tests convert all supported fixtures into stable normalized models and reject unsupported fixtures with specific errors.

## Milestone 4: Add reusable Gradle project templates and Wrapper resources

Create reusable templates under a clearly named directory such as:

    resources/gradle-project/build.gradle
    resources/gradle-project/settings.gradle
    resources/gradle-project/gradlew
    resources/gradle-project/gradlew.bat
    resources/gradle-project/gradle/wrapper/gradle-wrapper.jar
    resources/gradle-project/gradle/wrapper/gradle-wrapper.properties

Do not download a Gradle distribution during conversion. The Wrapper downloads its distribution when first executed.

Use the same Gradle Wrapper version as `totalcross-gradle-plugin` unless a compatibility test proves another version is required. Record the exact version and source of the wrapper files in `Decision Log`.

The generated `settings.gradle` must resolve the unpublished plugin from Maven Local:

    pluginManagement {
        repositories {
            mavenLocal()
            gradlePluginPortal()
            mavenCentral()
        }
    }

    rootProject.name = '<escaped artifact ID>'

The generated `build.gradle` must apply:

    plugins {
        id 'java'
        id 'com.totalcross.application' version '<inspected local plugin version>'
    }

It must configure repositories, Java compilation compatibility, the TotalCross SDK dependency, and the `totalcross` extension from the normalized Maven model.

Use the Groovy DSL only for this milestone. Do not generate Kotlin DSL files.

Do not embed an activation key directly in `build.gradle`. Generate:

    activationKey = providers.gradleProperty('totalcrossActivationKey').orNull

If the POM contains an activation key, write it to a project-local `gradle.properties` during conversion and ensure `.gitignore` excludes that file. If `gradle.properties` already exists, update it conservatively without replacing unrelated properties. Record this security-sensitive behavior in the conversion summary shown to the user.

The templates must be packaged in the VSIX. Review `.vscodeignore` and the package contents to prove they are not excluded.

The milestone is complete when a template-rendering test creates a complete project in a temporary directory and asserts that all expected text and binary wrapper resources exist.

## Milestone 5: Implement safe and idempotent conversion

Add a service such as `src/migration/convert-project.ts`. It must accept a specific workspace folder and perform all validation before mutating the project.

Before writing anything:

1. Re-run classification.
2. Parse and normalize the POM.
3. Verify that no root Gradle build files exist.
4. Verify that every destination path is writable.
5. Build all rendered text in memory.
6. Create a conversion backup directory under a temporary location inside the workspace, for example `.totalcross-migration-backup`, and ensure that path is ignored by Git if it must exist briefly.

Write files through temporary sibling names and rename them into place so a partial write does not leave truncated files.

Do not modify or move the Java source tree. Maven's standard `src/main/java`, `src/main/resources`, and `src/test/java` layouts are already compatible with Gradle's Java plugin.

Preserve the original `pom.xml` until Gradle validation succeeds. After successful validation, rename it to:

    pom.xml.maven-backup

If that destination already exists, use a deterministic numbered suffix rather than overwriting it.

The conversion must be idempotent. If Gradle files already exist, stop without changing them and show:

    This project already contains a Gradle build. No conversion was performed.

After files are written, execute the wrapper's `tasks` command in the target project:

On macOS and Linux:

    ./gradlew tasks --console=plain

On Windows:

    gradlew.bat tasks --console=plain

Use VS Code's progress notification with an English title such as:

    Converting TotalCross project to Gradle...

Capture stdout and stderr rather than writing shell syntax into a terminal. Use `child_process.spawn` or `execFile` with an explicit working directory and argument array. Do not concatenate untrusted workspace paths into a shell command.

If validation succeeds, rename the POM backup, remove temporary migration backup data, clear the reminder deadline, and show:

    The TotalCross project was converted to Gradle successfully.

If validation fails because the plugin marker cannot be resolved from Maven Local, leave the generated Gradle files and original `pom.xml` intact, remove only temporary files, and show an actionable English error:

    The Gradle files were created, but the TotalCross Gradle plugin is not available in Maven Local. Run `./gradlew publishToMavenLocal` in the totalcross-gradle-plugin repository, then run the conversion command again.

On a retry, the command must recognize that the generated files match the migration template and continue validation instead of treating them as an unrelated pre-existing Gradle build. Mark generated files with a concise stable comment so this state can be recognized safely.

For any other validation or write failure, restore modified pre-existing files from the temporary backup and remove newly created files. Keep `pom.xml` unchanged. Report the concise cause in English and log detailed output to a dedicated `TotalCross Migration` output channel.

Do not automatically clone or publish `totalcross-gradle-plugin`. The extension does not know where the developer wants that checkout and must not make an implicit network or repository mutation.

The milestone is complete when fixture-based tests prove success, local-plugin-unavailable retry behavior, write-failure rollback, pre-existing Gradle refusal, backup naming, and repeated invocation safety.

## Milestone 6: Align extension packaging and deployment behavior

The extension must continue to support postponed Maven projects while preferring Gradle for converted projects.

Refactor `src/packager.ts` so it detects the root build system:

- For a Gradle project, execute the project wrapper with `totalcrossPackage --console=plain`.
- For a Maven-only project, retain `mvn package`.
- For a project containing both unrelated build systems, show an English error asking the user to select or complete the migration instead of guessing.

Do not require a globally installed Gradle for converted projects.

Inspect `src/deployer.ts`. Its current assumptions about `pom.xml`, Maven project name, and `target/install/linux_arm` are not valid for converted projects. At minimum, make it derive the application name from the Gradle migration model or generated metadata and locate the Linux ARM deployment output under the Gradle plugin's actual `build/totalcross` output tree.

Prefer writing a small machine-readable migration metadata file, such as `.totalcross/project.json`, containing only non-secret values required by the extension:

    buildSystem
    artifactId
    applicationName
    sdkVersion

Do not store the activation key in this metadata.

If the actual Gradle plugin output does not contain the same install-directory layout expected by the SSH deployer, inspect a successful `totalcrossPackage` output and adapt the deployer to the observed structure. Record the discovery and exact path in `Surprises & Discoveries`; do not guess.

Update `package.json` workspace activation so Gradle-only TotalCross workspaces can activate the extension. Use root build-file patterns compatible with the repository's minimum VS Code version.

The milestone is complete when both a legacy Maven fixture and a converted Gradle fixture can run the extension's package command, and the deploy command either works against the verified Gradle output or fails with a clear English explanation of a deliberately unsupported output.

## Milestone 7: Testing and end-to-end proof

Add pure unit tests outside the Extension Development Host where practical. Keep VS Code-dependent coordination thin so classification, timing, parsing, rendering, and file transactions can run quickly under Mocha.

At minimum, test:

- A root TotalCross POM with no Gradle files is eligible.
- A root non-TotalCross POM is not eligible.
- Any root Gradle build file suppresses the automatic recommendation.
- Nested POMs do not trigger the root recommendation.
- Invalid XML does not crash activation.
- `Remind Me Tomorrow` stores exactly `now + 86_400_000`.
- Dismissal stores the same deadline.
- The prompt is suppressed one millisecond before the deadline.
- The prompt is allowed at the deadline.
- Reminder state for one folder does not suppress another folder.
- `Convert Now` invokes the conversion command for the correct folder.
- Only one prompt is displayed per activation.
- Supported POM configurations produce the expected Gradle model.
- Generated templates contain `mavenLocal()` and the inspected plugin version.
- Existing source files are unchanged.
- Activation keys are not written to `build.gradle` or migration metadata.
- Conversion rollback restores the original state after a simulated failure.
- Conversion retry works after the local Gradle plugin was initially unavailable.

Run the extension tests from the `totalcross-vscode-plugin` repository root:

    npm ci
    npm run compile
    npm test

Also run the repository's governance checks if present:

    npm run validate:governance
    npm run test:governance

Build the VSIX with the repository's existing packaging command, or install `@vscode/vsce` in the documented development manner if no command exists. Inspect the archive and confirm all Gradle template and wrapper resources are included.

For the end-to-end test, use clean temporary checkouts.

From the `totalcross-gradle-plugin` root:

    ./gradlew clean test publishToMavenLocal --console=plain

Expected evidence includes successful publication of:

    com.totalcross:totalcross-gradle-plugin:<version>
    com.totalcross.application:com.totalcross.application.gradle.plugin:<version>

Create or copy a representative TotalCross Maven fixture whose POM contains the SDK dependency and Maven plugin configuration. Open it in an Extension Development Host launched from `totalcross-vscode-plugin`.

Observe:

1. The English notification appears.
2. The only action buttons are `Convert Now` and `Remind Me Tomorrow`.
3. Choosing `Remind Me Tomorrow` prevents another prompt after window reload.
4. Automated tests using a fake clock prove the prompt returns at exactly 24 hours.
5. Clearing the test state and choosing `Convert Now` creates the Gradle build and Wrapper.
6. The original `pom.xml` becomes `pom.xml.maven-backup` only after validation succeeds.
7. The generated project runs:

       ./gradlew clean totalcrossPackage --console=plain

8. The command produces the TotalCross output beneath `build/totalcross`.
9. The extension's `TotalCross: Package` command invokes the wrapper rather than Maven.
10. Re-running the conversion command does not overwrite or duplicate the Gradle build.

Capture concise terminal excerpts, the list of generated root files, the final output path, and the extension notification text in `Artifacts and Notes`.

## Plan of Work

Begin by reading `package.json`, `src/extension.ts`, `src/creator.ts`, `src/packager.ts`, `src/deployer.ts`, the current tests, `.vscodeignore`, and all relevant templates. Also inspect `totalcross-gradle-plugin/build.gradle`, its example project, and its README to confirm the current plugin version, plugin IDs, wrapper version, configuration names, and output paths.

Implement classification, parsing, reminder timing, and template rendering as pure modules with narrow interfaces. Add tests before wiring UI actions so failures are local and deterministic.

Wire the reminder into activation only after the pure policy is proven. Register the explicit conversion command independently so it can also be invoked from the Command Palette and retried after the Gradle plugin is published locally.

Implement conversion as a transaction: validate first, render in memory, back up, write atomically, validate with the wrapper, then rename the POM. Keep failure and retry semantics explicit.

Finally align packaging, activation, deployment assumptions, docs, and VSIX contents. Perform the complete local-publication and Extension Development Host scenario before marking the plan complete.

## Concrete Steps

Work from a clean branch in `totalcross-vscode-plugin`.

Inspect the repository:

    git status --short
    find . -maxdepth 3 -type f | sort
    sed -n '1,220p' package.json
    sed -n '1,240p' src/extension.ts
    sed -n '1,280p' src/creator.ts
    sed -n '1,240p' src/packager.ts
    sed -n '1,320p' src/deployer.ts
    sed -n '1,220p' .vscodeignore

Inspect the Gradle plugin from its repository root:

    sed -n '1,220p' build.gradle
    sed -n '1,180p' examples/basic-app/settings.gradle
    sed -n '1,240p' examples/basic-app/build.gradle
    cat gradle/wrapper/gradle-wrapper.properties
    ./gradlew tasks --console=plain

After adding each pure module, run:

    npm run compile
    npm test

After wiring the command and notification, launch the Extension Development Host using the repository's existing debug configuration and open each fixture project.

Before the end-to-end conversion:

    cd /path/to/totalcross-gradle-plugin
    ./gradlew clean test publishToMavenLocal --console=plain

Then open the Maven fixture and perform conversion. From the converted project root:

    ./gradlew tasks --console=plain
    ./gradlew clean totalcrossPackage --console=plain

On Windows use:

    gradlew.bat tasks --console=plain
    gradlew.bat clean totalcrossPackage --console=plain

Inspect generated files:

    find . -maxdepth 4 -type f | sort
    find build/totalcross -maxdepth 5 -type f | sort

Build and inspect the VSIX:

    npx @vscode/vsce package
    unzip -l *.vsix | grep -E 'resources/gradle-project|gradle-wrapper'

Use the repository's pinned VSCE workflow instead of `npx` if one exists.

Commit in small, intentional increments. Suggested commit boundaries are:

    test(migration): cover Maven project classification
    feat(migration): add one-day Gradle reminder
    feat(migration): parse TotalCross Maven configuration
    feat(migration): generate Gradle project files
    feat(migration): convert Maven projects safely
    feat(build): package converted projects with Gradle
    test(migration): prove local plugin conversion
    docs(migration): document Maven to Gradle workflow

Adapt commit messages to the repository's actual contribution rules.

## Validation and Acceptance

The implementation is accepted only when all of the following behavior is observed or deterministically tested.

Opening a root-level TotalCross Maven project without Gradle files displays:

    This TotalCross project uses Maven. Convert it to Gradle to use the TotalCross Gradle plugin?

The only action buttons are:

    Convert Now
    Remind Me Tomorrow

Choosing `Remind Me Tomorrow` or dismissing the notification stores a deadline exactly 86,400,000 milliseconds in the future for that workspace folder. No prompt is displayed before the deadline, and the prompt becomes eligible at the deadline.

A non-TotalCross Maven project, an invalid POM, a nested-only POM, or any project with a root Gradle build does not display the automatic recommendation.

Choosing `Convert Now` creates a Gradle Wrapper and Gradle build that uses `com.totalcross.application`, `mavenLocal()`, and the TotalCross SDK version extracted from the POM.

The conversion does not modify Java source files. It does not place the activation key in `build.gradle` or `.totalcross/project.json`.

The original POM remains untouched until `gradlew tasks` succeeds. After success it is preserved as `pom.xml.maven-backup` or a deterministic numbered variant.

When the Gradle plugin has not been published locally, the user receives an actionable English error and can retry after running `publishToMavenLocal` without losing work.

With the plugin published locally, the converted project passes:

    ./gradlew tasks --console=plain
    ./gradlew clean totalcrossPackage --console=plain

The extension's package command uses the project Gradle Wrapper for converted projects and still uses Maven for postponed legacy projects.

All automated tests, TypeScript compilation, governance checks, and VSIX resource checks pass.

The plan is not complete until the final evidence is reconciled into `Outcomes & Retrospective` and every subsection of `Editorial Report`.

## Idempotence and Recovery

Classification and reminder checks are read-only and safe to repeat.

Postponement overwrites the same per-workspace deadline key and is safe to repeat.

The conversion command must never overwrite unrelated Gradle files. Generated files must carry a stable marker so a retry can distinguish an incomplete migration created by this extension from an independent Gradle build.

Use atomic temporary files and a temporary backup directory. On write or validation failure, restore every modified pre-existing file and delete every newly created file unless the specific failure is the expected missing-local-plugin condition. For that condition, keep the generated Gradle files and original POM so the user can publish the plugin and retry.

Never delete the original POM. Rename it only after validation, and always preserve an existing backup by selecting a new suffix.

If a Gradle distribution download is interrupted, the user may rerun the wrapper command; Gradle's wrapper cache handles retry. If a corrupt wrapper distribution persists, remove only the affected Gradle wrapper distribution directory from Gradle User Home and rerun.

If Maven Local contains a stale snapshot, republish from `totalcross-gradle-plugin`:

    ./gradlew clean publishToMavenLocal --console=plain

Document any additional recovery procedure discovered during implementation.

## Artifacts and Notes

Maintain concise evidence here while executing the plan.

Include:

- The exact notification text and action labels.
- A representative eligible and ineligible POM fixture.
- A generated `settings.gradle` excerpt showing `mavenLocal()`.
- A generated `build.gradle` excerpt showing the plugin ID, version, SDK dependency, and `totalcross` configuration without secrets.
- A test assertion proving the 86,400,000 millisecond delay.
- A before-and-after root file listing.
- A short successful `gradlew tasks` excerpt.
- A short successful `totalcrossPackage` excerpt and actual output path.
- A short missing-local-plugin failure excerpt.
- A VSIX listing excerpt proving wrapper resources are packaged.
- Commit, issue, and pull-request references when available.

Do not paste large logs.

## Interfaces and Dependencies

Prefer the existing dependencies `fs-extra`, `xml-js`, and Node's `child_process`, `path`, and `os` modules.

The final implementation must expose interfaces equivalent to the following. Exact type names may change to match repository style, but preserve separation of concerns.

In `src/migration/project-classifier.ts`:

    export type ProjectClassification =
        | { kind: 'not-maven' }
        | { kind: 'gradle-present' }
        | { kind: 'non-totalcross-maven' }
        | { kind: 'eligible'; pomPath: string }
        | { kind: 'invalid-pom'; error: Error };

    export async function classifyProject(rootPath: string): Promise<ProjectClassification>;

In `src/migration/reminder-state.ts`:

    export const MIGRATION_REMINDER_DELAY_MS: number;

    export function migrationReminderKey(folderUri: string): string;

    export function shouldShowMigrationReminder(
        context: vscode.ExtensionContext,
        folderUri: string,
        now: number
    ): boolean;

    export function postponeMigrationReminder(
        context: vscode.ExtensionContext,
        folderUri: string,
        now: number
    ): Thenable<void>;

    export function clearMigrationReminder(
        context: vscode.ExtensionContext,
        folderUri: string
    ): Thenable<void>;

In `src/migration/maven-project.ts`:

    export interface MavenTotalCrossProject {
        groupId?: string;
        artifactId: string;
        version?: string;
        applicationName: string;
        sdkVersion: string;
        platforms: string[];
        activationKey?: string;
        certificates?: string;
        totalcrossHome?: string;
        javaRelease?: number;
        repositories: string[];
    }

    export async function readMavenTotalCrossProject(
        pomPath: string
    ): Promise<MavenTotalCrossProject>;

In `src/migration/gradle-renderer.ts`:

    export interface RenderedGradleProject {
        files: Map<string, Buffer | string>;
        sensitiveFiles: string[];
    }

    export function renderGradleProject(
        project: MavenTotalCrossProject,
        pluginVersion: string
    ): RenderedGradleProject;

In `src/migration/convert-project.ts`:

    export interface ConversionResult {
        status:
            | 'converted'
            | 'plugin-not-local'
            | 'already-gradle'
            | 'unsupported'
            | 'failed';
        message: string;
        details?: string;
    }

    export async function convertMavenProjectToGradle(
        context: vscode.ExtensionContext,
        folder: vscode.WorkspaceFolder
    ): Promise<ConversionResult>;

In `src/migration/migration-reminder.ts`:

    export async function showMigrationReminderIfNeeded(
        context: vscode.ExtensionContext,
        now?: () => number
    ): Promise<void>;

Keep VS Code UI calls in the coordinator and command layer. Keep classification, parsing, rendering, and most conversion transaction logic testable without launching VS Code.

## Revision Note

Initial version created on 2026-07-16. This plan adds a one-day English-language migration recommendation and a safe assisted conversion path from legacy TotalCross Maven projects to the unpublished TotalCross Gradle plugin resolved through Maven Local.

Revision 2026-07-16: recorded the checked-out Gradle support and local plugin facts, then completed the classifier, reminder, UI routing, Maven-model, Gradle-rendering, and transactional-conversion milestones with deterministic tests.
