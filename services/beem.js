const axios = require("axios");
const https = require("https");
var btoa = require("btoa");

const api_key = process.env.BEEM_API_KEY;
const secret_key = process.env.BEEM_SECRET_KEY;
const content_type = "application/json";
const source_addr = process.env.SOURCE_ADDRESS;

const formatPhoneNumber = (phoneNumber) => {
    if (String(phoneNumber).startsWith('0')) {
        return '255' + phoneNumber.substring(1);
    }
    return phoneNumber;
};

function send_sms(message, recipients) {
    axios
        .post(
            "https://apisms.beem.africa/v1/send",
            {
                source_addr: source_addr,
                schedule_time: "",
                encoding: 0,
                message: message,
                recipients: recipients.map((phone, index) => ({
                    recipient_id: index + 1,
                    dest_addr: formatPhoneNumber(phone?.phone),
                }))
            },
            {
                headers: {
                    "Content-Type": content_type,
                    Authorization: "Basic " + btoa(api_key + ":" + secret_key),
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            }
        )
        .then((response) => console.log("SMS sent:", response.data))
        .catch((error) => console.error("SMS error:", error.response.data));
}

module.exports = send_sms;
