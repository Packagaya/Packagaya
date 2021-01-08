import { IConfig } from '@packagaya/config/dist/IConfig';
import { inject, injectable, multiInject } from 'inversify';

import { Command } from './Command';
import { HelpCommand } from './commands/HelpCommand';

@injectable()
export class CommandManager {
    /**
     * Creates an instance of CommandManager.
     * @param {Command[]} commands The commands which are managed by the command manager
     * @memberof CommandManager
     */
    constructor(
        @multiInject(Command.name) private readonly commands: Command[],
        @inject(HelpCommand.name) helpCommand: HelpCommand,
    ) {
        this.registerCommand(helpCommand);
    }

    /**
     * Returns all registered commands
     *
     * @return {*}  {Command[]} All registered commands
     * @memberof CommandManager
     */
    getCommands(): Command[] {
        return this.commands;
    }

    /**
     * Registers a new command
     *
     * @param {Command} command
     * @throws {Error} When the command is already registered
     * @memberof CommandManager
     */
    registerCommand(command: Command) {
        if (this.isCommandRegistered(command)) {
            throw `The command ${command.name} is already registered`;
        }

        this.commands.push(command);
    }

    /**
     * Executes the command by the given name
     *
     * @param {string} commandName The name of the command which should be executed
     * @param {IConfig} projectSpecification The project configuration
     * @param {string[]} [commandArguments=[]] Additional command arguments for the command
     * @memberof CommandManager
     */
    async executeCommand(
        commandName: string,
        projectSpecification: IConfig,
        commandArguments: string[] = [],
    ) {
        // Check if the command by the given name exists
        const foundCommand = this.commands.find(
            (registeredCommand: Command) => {
                return (
                    registeredCommand.name === commandName ||
                    registeredCommand.aliases.includes(commandName)
                );
            },
        );

        // Check if a command was found
        if (foundCommand === undefined) {
            // Throw an error when no command matched the command name
            throw `No command with the name or alias ${commandName} found`;
        }

        // Find the correct sub command by the given command arguments
        const subCommand = this.findSubCommand(foundCommand, commandArguments);

        // Define the variable for the command
        // which should be executed
        let commandToExecute: Command;

        // Check if a sub command was found
        if (subCommand === undefined) {
            // A sub command was not found, so we assign the existing command
            commandToExecute = foundCommand;
        } else {
            // A sub command was found, so we assign it instead of the existing command
            commandToExecute = subCommand;
        }

        // Execute the found command with the given project configuration and additional command arguments
        await commandToExecute.execute(projectSpecification, commandArguments);
    }

    /**
     * Finds the correct sub command from all registered commands
     *
     * @private
     * @param {Command} currentCommand The current command which was determined by the CLI
     * @param {string[]} commandArguments The command arguments
     * @return {(Command | undefined)} The found command or undefined
     * @memberof CommandManager
     */
    private findSubCommand(
        currentCommand: Command,
        commandArguments: string[],
    ): Command | undefined {
        // Extract the sub command name
        const subCommandName = commandArguments[0];

        // Find the sub command by its name in the sub commands from the current command
        const foundSubCommand = currentCommand.subCommands.find(
            (subCommand) => {
                return (
                    subCommand.name === subCommandName ||
                    subCommand.aliases.includes(subCommandName)
                );
            },
        );

        // Check if we found a sub command
        if (foundSubCommand === undefined) {
            // A sub command was not found so we return undefined
            return undefined;
        }

        // Take one command argument since we want to find other sub-sub-sub-...-commands
        commandArguments.shift();

        // Search for more sub commands!
        const subSubCommand = this.findSubCommand(
            foundSubCommand,
            commandArguments.slice(1),
        );

        // Return the found sub command or undefined when none was found
        return subSubCommand === undefined ? foundSubCommand : subSubCommand;
    }

    /**
     * Checks if the given command is already registered
     *
     * @private
     * @param {Command} command The command that should be checked
     * @return {boolean} True when the command is already registered
     * @memberof CommandManager
     */
    private isCommandRegistered(command: Command): boolean {
        return this.commands.some((registeredCommand) => {
            return (
                registeredCommand.name === command.name ||
                registeredCommand.aliases.includes(command.name)
            );
        });
    }
}
