import { IConfig } from '@packagaya/config/dist/IConfig';
import { injectable, unmanaged } from 'inversify';

/**
 * Defines a basic command
 *
 * @export
 * @interface Command
 */
@injectable()
export abstract class Command {
    /**
     * Creates an instance of Command.
     * @param {string} name The name of the command
     * @param {string[]} aliases The defined aliases for the command
     * @param {Command[]} subCommands Optional sub commands of the command
     * @param {string} help The help definition for the command
     * @memberof Command
     */
    protected constructor(
        @unmanaged() public readonly name: string,
        @unmanaged() public readonly aliases: string[],
        @unmanaged() public readonly subCommands: Command[],
        @unmanaged() public readonly help: string,
    ) {}

    /**
     * Executes the current command
     *
     * NOTE: Before the command is executed, the CommandManager checks if the command has any other subcommands
     *
     * @memberof ICommand
     */
    public abstract execute(
        projectSpecification: IConfig,
        commandArguments: string[],
    ): Promise<void>;
}
