export const INITIALIZED_APPLICATION: 'INITIALIZED_APPLICATION' =
  'INITIALIZED_APPLICATION';
export const UNINITIALIZED_APPLICATION: 'UNINITIALIZED_APPLICATION' =
  'UNINITIALIZED_APPLICATION';
export const TIME_IS_WACK: 'TIME_IS_WACK' = 'TIME_IS_WACK';

export const createApplicationInitializedEvent = () => ({
  type: INITIALIZED_APPLICATION,
});

export const createApplicationUnInitializedEvent = () => ({
  type: UNINITIALIZED_APPLICATION,
});

export const createOutOfSyncEvent = () => ({
  type: TIME_IS_WACK,
});
