import * as process from 'node:process';
import * as https from 'node:https';
import * as path from 'node:path';
import * as os from 'node:os';
import { Command } from 'commander';
// @ts-ignore
import packageJson from './package.json' assert { type: 'json' };
// @ts-ignore
import providerConfig from './providers.json' assert { type: 'json' };
import chalk from 'chalk';
import semver from 'semver/preload.js';
import fs from 'fs-extra';
import { spawn } from 'cross-spawn';

let app = new Command(packageJson.name);
let _projectName: string | undefined;
let _provider: string | undefined;
let _addons: string | undefined;

type Addon = {
    files?: Array<string>;
    devDependencies?: Array<string>;
    dependencies?: Array<string>;
}

type Dependencies = {
    dependencies: Array<string>;
    devDependencies: Array<string>;
}

export function init() {
    app.description('Bootstrap your next SF project')
        .version(packageJson.version);

    app.arguments('<project-directory> <provider>')
        .usage(`${chalk.green('<project-directory>')} ${chalk.magenta('<provider>')} [options]`)
        .option('--addons', '')
        .action((name, provider, addons) => {
            _projectName = name;
            _provider = provider;
            _addons = addons;
        }).on('--help', () => {
        console.log(`    ${chalk.green('<project-directory>')} is required.`);
        console.log(`    ${chalk.magenta('<provider>')} is required.`);
    });

    app.parse(process.argv);

    if (typeof _projectName === 'undefined') {
        console.error('Please specify the project directory:');
        console.log(`${chalk.cyan(app.name)} ${chalk.green('<project-directory>')}`);
        console.log();

        console.log('For example:');
        console.log(`${chalk.cyan(app.name)} ${chalk.green('<project-directory>')} aws-lambda`);

        process.exit(1);
    }

    if (typeof _provider === 'undefined') {
        console.error('Please specify a provider:');
        console.log(`${chalk.cyan(app.name)} ${chalk.green('<project-directory>')} ${chalk.magenta('<provider>')}`);
        console.log();

        console.log('For example:');
        console.log(`${chalk.cyan(app.name)} <project-directory> ${chalk.green('aws-lambda')}`);

        process.exit(1);
    }
}

checkForLatestVersion().then(latest => {
    if (latest && semver.lt(packageJson.version, latest)) {
        console.error(`${chalk.yellow(`You are running 'create-project' ${packageJson.version}, which is behind the latest release (${latest}`)}`);
    }

    console.debug('createProject');
    createProject(_projectName ?? '');
}).catch((e: any) => {
    console.error('error:', e);

    console.debug('createProject');
    createProject(_projectName ?? '');
});

async function createProject(projectName: string): Promise<void> {
    const root = path.resolve(projectName);
    const name = path.basename(root);

    fs.ensureDirSync(projectName);

    console.log(`Creating a new project in ${chalk.green(root)}`);
    console.log();

    const packageJson = {
        name: name,
        version: '0.0.1',
        private: true,
    };

    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2) + os.EOL);

    const originalDirectory = process.cwd();
    process.chdir(root);

    const config = providerConfig[_provider];
    console.log(_provider, providerConfig);
    console.log('')
    await install(config);

    if (_addons && _addons.length) {
        const addons = _addons.split(',').map(addon => addon.toLowerCase().trim());
        await installAddons(addons, originalDirectory);
    }
}

async function install(dependencies: Dependencies): Promise<void> {
    if (dependencies.dependencies) {
        try {
            await runNpmInstall(dependencies.dependencies, false);
        } catch (e: any) {
            console.error(`failed to install dependencies: ${e.message}`);
            process.exit(1);
        }
    }

    if (dependencies.devDependencies) {
        try {
            await runNpmInstall(dependencies.devDependencies, true);
        } catch (e: any) {
            console.error(`failed to install dev dependencies: ${e.message}`);
            process.exit(1);
        }
    }
}

async function installAddons(addons: Array<string>, packageRoot: string): Promise<void> {
    for (const addon of addons) {
        const config = providerConfig[_provider][addon] as Addon | undefined;
        if (!config) continue;

        if (config?.dependencies) {
            try {
                await runNpmInstall(config.dependencies, false);
            } catch (e: any) {
                console.error(`failed to install addon(${addon}) dependencies: ${e.message}`);
                process.exit(1);
            }
        }

        if (config?.devDependencies) {
            try {
                await runNpmInstall(config.devDependencies, true);
            } catch (e: any) {
                console.error(`failed to install addon(${addon}) dev dependencies: ${e.message}`);
                process.exit(1);
            }
        }

        if (config?.files) {

        }
    }
}

function runNpmInstall(dependencies: Array<string>, dev: boolean): Promise<void> {
    const args = [
        'install',
        '--save-exact',
        '--loglevel', 'error'
    ]

    if (dev) args.push('--save-dev');
    else args.push('--save');

    return new Promise((resolve, reject) => {
        const child = spawn('npm', args.concat(dependencies), {stdio: 'inherit'});
        child.on('error', (e: Error) => {
            reject(e);
        });
        child.on('close', code => {
            if (code !== 0) {
                return reject({
                    message: 'unexpected close',
                    command: `npm ${args.join(' ')}`,
                });
            }

            resolve();
        });
    });
}

function checkForLatestVersion(): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get('https://registry.npmjs.org/-/package/@serverless-framework/create-project/dist-tags', (res) => {
            if (res.statusCode !== 200) {
                return reject(`version check failed (${res.statusCode}): ${res.statusMessage}`);
            }

            let body = '';
            res.on('data', data => (body += data));
            res.on('end', () => resolve(JSON.parse(body).latest));
        });
    })
}