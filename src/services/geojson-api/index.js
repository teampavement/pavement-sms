import {downtown} from '../../constants/downtown';
const segments = [
  downtown.features
];
let features = segments.reduce((a,b) => a.concat(b), []);

const jc = {
  type: "FeatureCollection",
  features: features
};

export default () => jc;
