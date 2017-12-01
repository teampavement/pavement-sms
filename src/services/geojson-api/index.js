import {ph} from '../../constants/ph';
import {vvp} from '../../constants/vvp';
import {hp} from '../../constants/hp';
import {hc} from '../../constants/hc';
import {tv} from '../../constants/tv';
import {padna} from '../../constants/padna';
import {single} from '../../constants/single';
// const segments = [single.features];
// const segments = [ph.features, vvp.features];
const segments = [
  ph.features,
  vvp.features,
  hp.features,
  hc.features,
  tv.features,
  padna.features
];
let features = segments.reduce((a,b) => a.concat(b), []);

const jc = {
  type: "FeatureCollection",
  features: features
};

export default () => jc;
