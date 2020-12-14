import { ContainerModule } from 'inversify';
import { CommandManager } from '@packagaya/command/dist/CommandManager';
import { Command } from '@packagaya/command/dist/Command';
import { SyncCommand } from '@packagaya/command/dist/commands/SyncCommand';

export class CommandModule extends ContainerModule {
    constructor() {
        super((bind) => {
            bind(CommandManager).toSelf().inSingletonScope();

            bind(Command).to(SyncCommand);
        });
    }
}
