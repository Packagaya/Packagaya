import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { spawn, SpawnSyncOptionsWithStringEncoding } from 'child_process';
import { delimiter } from 'path';
import { env } from 'process';

import { IExecutionResult } from './IExecutionResult';

export class Subprocess {
    private localFileSystem = new LocalFileSystem();

    constructor(public name: string) {}

    public async execute(
        commandArguments: string[] = [],
        options?: SpawnSyncOptionsWithStringEncoding,
    ): Promise<IExecutionResult> {
        const resolvedPath = this.resolvePath();

        if (resolvedPath === undefined) {
            throw new Error(`Could not find binary in path: ${this.name}`);
        }

        return new Promise((resolve, reject) => {
            const { stdOut, stdErr, childProcess } = this.getChildProcess(
                resolvedPath,
                commandArguments,
                options,
            );

            childProcess.addListener('exit', (exitCode: number | undefined) => {
                if (stdErr.length > 0) {
                    reject(stdErr.join(' '));
                    return;
                }

                resolve({
                    stdOut,
                    stdErr,
                    exitCode: exitCode ?? -1,
                });
            });
        });
    }

    private spawnChildProcess(
        resolvedPath: string,
        commandArguments: string[],
        options?: SpawnSyncOptionsWithStringEncoding,
    ) {
        const spawnOptions = Object.assign(
            {},
            {
                encoding: 'utf-8',
                env: process.env,
                cwd: process.cwd(),
                stdio: 'pipe',
            },
            options,
        );

        return spawn(
            `${resolvedPath}${commandArguments.join(' ')}`,
            spawnOptions,
        );
    }

    private getChildProcess(
        resolvedPath: string,
        commandArguments: string[],
        options?: SpawnSyncOptionsWithStringEncoding,
    ) {
        let stdOut: string[] = [];
        let stdErr: string[] = [];
        const childProcess = this.spawnChildProcess(
            resolvedPath,
            commandArguments,
            options,
        );

        childProcess.stdout?.addListener('data', (e) => {
            stdOut.push(new String(e).toString().replace('\n', '').trim());
        });

        childProcess.stderr?.addListener('data', (e) => {
            stdErr.push(new String(e).toString().replace('\n', '').trim());
        });

        return {
            stdOut,
            stdErr,
            childProcess,
        };
    }

    public resolvePath(): string | undefined {
        const path = env.PATH ?? '';
        const pathParts = path.split(delimiter);
        const resolvedPaths = pathParts.map((pathPart) =>
            this.localFileSystem.resolve(pathPart, this.name),
        );

        return resolvedPaths.find((path) =>
            this.localFileSystem.checkIfFileExists(path),
        );
    }
}
