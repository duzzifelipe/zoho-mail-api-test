const request = require('request')
const async = require('async')
const prompt = require('prompt');
const colors = require('colors');
const URL = 'https://mail.zoho.com/api'

class ZohoAuth {
    _baseRequest (base, method, resource, auth) {
        request({
            method,
            url: `${base}/${resource}`,
            headers: {
                'Authorization': `Zoho-authtoken ${auth}`
            }
        })
    }

    getAccessToken (user, password, cb) {
        request({
            method: 'GET',
            url: `https://accounts.zoho.com/apiauthtoken/nb/create?SCOPE=ZohoMail/ZohoMailAPI&EMAIL_ID=${user}&PASSWORD=${password}`

        }, (e, r, b) => {
            cb(e, b)
        })
    }

    showAccounts (auth, cb) {
        request({
            method: 'GET',
            url: `${URL}/accounts`,
            headers: {
                'Authorization': `Zoho-authtoken ${auth}`
            }

        }, (e, r, b) => {
            cb(e, b)
        })
    }

    sendMessage (accountId, auth, message, cb) {
        request.post({
            url: `${URL}/accounts/${accountId}/messages`,
            headers: {
                'Authorization': `Zoho-authtoken ${auth}`
            },
            json: message

        }, (e, r, b) => {
            cb(e, b)
        })
    }

    getMessages () {
        // TODO
    }

    getSingleMessage () {
        // TODO
    }
}

/*
 * =======================================================
 * RUN
 * ======================================================== 
 */

// Zoho API object
let auth = new ZohoAuth();
let email;
let token;

async.waterfall([
    (callback) => {
        // configure prompt variables
        const schema = {
            properties: {
                email: { required: true, message: 'Your zoho account email' },
                password: { hidden: true, required: true, message: 'Zoho email password' }
            }
        };

        // get prompt variables
        prompt.get(schema, (err, result) => {
            email = result.email; // global

            // generate access token
            auth.getAccessToken(email, result.password, callback)
        })

    },
    (result, callback) => {
        console.log('Based on the response bellow: '.red)
        console.log(result)
        console.log('Enter your AUTHTOKEN:'.green)

        prompt.get(['token'], (err, result) => {
            token = result.token; // global

            // show account
            auth.showAccounts(token, callback)
        })
    },
    (result, callback) => {
        console.log('Based on the response bellow: '.red)
        console.log(result)
        console.log('Enter your account ID and the email to send:'.green)

        prompt.get(['accountId', 'to', 'subject', 'message'], (err, result) => {
            // show account
            let message = {
                fromAddress: email,
                toAddress: result.to,
                subject: result.subject,
                content: result.message
            };

            auth.sendMessage(result.accountId, token, message, callback)
        })
    }

], (error, result) => {
    console.log(error)
    console.log(result)
})