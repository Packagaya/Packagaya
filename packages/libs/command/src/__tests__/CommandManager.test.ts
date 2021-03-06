import { IConfig } from '@packagaya/config/dist/IConfig';

import { Command } from '../Command';
import { CommandManager } from '../CommandManager';
import { HelpCommand } from '../commands/HelpCommand';

describe('CommandManager', () => {
    let commandManager: CommandManager;
    let projectSpecification = {} as IConfig;

    let setCommand: Command;
    let removeCommand: Command;
    let adminCommand: Command;
    let helpCommand: Command;

    beforeEach(() => {
        setCommand = {
            name: 'set',
            aliases: ['s'],
            subCommands: [],
            help: '',
            execute: jest.fn(),
            logSubCommands: jest.fn(),
        };
        removeCommand = {
            name: 'remove',
            aliases: [],
            subCommands: [],
            help: '',
            execute: jest.fn(),
            logSubCommands: jest.fn(),
        };
        adminCommand = {
            name: 'admin',
            aliases: ['ad'],
            subCommands: [setCommand, removeCommand],
            help: '',
            execute: jest.fn(),
            logSubCommands: jest.fn(),
        };
        helpCommand = {
            name: 'help',
            aliases: [],
            subCommands: [setCommand, removeCommand],
            help: '',
            execute: jest.fn(),
            logSubCommands: jest.fn(),
        };

        commandManager = new CommandManager([], helpCommand as HelpCommand);
    });

    it('should be instantiable', () => {
        expect(commandManager).toBeDefined();
    });

    it('should register a command', () => {
        expect(commandManager.getCommands()).toHaveLength(1);
        commandManager.registerCommand(adminCommand);
        expect(commandManager.getCommands()).toHaveLength(2);
    });

    describe('Command', () => {
        it('should execute a command', async () => {
            commandManager.registerCommand(adminCommand);

            await commandManager.executeCommand(
                'admin',
                projectSpecification,
                [],
            );

            expect(adminCommand.execute).toBeCalled();
        });

        it('should execute a command with an alias', async () => {
            commandManager.registerCommand(adminCommand);

            await commandManager.executeCommand('ad', projectSpecification, []);

            expect(adminCommand.execute).toBeCalled();
        });

        it('should execute a command with no arguments', async () => {
            commandManager.registerCommand(adminCommand);

            await commandManager.executeCommand(
                'admin',
                projectSpecification,
                [],
            );

            expect(adminCommand.execute).toBeCalled();
            expect(adminCommand.execute).toBeCalledWith({}, []);
        });

        it('should execute a command with the correct arguments', async () => {
            commandManager.registerCommand(adminCommand);

            await commandManager.executeCommand('admin', projectSpecification, [
                'lol',
            ]);

            expect(adminCommand.execute).toBeCalled();
            expect(adminCommand.execute).toBeCalledWith({}, ['lol']);
        });
    });

    describe('Subcommand', () => {
        it('should execute a subcommand', async () => {
            commandManager.registerCommand(adminCommand);

            await commandManager.executeCommand('admin', projectSpecification, [
                'set',
                '123',
            ]);

            expect(setCommand.execute).toBeCalled();
            expect(setCommand.execute).toBeCalledWith({}, ['123']);
            expect(removeCommand.execute).not.toBeCalled();
        });

        it('should execute a subcommand with an alias', async () => {
            commandManager.registerCommand(adminCommand);

            await commandManager.executeCommand('admin', projectSpecification, [
                's',
                '123',
            ]);

            expect(setCommand.execute).toBeCalled();
            expect(setCommand.execute).toBeCalledWith({}, ['123']);
            expect(removeCommand.execute).not.toBeCalled();
        });

        it('should execute a subcommand with no arguments', async () => {
            commandManager.registerCommand(adminCommand);

            await commandManager.executeCommand('admin', projectSpecification, [
                'set',
            ]);

            expect(setCommand.execute).toBeCalled();
            expect(setCommand.execute).toBeCalledWith({}, []);
        });

        it('should execute a command with the correct arguments', async () => {
            commandManager.registerCommand(adminCommand);

            await commandManager.executeCommand('admin', projectSpecification, [
                'set',
                'lol',
            ]);

            expect(setCommand.execute).toBeCalled();
            expect(setCommand.execute).toBeCalledWith({}, ['lol']);
        });
    });
});
