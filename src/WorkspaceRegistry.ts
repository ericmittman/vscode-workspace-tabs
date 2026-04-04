import { WorkspaceEntry } from './types';
import { assignColor } from './colors';

const REGISTRY_KEY = 'workspaceTabs.registry';
const COUNT_KEY = 'workspaceTabs.totalAdded';

interface Memento {
  get<T>(key: string, defaultValue: T): T;
  update(key: string, value: unknown): Thenable<void>;
}

export class WorkspaceRegistry {
  constructor(private state: Memento) {}

  getAll(): WorkspaceEntry[] {
    return this.state.get<WorkspaceEntry[]>(REGISTRY_KEY, []);
  }

  add(filePath: string): void {
    const entries = this.getAll();
    if (entries.some(e => e.path === filePath)) {
      return; // no duplicates
    }
    const filename = filePath.split(/[\\/]/).pop() ?? filePath;
    const name = filename.replace(/\.code-workspace$/, '');
    const totalAdded = this.state.get<number>(COUNT_KEY, 0);
    const color = assignColor(totalAdded);
    this.state.update(COUNT_KEY, totalAdded + 1);
    this.state.update(REGISTRY_KEY, [...entries, { name, path: filePath, color }]);
  }

  remove(filePath: string): void {
    const entries = this.getAll().filter(e => e.path !== filePath);
    this.state.update(REGISTRY_KEY, entries);
  }
}
