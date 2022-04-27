import fetch from "node-fetch"

for(let i = 1; i < 5000; i++){
  let body = 
  `firstName=${i}&middleName=dummy&lastName=lastname&gender=male&genderOther=&dateOfBirth=2002-03-23&landline=2212&mobile=3123&email=12312&addressHouseNumber=123321&addressLineOne=123321&addressLineTwo=321213&addressCity=123212&addressPostcode=2312123&NHSNumber=123&patientType=private&GPName=12321&GPAddress=32123&notes=12313`
  
  fetch("http://127.0.0.1:5500/patient/add/", {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "cookie": "connect.sid=s%3AsJqfJiDVyv3wXzT98AduoSQ5cTd3nZaw.NbdCmYLrWIWww%2F0szmpPM7Yrl5XFPFxN68IU%2Fc45l4g",
      "Referer": "http://127.0.0.1:5500/patient/add/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": body,
    "method": "POST"
  })
}

console.log("done")