import {ph} from '../../constants/ph';
import {vvp} from '../../constants/vvp';
import {single} from '../../constants/single';
// const segments = [single.features];
const segments = [ph.features, vvp.features];
let features = segments.reduce((a,b) => a.concat(b), []);

const jc = {
  type: "FeatureCollection",
  features: features
};

export default () => jc;
