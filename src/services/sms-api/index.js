import fetch from 'isomorphic-fetch'
import StreetToString from '../../common/street-to-string';

const SHEETS_API = `https://script.google.com/macros/s/AKfycbyDa9H_r4ULJ_qJiL8DkEVrgDHsPavDj1TwlH32eFCp8OzH_Jd2/exec`;

const paramStringBuilder = (obj) => {
  let output = '';

  if (!obj) {
    return output;
  }
  Object.keys(obj).forEach((key) => {
    output += key + '=' + obj[key] + '&';
  });
  return output;
}

const getRequestURLBuilder = (body) => {
  return SHEETS_API + '?' + paramStringBuilder(body);
};



export default (endpoint, method, body) => {
  if (method === 'POST') {
    let streetName = StreetToString.fullStreetName(body.street);
    let signSummaryText = StreetToString.signSummaryText(body.street);
    let requestURL = getRequestURLBuilder({
      phone: body.phone,
      street: streetName,
      sign_summary_text: signSummaryText
    });
    window.analytics.track('schedule text', {
      phone: body.phone,
      street: body.street
    });
    return fetch(`${requestURL}`, {
      method: 'POST',
    });
  }
};
