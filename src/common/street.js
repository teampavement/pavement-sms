export default class Street {
  constructor(geoJSON) {
    this.geoJSON = geoJSON;
  }

  canParkAtCurrentTime() {

  }

  fullStreetName() {
    return `${this.geoJSON.properties.street_name} ${this.geoJSON.properties.street_suffix}`;
  }

  streetsBetweenNames() {
    if (!this.geoJSON.properties.streets_between ||
        this.geoJSON.properties.streets_between.length === 0) {
      return "";
    }

    let output = `Between`;
    this.geoJSON.properties.streets_between.map((street, index, arr) => {
      if (index === arr.length-1 && arr.length > 1) {
        output += ` and ${street.street_name} ${street.street_suffix}`;
      } else if (index === arr.length-2 && arr.length > 1) {
        output += ` ${street.street_name} ${street.street_suffix}`;
      } else {
        output += ` ${street.street_name} ${street.street_suffix},`;
      }
    });
    return output;
  }


}
