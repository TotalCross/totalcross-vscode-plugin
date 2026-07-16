# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Upcoming changes
- Live UI preview
- New projects now use the Gradle Wrapper and `com.totalcross.application`.
  The default unpublished plugin version must be installed with
  `publishToMavenLocal`; existing Maven-only workspaces remain supported for
  packaging and deployment.
- Legacy TotalCross Maven projects can be converted through a one-day,
  per-workspace Gradle migration reminder or the `TotalCross: Convert Maven
  Project to Gradle` command. Conversion preserves the POM until Wrapper
  validation succeeds, keeps activation keys out of build scripts and metadata,
  and can be retried after the local Gradle plugin is published.
- Gradle packaging uses the project Wrapper. Mixed Maven/Gradle roots require a
  migration decision, while Gradle Linux ARM package output is deployed from
  `build/totalcross/install/linux_arm`.

## [0.0.15] - 2021-04-27
### Changed
- Use https instead of http when connecting to our repository to improve security.

## [0.0.14] - 2020-11-26
Updated README

## [0.0.13] - 2020-08-05
### Added
- Now uses the new `totalcross-core` function to get the latest version of `totalcross-maven-plugin`.

## [0.0.12] - 2020-08-05
### Changed
- Hotfix: changes totalcross-maven-plugin version to 1.2.0.
  - this version of totalcross-maven-plugin has a bunch of improvements such as capability of easily packaging totalcross libraries and import them to projects.

## [0.0.11] - 2020-07-14
### Changed
- Hotfix: change totalcross-maven-plugin version to 1.1.5

## [0.0.9] - 2020-07-14
### Added
- Ask to collect anonymous data.

## [0.0.8] - 2020-06-11
### Changed
- Removed Login and Register.
