import fetch from "node-fetch"

const NUMBER = 136
const COOKIE = "connect.sid=s%3AsJqfJiDVyv3wXzT98AduoSQ5cTd3nZaw.NbdCmYLrWIWww%2F0szmpPM7Yrl5XFPFxN68IU%2Fc45l4g"


for (let i = 0; i < NUMBER; i++) {
  
  let p = await fetch("https://randomuser.me/api/?nat=gb").then(results => results.json())
  p = p.results[0]
  
  let NHSNum = "NHS" + (Math.floor(Math.random()*900000) + 100000)
  let nhs = Math.round(Math.random()) ? "NHS" : "private"
  let landline = p.phone.replaceAll("(","").replaceAll(")","").replaceAll(" ","").replaceAll("-","")
  let mobile = p.cell.replaceAll("(","").replaceAll(")","").replaceAll(" ","").replaceAll("-","")

  
  let body =
    `firstName=${p.name.first}&middleName=&lastName=${p.name.last}&gender=${p.gender}&genderOther=&dateOfBirth=${p.dob.date.substring(0,10)}&landline=${landline}&mobile=${mobile}&email=${p.email}&addressHouseNumber=${p.location.street.number}&addressLineOne=${p.location.street.name}&addressLineTwo=&addressCity=${p.location.city}&addressPostcode=${p.location.postcode}&NHSNumber=${NHSNum}&patientType=${nhs}&GPName=Dr+Smith&GPAddress=32+West+Drive&notes=`

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
      "cookie": COOKIE,
      "Referer": "http://127.0.0.1:5500/patient/add/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": body,
    "method": "POST"
  })
}

console.log("done")