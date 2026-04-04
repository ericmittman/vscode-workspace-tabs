// src/test/WorkspaceRegistry.test.ts
import * as assert from 'assert';
import { WorkspaceRegistry } from '../WorkspaceRegistry';

/** Minimal mock of vscode.Memento */
class MockMemento {
  private store: Record<string, unknown> = {};
  get<T>(key: string, defaultValue: T): T {
    return (this.store[key] as T) ?? defaultValue;
  }
  update(key: string, value: unknown): Thenable<void> {
    this.store[key] = value;
    return Promise.resolve();
  }
}

describe('WorkspaceRegistry', () => {
  let registry: WorkspaceRegistry;

  beforeEach(() => {
    registry = new WorkspaceRegistry(new MockMemento());
  });

  it('starts empty', () => {
    assert.deepStrictEqual(registry.getAll(), []);
  });

  it('adds a workspace and derives name from filename', () => {
    registry.add('/Users/eric/repos/claude-app/claude-app.code-workspace');
    const entries = registry.getAll();
    assert.strictEqual(entries.length, 1);
    assert.strictEqual(entries[0].name, 'claude-app');
    assert.strictEqual(entries[0].path, '/Users/eric/repos/claude-app/claude-app.code-workspace');
    assert.strictEqual(entries[0].color, '#4ec9b0'); // first palette color
  });

  it('assigns different colors to successive workspaces', () => {
    registry.add('/a/one.code-workspace');
    registry.add('/b/two.code-workspace');
    const entries = registry.getAll();
    assert.notStrictEqual(entries[0].color, entries[1].color);
  });

  it('does not add a duplicate path', () => {
    registry.add('/a/one.code-workspace');
    registry.add('/a/one.code-workspace');
    assert.strictEqual(registry.getAll().length, 1);
  });

  it('removes a workspace by path', () => {
    registry.add('/a/one.code-workspace');
    registry.add('/b/two.code-workspace');
    registry.remove('/a/one.code-workspace');
    const entries = registry.getAll();
    assert.strictEqual(entries.length, 1);
    assert.strictEqual(entries[0].name, 'two');
  });

  it('remove is a no-op for unknown path', () => {
    registry.add('/a/one.code-workspace');
    registry.remove('/x/unknown.code-workspace');
    assert.strictEqual(registry.getAll().length, 1);
  });
});
