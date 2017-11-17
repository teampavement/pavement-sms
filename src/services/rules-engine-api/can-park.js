import moment from 'moment';
import { dayIndex } from '../../constants/days';

const canParkAPI = (body) => {
  /*
   * body.currentTime
   * body.streetNearestToCenter
  */
  /*
    strategy here:
    - iterate over all the signs a street has
    - assume all signs are negative (can't park during duration)
    - using current DateTime (across all signs), check to see if
      DateTime value is in any sign's range:
      if true, short circuit and return false
      else, return true
  */
  let dateObj;
  if (!body.currentTime) {
    dateObj = moment();
  } else {
    dateObj = moment(body.currentTime);
  }

  if (body.streetNearestToCenter
    && body.streetNearestToCenter.properties.signs) {

    let followsAllRestrictions = ((dateObj) => {
        const weekday = dateObj.day();
        const permitZone = body.streetNearestToCenter.properties.permit_zone;

        return body.streetNearestToCenter.properties.signs.every((sign) => {
          let followsRestrictions = true;

          let daysActive = sign.sign_days.map(day => dayIndex[day]);
          if (!daysActive.includes(weekday)) {
            // if this sign isn't active today, you can park
            followsRestrictions = true;
          } else {
            // no parking in range
            if (sign.sign_time_range && sign.sign_time_range.length > 0) {
              if (sign.sign_duration) {
                return true;
              }
              // multiple ranges, need to do an .every
               followsRestrictions = sign.sign_time_range.every((range) => {
                  let timeRangeAsDate = signTimeRangeToDate(range);
                  return !(moment(dateObj).isBetween(
                    timeRangeAsDate.startTime,
                    timeRangeAsDate.endTime
                  ));
              });
            }

            // time limit
            if (sign.sign_duration) {
              //TODO - store parked timestamp in localstorage
              //check current timestamp against stored
              //if (stored + sign_duration < current) show warning
            }

          }
          return followsRestrictions;
        });
    })(dateObj);

    return followsAllRestrictions;
  }
}

const signTimeRangeToDate = (signTimeRange) => {
  let output = {};
  const startTimeParts = {
    hour: (signTimeRange.start_time.substring(0,2)),
    minute: (signTimeRange.start_time.substring(2)),
  };
  const endTimeParts = {
    hour: (signTimeRange.end_time.substring(0,2)),
    minute: (signTimeRange.end_time.substring(2)),
  };

  const startTimeAsDate = moment(
    `${startTimeParts.hour}:${startTimeParts.minute}`,
    'HH:mm'
  );

  const endTimeAsDate = moment(
    `${endTimeParts.hour}:${endTimeParts.minute}`,
    'HH:mm'
  );

  output.startTime = startTimeAsDate;
  output.endTime = endTimeAsDate;
  return output;
};

export default canParkAPI;
