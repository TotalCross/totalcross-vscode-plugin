# Migrate generated TotalCross projects from Maven to Gradle

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`, and `Editorial Report` must be kept up to date as work proceeds.

Maintain this document in accordance with the repository's `PLANS.md` if that file is present. If `PLANS.md` is not yet checked into `totalcross-vscode-plugin`, use the ExecPlan requirements supplied with this plan and add the repository-standard planning files in a separate governance change rather than silently mixing them into this feature.

## Purpose / Big Picture

After this change, a developer can run `TotalCross: Create new Project` in VS Code and receive a self-contained Gradle project instead of a Maven project. The generated project applies the `com.totalcross.application` plugin from `TotalCross/totalcross-gradle-plugin`, includes a Gradle Wrapper, resolves the TotalCross SDK dependency, and can be packaged from either the command line or the existing `TotalCross: Package` command.

The Gradle plugin is not yet published to a public plugin repository. During development, the developer first runs `publishToMavenLocal` in a checkout of `totalcross-gradle-plugin`. The generated project's `settings.gradle` includes `mavenLocal()` in plugin resolution, so the local plugin marker and implementation can be resolved without coupling the generated project to a sibling checkout or an absolute filesystem path. This same structure can later resolve a published plugin version with only a version or repository adjustment.

A human can see the feature working by generating a project, opening the generated folder, running its wrapper task `totalcrossPackage`, and observing TotalCross artifacts under `build/totalcross`. The VS Code package command must invoke the same wrapper task. Existing Maven workspaces must remain detectable as a compatibility path, but the extension must no longer create new Maven projects.

## Progress

- [x] (2026-07-16 02:04Z) Recorded the baseline: `npm run compile` and `npm test` passed, with 3 extension-host tests passing.
- [x] (2026-07-16 02:10Z) Added focused extension-host tests for template rendering, SDK Java-release selection, project layout, command construction, and Gradle application-name discovery; `npm test` passed with 10 tests.
- [x] (2026-07-16 02:10Z) Replaced Maven generation resources with Gradle build, settings, properties, ignore-file, Java source, and Gradle 9.6.1 wrapper resources, including the wrapper JAR and Windows script.
- [x] (2026-07-16 02:10Z) Refactored `src/creator.ts` to render the Gradle template tree synchronously, copy binary wrapper files unchanged, reject non-empty destinations, and stop downloading Maven-plugin metadata.
- [x] (2026-07-16 02:12Z) Updated extension activation and configuration so Gradle workspaces are recognized and `totalcross.gradlePluginVersion` defaults to `0.1.0-SNAPSHOT` with its Maven Local requirement documented.
- [x] (2026-07-16 02:12Z) Updated `src/packager.ts` to create a fresh terminal rooted at the selected workspace and execute the Gradle Wrapper or the Maven compatibility command selected by project detection.
- [x] (2026-07-16 02:12Z) Updated `src/deployer.ts` to select the Gradle or Maven Linux ARM output directory, resolve Gradle application names without executing build scripts, verify local output before SSH, and retain Maven POM parsing only for Maven workspaces.
- [x] (2026-07-16 02:12Z) Published `totalcross-gradle-plugin` to Maven Local; an independent generated project listed and executed `totalcrossPackage` without a composite build.
- [x] (2026-07-16 02:13Z) Validated the generated wrapper on macOS/POSIX, including `--offline` after caching. Windows command construction and `gradlew.bat` inclusion are covered by tests and VSIX inspection; a Windows host was not available.
- [x] (2026-07-16 02:19Z) Updated `README.md` and `CHANGELOG.md`, packaged a VSIX, and verified its Gradle wrapper resources and source/test exclusions.
- [x] (2026-07-16 02:22Z) Ran final compile, extension-host tests, audit, governance validation, and governance tests; reconciled this report with observed evidence.

## Surprises & Discoveries

- Observation: project creation is concentrated in `src/creator.ts`, which currently copies `resources/pom.xml`, inserts Maven-specific placeholders, and downloads the latest Maven plugin version.
  Evidence: `createNewProject` calls `latestMavenPluginVersion`, renders `resources/pom.xml`, and replaces `${maven_plugin_version}`.

- Observation: the existing package command is not build-tool-neutral; it sends `mvn package` to a terminal and creates that terminal without binding it to the selected workspace directory.
  Evidence: `src/packager.ts` creates a module-level terminal and calls `output.sendText("mvn package")`.

- Observation: deployment is coupled to Maven's output and project model.
  Evidence: `src/deployer.ts` reads `pom.xml`, takes the application name from the parsed POM, and uploads `target/install/linux_arm`.

- Observation: the Gradle plugin already supports local publication and plugin markers.
  Evidence: `totalcross-gradle-plugin` applies `maven-publish`; `./gradlew publishToMavenLocal` publishes `com.totalcross:totalcross-gradle-plugin:0.1.0-SNAPSHOT` and markers for `com.totalcross.application` and `com.totalcross.library`.

- Observation: the Gradle plugin's application task is named `totalcrossPackage`, depends on `jar`, is attached to `assemble`, and uses `build/totalcross` as its output root by convention.
  Evidence: `TotalCrossPlugin` registers `totalcrossPackage`, configures its output directory from `buildDirectory.dir("totalcross")`, and makes `assemble` depend on it.

- Observation: the supporting plugin checkout has Gradle 9.6.1 wrapper files but no committed `gradlew.bat`.
  Evidence: `ls ../totalcross-gradle-plugin/gradlew.bat` returned “No such file or directory”; a clean temporary Gradle basic build generated the complete 9.6.1 wrapper, including `gradlew.bat` and `gradle-wrapper.jar`.

- Observation: repository governance originally classified all new `src/` and `resources/` files as historical MIT work.
  Evidence: `npm run validate:governance` rejected the new Apache-2.0 Gradle templates and helper modules despite the repository instruction that new first-party source uses Apache-2.0.

- Observation: the actual Linux ARM output exactly matches the intended Gradle deploy path.
  Evidence: `./gradlew clean totalcrossPackage --console=plain` created `build/totalcross/install/linux_arm/GradleSample`, its `.tcz` files, and `libtcvm.so` for an independently generated SDK 7.2.2 project.

- Observation: the generated project packages offline once Gradle, the plugin, SDK, and JDK are cached.
  Evidence: `./gradlew totalcrossPackage --offline --console=plain` reported `BUILD SUCCESSFUL` with the task up to date.

Add new observations here as implementation reveals actual output trees, wrapper packaging behavior, platform differences, or compatibility constraints.

## Decision Log

- Decision: generate Groovy Gradle scripts, not Kotlin DSL scripts.
  Rationale: the Gradle plugin's maintained example uses `build.gradle` and `settings.gradle`; using the same DSL minimizes divergence and makes the generated template directly comparable with the plugin's tested example.
  Date/Author: 2026-07-15 / OpenAI

- Decision: resolve the unpublished plugin through Maven Local rather than `includeBuild` with a generated filesystem path.
  Rationale: `includeBuild` is excellent inside the Gradle plugin repository, but an arbitrary generated project must remain movable and independent of the plugin source checkout. `publishToMavenLocal` provides the plugin implementation and marker artifacts through standard Gradle resolution.
  Date/Author: 2026-07-15 / OpenAI

- Decision: bundle a Gradle Wrapper in every generated project.
  Rationale: the generated project should not require a separately installed Gradle executable and the extension needs one stable cross-platform command to invoke. The wrapper version must initially match the wrapper used by `totalcross-gradle-plugin` and be updated deliberately with compatibility validation.
  Date/Author: 2026-07-15 / OpenAI

- Decision: make new projects Gradle-only while preserving a Maven compatibility branch for already existing workspaces.
  Rationale: the requested migration concerns newly generated projects, and silently breaking package or deploy commands for existing users is unnecessary. Maven-specific template generation and Maven plugin version lookup will be removed, but detection can still run the old command and layout when a workspace contains `pom.xml` and no Gradle build.
  Date/Author: 2026-07-15 / OpenAI

- Decision: represent TotalCross platforms in the generated Gradle file without leading hyphens.
  Rationale: the Gradle plugin documents names such as `linux` and adds the command-line prefix internally. The creator should present and render the Gradle-native form while preserving the same platform choices currently offered by the extension.
  Date/Author: 2026-07-15 / OpenAI

- Decision: keep the TotalCross SDK version picker and Maven metadata fallback, but remove Maven-plugin metadata lookup.
  Rationale: the Gradle project still declares `com.totalcross:totalcross-sdk:<version>`, so SDK version discovery remains useful. The generated project no longer applies `totalcross-maven-plugin`, so downloading its version is obsolete and would make offline creation fail for no reason.
  Date/Author: 2026-07-15 / OpenAI

- Decision: expose the Gradle plugin version as extension configuration with a default matching the locally published plugin version.
  Rationale: until public publication exists, the generated version must match the local publication. A setting is more maintainable than scattering a snapshot literal through TypeScript and templates, and it provides a controlled transition to a released version later.
  Date/Author: 2026-07-15 / OpenAI

- Decision: retain the existing activation key as the generated `gradle.properties` value.
  Rationale: the same value was already committed in the Maven generator and its source template. It is therefore treated as the extension's existing public development key rather than a newly introduced secret, while avoiding embedding it directly in `build.gradle`.
  Date/Author: 2026-07-16 / OpenAI

- Decision: retain the terminal-driven package command.
  Rationale: this preserves the extension's visible build output and user control while the pure layout helper makes the selected command testable. Deploy remains a separate command because a terminal invocation does not provide a completion result that deploy could safely await.
  Date/Author: 2026-07-16 / OpenAI

- Decision: classify the new Gradle templates and helper modules as Amalgam Apache-2.0 work, while excluding unmodified Gradle Wrapper artifacts from first-party header checks.
  Rationale: this preserves the MIT notice on the relocated historical sample Java source, gives newly authored files the repository-required license, and leaves generated third-party wrapper notices intact.
  Date/Author: 2026-07-16 / OpenAI

## Outcomes & Retrospective

The generator now produces a self-contained Gradle consumer project in an empty selected directory. The output has Groovy build/settings files, a Gradle 9.6.1 wrapper, the application source at the group-derived Java path, a configured plugin snapshot version, and no Maven POM. Rendering and file copying are awaited, unlike the previous asynchronous per-token replacement calls. Package and deploy now detect Gradle first and preserve a Maven-only fallback; deployment verifies Linux ARM output before opening SSH. An independently generated project resolved the locally published plugin, ran `totalcrossPackage`, and produced Linux ARM files at the path used by deploy. The VSIX also generated a project that listed the task. Final validation passed: compilation, 10 extension-host tests, audit, governance checks, and governance tests.

## Editorial Report

This section is mandatory at completion. Keep it factual, evidence-based, and synchronized with the final implementation. Do not convert the planned statements below into claims of completion until commands have been run and outputs observed.

### Editorial Summary

The extension generated Maven projects and invoked Maven even though the supported new plugin is Gradle-based. This prevented a newly generated project from consuming `com.totalcross.application` through the normal plugin mechanism. The implementation now generates a portable Gradle project with its own wrapper and has the extension package and deploy Gradle projects first while retaining Maven behavior for old Maven-only workspaces.

The delivered local-development workflow is to publish `totalcross-gradle-plugin` to Maven Local, create a project, and run `./gradlew totalcrossPackage`. The generated settings resolve the plugin marker from Maven Local, and successful output appears below `build/totalcross`.

### Original Plan versus Actual Outcome

The Gradle templates, complete 9.6.1 wrapper, Maven Local resolution, SDK-aware Java target selection, Maven compatibility path, extension configuration, tests, documentation, and VSIX inspection were delivered as planned. The dead local Java runner was removed rather than carried into Gradle. The wrapper was generated from a clean temporary Gradle project because the plugin checkout did not contain `gradlew.bat`.

The planned interactive `TotalCross: Package` observation was not recorded against a clean generated workspace: the available Extension Development Host was already opened on an unrelated dirty workspace. The command implementation is covered by focused tests, and the same wrapper task was observed from generated source and VSIX consumer projects. Windows execution and SSH transfer were not performed because no Windows or SSH target was available.

### What Changed

`src/project-generator.ts`, `src/project-layout.ts`, and `src/build-command.ts` provide deterministic generation, layout detection, command selection, and safe Gradle identity parsing. `src/creator.ts` uses them and no longer downloads Maven-plugin metadata. `src/packager.ts` and `src/deployer.ts` select Gradle output and commands before Maven compatibility behavior.

`resources/gradle/` contains the rendered Gradle scripts, historical Java sample, and wrapper. `package.json` adds Gradle activation events and `totalcross.gradlePluginVersion`; `.vscodeignore` keeps templates while excluding source and test material. `README.md`, `CHANGELOG.md`, and governance validation/tests were updated accordingly.

### Decisions and Trade-offs

Maven Local was chosen over a composite build so generated projects remain independent of a sibling plugin checkout. Bundling the wrapper makes package commands reproducible and lets the extension select `./gradlew totalcrossPackage` on POSIX or `gradlew.bat totalcrossPackage` on Windows. Maven remains only as a detection-based compatibility branch. The snapshot plugin version is an extension setting so local publication and future public versions can be coordinated without paths embedded in projects.

### Unexpected Problems and Discoveries

The plugin checkout lacked `gradlew.bat`, so a temporary Gradle 9.6.1 basic build supplied the verified Windows script and wrapper JAR. Governance initially rejected new Apache files because all `src/` and `resources/` paths were treated as historical; targeted classifications now distinguish the new first-party templates from unmodified third-party wrapper artifacts. The observed deployer output used the planned Linux ARM path. No Windows host was available.

### Validation and Measurable Results

Observed results: `./gradlew clean test publishToMavenLocal --console=plain` in `totalcross-gradle-plugin` succeeded with 15 actionable tasks and published the application marker under `com/totalcross/application/com.totalcross.application.gradle.plugin/0.1.0-SNAPSHOT/`. An independent consumer's `./gradlew tasks --console=plain` listed `totalcrossPackage`; `./gradlew clean totalcrossPackage --console=plain` succeeded and created Linux ARM and Linux ARM64 files under `build/totalcross/install/`.

`npm run compile`, `npm test` (10 passing), `npm audit --audit-level=low`, `npm run validate:governance`, and `npm run test:governance` (17 tests) passed. `npx @vscode/vsce package --no-dependencies --out /tmp/totalcross-vscode-gradle-validation.vsix` produced a 38-file, 226.59 KB VSIX containing the wrapper JAR; a consumer generated from that VSIX listed `totalcrossPackage`. No performance measurement was taken.

### Useful Evidence and Examples

Focused coverage is in `src/test/suite/project-generator.test.ts` and `src/test/suite/project-layout.test.ts`. The independent generated sample was under `/tmp/totalcross-vscode-gradle-sample.F2e4VB`; its output tree included `build/totalcross/install/linux_arm/GradleSample`, `GradleSample.tcz`, `TCBase.tcz`, `TCFont.tcz`, `TCUI.tcz`, and `libtcvm.so`. The local marker and implementation artifacts were inspected under `~/.m2/repository/com/totalcross/`. Commits `3255075` and `3b4bf14` capture the generator and command work.

### Limitations, Remaining Work, and Open Questions

The plugin is still unpublished publicly, so default project creation requires a matching Maven Local publication. The generated DSL is Groovy only; Kotlin DSL detection exists for existing workspaces but no Kotlin template is generated. Maven compatibility remains and should be removed only deliberately. Windows wrapper execution, all target platforms, a clean interactive VS Code package invocation, and real SSH deployment were not observed in this run. The existing development activation key needs release-policy review before being promoted as a production recommendation.

### Possible Article Angles

- For extension maintainers: “Migrating a project generator from Maven to Gradle without breaking existing workspaces,” focusing on build-tool detection, wrapper distribution, and compatibility boundaries.
- For Gradle plugin authors: “Testing an unpublished Gradle plugin through Maven Local and a real generated consumer project,” focusing on marker artifacts and end-to-end validation.
- For developer-tooling engineers: “Why generated projects should carry their own build wrapper,” focusing on reproducibility across VS Code, terminals, CI, and operating systems.

The strongest verified angle is the independent Maven Local consumer: it proves plugin-marker resolution, wrapper portability, and real `tc.Deploy` output without a composite build.

### Suggested Narrative

Start with the Maven/Gradle workflow mismatch. Explain the constraint that the plugin is unpublished but generated projects must stay movable. Contrast composite builds with Maven Local, then show how plugin markers and a bundled wrapper make a separate consumer work. Cover Gradle-first command/layout detection, present the independently generated Linux ARM output and VSIX evidence, and close with the unverified Windows, SSH, and public-publication work.

### Claims Requiring Human Review

Claims that the plugin is ready for public use, that all TotalCross target platforms work, that Windows packaging was validated, or that Maven compatibility can be removed require maintainer review. The activation key and any public documentation of plugin repositories require normal security and release-policy review.

## Context and Orientation

The target repository is `TotalCross/totalcross-vscode-plugin`, a TypeScript VS Code extension. `src/extension.ts` registers commands. `src/creator.ts` asks for a destination folder, group ID, artifact ID, SDK version, and platforms, then copies templates from `resources/`. `src/packager.ts` opens an integrated terminal and currently invokes Maven. `src/deployer.ts` uploads a Linux ARM package over SSH and currently derives its paths and application name from Maven files. `package.json` declares commands, activation events, extension configuration, scripts, and dependencies. `src/test/suite/` contains extension tests, but the existing creator test has little effective coverage.

The supporting repository is `TotalCross/totalcross-gradle-plugin`. Its `com.totalcross.application` plugin applies Java support, creates a `totalcross` extension, and registers the `totalcrossPackage` task. The plugin finds the resolved `com.totalcross:totalcross-sdk` dependency, obtains the matching SDK and JDK, invokes `tc.Deploy`, and writes through the conventional `build/totalcross` output root. Its current development version is `0.1.0-SNAPSHOT`, and `publishToMavenLocal` publishes both the implementation artifact and Gradle plugin marker artifacts.

A Gradle plugin marker is the small Maven publication Gradle uses to translate a `plugins { id 'com.totalcross.application' version '...' }` declaration into the plugin implementation dependency. Publishing only the implementation JAR is insufficient for the `plugins` block. The `java-gradle-plugin` and `maven-publish` setup in `totalcross-gradle-plugin` already publishes the required markers.

Maven Local is the repository conventionally stored under the current user's Maven home, normally `~/.m2/repository` on POSIX systems and `%USERPROFILE%\.m2\repository` on Windows. The generated `settings.gradle` must list `mavenLocal()` inside `pluginManagement.repositories`, because plugin resolution occurs before the repositories in `build.gradle` are evaluated.

A Gradle Wrapper consists of `gradlew`, `gradlew.bat`, `gradle/wrapper/gradle-wrapper.jar`, and `gradle/wrapper/gradle-wrapper.properties`. It downloads and runs a declared Gradle distribution. The generated project must carry all four parts. The initial distribution version must match the one used by the Gradle plugin repository at implementation time; the researched baseline is Gradle 9.6.1. Do not manually reconstruct the wrapper JAR. Generate or copy it from a verified wrapper task and retain its standard license notices.

A compatibility path means that the extension recognizes an old Maven workspace and continues using `mvn package`, `pom.xml`, and `target/install/linux_arm` for that workspace. It does not mean that the extension continues generating Maven templates.

## Plan of Work

### Milestone 1: Establish testable build-tool and template boundaries

Begin by recording the baseline and extracting pure logic from the VS Code command handlers. The current creator mixes user prompts, template selection, copying, and placeholder replacement, while the package and deploy commands embed Maven assumptions directly. Introduce small functions that can be tested without launching a full extension host.

In `src/creator.ts`, or preferably a new `src/project-generator.ts`, define a typed project model containing `groupId`, `artifactId`, `sdkVersion`, `platforms`, `activationKey`, and `gradlePluginVersion`. Define rendering helpers that turn platform values into a valid Groovy list and replace all supported placeholders in a text template in one deterministic pass. Do not use repeated asynchronous `replace-in-file` calls for each token; render in memory, verify that no known placeholder remains, and write the final file atomically. Binary wrapper files must be copied without text rendering.

In a new `src/project-layout.ts`, define build-tool detection and path resolution independently from VS Code. It must identify a Gradle project when the workspace contains `gradlew` or `gradlew.bat` together with `settings.gradle`, `settings.gradle.kts`, `build.gradle`, or `build.gradle.kts`. It must identify Maven only when no Gradle project is detected and `pom.xml` exists. It must return the package command, output root, Linux ARM install directory, and a strategy for resolving the application name. Prefer Gradle when both build systems are present because all newly generated projects are Gradle projects.

In a new `src/build-command.ts`, construct commands without executing them. For Gradle, return `gradlew.bat totalcrossPackage` on Windows and `./gradlew totalcrossPackage` on POSIX. For Maven compatibility, return `mvn package`. Keep shell quoting out of arbitrary concatenated `cd` commands by running the terminal with the workspace as its current directory.

Add unit tests under `src/test/suite/` or a new dependency-light test directory already supported by the repository. Tests must prove placeholder rendering, platform rendering, detection priority, command selection, and path resolution. A test should initially expose the old Maven-only behavior and pass after the refactor.

This milestone is complete when `npm run compile` and the focused tests pass, no user-visible workflow has regressed, and the pure helpers can be used by later milestones.

### Milestone 2: Generate a complete Gradle consumer project

Replace `resources/pom.xml` with Gradle templates. Add at least:

- `resources/gradle/build.gradle`
- `resources/gradle/settings.gradle`
- `resources/gradle/gradle.properties`
- `resources/gradle/.gitignore`
- `resources/gradle/gradlew`
- `resources/gradle/gradlew.bat`
- `resources/gradle/gradle/wrapper/gradle-wrapper.jar`
- `resources/gradle/gradle/wrapper/gradle-wrapper.properties`

Retain and render the Java sample resources, moving them under `resources/gradle/src/` only if doing so makes copying the project tree simpler. Keep generated Java in standard Gradle source paths. Use `src/main/java/<group path>/<ArtifactId>.java` for the application. Preserve the local runner only if it still compiles and remains useful; place it deliberately rather than accidentally copying it into the main source set. If retained in `src/main/java`, record why. If moved to `src/test/java`, add a tested Gradle run task or document how it is used. Do not leave dead sample code.

The generated `settings.gradle` must declare plugin repositories before the root project name:

    pluginManagement {
        repositories {
            mavenLocal()
            gradlePluginPortal()
            mavenCentral()
        }
    }

    rootProject.name = '${artifactid}'

The generated `build.gradle` must use the TotalCross application plugin and a version placeholder controlled by the extension:

    plugins {
        id 'java'
        id 'com.totalcross.application' version '${gradle_plugin_version}'
    }

    group = '${groupid}'
    version = '1.0-SNAPSHOT'

    repositories {
        maven {
            url = uri('https://maven.totalcross.com/artifactory/repo1')
        }
        mavenCentral()
    }

    java {
        toolchain {
            languageVersion = JavaLanguageVersion.of(17)
        }
    }

    tasks.withType(JavaCompile).configureEach {
        options.release = ${java_release}
    }

    dependencies {
        implementation 'com.totalcross:totalcross-sdk:${sdk_version}'
    }

    totalcross {
        applicationName = '${artifactid}'
        platforms = [${platforms}]
        activationKey = providers.gradleProperty('totalcrossActivationKey').orNull
    }

Render `${platforms}` as quoted comma-separated Groovy values without leading hyphens, for example `'android', 'linux_arm'`. Determine `${java_release}` from the selected SDK compatibility policy already implemented by the Gradle plugin. At the researched baseline, SDKs before 7.3.0 must be compiled to Java 8 and SDK 7.3.0 or newer can use Java 17. Do not duplicate a fragile lexical comparison in the template generator. Add and test a semantic version helper or, if the Gradle plugin exposes a safer convention by implementation time, use that convention. The generated build must compile under the selected SDK before the milestone is accepted.

Write the current activation-key behavior to `gradle.properties` as:

    totalcrossActivationKey=${activation_key}

Do not embed the key directly in `build.gradle`. Review whether this value is a public development key or a user secret. If it is a secret, replace the generated value with an explanatory commented placeholder and prompt or document secure user configuration instead. Record the final security decision in the `Decision Log`; do not guess silently.

Use the Gradle wrapper version from `totalcross-gradle-plugin/gradle/wrapper/gradle-wrapper.properties` at implementation time. Run the wrapper task in a clean temporary directory or copy the verified wrapper files from the plugin repository, then ensure `gradlew` is executable after generation on POSIX systems. Add a test that packages the extension or inspects the VSIX and confirms the wrapper JAR was not removed by `.vscodeignore` or packaging defaults.

Refactor `src/creator.ts` to stop calling `latestMavenPluginVersion`. Keep SDK metadata lookup and offline fallback. Read `totalcross.gradlePluginVersion` from VS Code configuration, defaulting to `0.1.0-SNAPSHOT` initially. Change the platform picker values from `-android` form to `android` form while keeping the existing platform set unless a separate supported-platform review expands it.

Create the destination structure through one project-tree copy followed by controlled text rendering, or through explicit writes that all return awaited promises. Do not fire unawaited `setupFile` calls. On any failure, show an actionable error and do not open a partially generated project as though creation succeeded.

This milestone is complete when a test fixture generated into a temporary directory contains no `pom.xml`, contains the complete wrapper and Gradle files, contains no unreplaced placeholders, has the expected Java package paths, and its scripts have appropriate permissions.

### Milestone 3: Make extension commands Gradle-first and Maven-compatible

Update `package.json` activation events. Add Gradle workspace patterns such as `workspaceContains:build.gradle`, `workspaceContains:build.gradle.kts`, and `workspaceContains:settings.gradle`. Retain `workspaceContains:pom.xml` only to support existing Maven projects. Add the `totalcross.gradlePluginVersion` configuration property with a clear description that snapshot versions must first be published to Maven Local.

Refactor `src/packager.ts` to create a terminal per invocation with the workspace root as `cwd`. Do not keep a stale module-level terminal bound to a previous workspace. Use the build-command helper and send the platform-appropriate wrapper command. The terminal title should identify the project or build tool. If no supported project layout exists, show an error that states the expected Gradle or Maven files.

The package command may remain terminal-driven, because that preserves visible Gradle output and user control, but the helper must be testable. If deploy needs to wait for packaging in the future, do not pretend a terminal command has completed. Either keep package and deploy separate, as they are today, or introduce a VS Code task/process execution that exposes an exit code. Record this decision.

Refactor `src/deployer.ts` so it no longer assumes Maven. Use the layout helper to select:

- Gradle Linux ARM package directory: `<workspace>/build/totalcross/install/linux_arm`, subject to verification against actual `tc.Deploy` output.
- Maven compatibility directory: `<workspace>/target/install/linux_arm`.

For Gradle projects, obtain the application name from a stable generated source. First prefer an explicit extension workspace setting if one is introduced. Otherwise parse only the simple generated assignments `applicationName = '...'` or `rootProject.name = '...'` with tested helpers, and fall back to the workspace folder name with a warning. Do not evaluate arbitrary Gradle scripts inside the extension. Before connecting over SSH, verify that the resolved local directory exists and show an error that tells the developer to run `TotalCross: Package` or the wrapper task when it does not.

Preserve the existing Maven POM parser only for the Maven compatibility branch. Do not parse `pom.xml` for Gradle projects. Ensure the default remote folder and executable command use the same resolved application name.

This milestone is complete when tests cover Gradle and Maven detection, correct command construction on Windows and POSIX, Gradle and Maven deployment paths, missing-output errors, and application-name resolution. A manually generated Gradle project must package through the VS Code command and the deploy command must at least resolve the correct local directory before any SSH operation.

### Milestone 4: Prove local plugin consumption end to end

Use two separate checkouts or directories so the generated project is not accidentally resolving the plugin through a composite build.

From the root of `totalcross-gradle-plugin`, run:

    ./gradlew clean test publishToMavenLocal --console=plain

On Windows, run:

    gradlew.bat clean test publishToMavenLocal --console=plain

Confirm that Maven Local contains the implementation artifact and the marker for `com.totalcross.application` at the configured version. A typical implementation path is:

    ~/.m2/repository/com/totalcross/totalcross-gradle-plugin/0.1.0-SNAPSHOT/

The exact marker path is derived from the plugin ID and should be inspected rather than assumed in the final report.

Install and run the VS Code extension in an Extension Development Host, generate a new project in a fresh directory outside both repositories, then run:

    ./gradlew tasks --console=plain

Confirm that `totalcrossPackage` appears. This proves plugin marker resolution before invoking SDK downloads or deployment. Then run:

    ./gradlew clean totalcrossPackage --console=plain

Use `--info` only when the plain output is insufficient; redirect verbose diagnostics to a file to avoid unnecessary console noise:

    ./gradlew clean totalcrossPackage --console=plain > totalcross-package.log 2>&1

Confirm the task completes successfully and inspect:

    find build/totalcross -maxdepth 4 -type f -print | sort

On Windows, use PowerShell:

    Get-ChildItem -Recurse build\totalcross | Select-Object FullName

Record the actual platform output directory and generated artifacts. If the actual install path differs from `build/totalcross/install/<platform>`, update the layout helper, tests, documentation, `Surprises & Discoveries`, and the `Decision Log` before continuing.

Now invoke `TotalCross: Package` in VS Code and confirm the integrated terminal runs the same wrapper task from the generated workspace. Do not accept a test that only asserts command text; observe generated artifacts.

For offline behavior, first complete one successful online build so Gradle, the plugin, SDK, and JDK are cached. Then disconnect or use Gradle's offline mode:

    ./gradlew totalcrossPackage --offline --console=plain

Record whether the cached build succeeds. Offline success is useful evidence but is not required if the SDK resolver performs an unavoidable network check; document the verified limitation rather than masking it.

This milestone is complete when an independent generated project resolves the locally published plugin, exposes the expected task, packages successfully, and is packaged through the VS Code command.

### Milestone 5: Documentation, packaging, and factual handoff

Update `README.md` so requirements and examples describe Java and the Gradle Wrapper rather than a separately installed Maven requirement. Add a concise section named “Using the unpublished Gradle plugin locally” with the exact `publishToMavenLocal` command, explain that the generated project's `settings.gradle` searches Maven Local, and state how the configured plugin version must match the local publication.

Update project creation, packaging, output paths, and deployment documentation. Replace screenshots or recordings that visibly show `pom.xml`, Maven commands, or `target/install` when practical. If visual assets cannot be updated in this change, state that clearly in the changelog and remaining work.

Update `CHANGELOG.md` with the migration, compatibility behavior, local-publication prerequisite, and any user-visible setting. Review `package.json`, `.vscodeignore`, and the built VSIX so all templates and wrapper files are included while source-only and test-only files remain excluded.

Run repository governance, compile, tests, audit policy, and extension packaging commands supported by the repository. Keep logs concise and save only useful evidence. Review `git diff --check`, generated fixtures, and the VSIX file list.

Finally update every living section in this ExecPlan. Fill the `Editorial Report` from actual evidence, clearly separating intended behavior from delivered behavior. This milestone and the plan are not complete until that report is factual and reconciled with `Outcomes & Retrospective`.

## Concrete Steps

Work from clean checkouts of both repositories. Use the actual default branches and do not assume branch names from this plan.

In `totalcross-vscode-plugin`, record the baseline:

    git status --short
    npm ci
    npm run compile
    npm test
    npm run validate:governance
    npm run test:governance

If `npm ci` cannot run because no lockfile exists, use the repository's documented install command and record the deviation. Do not generate or replace a lockfile incidentally without reviewing the diff.

Inspect the current VSIX packaging command. If `vsce` is available through project scripts or `npx`, run the repository-supported equivalent, for example:

    npx @vscode/vsce package

List the archive contents and retain a short baseline showing current resources:

    unzip -l *.vsix | sed -n '1,160p'

Implement Milestone 1 and run focused tests after every small refactor:

    npm run compile
    npm test

Generate or acquire the wrapper from the verified Gradle plugin checkout. From `totalcross-gradle-plugin`:

    ./gradlew wrapper --gradle-version 9.6.1 --distribution-type all
    git diff -- gradlew gradlew.bat gradle/wrapper

If the repository wrapper already matches, copy those verified files into the VS Code extension's template resources without modifying the Gradle plugin checkout. Preserve standard wrapper scripts and JAR unchanged.

After implementing the Gradle generator, run tests that create a project in a temporary directory. Inspect it with:

    find <generated-project> -maxdepth 5 -type f -print | sort
    grep -R "\${" <generated-project> --exclude='gradle-wrapper.jar'
    test ! -e <generated-project>/pom.xml
    test -x <generated-project>/gradlew

The placeholder search should return no template placeholders. Escape or adapt the command for the active shell.

Publish the Gradle plugin locally:

    cd <totalcross-gradle-plugin>
    ./gradlew clean test publishToMavenLocal --console=plain

Generate the independent sample, then from its root run:

    ./gradlew tasks --console=plain
    ./gradlew clean totalcrossPackage --console=plain

Return to `totalcross-vscode-plugin` and run the full validation set:

    npm run compile
    npm test
    npm run validate:governance
    npm run test:governance
    npm audit --audit-level=low
    git diff --check

Package the VSIX and verify Gradle resources are present:

    npx @vscode/vsce package
    unzip -l *.vsix | grep -E 'resources/gradle|gradle-wrapper|gradlew'

Run the Extension Development Host and manually exercise:

    1. TotalCross: Create new Project.
    2. Select an empty directory.
    3. Enter a valid group ID and artifact ID.
    4. Select an SDK version and at least one platform.
    5. Confirm the generated folder opens and contains Gradle files but no POM.
    6. Run TotalCross: Package.
    7. Observe the wrapper command in the terminal and generated files under build/totalcross.
    8. For Linux ARM output, invoke TotalCross: Deploy and confirm it resolves the Gradle output directory before SSH transfer.

Use the repository's existing lint or formatting commands if present. Do not introduce a formatter-wide diff as part of this feature.

## Validation and Acceptance

The change is accepted only when all of the following observable behavior is demonstrated.

Creating a project produces a standard Gradle project with `build.gradle`, `settings.gradle`, `gradle.properties`, wrapper scripts, wrapper JAR and properties, Java sources, and ignore rules. It produces no `pom.xml`. No known template placeholder remains in any generated text file.

The generated `settings.gradle` includes `mavenLocal()` inside `pluginManagement.repositories`. The generated `build.gradle` applies `com.totalcross.application` at the configured version, declares the selected `com.totalcross:totalcross-sdk` version, configures the selected platforms without leading hyphens, sets the intended application name, and uses a Java target compatible with that SDK.

After `totalcross-gradle-plugin` is published locally, a generated project outside both repositories runs `./gradlew tasks` and lists `totalcrossPackage`. It then runs `./gradlew clean totalcrossPackage` successfully and produces verified TotalCross artifacts under the actual `build/totalcross` tree.

`TotalCross: Package` opens a terminal rooted at the current workspace and invokes `./gradlew totalcrossPackage` on POSIX or `gradlew.bat totalcrossPackage` on Windows. It does not depend on a globally installed `gradle` command. In an existing Maven-only workspace, it continues to invoke `mvn package` unless the maintainers explicitly reverse the compatibility decision and document that breaking change.

For a generated Gradle project, deployment resolves the Gradle Linux ARM output rather than `target/install/linux_arm`, verifies the directory exists before SSH, and uses the generated application identity for the default remote path and executable. For an old Maven project, the existing POM-based behavior remains available.

The packaged VSIX contains all required Gradle template files, including `gradle-wrapper.jar`. A project generated from the installed VSIX, not only from the source checkout, passes the same task-resolution test.

All repository compile, test, governance, and packaging checks pass. Any pre-existing failing check must be recorded with evidence and distinguished from regressions introduced by this change.

Documentation no longer lists Maven as a requirement for newly generated projects and contains an accurate local-publication procedure for the unpublished Gradle plugin.

## Idempotence and Recovery

Publishing `totalcross-gradle-plugin` with `publishToMavenLocal` is repeatable and overwrites the same snapshot version in the user's local repository. When testing code changes under the same snapshot version, use `--refresh-dependencies` or remove only that plugin version's local Maven directories if Gradle reuses stale artifacts. Do not delete the entire Maven repository.

Project generation must refuse or safely handle a non-empty destination. Preserve the current selection behavior only if it cannot overwrite user files. Prefer validating that target files do not exist before writing. If generation fails halfway, report the failure and list the created paths; either remove only files created during that invocation or leave them with an explicit recovery message. Never recursively delete a user-selected folder.

Wrapper copying is repeatable for a fresh fixture. During development, regenerate temporary samples rather than manually editing them. Do not run the Gradle wrapper task inside a user's generated project in a way that unexpectedly upgrades its version.

If local plugin resolution fails, verify in this order: the generated plugin version, successful `publishToMavenLocal`, presence of plugin marker artifacts, `mavenLocal()` inside `pluginManagement.repositories`, and Gradle dependency caches. Use `--refresh-dependencies` before changing repository design.

If packaging fails after SDK or JDK download interruption, use the Gradle plugin's documented cache recovery and remove only the affected TotalCross cache directory under Gradle user home. Do not delete unrelated Gradle caches unless evidence requires it.

Keep the Maven compatibility code isolated behind build-tool detection so it can later be removed cleanly. Do not share mutable global state between Gradle and Maven project invocations.

## Artifacts and Notes

Keep concise evidence during execution:

- A generated-project file tree showing Gradle files and no POM.
- A short excerpt from `./gradlew tasks` showing `totalcrossPackage`.
- A short successful `totalcrossPackage` transcript and the resulting `build/totalcross` tree.
- A VSIX content excerpt showing wrapper scripts, JAR, properties, and Gradle templates.
- Focused test names and counts for rendering, layout detection, command construction, and application-name resolution.
- A manual VS Code transcript or screenshot showing the package command using the wrapper.
- The actual Maven Local marker paths used by Gradle plugin resolution.
- Any Windows-specific validation or an explicit statement that Windows was not available.

Do not embed large Gradle, npm, or SDK download logs in this plan. Store verbose logs as temporary or CI artifacts and quote only the lines that prove a result or explain a failure.

## Interfaces and Dependencies

In `src/project-generator.ts`, define stable data structures similar to:

    export interface TotalCrossProjectOptions {
        groupId: string;
        artifactId: string;
        sdkVersion: string;
        platforms: string[];
        activationKey?: string;
        gradlePluginVersion: string;
    }

    export async function generateGradleProject(
        templateRoot: string,
        destinationRoot: string,
        options: TotalCrossProjectOptions
    ): Promise<void>;

The generator must validate identifiers and platform values before writing, render UTF-8 text templates deterministically, copy binary files exactly, and reject unreplaced known placeholders.

In `src/project-layout.ts`, define:

    export type BuildTool = 'gradle' | 'maven';

    export interface ProjectLayout {
        buildTool: BuildTool;
        root: string;
        packageCommand: string;
        packageOutputRoot: string;
        linuxArmInstallDirectory: string;
    }

    export async function detectProjectLayout(root: string, platform: NodeJS.Platform): Promise<ProjectLayout | undefined>;

Keep path construction in Node's `path` API. Do not concatenate paths with hard-coded forward slashes.

In `src/build-command.ts`, define a pure function:

    export function packageCommand(buildTool: BuildTool, platform: NodeJS.Platform): string;

Expected results are `gradlew.bat totalcrossPackage` for Windows Gradle, `./gradlew totalcrossPackage` for POSIX Gradle, and `mvn package` for Maven compatibility.

Provide a tested application-name resolver with a narrow contract. It may inspect generated `build.gradle` and `settings.gradle`, but it must not execute arbitrary Gradle code. Document precedence and warning behavior.

The extension continues to depend on `fs-extra` and `xml-js` only where useful. `xml-js` remains required for online and cached SDK Maven metadata and for Maven compatibility deployment. Remove `replace-in-file` if the new in-memory renderer makes it unused. Remove Maven-plugin-specific constants and functions from `src/maven-metadata.ts`; rename the module to `src/sdk-metadata.ts` if that improves clarity and update all imports and tests atomically.

In `package.json`, contribute:

    totalcross.gradlePluginVersion

as a string setting whose initial default is `0.1.0-SNAPSHOT`. Its description must say that an unpublished version must be installed with `publishToMavenLocal`. Do not add a user-specific absolute path setting for the Gradle plugin source checkout.

The generated project depends on:

- Gradle Wrapper at the version verified against `totalcross-gradle-plugin`.
- Plugin ID `com.totalcross.application`.
- Plugin implementation publication `com.totalcross:totalcross-gradle-plugin:<version>` and its marker artifact.
- SDK dependency `com.totalcross:totalcross-sdk:<selected-version>`.
- TotalCross artifact repository over HTTPS when verified, plus Maven Central.
- Java toolchain 17 to run the build, while Java compilation release is selected for SDK compatibility.

Do not add `includeBuild` to arbitrary generated projects. Reserve composite builds for examples located inside the Gradle plugin repository or for an explicit advanced developer mode added by a separate change.

Revision note: Initial ExecPlan authored on 2026-07-15 from the current `totalcross-vscode-plugin` Maven generator and the current `totalcross-gradle-plugin` local-publication workflow. The plan deliberately expands the migration to package and deploy command compatibility because a Gradle template would not be demonstrably usable while the extension still invoked Maven and assumed Maven output paths.
