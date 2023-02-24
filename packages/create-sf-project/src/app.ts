import * as process from 'node:process';
import * as path from 'node:path';
import * as os from 'node:os';
import * as url from 'node:url';
import * as https from 'node:https';
import * as console from 'node:console';
import prompts from 'prompts';
import minimist from 'minimist';
import { red, yellow, green, blue, white, bold, cyan } from 'kolorist';
import fs from 'fs-extra';
import semver from 'semver';
import { spawn } from 'cross-spawn';
// @ts-ignore
import packageJson from './package.json' assert { type: 'json' };
// @ts-ignore
import providerConfig from './providers.json' assert { type: 'json' };
import { glob } from './glob.js';
import deepMerge from './merge.js';
import sortDependencies from './sort.js';

let result: {
    projectName?: string
    packageName?: string
    provider?: string
    features?: Array<string>
} = {
    projectName: '',
};

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const afterInstallTips: Array<Tip> = [];

type Tip = {
    title: string;
    tips: Array<string>;
}
type Addon = {
    requires?: string;
    filesWithPlaceholders?: Array<string>;
    devDependencies?: Array<string>;
    dependencies?: Array<string>;
    afterInstallTips?: Array<string>;
}

// function isValidPackageName(projectName) {
//     return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(projectName)
// }

function toValidPackageName(projectName: string) {
    return projectName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/^[._]/, '')
        .replace(/[^a-z0-9-~]+/g, '-')
}

export async function init() {
    console.log('');
    console.log('Serverless Framework - Kick-starting your next serverless project');
    console.log('');

    const argv = minimist(process.argv.slice(2), {});

    let targetDir = argv._[0];

    const promptsList = [] as Array<prompts.PromptObject>;

    if (!targetDir) {
        promptsList.push({
            name: 'projectName',
            type: targetDir ? null : 'text',
            message: 'Project name:',
            validate: (input) => input.length > 0,
            onState: (state) => (targetDir = String(state.value).trim())
        });
    }

    promptsList.push({
        name: 'provider',
        type: () => (argv.provider ? null : 'select'),
        message: 'Select a provider',
        initial: 0,
        choices: (prev, answers) => [
            {
                title: 'AWS-Lambda',
                value: 'aws-lambda'
            },
            // {
            //     title: 'Google Cloud functions',
            //     value: 'google-cloud-functions'
            // },
        ]
    });

    if (!argv.features) {
        promptsList.push({
            name: 'features',
            type: () => (argv.features ? null : 'multiselect'),
            message: 'Select features to add',
            initial: 0,
            onState: (state) => {
                state.value.unshift('default')
            },
            choices: (prev, answers) => {
                const provider = argv.provider ?? answers.provider;

                switch (provider) {
                    case 'aws-lambda':
                        return [
                            {
                                title: 'Serverless',
                                value: 'serverless'
                            },
                            {
                                title: 'Localstack',
                                value: 'localstack'
                            },
                        ];
                    case 'google':
                        return [
                            {
                                title: 'Serverless',
                                value: 'serverless'
                            },
                        ];
                }
            }
        });
    }

    result = await prompts(promptsList,
        {
            onCancel: () => {
                console.error('Error: ' + red('✖') + ' Operation cancelled');
                process.exit(1);
            }
        }
    );

    if (!result.projectName) result.projectName = targetDir;
    if (!result.provider) result.provider = argv.provider;
    if (!result.features) result.features = argv.features?.split(',').map((item: string) => item.trim()) ?? [];

    result.features?.unshift('default');

    try {
        const latest = await checkForLatestVersion();
        if (latest && semver.lt(packageJson.version, latest)) {
            console.error(`${yellow(`You are running 'create-project' ${packageJson.version}, which is behind the latest release (${latest}`)}`);
            console.log('')
        }
    } catch (e: any) {
        // console.error('Error: ' + red('✖'), e);
        // console.log('');
    }

    await createProject(result.projectName ?? '');
}

async function createProject(projectName: string): Promise<void> {
    const root = path.resolve(projectName);
    const name = path.basename(root);

    console.log('');
    console.log(`Creating a new project in ${green(root)}`);
    console.log('');

    fs.ensureDirSync(projectName);

    const packageJson = {
        name: name,
        version: '0.0.1',
        private: true,
    };

    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2) + os.EOL);

    process.chdir(root);

    if (result.features) {
        await install(name, result.features, root);
    }

    console.log('');
    console.log(`${green('✔')} ${bold(white('Installation complete'))}`);

    if (afterInstallTips.length > 0) {
        console.log('');
        afterInstallTips.forEach(tip => {
            console.log(`${blue('❯')} ${cyan(tip.title)}`);
            tip.tips.forEach(line => console.log(`  ` + green(line.replace(new RegExp('__project_name__', 'g'), toValidPackageName(name ?? '')))));
            console.log('');
        });
    }
}

async function install(name: string, addons: Array<string>, packageRoot: string, logIndent: string = ''): Promise<void> {
    for (const addon of addons) {
        const config = providerConfig[result.provider].addons[addon] as Addon | undefined;
        if (!config) continue;

        console.info(`${logIndent}Installing ${green(addon)}`);

        if (config?.requires) {
            const requirements = config.requires.split(',')
            const skipInstall = requirements.some(r => addons.indexOf(r) >= 0)
            if (!skipInstall) await install(name, requirements, packageRoot, `  ${blue('❯')} `);
        }

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

        if (config?.afterInstallTips) {
            afterInstallTips.push({
                title: 'Localstack',
                tips: config.afterInstallTips,
            });
        }

        if (!fs.pathExistsSync(`${__dirname}templates/${result.provider}/${addon}`)) {
            console.log('failed', `${__dirname}templates/${result.provider}/${addon}`);
            return
        }

        copyRecursiveSync(`${__dirname}templates/${result.provider}/${addon}`, `./`);

        let files = await glob(`${__dirname}templates/${result.provider}/${addon}/**/*`, {
            nodir: true,
        });

        files = files.map(path => path.replace(`${__dirname}templates/${result.provider}/${addon}`, `./`));

        files.forEach(filePath => {
            const file = path.basename(filePath);

            if (config?.filesWithPlaceholders) {
                config.filesWithPlaceholders.forEach(fileToModify => {
                    if (path.basename(file) === fileToModify) {
                        let contents = fs.readFileSync(file).toString();
                        contents = contents.replace(new RegExp('__project_name__', 'g'), toValidPackageName(name ?? ''));
                        fs.writeFileSync(file, contents);
                    }
                });
            }
        });

        const pkgJsonPath = `${__dirname}templates/${result.provider}/${addon}/package.json`;
        if (fs.existsSync(pkgJsonPath) && fs.existsSync('./package.json')) {
            const current = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
            const newPackage = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
            const merged = sortDependencies(deepMerge(current, newPackage));

            fs.writeFileSync('./package.json', JSON.stringify(merged, null, 2) + os.EOL);
        }
    }
}

function runNpmInstall(dependencies: Array<string>, dev: boolean): Promise<void> {
    const args = [
        'install',
        '--save-exact',
        '--loglevel', 'silent'
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

async function copyRecursiveSync(src: string, dest: string) {
    let files = await glob(`${src}/**/*`, {
        nodir: true,
    });

    for (const file of files) {
        if (file.endsWith('package.json')) {
            continue;
        }

        fs.copySync(file, `${dest}/${file.replace(src, ``)}`);
    }
}