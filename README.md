<div align="center"> <a href="https://totalcross.com/" target="_blank"> <img src="./totalcross.gif" alt="totalcross logo"/></a></div>

<div align="center"> 
<h1>TotalCross Plugin</h1> </div>
<p align="center">The simplest way to start coding with TotalCross</strong></em></p>

TotalCross is an open source cross-platform SDK developed to bring speed to GUI (Graphical User Interface) creation for embedded devices. TotalCross has the development benefits from Java without the need of Java running on the device, as it uses its own bytecode and virtual machine (TC bytecode and TCVM), created specifically for performance enhancement. TotalCross runtime is currently at 5MB to bring mobile grade user experience even for low-end MPUs.

## Features

- Create a new project;
- Package;
- Deploy;
- Deploy&Run (-linux_arm only via SSH).

## Requirements

- Java JDK 11 | [offical](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html) | [azul openjdk](https://www.azul.com/downloads/zulu-community/?version=java-11-lts&architecture=x86-64-bit&package=jdk) |
- Maven 3.6.2 | [download](https://maven.apache.org/download.cgi) | [how to install](https://maven.apache.org/install.html) |

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

### Deploy

- Press `F1` or `cmd + shift + p` and search for `Totalcross: Deploy`;
- Fill in the device information.
- See the result on the screen or with VNC.

![alt text](deployplugin.gif)

### Deploy and Run

This is working only for linux arm programs. This feature performs platform _deploy&run_ via ssh.

- Press `F1` or `cmd + shift + p` and search for `Totalcross: Deploy&Run`.

![alt text](https://i.imgur.com/Y6F3pTc.gif)

## Contributing to TotalCross Plugin

To contribute, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

## Mainteners

Thanks to the following people who have contributed to this project:

- [@ItaloYeltsin](https://github.com/ItaloYeltsin) 💻
- [@acmlira](https://github.com/acmlira) 💻
- [@ricardobna](https://github.com/ricardobna) 💻
- [@nmarquesin](https://github.com/nmarquesin) 📖

## Contact

If you want to contact me you can reach me at br.yeltsin@gmail.com.

## License

This project uses the following license: [MIT](LICENSE).
