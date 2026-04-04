import * as vscode from 'vscode';
import { WorkspaceRegistry } from './WorkspaceRegistry';
import { TabBarPanel } from './TabBarPanel';

export function activate(context: vscode.ExtensionContext): void {
  const registry = new WorkspaceRegistry(context.globalState);

  // TabBarPanel is assigned after commands are registered so the
  // addWorkspace command can call tabBar.refresh() via closure.
  let tabBar: TabBarPanel;

  const addWorkspace = async (): Promise<void> => {
    const uris = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: { 'VS Code Workspace': ['code-workspace'] },
      title: 'Add Workspace to Window',
    });
    if (!uris || uris.length === 0) { return; }
    registry.add(uris[0].fsPath);
    tabBar.refresh();
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('workspaceTabs.addWorkspace', addWorkspace),

    vscode.commands.registerCommand('workspaceTabs.removeWorkspace', async () => {
      const entries = registry.getAll();
      if (entries.length === 0) {
        vscode.window.showInformationMessage('No workspaces registered.');
        return;
      }
      const pick = await vscode.window.showQuickPick(
        entries.map(e => ({ label: e.name, description: e.path })),
        { title: 'Remove Workspace from Window', placeHolder: 'Select a workspace to remove' }
      );
      if (!pick) { return; }
      registry.remove(pick.description!);
      tabBar.refresh();
    }),

    vscode.commands.registerCommand('workspaceTabs.show', () => {
      tabBar.refresh();
    })
  );

  tabBar = new TabBarPanel(registry, context, addWorkspace);
}

export function deactivate(): void {}
