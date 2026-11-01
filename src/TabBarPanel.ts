import * as vscode from 'vscode';
import { WorkspaceRegistry } from './WorkspaceRegistry';
import { hexToRgba } from './colors';
import { WorkspaceEntry } from './types';

export class TabBarPanel {
  private panel!: vscode.WebviewPanel;
  private disposed = true;

  constructor(
    private registry: WorkspaceRegistry,
    private context: vscode.ExtensionContext,
    private onAddWorkspace: () => void
  ) {
    this.createPanel();
  }

  private createPanel(): void {
    this.panel = vscode.window.createWebviewPanel(
      'workspaceTabs',
      'Workspaces',
      { viewColumn: vscode.ViewColumn.One, preserveFocus: false },
      { enableScripts: true, retainContextWhenHidden: true }
    );
    this.disposed = false;
    this.context.subscriptions.push(this.panel);

    this.panel.onDidDispose(() => {
      this.disposed = true;
    });

    this.panel.webview.onDidReceiveMessage(
      (msg: { command: string; path?: string }) => {
        if (msg.command === 'switchWorkspace' && msg.path) {
          vscode.commands.executeCommand(
            'vscode.openFolder',
            vscode.Uri.file(msg.path),
            { forceReuseWindow: true }
          );
        } else if (msg.command === 'addWorkspace') {
          this.onAddWorkspace();
        }
      },
      undefined,
      this.context.subscriptions
    );

    this.renderHtml();
  }

  refresh(): void {
    if (this.disposed) {
      this.createPanel();
    } else {
      this.renderHtml();
    }
  }

  private renderHtml(): void {
    const entries = this.registry.getAll();
    const activePath = vscode.workspace.workspaceFile?.fsPath;
    this.panel.webview.html = this.buildHtml(entries, activePath);
  }

  private buildHtml(entries: WorkspaceEntry[], activePath: string | undefined): string {
    const emptyHint = entries.length === 0
      ? `<span class="empty-hint">No workspaces — click + to add one</span>`
      : '';
    const tabs = entries.map(e => {
      const isActive = e.path === activePath;
      const bg = isActive ? hexToRgba(e.color, 0.15) : 'transparent';
      const borderColor = isActive ? e.color : 'transparent';
      const textColor = isActive ? '#ffffff' : '#888888';
      const safePathAttr = e.path.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      return `<div class="tab${isActive ? ' active' : ''}"
                   data-path="${safePathAttr}"
                   style="background:${bg};border-bottom:3px solid ${borderColor};color:${textColor};"
                   >${escapeHtml(e.name)}</div>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #252526;
    display: flex;
    align-items: stretch;
    font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
    font-size: 13px;
    overflow: hidden;
    height: 100vh;
  }
  .tab {
    padding: 6px 16px;
    cursor: pointer;
    white-space: nowrap;
    border-bottom: 3px solid transparent;
    user-select: none;
    display: flex;
    align-items: center;
  }
  .tab:hover { background: rgba(255,255,255,0.07) !important; }
  .empty-hint {
    display: flex;
    align-items: center;
    padding: 6px 16px;
    color: #888;
    font-style: italic;
  }
  .add-btn {
    padding: 6px 12px;
    color: #cccccc;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 18px;
    line-height: 1;
  }
  .add-btn:hover { color: #ffffff; }
</style>
</head>
<body>
  ${tabs}
  ${emptyHint}
  <div class="add-btn" title="Add Workspace to Window">+</div>
  <script>
    const vscode = acquireVsCodeApi();
    document.querySelectorAll('.tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        vscode.postMessage({ command: 'switchWorkspace', path: tab.dataset.path });
      });
    });
    document.querySelector('.add-btn').addEventListener('click', function() {
      vscode.postMessage({ command: 'addWorkspace' });
    });
  </script>
</body>
</html>`;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
