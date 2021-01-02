import { Command } from '@packagaya/command/dist/Command';
import { CommandManager } from '@packagaya/command/dist/CommandManager';
import { GenerateCommand } from '@packagaya/command/dist/commands/GenerateCommand';
import { SyncCommand } from '@packagaya/command/dist/commands/SyncCommand';
import { ExecuteCommand } from '@packagaya/command/dist/commands/SyncCommand/ExecuteCommand';
import { InfoCommand } from '@packagaya/command/dist/commands/SyncCommand/InfoCommand';
import { ContainerModule } from 'inversify';

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
            bind(Command).to(GenerateCommand);

            bind(InfoCommand).toSelf();
            bind(ExecuteCommand).toSelf();
        });
    }
}
