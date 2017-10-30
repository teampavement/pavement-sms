export const single = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "street_name": "Mercer",
        "street_suffix": "Street",
        "permit_zone": 1,
        "streets_between": [
          {
            "street_name": "Jersey",
            "street_suffix": "Avenue"
          },
          {
            "street_name": "Barrow",
            "street_suffix": "Street"
          }
        ],
        "signs": [
          {
            "sign_title": "No Parking",
            "sign_applies_to_permit_holder": true,
            "sign_time_range": [
              {
                "start_time": "0800",
                "end_time": "1000"
              }
            ],
            "sign_days": [
              "Tu",
              "F"
            ]
          }
        ]
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [
            -74.0474224090576,
            40.719263904730404
          ],
          [
            -74.0458908677101,
            40.718788207573766
          ]
        ]
      }
    },
    ]
};
