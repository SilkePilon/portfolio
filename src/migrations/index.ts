import * as migration_20260826_175201_initial from './20260826_175201_initial';
import * as migration_20260827_083528_full_cms from './20260827_083528_full_cms';
import * as migration_20260828_191551_showcase_app from './20260828_191551_showcase_app';

export const migrations = [
  {
    up: migration_20260826_175201_initial.up,
    down: migration_20260826_175201_initial.down,
    name: '20260826_175201_initial',
  },
  {
    up: migration_20260827_083528_full_cms.up,
    down: migration_20260827_083528_full_cms.down,
    name: '20260827_083528_full_cms',
  },
  {
    up: migration_20260828_191551_showcase_app.up,
    down: migration_20260828_191551_showcase_app.down,
    name: '20260828_191551_showcase_app'
  },
];
