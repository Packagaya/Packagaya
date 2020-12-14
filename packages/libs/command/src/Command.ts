import { injectable, unmanaged } from 'inversify';
import { IConfig } from '@packagaya/config/dist/IConfig';

/**
 * Defines a basic command
 *
 * @export
 * @interface Command
 */
@injectable()
export abstract class Command {
    /**
     * The name of the command
     *
     * @type {string}
     * @memberof ICommand
     */
    public readonly name: string;

    /**
     * The aliases of the command
     *
     * @type {string[]}
     * @memberof ICommand
     */
    public readonly aliases: string[];

    /**
     * The subcommands of the command
     *
     * @type {Command[]}
     * @memberof ICommand
     */
    public readonly subCommands: Command[];

    protected constructor(
        @unmanaged() name: string,
        @unmanaged() aliases: string[],
        @unmanaged() subCommands: Command[],
    ) {
        this.name = name;
        this.aliases = aliases;
        this.subCommands = subCommands;
    }

    /**
     * Executes the current command
     *
     * @memberof ICommand
     */
    public abstract execute(
        projectSpecification: IConfig,
        commandArguments: string[],
    ): Promise<void>;
}
