import React from 'react';
import { fullDayNames } from '../constants/days'

export default {
  // canParkAtCurrentTime() {
  //
  // }

  fullStreetName: (geoJSON) => {
    return `${geoJSON.properties.street_name} ${geoJSON.properties.street_suffix}`;
  },

  signSummaryText: (geoJSON) => {
    return `${geoJSON.properties.sign_summary_text}`;
  },

  streetsBetweenNames: (geoJSON) => {
    if (!geoJSON.properties.streets_between ||
        geoJSON.properties.streets_between.length === 0) {
      return "";
    }

    let output = `Between`;
    geoJSON.properties.streets_between.map((street, index, arr) => {
      if (index === arr.length-1 && arr.length > 1) {
        output += ` and ${street.street_name} ${street.street_suffix}`;
      } else if (index === arr.length-2 && arr.length > 1) {
        output += ` ${street.street_name} ${street.street_suffix}`;
      } else {
        output += ` ${street.street_name} ${street.street_suffix},`;
      }
    });
    return output;
  },

  rules: (geoJSON) => {
    let output;
    let parkingZone = geoJSON.properties.permit_zone;
    return (
      <ul>
        { geoJSON.properties.signs &&
          geoJSON.properties.signs.map((rule) => {
            if (!rule.sign_time_range || rule.sign_time_range.length < 1) {
              return;
            }
            const startTimeParts = {
              hour: (rule.sign_time_range[0].start_time.substring(0,2)),
              minute: (rule.sign_time_range[0].start_time.substring(2)),
            };
            const endTimeParts = {
              hour: (rule.sign_time_range[0].end_time.substring(0,2)),
              minute: (rule.sign_time_range[0].end_time.substring(2)),
            };

            if (rule.duration) {
              return (<div>
                <span>
                  {rule.sign_title} from {startTimeParts.hour}:{startTimeParts.minute}
                  to {endTimeParts.hour}:{endTimeParts.hour}
                </span>
                <span>
                  ${rule.sign_days.join(", ")}
                </span>
                <span>
                  {rule.sign_applies_to_permit_holder ?
                    null
                    : 'Only for non-permit holders'
                  }
                </span>
              </div>)
            }

            if (rule.sign_time_range) {
              return (<div>
                <div>
                  {rule.sign_title}
                </div>
                <div>
                  from {startTimeParts.hour}:{startTimeParts.minute}
                   to {endTimeParts.hour}:{endTimeParts.minute}
                </div>
                <div>
                  {rule.sign_days.map(day => fullDayNames[day]).join(", ")}
                </div>
                <div>

                </div>
              </div>);
            }

          })
        }
      </ul>
    )
  }

}
