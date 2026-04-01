#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import { spawn } from 'child_process';
import chalk from 'chalk';
import { checkPackage } from './src/scanner.js'; 

program
    .version('1.0.0')
    .description('npm-gatekeeper: Zero-Trust Package Management');

program
    .command('install <package>')
    .description('Intercepts and safely installs an npm package')
    .action(async (packageName) => {
        
        // 1. Run Gatekeeper Heuristics
        const scanResult = await checkPackage(packageName);

        // 2. The Interception Logic
        if (scanResult.hardBlock) {
            console.log(chalk.bgRed.white.bold('\n 🚫 HARD BLOCK ACTIVATED. Installation aborted to protect your environment. '));
            process.exit(1);
        }

        if (!scanResult.isSafe) {
            const answers = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'override',
                    message: chalk.red.bold('Threats detected. Do you want to OVERRIDE and install anyway?'),
                    default: false
                }
            ]);

            if (!answers.override) {
                console.log(chalk.red.bold('\n🚫 Installation blocked by Gatekeeper. Your machine is safe.'));
                process.exit(1);
            }
        }

        // 3. Pass-Through Execution
        console.log(chalk.cyan(`\n🚀 Handing off to native npm to install ${packageName}...\n`));

        // THE FIX: Explicitly call cmd.exe on Windows to avoid the shell: true warning
        const isWindows = process.platform === 'win32';
        const command = isWindows ? 'cmd.exe' : 'npm';
        const args = isWindows ? ['/c', 'npm', 'install', packageName] : ['install', packageName];

        const child = spawn(command, args, {
            stdio: 'inherit', 
            shell: false // Kept false for maximum security
        });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(chalk.green(`\n🔒 gatekeeper: ${packageName} installed successfully.`));
            } else {
                console.log(chalk.red(`\n❌ native npm exited with error code ${code}`));
            }
        });
    });

program.parse(process.argv);