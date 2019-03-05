var moment = require('moment-timezone');
var readingTime = require('reading-time');
var AmazonDateParser = require('amazon-date-parser');

function getFormattedDate(date) {
    var month = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    return date.getFullYear() + "-" + month + "-" + date.getDate();
}

function getDateWithoutYear(date){
    var day = moment(date);
    return day.format('dddd, Do') + " "+ day.format('MMMM');
}

function getFormattedTime(date, timezone){
    return moment(new Date(date)).tz(timezone).format('h:mm a');
}

function getReminderDate(date, timezone){
    return moment(new Date(date)).tz(timezone).add(4, 'hour').add(30, 'minutes').toISOString();
}

function getReminderTime(date, timezone){
    return moment(new Date(date)).tz(timezone).subtract(1, 'hour').format('h:mm a');
}

function getEventTime(date, timezone){
    return moment(new Date(date)).tz(timezone).format('h:mm a');
}

function getReminderDateForText(date, timezone){
    return moment(new Date(date)).tz(timezone).subtract(1, 'hour').format('Do MMMM');
}
function reminderCanBeCreated(eventDate, timezone){
    var currentDate = moment(new Date()).tz(timezone);
    var day1 = moment(new Date(eventDate)).tz(timezone);
    var duration = moment.duration(currentDate.diff(day1));
    return (day1.isAfter(currentDate) && duration.asHours() < -1)
}

function getShortEventDescription(event){
    let eventDate = new Date(event.start);
    let category = event.category;
    let shortenedDate = getDateWithoutYear(eventDate);
    return event.title + ", a " + category + " event; on " + shortenedDate + ". ";
}

function getEventDescriptionForCard(event){
    let eventDate = new Date(event.start);
    let category = event.category;
    let shortenedDate = getDateWithoutYear(eventDate);
    let timezone = event.timezone;
    let time = getFormattedTime(eventDate, timezone);
    return "Category: " + category + "\n\nScheduled on: " + shortenedDate + "\n\nStarting at: " + time ;
}

function getShortEventDescriptionWithoutDate(event){
    let eventDate = new Date(event.start);
    let category = event.category;
    let timezone = event.timezone;
    let time = getFormattedTime(eventDate, timezone);
    return event.title + ", a " + category + " event, starting at " + time + ". ";
}

function getHumanReadableTime(seconds){
    var duration = moment.duration(seconds * 1000);
    return duration.humanize();
}

function getEventDescription(event){
    let eventDate = new Date(event.start);
    let category = event.category;
    let description = event.description;
    var stats = readingTime(description);
    let timezone = event.timezone;
    let time = getFormattedTime(eventDate, timezone);

    let duration;
    if(event.duration !== 0){
        duration = getHumanReadableTime(event.duration);
    }else{
        duration = 'unknown duration';
    }
    let shortenedDate = getDateWithoutYear(eventDate);

    if(stats.time >= 5000 && stats.time <= 15000){
        return "The event " + event.title + " is a " + category + " event and is scheduled on " + shortenedDate + ". "
    + "It will start at " + time + " and will run for " + duration + ". Here\'s it\'s description. " + description;
    }
    else{
        return "The event " + event.title + " is a " + category + " event and is scheduled on " + shortenedDate + ". "
    + "It will start at " + time + " and will run for " + duration + ". ";
    }
}

function getDateFromSlot(slotDate){
    if(slotDate && typeof slotDate !== 'undefined'){
        var date = new AmazonDateParser(slotDate);
        var startDate = moment(date.startDate).format('YYYY-MM-DD');
        var endDate = moment(date.endDate).format('YYYY-MM-DD');
        return {
            startDate: startDate,
            endDate: endDate
        }
    }else{
        let date = new Date();
        var startDate = moment(date).format('YYYY-MM-DD');
        var endDate = startDate;
        return {
                startDate: startDate,
                endDate: endDate
        }
    }
}

function randomize(array){
    return array[Math.floor(Math.random() * array.length)];
}

module.exports.getFormattedDate = getFormattedDate;
module.exports.getDateWithoutYear = getDateWithoutYear;
module.exports.getFormattedTime = getFormattedTime;
module.exports.getReminderDate = getReminderDate;
module.exports.getReminderTime = getReminderTime;
module.exports.getEventTime = getEventTime;
module.exports.getReminderDateForText = getReminderDateForText;
module.exports.getShortEventDescription = getShortEventDescription;
module.exports.getEventDescription = getEventDescription;
module.exports.getHumanReadableTime = getHumanReadableTime;
module.exports.getShortEventDescriptionWithoutDate = getShortEventDescriptionWithoutDate;
module.exports.getEventDescriptionForCard = getEventDescriptionForCard;
module.exports.reminderCanBeCreated = reminderCanBeCreated;
module.exports.getDateFromSlot = getDateFromSlot;
module.exports.randomize = randomize;