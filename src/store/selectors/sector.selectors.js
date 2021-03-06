import { createSelector } from 'reselect';

import {
  isInitializedSelector,
  currentSectorSelector,
  sectorSelector,
  savedSectorSelector,
  shareSectorSelector,
  fetchedSectorSelector,
  playerViewSelector,
} from 'store/selectors/base.selectors';
import { omitBy, includes } from 'constants/lodash';

export const getUserSectors = createSelector(
  [sectorSelector, savedSectorSelector],
  (sectors, saved) => omitBy(sectors, (sector, key) => !includes(saved, key)),
);

export const isCurrentSectorSaved = createSelector(
  [currentSectorSelector, savedSectorSelector],
  (currentSector, saved) => includes(saved, currentSector),
);

export const isCurrentSectorFetched = createSelector(
  [currentSectorSelector, fetchedSectorSelector],
  (currentSector, fetched) => includes(fetched, currentSector),
);

export const isSharedSector = createSelector(
  [currentSectorSelector, shareSectorSelector],
  (currentSector, share) => currentSector === share,
);

export const isViewingSharedSector = createSelector(
  [isSharedSector, playerViewSelector],
  (isShared, isPlayerView) => isShared || isPlayerView,
);

export const currentSectorIsLoading = createSelector(
  [isInitializedSelector, isCurrentSectorFetched],
  (isInitialized, isCurrentFetched) => !isInitialized || !isCurrentFetched,
);
