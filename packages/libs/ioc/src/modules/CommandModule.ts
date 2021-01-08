import { Command } from '@packagaya/command/dist/Command';
import { CommandManager } from '@packagaya/command/dist/CommandManager';
import { GenerateCommand } from '@packagaya/command/dist/commands/GenerateCommand';
import { HelpCommand } from '@packagaya/command/dist/commands/HelpCommand';
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
            bind(CommandManager.name).to(CommandManager).inSingletonScope();

            bind(HelpCommand.name).to(HelpCommand);

            // Bind the "sync" command to the container
            bind(Command.name).to(SyncCommand);
            bind(Command.name).to(GenerateCommand);

            bind(InfoCommand.name).to(InfoCommand);
            bind(ExecuteCommand.name).to(ExecuteCommand);
        });
    }
}
