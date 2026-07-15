# TotalCross VS Code Extension

This extension adds commands to Visual Studio Code for creating, packaging,
deploying, and deploying-and-running TotalCross projects. Deploy-and-run is
currently intended for Linux ARM targets reached over SSH.

## Requirements

- Java JDK 11
- Maven 3.6.2
- Node.js and npm compatible with this extension's dependencies

## Use

Open the Command Palette (`F1` or `Cmd+Shift+P`) and select one of these
commands:

- `TotalCross: Create new Project`
- `TotalCross: Package`
- `TotalCross: Deploy`
- `TotalCross: Deploy&Run`

Packaging places the target program in `target/install/<platform>`.

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
