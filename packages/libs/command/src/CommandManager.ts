import { Command } from './Command';
import { injectable, multiInject } from 'inversify';
import { IConfig } from '@packagaya/config/dist/IConfig';

@injectable()
export class CommandManager {
    constructor(
        @multiInject(Command) private readonly commands: Command[],
    ) {
    }

    getCommands(): Command[] {
        return this.commands;
    }

    registerCommand(command: Command) {
        if (this.isCommandRegistered(command)) {
            throw `The command ${command.name} is already registered`;
        }

        this.commands.push(command);
    }

    async executeCommand(commandName: string, projectSpecification: IConfig, commandArguments: string[] = []) {
        const foundCommand = this.commands.find(
            (registeredCommand: Command) => {
                return (
                    registeredCommand.name === commandName ||
                    registeredCommand.aliases.includes(commandName)
                );
            },
        );

        if (foundCommand === undefined) {
            throw `No command with the name or alias ${commandName} found`;
        }

        const subCommand = this.findSubCommand(foundCommand, commandArguments);

        let commandToExecute: Command;

        if (subCommand === undefined) {
            commandToExecute = foundCommand;
        } else {
            commandToExecute = subCommand;
        }

        await commandToExecute.execute(projectSpecification, commandArguments);
    }

    private findSubCommand(
        currentCommand: Command,
        commandArguments: string[],
    ): Command | undefined {
        const subCommandName = commandArguments[0];

        const foundSubCommand = currentCommand.subCommands.find(subCommand => {
            return (
                subCommand.name === subCommandName ||
                subCommand.aliases.includes(subCommandName)
            );
        });

        if (foundSubCommand === undefined) {
            return undefined;
        }

        commandArguments.shift();

        const subSubCommand = this.findSubCommand(
            foundSubCommand,
            commandArguments.slice(1),
        );

        return subSubCommand === undefined ? foundSubCommand : subSubCommand;
    }

    private isCommandRegistered(command: Command): boolean {
        return this.commands.some(registeredCommand => {
            return (
                registeredCommand.name === command.name ||
                registeredCommand.aliases.includes(command.name)
            );
        });
    }
}
