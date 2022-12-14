var moment = require('moment');

const SELECTIONS = process.env;

const INPUT  = {
    REQUIRED: ['civility', 'fullName', 'primaryPhone', 'governorate', 'service', 'demandDate', 'demandState'],
    OPTIONAL: ["email", "secondaryPhone", "delegation", "locality", "notes", "quantity", "price", "missionDate", "reportState", "paymentState", "payment", "reportFile"]
};

// regEx for phone validation
const phoneNumberPattern = /^[0-9]{8}$/;


// DemandDto validation
function getDemandDtoValidationErrors(bodyContent){
    let validationErrors = [];
    for (var prop in bodyContent){
        if (SELECTIONS.hasOwnProperty(prop)){
            if (!(SELECTIONS[prop].includes(bodyContent[prop]))) validationErrors.push(prop + ' ' + 'invalid');
        }
        if (['primaryPhone', 'secondaryPhone'].includes(prop) && bodyContent[prop] != null){
            if (!(phoneNumberPattern.test(bodyContent[prop]))) validationErrors.push(prop + ' ' + 'invalid');
        }
        if (['demandDate', 'missionDate'].includes(prop) && bodyContent[prop] != null){
            if (!isValidStringDate(bodyContent[prop])) validationErrors.push(prop + ' ' + 'invalid');
        }
    }
    return validationErrors ;
};


// StringDate validation
function isValidStringDate(inputStringDate) {
    // pattern: YYYY-MM-DD
    const datePattern = /20[0-9]{2}-[0-9]{2}-[0-9]{2}$/;
    if (!datePattern.test(inputStringDate)) return false;
    const splittedDate = inputStringDate.split("-");
    let inputDate = {
        year: parseInt(splittedDate[0]),
        month: parseInt(splittedDate[1]),
        day: parseInt(splittedDate[2])
    }
    return ((inputDate.month > 0) && (inputDate.month < 13) && (inputDate.day > 0) && (inputDate.day < 32));
}


// Demand validation
function getDemandValidationErrors(bodyContent) {
    let validationErrors = [];
    for (var prop of INPUT.REQUIRED){
        if (!(prop in bodyContent)) validationErrors.push(prop + ' ' + 'required');
    }
    for (var prop in bodyContent){
        if (SELECTIONS.hasOwnProperty(prop)){
            if (!(SELECTIONS[prop].includes(bodyContent[prop])) && bodyContent[prop] != null) validationErrors.push(prop + ' ' + 'invalid');
        } 
        if (['primaryPhone', 'secondaryPhone'].includes(prop) && bodyContent[prop] != null){
            if (!(phoneNumberPattern.test(bodyContent[prop]))) validationErrors.push(prop + ' ' + 'invalid');
        }
        if (['demandDate', 'missionDate'].includes(prop) && bodyContent[prop] != null){
            if (!isValidStringDate(bodyContent[prop])) validationErrors.push(prop + ' ' + 'invalid');
        }
    }
    return validationErrors ;
};


function isValidStringDate(inputStringDate) {
    // pattern: YYYY-MM-DD
    const datePattern = /20[0-9]{2}-[0-9]{2}-[0-9]{2}$/;
    if (!datePattern.test(inputStringDate)) return false;
    const splittedDate = inputStringDate.split("-");
    let inputDate = {
        year: parseInt(splittedDate[0]),
        month: parseInt(splittedDate[1]),
        day: parseInt(splittedDate[2])
    }
    return ((inputDate.month > 0) && (inputDate.month < 13) && (inputDate.day > 0) && (inputDate.day < 32));
}

function stringifyDemandNumber(number) {
    stringNumber = number.toString();
    let stringSize = stringNumber.length;
    while (stringNumber.length < 4){
        stringNumber = "0" + stringNumber;
    }
    return stringNumber;
}

function preprocessDemandsArray(demands) {
    for (let demand of demands){
        delete demand._id;
        delete demand.__v;
        let date;
        demand.demandDate = moment(demand.demandDate).format('YYYY-MM-DD');
        if (demand.missionDate) {
            demand.missionDate = moment(demand.missionDate).format('YYYY-MM-DD');
        };
    }
    return demands;
}

module.exports = { preprocessDemandsArray, getDemandValidationErrors, getDemandDtoValidationErrors, stringifyDemandNumber, INPUT, SELECTIONS }
