> [!IMPORTANT]
> This project has moved to the
> [`TotalCross/totalcross-tooling`](https://github.com/TotalCross/totalcross-tooling)
> repository under [`vscode-extension/`](https://github.com/TotalCross/totalcross-tooling/tree/main/vscode-extension).
> Development continues there. This repository is retained for historical
> issues, pull requests, releases, and links and is intended to be archived.

# TotalCross VS Code Extension

This extension adds commands to Visual Studio Code for creating, packaging,
deploying, and deploying-and-running TotalCross projects. Deploy-and-run is
currently intended for Linux ARM targets reached over SSH.

## Requirements

- Java JDK 17
- Node.js and npm compatible with this extension's dependencies

## Use

Open the Command Palette (`F1` or `Cmd+Shift+P`) and select one of these
commands:

- `TotalCross: Create new Project`
- `TotalCross: Package`
- `TotalCross: Deploy`
- `TotalCross: Deploy&Run`
- `TotalCross: Convert Maven Project to Gradle`

New projects use the Gradle Wrapper included in the generated project, so a
separate Gradle or Maven installation is not required. Package a project with
`TotalCross: Package` or from the project directory with:

    ./gradlew totalcrossPackage

On Windows, use `gradlew.bat totalcrossPackage --console=plain`. Generated
output is rooted at `build/totalcross`. Existing Maven-only projects remain
supported and continue to package with `mvn package` and use `target/install`.

## Migrating a Maven project

When a workspace root contains a TotalCross `pom.xml` and no root Gradle build
files, the extension asks in English whether to convert it. The only actions
are `Convert Now` and `Remind Me Tomorrow`. Dismissing the notification has the
same effect as the reminder action: that workspace is not prompted again for
exactly 24 hours. Other workspace folders have independent reminders.

`Convert Now` reads the TotalCross SDK and plugin configuration from the POM,
creates a marked Groovy Gradle project and Wrapper, and runs `./gradlew tasks
--console=plain`. The Java source tree is unchanged. The POM becomes
`pom.xml.maven-backup` only after that validation succeeds. If the unpublished
plugin is missing from Maven Local, the generated Gradle files and original POM
remain so that publishing the plugin and retrying the command is safe.

The conversion writes activation keys only to project-local `gradle.properties`,
which it adds to `.gitignore`; it does not put the key in `build.gradle` or
`.totalcross/project.json`. A root with unrelated Maven and Gradle files is
deliberately not packaged or deployed automatically, because the extension
cannot know which build is authoritative.

For a project configured with the `linux_arm` platform, the Gradle plugin writes
the SSH deployer's install directory beneath
`build/totalcross/install/linux_arm`, so `TotalCross: Deploy` uses that output
after packaging.

## Using the unpublished Gradle plugin locally

Before creating a project with the default `0.1.0-SNAPSHOT` plugin version,
publish the plugin checkout to Maven Local:

    ./gradlew clean test publishToMavenLocal --console=plain

Run that command from `totalcross-gradle-plugin`. Generated `settings.gradle`
files search Maven Local before public plugin repositories, so Gradle can find
the local plugin marker and implementation. The
`totalcross.gradlePluginVersion` VS Code setting must match the version that
was published locally.

## Development

From the repository root, run:

    npm ci
    npm run audit
    npm run compile
    python3 tools/check-repository-governance.py
    python3 -m unittest tests.test_repository_governance

`npm test` runs the extension integration tests after compilation. It may
download and start a compatible VS Code test instance.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution and validation rules.

## Authors and maintenance

The original creator is [Italo Yeltsin](https://github.com/ItaloYeltsin).
[Fabio Sobral](https://github.com/flsobral) is the sole current maintainer.
Historical contributors are listed in [AUTHORS.md](AUTHORS.md).

## License and transition

The repository's current license is [Apache License 2.0](LICENSE). Versions
and source distributions released before this governance change may remain
available under the MIT License terms that accompanied them. From this
governance change onward, project work controlled by the current copyright
holder is licensed under the Apache License, Version 2.0, unless a file states
otherwise.

Historical TotalCross source files retain their MIT notices and licensing.
See [NOTICE](NOTICE) for attribution and provenance details.
