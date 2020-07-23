<div align="center"> <a href="https://totalcross.com/" target="_blank"> <img src="./totalcross.gif" alt="totalcross logo"/></a></div>

<div align="center"> 
<h1>TotalCross Plugin</h1> </div>
<p align="center">The simplest way to start coding with TotalCross</strong></em></p>

TotalCross Plugin for VSCode is a tool that allows people coding with TotalCross to jump in the coding part without needing to set up their own TC Virtual Machine and project folder structure. It sorts it all for you!

## Features
- Create a new project;
- Package;
- Deploy;
- Deploy&Run (-linux_arm only via SSH).

## Requirements
- Java JDK 1.8 | [offical](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) | [azul openjdk](https://www.azul.com/downloads/zulu-community/?&version=java-8-lts&architecture=x86-64-bit&package=jdk) |
- Maven 3.6.2 | [download](https://maven.apache.org/download.cgi) | [how to install](https://maven.apache.org/install.html) |
- Microsoft Java Extension Plugin for vscode | [home](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) |

## Using TotalCross Plugin

### Create a project
This is the first step you will need to follow.
- Press `F1` or `cmd + shift + p` and search for `Totalcross: Create new Project`.

![alt text](https://i.imgur.com/rli4Qsc.gif)

Now you can start coding your project.

### Package
Once your project is finished, it's time to package it. This is how you do it:

- Press `F1` or `cmd + shift + p` and search for `Totalcross: Package`;
- The target program will take place inside the folder `target/install/<platform>`.

![alt text](https://i.imgur.com/dIIZe1X.gif)

### Deploy and Run a program

This is working only for linux arm programs. This feature performs platform *deploy&run* via ssh. 

- Press `F1` or `cmd + shift + p` and search for `Totalcross: Deploy&Run`.

![alt text](https://i.imgur.com/Y6F3pTc.gif)

