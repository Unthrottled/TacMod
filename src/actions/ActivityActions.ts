import {
  createStartedActivityEvent,
  createStartedNonTimedActivityEvent,
  createStartedTimedActivityEvent
} from "../events/ActivityEvents";
import {ActivityContent} from "../types/ActivityTypes";


export const
  startTimedActivity = (activityContent: ActivityContent) =>
    (dispetch: any) => {
      dispetch(createStartedActivityEvent(activityContent)); // to the backend event
      dispetch(createStartedTimedActivityEvent(activityContent)); // internal event
    };

export const
  startNonTimedActivity = (activityContent: ActivityContent) =>
    (dispetch: any) => {
      dispetch(createStartedActivityEvent(activityContent)); // to the backend event
      dispetch(createStartedNonTimedActivityEvent(activityContent)); // internal event
    };
