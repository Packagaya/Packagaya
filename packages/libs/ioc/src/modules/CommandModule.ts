import { ContainerModule } from 'inversify';
import { CommandManager } from '@packagaya/command/dist/CommandManager';
import { Command } from '@packagaya/command/dist/Command';
import { SyncCommand } from '@packagaya/command/dist/commands/SyncCommand';

/**
 * Defines an IoC container module for the command package
 *
 * @export
 * @class CommandModule
 * @extends {ContainerModule}
 */
export class CommandModule extends ContainerModule {
    constructor() {
        super((bind) => {
            // Bind the command manager to the container
            bind(CommandManager).toSelf().inSingletonScope();

            // Bind the "sync" command to the container
            bind(Command).to(SyncCommand);
        });
    }
}
