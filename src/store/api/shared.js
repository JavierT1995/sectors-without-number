import { pickBy, size } from 'lodash';

import {
  userModelSelector,
  userUidSelector,
  currentSectorSelector,
} from 'store/selectors/base.selectors';
import {
  getCurrentEntities,
  getCurrentEntityType,
} from 'store/selectors/entity.selectors';
import { isCurrentSectorSaved } from 'store/selectors/sector.selectors';
import { mergeEntityUpdates } from 'utils/entity';

import { deleteEntities as localDeleteEntities } from 'store/api/local';
import {
  uploadEntities,
  deleteEntities as syncDeleteEntities,
  updateEntities as syncUpdateEntities,
} from 'store/api/firebase';
import { SuccessToast, ErrorToast } from 'utils/toasts';
import Entities from 'constants/entities';

export const deleteEntities = ({ state, deleted }, intl) => {
  const isLoggedIn = !!userModelSelector(state);
  const isSaved = isCurrentSectorSaved(state);
  const currentEntityType = getCurrentEntityType(state);
  if (!isSaved) {
    return Promise.resolve();
  }
  let promise;
  if (isLoggedIn) {
    promise = syncDeleteEntities(deleted);
  } else if (currentEntityType === Entities.sector.key) {
    promise = localDeleteEntities(deleted);
  } else {
    return Promise.resolve();
  }
  const entityName = intl.formatMessage({
    id: Entities[currentEntityType].name,
  });
  return promise
    .then(() => ({
      action: SuccessToast({
        title: intl.formatMessage(
          { id: 'misc.entityDeleted' },
          { entity: entityName },
        ),
        message: intl.formatMessage(
          { id: 'misc.successfullyRemoved' },
          { entity: entityName },
        ),
      }),
    }))
    .catch(err => {
      console.error(err);
      return {
        action: ErrorToast({
          title: intl.formatMessage({ id: 'misc.error' }),
          message: intl.formatMessage({ id: 'misc.reportProblemPersists' }),
        }),
      };
    });
};

export const saveEntities = (
  { state, updated, created, deleted, entities },
  intl,
) => {
  const uid = userUidSelector(state);
  const isSaved = isCurrentSectorSaved(state);
  let promise;
  if (isSaved) {
    if (uid) {
      promise = Promise.all([
        uploadEntities(created, uid, currentSectorSelector(state)),
        syncDeleteEntities(deleted),
        syncUpdateEntities(updated),
      ]).then(([uploaded]) => ({ mapping: uploaded.mapping }));
    } else {
      return Promise.resolve();
    }
  } else {
    const updates = pickBy(
      mergeEntityUpdates(getCurrentEntities(state), entities),
      size,
    );
    if (uid) {
      promise = uploadEntities(updates, uid);
    } else {
      return Promise.resolve();
    }
  }
  return promise
    .then(({ mapping }) => ({
      action: SuccessToast({
        title: intl.formatMessage({ id: 'misc.sectorSaved' }),
        message: intl.formatMessage({ id: 'misc.yourSectorSaved' }),
      }),
      mapping,
    }))
    .catch(err => {
      console.error(err);
      return {
        action: ErrorToast({
          title: intl.formatMessage({ id: 'misc.error' }),
          message: intl.formatMessage({ id: 'misc.reportProblemPersists' }),
        }),
      };
    });
};
