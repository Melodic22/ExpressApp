/* This file stores all the input validation methods and sanitisation */

//validates password - compares password against a list of dissallowed common passwords, and against the NIST min and max lengths
function validatePassword(password) {

    const commonPasswords = ['123456', '123456789','qwerty','password','12345','qwerty123','1q2w3e','12345678','111111','1234567890'];

    commonPasswords.forEach(commonPass => {
        if (password === commonPass) {
            return false;
        }
    });

    if (password.length > 7 && password.length < 65) {
        return true;
    } else {
        return false;
    }
};

//check that the firstname and username are not empty
function validateName(name) {
    return (name.length > 0)
}

function validateType(type) {
    return (type === 'student' || type === 'staff');

}

function validateEmail(email) {

    // const regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/;
    const regex = /^[A-Za-z0-9+_.-]+@(.+)$/;

    if (email.match(regex)) {
        console.log('email matches');
        return true;
    } else {
        return false;
    }
}

//validate that the start time is before the end time
function validateTimes(start, end) {
    if (start === undefined || end === undefined) {
        return false;
    } else {
        return (start < end);
    }
    
}

//function mostly lifted from https://stackoverflow.com/questions/2794137/sanitizing-user-input-before-adding-it-to-the-dom-in-javascript to
//sanitise any inputs to the website to mitigate cross site scripting
function sanitise(string) {

    //if input value was empty
    if (string === undefined) {
        return string;
    }

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match)=>(map[match]));
}

function sanitiseDate(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
    };
    const reg = /[&<>"']/ig;
    return string.replace(reg, (match)=>(map[match]));
}

module.exports = {validatePassword, sanitise, sanitiseDate, validateName, validateEmail, validateTimes, validateType}